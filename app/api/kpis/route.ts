import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        COUNT(*) AS total_respondents,
        COALESCE(ROUND(AVG(pct_employees_using_ai)::numeric, 2), 0) AS adoption_rate,
        COALESCE(ROUND(AVG(self_reported_productivity_change_pct)::numeric, 2), 0) AS avg_productivity,
        0 AS avg_income,
        COALESCE(ROUND(AVG(ai_familiarity_score)::numeric, 2), 0) AS avg_comfort_level,
        COALESCE(SUM(CASE WHEN training_hours_per_employee IS NOT NULL AND training_hours_per_employee > 0 THEN 1 ELSE 0 END), 0) AS trained_count,
        COALESCE(ROUND(
          (SUM(CASE WHEN training_hours_per_employee IS NOT NULL AND training_hours_per_employee > 0 THEN 1 ELSE 0 END)::numeric * 100.0)
          / NULLIF(COUNT(*)::numeric, 0),
        2), 0) AS training_rate
      FROM survey_respondents;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        error: 'No data available',
        message: 'Please run the ETL pipeline to load data',
      }, { status: 404 });
    }

    const row = rows[0] as {
      total_respondents: number | string;
      adoption_rate: number | string | null;
      avg_productivity: number | string | null;
      avg_income: number | string | null;
      avg_comfort_level: number | string | null;
      trained_count: number | string | null;
      training_rate: number | string | null;
    };

    return NextResponse.json({
      totalRespondents: Number(row.total_respondents || 0),
      adoptionRate: Number(row.adoption_rate || 0),
      avgProductivity: Number(row.avg_productivity || 0),
      avgIncome: Number(row.avg_income || 0),
      avgComfortLevel: Number(row.avg_comfort_level || 0),
      trainedCount: Number(row.trained_count || 0),
      trainingRate: Number(row.training_rate || 0),
    });
  } catch (error: any) {
    console.error('Error fetching KPIs (extended):', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPIs', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}
