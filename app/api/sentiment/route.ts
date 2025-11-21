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
    
    // Overall sentiment breakdown
    const sentimentQuery = `
      SELECT 
        COUNT(*) as total_respondents,
        SUM(CASE WHEN is_worried THEN 1 ELSE 0 END) as worried_count,
        ROUND(AVG(CASE WHEN is_worried THEN 1 ELSE 0 END) * 100, 2) as worried_pct,
        SUM(CASE WHEN is_hopeful THEN 1 ELSE 0 END) as hopeful_count,
        ROUND(AVG(CASE WHEN is_hopeful THEN 1 ELSE 0 END) * 100, 2) as hopeful_pct,
        SUM(CASE WHEN is_overwhelmed THEN 1 ELSE 0 END) as overwhelmed_count,
        ROUND(AVG(CASE WHEN is_overwhelmed THEN 1 ELSE 0 END) * 100, 2) as overwhelmed_pct,
        SUM(CASE WHEN is_excited THEN 1 ELSE 0 END) as excited_count,
        ROUND(AVG(CASE WHEN is_excited THEN 1 ELSE 0 END) * 100, 2) as excited_pct
      FROM survey_respondents
      ${whereClause};
    `;
    const sentimentResult = await sqlClient(sentimentQuery);

    // Sentiment by age group
    const ageWhereClause = whereClause ? `${whereClause} AND age_group IS NOT NULL` : 'WHERE age_group IS NOT NULL';
    const sentimentByAgeQuery = `
      SELECT 
        age_group,
        COUNT(*) as total,
        ROUND(AVG(CASE WHEN is_worried THEN 1 ELSE 0 END) * 100, 2) as worried_pct,
        ROUND(AVG(CASE WHEN is_hopeful THEN 1 ELSE 0 END) * 100, 2) as hopeful_pct,
        ROUND(AVG(CASE WHEN is_overwhelmed THEN 1 ELSE 0 END) * 100, 2) as overwhelmed_pct,
        ROUND(AVG(CASE WHEN is_excited THEN 1 ELSE 0 END) * 100, 2) as excited_pct
      FROM survey_respondents
      ${ageWhereClause}
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN '18-29' THEN 1
          WHEN '30-49' THEN 2
          WHEN '50+' THEN 3
        END;
    `;
    const sentimentByAge = await sqlClient(sentimentByAgeQuery);

    // Job opportunity outlook
    const outlookWhereClause = whereClause ? `${whereClause} AND job_opportunity_outlook IS NOT NULL` : 'WHERE job_opportunity_outlook IS NOT NULL';
    const outlookQuery = `
      SELECT 
        job_opportunity_outlook,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM survey_respondents
      ${outlookWhereClause}
      GROUP BY job_opportunity_outlook
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
