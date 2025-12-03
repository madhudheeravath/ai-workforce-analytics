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
    const whereClause = buildWhereClause(searchParams);
    const sqlClient = neon(process.env.DATABASE_URL!);

    // Training impact comparison
    // Using ai_familiarity_score >= 5 as proxy for "trained" (higher familiarity = likely trained)
    // Dividing by 2 to convert 1-10 scale to 1-5 scale for display
    const trainingImpactQuery = `
      SELECT 
        CASE WHEN ai_familiarity_score >= 5 THEN true ELSE false END AS trained,
        COUNT(*) as respondents,
        ROUND(AVG(CASE WHEN ai_use_frequency IN ('weekly', 'daily') THEN 1 ELSE 0 END)::numeric * 100, 2) as adoption_rate,
        ROUND((AVG(ai_familiarity_score)::numeric / 2.0), 2) as avg_comfort_level,
        ROUND(AVG(self_reported_productivity_change_pct)::numeric, 2) as avg_productivity_change,
        ROUND((AVG(ai_familiarity_score)::numeric / 2.0), 2) as avg_tools_used
      FROM survey_respondents
      ${whereClause}
      GROUP BY (ai_familiarity_score >= 5)
      ORDER BY trained DESC;
    `;
    const trainingImpact = await sqlClient(trainingImpactQuery);

    // Training by industry sector (as proxy for company size breakdown)
    const trainingSizeQuery = `
      SELECT 
        industry_sector as company_size,
        COUNT(*) as total,
        SUM(CASE WHEN ai_familiarity_score >= 5 THEN 1 ELSE 0 END) as trained,
        ROUND(
          SUM(CASE WHEN ai_familiarity_score >= 5 THEN 1 ELSE 0 END)::numeric
          * 100.0 / NULLIF(COUNT(*)::numeric, 0),
        2) as training_rate
      FROM survey_respondents
      WHERE industry_sector IS NOT NULL
      GROUP BY industry_sector
      ORDER BY training_rate DESC
      LIMIT 5;
    `;
    const trainingBySize = await sqlClient(trainingSizeQuery);

    // Comfort level distribution using ai_familiarity_score (1-10 bucketed to 1-5)
    const comfortQuery = `
      SELECT 
        CASE
          WHEN ai_familiarity_score <= 2 THEN 1
          WHEN ai_familiarity_score <= 4 THEN 2
          WHEN ai_familiarity_score <= 6 THEN 3
          WHEN ai_familiarity_score <= 8 THEN 4
          ELSE 5
        END AS comfort_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM survey_respondents
      WHERE ai_familiarity_score IS NOT NULL
      GROUP BY 1
      ORDER BY comfort_level;
    `;
    const comfortDistribution = await sqlClient(comfortQuery);

    return NextResponse.json({
      trainingImpact: trainingImpact.map((row: any) => ({
        trained: row.trained,
        respondents: Number(row.respondents),
        adoptionRate: Number(row.adoption_rate || 0),
        avgComfortLevel: Number(row.avg_comfort_level || 0),
        avgProductivityChange: Number(row.avg_productivity_change || 0),
        avgToolsUsed: Number(row.avg_tools_used || 0),
      })),
      trainingBySize: trainingBySize.map((row: any) => ({
        companySize: row.company_size,
        total: Number(row.total),
        trained: Number(row.trained),
        trainingRate: Number(row.training_rate || 0),
      })),
      comfortDistribution: comfortDistribution.map((row: any) => ({
        level: Number(row.comfort_level),
        count: Number(row.count),
        percentage: Number(row.percentage || 0),
      })),
    });
  } catch (error) {
    console.error('Error fetching training impact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
