import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function buildWhereClause(searchParams: URLSearchParams): string {
  const conditions: string[] = [];
  
  // Age Group filter - use age_bracket (CSV column)
  const ageGroups = searchParams.getAll('ageGroup');
  if (ageGroups.length > 0) {
    const ageConditions = ageGroups.map(age => `age_bracket = '${age}'`).join(' OR ');
    conditions.push(`(${ageConditions})`);
  }
  
  // Industry filter
  const industries = searchParams.getAll('industry');
  if (industries.length > 0) {
    const industryConditions = industries.map(ind => `industry_sector = '${ind}'`).join(' OR ');
    conditions.push(`(${industryConditions})`);
  }
  
  // Job Role filter - use job_type (CSV column)
  const jobRoles = searchParams.getAll('jobRole');
  if (jobRoles.length > 0) {
    const roleConditions = jobRoles.map(role => `job_type = '${role}'`).join(' OR ');
    conditions.push(`(${roleConditions})`);
  }
  
  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const whereClause = buildWhereClause(searchParams);
    const sqlClient = neon(process.env.DATABASE_URL!);
    
    // Organizational maturity levels based on ai_familiarity_score
    const maturityQuery = `
      SELECT 
        CASE 
          WHEN ai_familiarity_score <= 2 THEN 'Not Started'
          WHEN ai_familiarity_score <= 4 THEN 'Exploring'
          WHEN ai_familiarity_score <= 6 THEN 'Piloting'
          WHEN ai_familiarity_score <= 8 THEN 'Scaling'
          ELSE 'Advanced'
        END AS org_ai_adoption_level,
        COUNT(*) as organizations,
        ROUND(AVG(CASE WHEN ai_use_frequency IN ('weekly', 'daily') THEN 1 ELSE 0 END)::numeric * 100, 2) as policy_rate,
        ROUND(AVG(CASE WHEN self_reported_productivity_change_pct > 5 THEN 1 ELSE 0 END)::numeric * 100, 2) as sustainability_rate,
        ROUND(AVG(self_reported_productivity_change_pct)::numeric, 2) as avg_productivity_change
      FROM survey_respondents
      WHERE ai_familiarity_score IS NOT NULL
      ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
      GROUP BY 1
      ORDER BY 
        CASE 
          WHEN ai_familiarity_score <= 2 THEN 1
          WHEN ai_familiarity_score <= 4 THEN 2
          WHEN ai_familiarity_score <= 6 THEN 3
          WHEN ai_familiarity_score <= 8 THEN 4
          ELSE 5
        END;
    `;
    const maturityLevels = await sqlClient(maturityQuery);

    // Investment trends based on productivity change
    const investmentQuery = `
      SELECT 
        CASE 
          WHEN self_reported_productivity_change_pct < 0 THEN 'Decreasing'
          WHEN self_reported_productivity_change_pct <= 5 THEN 'Maintaining'
          ELSE 'Increasing'
        END AS org_ai_investment_trend,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM survey_respondents
      WHERE self_reported_productivity_change_pct IS NOT NULL
      ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
      GROUP BY 1
      ORDER BY count DESC;
    `;
    const investmentTrends = await sqlClient(investmentQuery);

    // Policy adoption by industry
    const policyQuery = `
      SELECT 
        industry_sector as company_size,
        COUNT(*) as total,
        SUM(CASE WHEN ai_familiarity_score >= 5 THEN 1 ELSE 0 END) as with_policy,
        ROUND(AVG(CASE WHEN ai_familiarity_score >= 5 THEN 1 ELSE 0 END)::numeric * 100, 2) as policy_rate
      FROM survey_respondents
      WHERE industry_sector IS NOT NULL
      ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
      GROUP BY industry_sector
      ORDER BY policy_rate DESC
      LIMIT 5;
    `;
    const policyBySize = await sqlClient(policyQuery);

    return NextResponse.json({
      maturityLevels: maturityLevels.map((row: any) => ({
        level: row.org_ai_adoption_level,
        organizations: Number(row.organizations),
        policyRate: Number(row.policy_rate || 0),
        sustainabilityRate: Number(row.sustainability_rate || 0),
        avgProductivityChange: Number(row.avg_productivity_change || 0),
      })),
      investmentTrends: investmentTrends.map((row: any) => ({
        trend: row.org_ai_investment_trend,
        count: Number(row.count),
        percentage: Number(row.percentage || 0),
      })),
      policyBySize: policyBySize.map((row: any) => ({
        companySize: row.company_size,
        total: Number(row.total),
        withPolicy: Number(row.with_policy),
        policyRate: Number(row.policy_rate || 0),
      })),
    });
  } catch (error) {
    console.error('Error fetching org maturity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch org maturity data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
