import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function buildWhereClause(searchParams: URLSearchParams): string {
  const conditions: string[] = ['company_size_bucket IS NOT NULL'];

  // Industry filter (matches industry_sector in all datasets)
  const industries = searchParams.getAll('industry');
  if (industries.length > 0) {
    const industryConditions = industries
      .map((ind) => `industry_sector = '${ind}'`)
      .join(' OR ');
    conditions.push(`(${industryConditions})`);
  }

  // Company Size filter - map legacy values to new buckets
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

  // AI User Status filter using has_used_ai_on_job where available
  const aiUser = searchParams.get('aiUser');
  if (aiUser === 'yes') {
    conditions.push('COALESCE(has_used_ai_on_job, false) = true');
  } else if (aiUser === 'no') {
    conditions.push('COALESCE(has_used_ai_on_job, false) = false');
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
        company_size_bucket AS company_size,
        COUNT(*) as total_rows,
        ROUND(AVG(pct_employees_using_ai)::numeric, 2) as avg_pct_using_ai,
        ROUND(AVG(productivity_change_pct)::numeric, 2) as avg_productivity
      FROM survey_respondents
      ${whereClause}
      GROUP BY company_size_bucket
      ORDER BY 
        CASE company_size_bucket
          WHEN 'micro' THEN 1
          WHEN 'small' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'large' THEN 4
        END;
    `;
    
    const result = await sqlClient(query);

    const data = result.map((row: any) => ({
      companySize: row.company_size,
      totalRespondents: Number(row.total_rows),
      // For this aggregated dataset, treat avg_pct_using_ai as both
      // the adoption rate and an approximate "AI users" count metric.
      aiUsers: Number(row.avg_pct_using_ai || 0),
      adoptionRate: Number(row.avg_pct_using_ai || 0),
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
