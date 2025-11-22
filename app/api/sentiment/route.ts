import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function buildWhereClause(searchParams: URLSearchParams): string {
  const conditions: string[] = [];

  // Age Group filter -> age_bracket
  const ageGroups = searchParams.getAll('ageGroup');
  if (ageGroups.length > 0) {
    const ageConditions = ageGroups
      .map((age) => `age_bracket = '${age}'`)
      .join(' OR ');
    conditions.push(`(${ageConditions})`);
  }

  // Industry filter
  const industries = searchParams.getAll('industry');
  if (industries.length > 0) {
    const industryConditions = industries
      .map((ind) => `industry_sector = '${ind}'`)
      .join(' OR ');
    conditions.push(`(${industryConditions})`);
  }

  // Job Role filter -> job_type
  const jobRoles = searchParams.getAll('jobRole');
  if (jobRoles.length > 0) {
    const roleConditions = jobRoles
      .map((role) => `job_type = '${role}'`)
      .join(' OR ');
    conditions.push(`(${roleConditions})`);
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const baseFilter = buildWhereClause(searchParams);

    const sqlClient = neon(process.env.DATABASE_URL!);

    // Overall sentiment breakdown using sentiment_toward_ai buckets
    const sentimentWhere = baseFilter
      ? `${baseFilter} AND sentiment_toward_ai IS NOT NULL`
      : 'WHERE sentiment_toward_ai IS NOT NULL';

    const sentimentQuery = `
      SELECT 
        COUNT(*) as total_respondents,
        SUM(CASE WHEN sentiment_toward_ai < -0.5 THEN 1 ELSE 0 END) as worried_count,
        ROUND(AVG(CASE WHEN sentiment_toward_ai < -0.5 THEN 1 ELSE 0 END)::numeric * 100, 2) as worried_pct,
        SUM(CASE WHEN sentiment_toward_ai >= -0.5 AND sentiment_toward_ai <= 0.5 THEN 1 ELSE 0 END) as hopeful_count,
        ROUND(AVG(CASE WHEN sentiment_toward_ai >= -0.5 AND sentiment_toward_ai <= 0.5 THEN 1 ELSE 0 END)::numeric * 100, 2) as hopeful_pct,
        SUM(CASE WHEN sentiment_toward_ai > 0.5 AND sentiment_toward_ai <= 1.5 THEN 1 ELSE 0 END) as overwhelmed_count,
        ROUND(AVG(CASE WHEN sentiment_toward_ai > 0.5 AND sentiment_toward_ai <= 1.5 THEN 1 ELSE 0 END)::numeric * 100, 2) as overwhelmed_pct,
        SUM(CASE WHEN sentiment_toward_ai > 1.5 THEN 1 ELSE 0 END) as excited_count,
        ROUND(AVG(CASE WHEN sentiment_toward_ai > 1.5 THEN 1 ELSE 0 END)::numeric * 100, 2) as excited_pct
      FROM survey_respondents
      ${sentimentWhere};
    `;
    const sentimentResult = await sqlClient(sentimentQuery);

    // Sentiment by age bracket
    const sentimentByAgeWhere = baseFilter
      ? `${baseFilter} AND sentiment_toward_ai IS NOT NULL AND age_bracket IS NOT NULL`
      : 'WHERE sentiment_toward_ai IS NOT NULL AND age_bracket IS NOT NULL';

    const sentimentByAgeQuery = `
      SELECT 
        age_bracket,
        COUNT(*) as total,
        ROUND(AVG(CASE WHEN sentiment_toward_ai < -0.5 THEN 1 ELSE 0 END)::numeric * 100, 2) as worried_pct,
        ROUND(AVG(CASE WHEN sentiment_toward_ai >= -0.5 AND sentiment_toward_ai <= 0.5 THEN 1 ELSE 0 END)::numeric * 100, 2) as hopeful_pct,
        ROUND(AVG(CASE WHEN sentiment_toward_ai > 0.5 AND sentiment_toward_ai <= 1.5 THEN 1 ELSE 0 END)::numeric * 100, 2) as overwhelmed_pct,
        ROUND(AVG(CASE WHEN sentiment_toward_ai > 1.5 THEN 1 ELSE 0 END)::numeric * 100, 2) as excited_pct
      FROM survey_respondents
      ${sentimentByAgeWhere}
      GROUP BY age_bracket
      ORDER BY age_bracket;
    `;
    const sentimentByAge = await sqlClient(sentimentByAgeQuery);

    // Job opportunity outlook using expected_job_impact
    const outlookWhereClause = baseFilter
      ? `${baseFilter} AND expected_job_impact IS NOT NULL`
      : 'WHERE expected_job_impact IS NOT NULL';

    const outlookQuery = `
      SELECT 
        expected_job_impact AS job_opportunity_outlook,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM survey_respondents
      ${outlookWhereClause}
      GROUP BY expected_job_impact
      ORDER BY count DESC;
    `;
    const outlookResult = await sqlClient(outlookQuery);

    const row = sentimentResult[0];

    return NextResponse.json({
      overall: {
        totalRespondents: Number(row.total_respondents),
        worried: {
          count: Number(row.worried_count),
          percentage: Number(row.worried_pct || 0),
        },
        hopeful: {
          count: Number(row.hopeful_count),
          percentage: Number(row.hopeful_pct || 0),
        },
        overwhelmed: {
          count: Number(row.overwhelmed_count),
          percentage: Number(row.overwhelmed_pct || 0),
        },
        excited: {
          count: Number(row.excited_count),
          percentage: Number(row.excited_pct || 0),
        },
      },
      byAge: sentimentByAge.map(row => ({
        ageGroup: row.age_group,
        total: Number(row.total),
        worried: Number(row.worried_pct || 0),
        hopeful: Number(row.hopeful_pct || 0),
        overwhelmed: Number(row.overwhelmed_pct || 0),
        excited: Number(row.excited_pct || 0),
      })),
      outlook: outlookResult.map(row => ({
        outlook: row.job_opportunity_outlook,
        count: Number(row.count),
        percentage: Number(row.percentage || 0),
      })),
    });
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
