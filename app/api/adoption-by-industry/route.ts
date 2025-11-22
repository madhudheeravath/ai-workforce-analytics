import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function buildWhereClause(searchParams: URLSearchParams): string {
  const conditions: string[] = ['industry_sector IS NOT NULL'];

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

  // Company Size filter -> company_size_bucket with mapping
  const companySizes = searchParams.getAll('companySize');
  if (companySizes.length > 0) {
    const mappedSizes = companySizes.map((size) => {
      switch (size) {
        case '1-50':
          return 'micro';
        case '51-200':
          return 'small';
        case '201-1000':
          return 'medium';
        case '1000+':
          return 'large';
        default:
          return size;
      }
    });

    const sizeConditions = mappedSizes
      .map((size) => `company_size_bucket = '${size}'`)
      .join(' OR ');
    conditions.push(`(${sizeConditions})`);
  }

  // AI User Status filter using has_used_ai_on_job
  const aiUser = searchParams.get('aiUser');
  if (aiUser === 'yes') {
    conditions.push('COALESCE(has_used_ai_on_job, false) = true');
  } else if (aiUser === 'no') {
    conditions.push('COALESCE(has_used_ai_on_job, false) = false');
  }

  // Training Status filter using training_hours_per_employee
  const trained = searchParams.get('trained');
  if (trained === 'yes') {
    conditions.push('COALESCE(training_hours_per_employee, 0) > 0');
  } else if (trained === 'no') {
    conditions.push('COALESCE(training_hours_per_employee, 0) = 0');
  }

  // Sentiment filter using sentiment_toward_ai buckets
  const sentiments = searchParams.getAll('sentiment');
  if (sentiments.length > 0) {
    const sentimentConditions = sentiments
      .map((s) => {
        switch (s.toLowerCase()) {
          case 'worried':
            return 'sentiment_toward_ai < -0.5';
          case 'hopeful':
            return 'sentiment_toward_ai >= -0.5 AND sentiment_toward_ai <= 0.5';
          case 'overwhelmed':
            return 'sentiment_toward_ai > 0.5 AND sentiment_toward_ai <= 1.5';
          case 'excited':
            return 'sentiment_toward_ai > 1.5';
          default:
            return '';
        }
      })
      .filter(Boolean)
      .join(' OR ');

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
    const query = `
      SELECT 
        industry_sector,
        COUNT(*) as total_rows,
        ROUND(AVG(pct_employees_using_ai)::numeric, 2) as adoption_rate,
        ROUND(AVG(self_reported_productivity_change_pct)::numeric, 2) as avg_productivity
      FROM survey_respondents
      ${whereClause}
      GROUP BY industry_sector
      ORDER BY adoption_rate DESC;
    `;
    
    const result = await sqlClient(query);

    const data = result.map((row: any) => ({
      industry: row.industry_sector,
      totalRespondents: Number(row.total_rows),
      adoptionRate: Number(row.adoption_rate || 0),
      avgProductivity: Number(row.avg_productivity || 0),
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
