import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function buildWhereClause(searchParams: URLSearchParams): string {
  const conditions: string[] = [];

  // Industry filter
  const industries = searchParams.getAll('industry');
  if (industries.length > 0) {
    const industryConditions = industries
      .map((ind) => `industry_sector = '${ind}'`)
      .join(' OR ');
    conditions.push(`(${industryConditions})`);
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const whereClause = buildWhereClause(searchParams);
    
    const sqlClient = neon(process.env.DATABASE_URL!);
    
    // Group by industry sector as proxy for company size breakdown
    // Use ai_use_frequency to determine adoption
    const query = `
      SELECT 
        industry_sector as company_size,
        COUNT(*) as total_rows,
        SUM(CASE WHEN ai_use_frequency IN ('weekly', 'daily') THEN 1 ELSE 0 END) as ai_users,
        ROUND(AVG(CASE WHEN ai_use_frequency IN ('weekly', 'daily') THEN 1 ELSE 0 END)::numeric * 100, 2) as adoption_rate,
        ROUND(AVG(self_reported_productivity_change_pct)::numeric, 2) as avg_productivity
      FROM survey_respondents
      WHERE industry_sector IS NOT NULL
      ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
      GROUP BY industry_sector
      ORDER BY adoption_rate DESC;
    `;
    
    const result = await sqlClient(query);

    const data = result.map((row: any) => ({
      companySize: row.company_size,
      totalRespondents: Number(row.total_rows),
      aiUsers: Number(row.ai_users || 0),
      adoptionRate: Number(row.adoption_rate || 0),
      avgProductivity: Number(row.avg_productivity || 0),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching adoption by company size:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
