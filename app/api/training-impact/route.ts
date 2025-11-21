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
    
    // Training impact comparison
    const trainingImpactQuery = `
      SELECT 
        ai_training_received,
        COUNT(*) as respondents,
        ROUND(AVG(CASE WHEN is_ai_user THEN 1 ELSE 0 END) * 100, 2) as adoption_rate,
        ROUND(AVG(ai_comfort_level), 2) as avg_comfort_level,
        ROUND(AVG(productivity_change), 2) as avg_productivity_change,
        ROUND(AVG(ai_tools_used_count), 2) as avg_tools_used
      FROM survey_respondents
      ${whereClause}
      GROUP BY ai_training_received;
    `;
    const trainingImpact = await sqlClient(trainingImpactQuery);

    // Training by company size
    const sizeWhereClause = whereClause ? `${whereClause} AND company_size IS NOT NULL` : 'WHERE company_size IS NOT NULL';
    const trainingSizeQuery = `
      SELECT 
        company_size,
        COUNT(*) as total,
        SUM(CASE WHEN ai_training_received THEN 1 ELSE 0 END) as trained,
        ROUND(AVG(CASE WHEN ai_training_received THEN 1 ELSE 0 END) * 100, 2) as training_rate
      FROM survey_respondents
      ${sizeWhereClause}
      GROUP BY company_size
      ORDER BY 
        CASE company_size
          WHEN '1-50' THEN 1
          WHEN '51-200' THEN 2
          WHEN '201-1000' THEN 3
          WHEN '1000+' THEN 4
        END;
    `;
    const trainingBySize = await sqlClient(trainingSizeQuery);

    // Comfort level distribution
    const comfortWhereClause = whereClause ? `${whereClause} AND ai_comfort_level IS NOT NULL` : 'WHERE ai_comfort_level IS NOT NULL';
    const comfortQuery = `
      SELECT 
        ai_comfort_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM survey_respondents
      ${comfortWhereClause}
      GROUP BY ai_comfort_level
      ORDER BY ai_comfort_level;
    `;
    const comfortDistribution = await sqlClient(comfortQuery);

    return NextResponse.json({
      trainingImpact: trainingImpact.map(row => ({
        trained: row.ai_training_received,
        respondents: Number(row.respondents),
        adoptionRate: Number(row.adoption_rate || 0),
        avgComfortLevel: Number(row.avg_comfort_level || 0),
        avgProductivityChange: Number(row.avg_productivity_change || 0),
        avgToolsUsed: Number(row.avg_tools_used || 0),
      })),
      trainingBySize: trainingBySize.map(row => ({
        companySize: row.company_size,
        total: Number(row.total),
        trained: Number(row.trained),
        trainingRate: Number(row.training_rate || 0),
      })),
      comfortDistribution: comfortDistribution.map(row => ({
        level: Number(row.ai_comfort_level),
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
