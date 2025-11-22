import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

type TableStatsRow = {
  table_name: string;
  row_estimate: number;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await sql`
      SELECT
        relname AS table_name,
        n_live_tup AS row_estimate
      FROM pg_stat_user_tables
      ORDER BY relname;
    `.catch(() => [] as TableStatsRow[]);

    const rows = result as TableStatsRow[];

    const tables = rows.map((row) => ({
      name: row.table_name,
      rowEstimate: Number((row as any).row_estimate ?? 0),
    }));

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Error fetching database tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database tables' },
      { status: 500 }
    );
  }
}
