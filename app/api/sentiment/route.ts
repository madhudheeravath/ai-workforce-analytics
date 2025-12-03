import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function buildWhereClause(searchParams: URLSearchParams): string {
  const conditions: string[] = [];

  // Age Group filter - use age_bracket (CSV column)
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

  // Job Role filter - use job_type (CSV column)
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

    // Parse concerns column to determine sentiment
    // The 'concerns' column contains pipe-separated values like 'privacy|accuracy|job_loss'
    const sentimentQuery = `
      SELECT 
        COUNT(*) as total_respondents,
        SUM(CASE WHEN concerns LIKE '%job_loss%' THEN 1 ELSE 0 END) as worried_count,
        ROUND(AVG(CASE WHEN concerns LIKE '%job_loss%' THEN 1 ELSE 0 END)::numeric * 100, 2) as worried_pct,
        SUM(CASE WHEN confidence_change > 0 THEN 1 ELSE 0 END) as hopeful_count,
        ROUND(AVG(CASE WHEN confidence_change > 0 THEN 1 ELSE 0 END)::numeric * 100, 2) as hopeful_pct,
        SUM(CASE WHEN concerns LIKE '%accuracy%' OR concerns LIKE '%regulation%' THEN 1 ELSE 0 END) as overwhelmed_count,
        ROUND(AVG(CASE WHEN concerns LIKE '%accuracy%' OR concerns LIKE '%regulation%' THEN 1 ELSE 0 END)::numeric * 100, 2) as overwhelmed_pct,
        SUM(CASE WHEN self_reported_productivity_change_pct > 5 THEN 1 ELSE 0 END) as excited_count,
        ROUND(AVG(CASE WHEN self_reported_productivity_change_pct > 5 THEN 1 ELSE 0 END)::numeric * 100, 2) as excited_pct
      FROM survey_respondents
      ${baseFilter};
    `;
    const sentimentResult = await sqlClient(sentimentQuery);

    // Sentiment by age bracket
    const sentimentByAgeWhere = baseFilter
      ? `${baseFilter} AND age_bracket IS NOT NULL`
      : 'WHERE age_bracket IS NOT NULL';

    const sentimentByAgeQuery = `
      SELECT 
        age_bracket as age_group,
        COUNT(*) as total,
        ROUND(AVG(CASE WHEN concerns LIKE '%job_loss%' THEN 1 ELSE 0 END)::numeric * 100, 2) as worried_pct,
        ROUND(AVG(CASE WHEN confidence_change > 0 THEN 1 ELSE 0 END)::numeric * 100, 2) as hopeful_pct,
        ROUND(AVG(CASE WHEN concerns LIKE '%accuracy%' OR concerns LIKE '%regulation%' THEN 1 ELSE 0 END)::numeric * 100, 2) as overwhelmed_pct,
        ROUND(AVG(CASE WHEN self_reported_productivity_change_pct > 5 THEN 1 ELSE 0 END)::numeric * 100, 2) as excited_pct
      FROM survey_respondents
      ${sentimentByAgeWhere}
      GROUP BY age_bracket
      ORDER BY age_bracket;
    `;
    const sentimentByAge = await sqlClient(sentimentByAgeQuery);

    // Job opportunity outlook based on productivity change
    const outlookQuery = `
      SELECT 
        CASE 
          WHEN self_reported_productivity_change_pct > 10 THEN 'More'
          WHEN self_reported_productivity_change_pct > 0 THEN 'Same'
          WHEN self_reported_productivity_change_pct > -5 THEN 'Unsure'
          ELSE 'Fewer'
        END AS job_opportunity_outlook,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM survey_respondents
      WHERE self_reported_productivity_change_pct IS NOT NULL
      GROUP BY 1
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
      byAge: sentimentByAge.map((row: any) => ({
        ageGroup: row.age_group,
        total: Number(row.total),
        worried: Number(row.worried_pct || 0),
        hopeful: Number(row.hopeful_pct || 0),
        overwhelmed: Number(row.overwhelmed_pct || 0),
        excited: Number(row.excited_pct || 0),
      })),
      outlook: outlookResult.map((row: any) => ({
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
