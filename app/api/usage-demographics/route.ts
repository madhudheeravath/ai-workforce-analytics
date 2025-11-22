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

    const ageWhere = whereClause
      ? `${whereClause} AND age_bracket IS NOT NULL AND ai_familiarity_score IS NOT NULL`
      : 'WHERE age_bracket IS NOT NULL AND ai_familiarity_score IS NOT NULL';

    const usageByAgeQuery = `
      SELECT
        age_bracket,
        COUNT(*) as total,
        ROUND(AVG(CASE WHEN COALESCE(has_used_ai_on_job, false) THEN 1 ELSE 0 END)::numeric * 100, 2) as adoption_rate,
        ROUND(AVG(ai_familiarity_score)::numeric, 2) as avg_comfort,
        ROUND((AVG(ai_familiarity_score)::numeric / 2.0), 2) as avg_tools,
        ROUND(AVG(CASE WHEN ai_use_frequency = 'daily' THEN 1 ELSE 0 END)::numeric * 100, 2) as daily_pct,
        ROUND(AVG(CASE WHEN ai_use_frequency = 'weekly' THEN 1 ELSE 0 END)::numeric * 100, 2) as weekly_pct,
        ROUND(AVG(CASE WHEN ai_use_frequency = 'monthly' THEN 1 ELSE 0 END)::numeric * 100, 2) as monthly_pct,
        ROUND(AVG(CASE WHEN ai_use_frequency = 'rarely' THEN 1 ELSE 0 END)::numeric * 100, 2) as rarely_pct,
        ROUND(AVG(CASE WHEN ai_use_frequency = 'never' THEN 1 ELSE 0 END)::numeric * 100, 2) as never_pct
      FROM survey_respondents
      ${ageWhere}
      GROUP BY age_bracket
      ORDER BY age_bracket;
    `;

    const byAge = await sqlClient(usageByAgeQuery);

    return NextResponse.json({
      byAge: byAge.map((row: any) => ({
        segment: row.age_bracket,
        total: Number(row.total),
        adoptionRate: Number(row.adoption_rate || 0),
        avgComfort: Number(row.avg_comfort || 0),
        avgTools: Number(row.avg_tools || 0),
        dailyPct: Number(row.daily_pct || 0),
        weeklyPct: Number(row.weekly_pct || 0),
        monthlyPct: Number(row.monthly_pct || 0),
        rarelyPct: Number(row.rarely_pct || 0),
        neverPct: Number(row.never_pct || 0),
      })),
      byRole: [],
      byExperience: [],
    });
  } catch (error) {
    console.error('Error fetching usage demographics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch usage demographics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
