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

  // Sentiment filter using sentiment_toward_ai
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

    // Training impact comparison using training_hours_per_employee & has_used_ai_on_job
    const trainingImpactQuery = `
      SELECT 
        (COALESCE(training_hours_per_employee, 0) > 0) AS trained,
        COUNT(*) as respondents,
        ROUND(AVG(CASE WHEN COALESCE(has_used_ai_on_job, false) THEN 1 ELSE 0 END)::numeric * 100, 2) as adoption_rate,
        ROUND(AVG(ai_familiarity_score)::numeric, 2) as avg_comfort_level,
        ROUND(AVG(self_reported_productivity_change_pct)::numeric, 2) as avg_productivity_change,
        ROUND((AVG(ai_familiarity_score)::numeric / 2.0), 2) as avg_tools_used
      FROM survey_respondents
      ${whereClause}
      GROUP BY 1
      ORDER BY trained DESC;
    `;
    const trainingImpact = await sqlClient(trainingImpactQuery);

    // Training by company size using company_size_bucket
    const sizeWhereClause = whereClause
      ? `${whereClause} AND company_size_bucket IS NOT NULL`
      : 'WHERE company_size_bucket IS NOT NULL';

    const trainingSizeQuery = `
      SELECT 
        company_size_bucket,
        COUNT(*) as total,
        SUM(CASE WHEN COALESCE(training_hours_per_employee, 0) > 0 THEN 1 ELSE 0 END) as trained,
        ROUND(
          SUM(CASE WHEN COALESCE(training_hours_per_employee, 0) > 0 THEN 1 ELSE 0 END)::numeric
          * 100.0 / NULLIF(COUNT(*)::numeric, 0),
        2) as training_rate
      FROM survey_respondents
      ${sizeWhereClause}
      GROUP BY company_size_bucket
      ORDER BY 
        CASE company_size_bucket
          WHEN 'micro' THEN 1
          WHEN 'small' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'large' THEN 4
        END;
    `;
    const trainingBySize = await sqlClient(trainingSizeQuery);

    // Comfort level distribution using ai_familiarity_score bucketed to 1-5
    const comfortWhereClause = whereClause
      ? `${whereClause} AND ai_familiarity_score IS NOT NULL`
      : 'WHERE ai_familiarity_score IS NOT NULL';

    const comfortQuery = `
      SELECT 
        CASE
          WHEN ai_familiarity_score < 2 THEN 1
          WHEN ai_familiarity_score < 4 THEN 2
          WHEN ai_familiarity_score < 6 THEN 3
          WHEN ai_familiarity_score < 8 THEN 4
          ELSE 5
        END AS comfort_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM survey_respondents
      ${comfortWhereClause}
      GROUP BY comfort_level
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
        companySize: row.company_size_bucket,
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
