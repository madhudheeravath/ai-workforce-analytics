import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await sql`
      SELECT COUNT(*)::int AS total_respondents
      FROM survey_respondents;
    `;

    const row = rows?.[0] as { total_respondents?: number | string } | undefined;
    const total = row?.total_respondents ?? 0;

    return NextResponse.json({
      totalRespondents: Number(total),
    });
  } catch (error: any) {
    console.error('Error in debug-count route:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch debug count',
        details: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}

