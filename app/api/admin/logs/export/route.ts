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

// GET - Export audit logs to CSV
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
    `.catch(() => {
      return [] as AuditLogRecord[];
    });

    const logs = logsResult as AuditLogRecord[];

    // Generate CSV
    const headers = ['ID', 'Timestamp', 'Admin User', 'Action Type', 'Target Type', 'Target ID', 'Details', 'Status'];
    const csvRows = [headers.join(',')];

    for (const log of logs) {
      const row = [
        log.id,
        new Date(log.created_at).toISOString(),
        `"${log.admin_name || 'Unknown'}"`,
        log.action_type,
        log.target_type || '',
        log.target_id || '',
        `"${log.details?.replace(/"/g, '""') || ''}"`,
        log.status
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit_logs_${Date.now()}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting logs:', error);
    return NextResponse.json(
      { error: 'Failed to export logs' },
      { status: 500 }
    );
  }
}
