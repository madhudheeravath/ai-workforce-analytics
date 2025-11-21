import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function buildWhereClause(searchParams: URLSearchParams): string {
  const conditions: string[] = [];
  
  // Age Group filter
  const ageGroups = searchParams.getAll('ageGroup');
  if (ageGroups.length > 0) {
    const ageConditions = ageGroups.map(age => `age_group = '${age}'`).join(' OR ');
    conditions.push(`(${ageConditions})`);
  }
  
  // Industry filter
  const industries = searchParams.getAll('industry');
  if (industries.length > 0) {
    const industryConditions = industries.map(ind => `industry_sector = '${ind}'`).join(' OR ');
    conditions.push(`(${industryConditions})`);
  }
  
  // Job Role filter
  const jobRoles = searchParams.getAll('jobRole');
  if (jobRoles.length > 0) {
    const roleConditions = jobRoles.map(role => `job_role = '${role}'`).join(' OR ');
    conditions.push(`(${roleConditions})`);
  }
  
  // Company Size filter
  const companySizes = searchParams.getAll('companySize');
  if (companySizes.length > 0) {
    const sizeConditions = companySizes.map(size => `company_size = '${size}'`).join(' OR ');
    conditions.push(`(${sizeConditions})`);
  }
  
  // AI User Status filter
  const aiUser = searchParams.get('aiUser');
  if (aiUser === 'yes') {
    conditions.push('is_ai_user = true');
  } else if (aiUser === 'no') {
    conditions.push('is_ai_user = false');
  }
  
  // Training Status filter
  const trained = searchParams.get('trained');
  if (trained === 'yes') {
    conditions.push('ai_training_received = true');
  } else if (trained === 'no') {
    conditions.push('ai_training_received = false');
  }
  
  // Sentiment filter
  const sentiments = searchParams.getAll('sentiment');
  if (sentiments.length > 0) {
    const sentimentConditions = sentiments.map(s => {
      switch (s.toLowerCase()) {
        case 'worried': return 'is_worried = true';
        case 'hopeful': return 'is_hopeful = true';
        case 'overwhelmed': return 'is_overwhelmed = true';
        case 'excited': return 'is_excited = true';
        default: return '';
      }
    }).filter(c => c).join(' OR ');
    if (sentimentConditions) {
      conditions.push(`(${sentimentConditions})`);
    }
  }
  
  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const whereClause = buildWhereClause(searchParams);
    const sqlClient = neon(process.env.DATABASE_URL!);
    
    // Organizational maturity levels
    const maturityWhereClause = whereClause ? `${whereClause} AND org_ai_adoption_level IS NOT NULL` : 'WHERE org_ai_adoption_level IS NOT NULL';
    const maturityQuery = `
      SELECT 
        org_ai_adoption_level,
        COUNT(*) as organizations,
        ROUND(AVG(CASE WHEN org_has_ai_policy THEN 1 ELSE 0 END) * 100, 2) as policy_rate,
        ROUND(AVG(CASE WHEN org_ai_sustainability_use THEN 1 ELSE 0 END) * 100, 2) as sustainability_rate,
        ROUND(AVG(productivity_change), 2) as avg_productivity_change
      FROM survey_respondents
      ${maturityWhereClause}
      GROUP BY org_ai_adoption_level
      ORDER BY 
        CASE org_ai_adoption_level
          WHEN 'Not Started' THEN 1
          WHEN 'Exploring' THEN 2
          WHEN 'Piloting' THEN 3
          WHEN 'Scaling' THEN 4
          WHEN 'Advanced' THEN 5
        END;
    `;
    const maturityLevels = await sqlClient(maturityQuery);

    // Investment trends
    const investmentWhereClause = whereClause ? `${whereClause} AND org_ai_investment_trend IS NOT NULL` : 'WHERE org_ai_investment_trend IS NOT NULL';
    const investmentQuery = `
      SELECT 
        org_ai_investment_trend,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM survey_respondents
      ${investmentWhereClause}
      GROUP BY org_ai_investment_trend
      ORDER BY count DESC;
    `;
    const investmentTrends = await sqlClient(investmentQuery);

    // Policy adoption by company size
    const policyWhereClause = whereClause ? `${whereClause} AND company_size IS NOT NULL` : 'WHERE company_size IS NOT NULL';
    const policyQuery = `
      SELECT 
        company_size,
        COUNT(*) as total,
        SUM(CASE WHEN org_has_ai_policy THEN 1 ELSE 0 END) as with_policy,
        ROUND(AVG(CASE WHEN org_has_ai_policy THEN 1 ELSE 0 END) * 100, 2) as policy_rate
      FROM survey_respondents
      ${policyWhereClause}
      GROUP BY company_size
      ORDER BY 
        CASE company_size
          WHEN '1-50' THEN 1
          WHEN '51-200' THEN 2
          WHEN '201-1000' THEN 3
          WHEN '1000+' THEN 4
        END;
    `;
    const policyBySize = await sqlClient(policyQuery);

    return NextResponse.json({
      maturityLevels: maturityLevels.map(row => ({
        level: row.org_ai_adoption_level,
        organizations: Number(row.organizations),
        policyRate: Number(row.policy_rate || 0),
        sustainabilityRate: Number(row.sustainability_rate || 0),
        avgProductivityChange: Number(row.avg_productivity_change || 0),
      })),
      investmentTrends: investmentTrends.map(row => ({
        trend: row.org_ai_investment_trend,
        count: Number(row.count),
        percentage: Number(row.percentage || 0),
      })),
      policyBySize: policyBySize.map(row => ({
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
