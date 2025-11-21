import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function buildWhereClause(searchParams: URLSearchParams): string {
  const conditions: string[] = ['industry_sector IS NOT NULL'];
  
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
  
  return `WHERE ${conditions.join(' AND ')}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const whereClause = buildWhereClause(searchParams);
    
    const sqlClient = neon(process.env.DATABASE_URL!);
    const query = `
      SELECT 
        industry_sector,
        COUNT(*) as total_respondents,
        SUM(CASE WHEN is_ai_user THEN 1 ELSE 0 END) as ai_users,
        ROUND(AVG(CASE WHEN is_ai_user THEN 1 ELSE 0 END) * 100, 2) as adoption_rate,
        ROUND(AVG(productivity_change), 2) as avg_productivity,
        ROUND(AVG(income_level), 2) as avg_income
      FROM survey_respondents
      ${whereClause}
      GROUP BY industry_sector
      ORDER BY adoption_rate DESC;
    `;
    
    const result = await sqlClient(query);

    const data = result.map(row => ({
      industry: row.industry_sector,
      totalRespondents: Number(row.total_respondents),
      aiUsers: Number(row.ai_users),
      adoptionRate: Number(row.adoption_rate || 0),
      avgProductivity: Number(row.avg_productivity || 0),
      avgIncome: Number(row.avg_income || 0),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching adoption by industry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
