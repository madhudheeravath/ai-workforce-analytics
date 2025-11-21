import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

type AuditLogRecord = {
  id: number;
  created_at: string;
  admin_name?: string | null;
  action_type: string;
  target_type?: string | null;
  target_id?: string | number | null;
  details?: string | null;
  status: string;
};

// GET - Fetch audit logs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const logsResult = await sql`
      SELECT 
        al.*,
        u.name as admin_name
      FROM audit_logs al
      LEFT JOIN users u ON al.admin_user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 500
    `.catch(() => {
      // If audit_logs table doesn't exist, return empty array
      return [] as AuditLogRecord[];
    });

    const logs = logsResult as AuditLogRecord[];

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
