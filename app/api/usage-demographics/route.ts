import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function buildWhereClause(searchParams: URLSearchParams): string {
  const conditions: string[] = [];

  const ageGroups = searchParams.getAll('ageGroup');
  if (ageGroups.length > 0) {
    const ageConditions = ageGroups.map(age => `age_group = '${age}'`).join(' OR ');
    conditions.push(`(${ageConditions})`);
  }

  const industries = searchParams.getAll('industry');
  if (industries.length > 0) {
    const industryConditions = industries.map(ind => `industry_sector = '${ind}'`).join(' OR ');
    conditions.push(`(${industryConditions})`);
  }

  const jobRoles = searchParams.getAll('jobRole');
  if (jobRoles.length > 0) {
    const roleConditions = jobRoles.map(role => `job_role = '${role}'`).join(' OR ');
    conditions.push(`(${roleConditions})`);
  }

  const companySizes = searchParams.getAll('companySize');
  if (companySizes.length > 0) {
    const sizeConditions = companySizes.map(size => `company_size = '${size}'`).join(' OR ');
    conditions.push(`(${sizeConditions})`);
  }

  const aiUser = searchParams.get('aiUser');
  if (aiUser === 'yes') {
    conditions.push('is_ai_user = true');
  } else if (aiUser === 'no') {
    conditions.push('is_ai_user = false');
  }

  const trained = searchParams.get('trained');
  if (trained === 'yes') {
    conditions.push('ai_training_received = true');
  } else if (trained === 'no') {
    conditions.push('ai_training_received = false');
  }

  const sentiments = searchParams.getAll('sentiment');
  if (sentiments.length > 0) {
    const sentimentConditions = sentiments
      .map((s) => {
        switch (s.toLowerCase()) {
          case 'worried':
            return 'is_worried = true';
          case 'hopeful':
            return 'is_hopeful = true';
          case 'overwhelmed':
            return 'is_overwhelmed = true';
          case 'excited':
            return 'is_excited = true';
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
      ? `${whereClause} AND age_group IS NOT NULL`
      : 'WHERE age_group IS NOT NULL';

    const usageByAgeQuery = `
      SELECT
        age_group,
        COUNT(*) as total,
        ROUND(AVG(CASE WHEN is_ai_user THEN 1 ELSE 0 END) * 100, 2) as adoption_rate,
        ROUND(AVG(ai_comfort_level), 2) as avg_comfort,
        ROUND(AVG(ai_tools_used_count), 2) as avg_tools,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Daily' THEN 1 ELSE 0 END) * 100, 2) as daily_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Weekly' THEN 1 ELSE 0 END) * 100, 2) as weekly_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Monthly' THEN 1 ELSE 0 END) * 100, 2) as monthly_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Rarely' THEN 1 ELSE 0 END) * 100, 2) as rarely_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Never' THEN 1 ELSE 0 END) * 100, 2) as never_pct
      FROM survey_respondents
      ${ageWhere}
      GROUP BY age_group
      ORDER BY
        CASE age_group
          WHEN '18-29' THEN 1
          WHEN '30-49' THEN 2
          WHEN '50+' THEN 3
          ELSE 4
        END;
    `;

    const roleWhere = whereClause
      ? `${whereClause} AND job_role IS NOT NULL`
      : 'WHERE job_role IS NOT NULL';

    const usageByRoleQuery = `
      SELECT
        job_role,
        COUNT(*) as total,
        ROUND(AVG(CASE WHEN is_ai_user THEN 1 ELSE 0 END) * 100, 2) as adoption_rate,
        ROUND(AVG(ai_comfort_level), 2) as avg_comfort,
        ROUND(AVG(ai_tools_used_count), 2) as avg_tools,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Daily' THEN 1 ELSE 0 END) * 100, 2) as daily_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Weekly' THEN 1 ELSE 0 END) * 100, 2) as weekly_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Monthly' THEN 1 ELSE 0 END) * 100, 2) as monthly_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Rarely' THEN 1 ELSE 0 END) * 100, 2) as rarely_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Never' THEN 1 ELSE 0 END) * 100, 2) as never_pct
      FROM survey_respondents
      ${roleWhere}
      GROUP BY job_role
      ORDER BY job_role;
    `;

    const experienceWhere = whereClause
      ? `${whereClause} AND years_experience IS NOT NULL`
      : 'WHERE years_experience IS NOT NULL';

    const usageByExperienceQuery = `
      SELECT
        CASE
          WHEN years_experience < 3 THEN '0-2 years'
          WHEN years_experience BETWEEN 3 AND 5 THEN '3-5 years'
          WHEN years_experience BETWEEN 6 AND 10 THEN '6-10 years'
          ELSE '10+ years'
        END as experience_band,
        COUNT(*) as total,
        ROUND(AVG(CASE WHEN is_ai_user THEN 1 ELSE 0 END) * 100, 2) as adoption_rate,
        ROUND(AVG(ai_comfort_level), 2) as avg_comfort,
        ROUND(AVG(ai_tools_used_count), 2) as avg_tools,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Daily' THEN 1 ELSE 0 END) * 100, 2) as daily_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Weekly' THEN 1 ELSE 0 END) * 100, 2) as weekly_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Monthly' THEN 1 ELSE 0 END) * 100, 2) as monthly_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Rarely' THEN 1 ELSE 0 END) * 100, 2) as rarely_pct,
        ROUND(AVG(CASE WHEN ai_usage_frequency = 'Never' THEN 1 ELSE 0 END) * 100, 2) as never_pct
      FROM survey_respondents
      ${experienceWhere}
      GROUP BY 1
      ORDER BY
        experience_band;
    `;

    const [byAge, byRole, byExperience] = await Promise.all([
      sqlClient(usageByAgeQuery),
      sqlClient(usageByRoleQuery),
      sqlClient(usageByExperienceQuery),
    ]);

    return NextResponse.json({
      byAge: byAge.map((row: any) => ({
        segment: row.age_group,
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
      byRole: byRole.map((row: any) => ({
        segment: row.job_role,
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
      byExperience: byExperience.map((row: any) => ({
        segment: row.experience_band,
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
