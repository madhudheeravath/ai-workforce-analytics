import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sqlClient = neon(process.env.DATABASE_URL!);
    
    // Use actual CSV column names that exist in the live database
    const rows = await sqlClient`
      SELECT
        COUNT(*) AS total_respondents,
        COALESCE(ROUND(AVG(CASE WHEN ai_use_frequency IN ('weekly', 'daily') THEN 1 ELSE 0 END)::numeric * 100, 2), 0) AS adoption_rate,
        COALESCE(ROUND(AVG(self_reported_productivity_change_pct)::numeric, 2), 0) AS avg_productivity,
        0 AS avg_income,
        COALESCE(ROUND((AVG(ai_familiarity_score)::numeric / 2.0), 2), 0) AS avg_comfort_level,
        COALESCE(SUM(CASE WHEN ai_familiarity_score >= 5 THEN 1 ELSE 0 END), 0) AS trained_count,
        COALESCE(ROUND(
          (SUM(CASE WHEN ai_familiarity_score >= 5 THEN 1 ELSE 0 END)::numeric * 100.0)
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
