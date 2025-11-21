import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

type UserCountRow = {
  count: number | string;
};

export async function GET() {
  try {
    // For now, return count without auth check
    // In production, implement proper auth middleware
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    const rows = result as UserCountRow[];
    const count = rows[0]?.count || 0;

    return NextResponse.json({ count: Number(count) });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user count' },
      { status: 500 }
    );
  }
}
