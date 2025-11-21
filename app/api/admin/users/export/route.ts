import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Export users to CSV
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const users = await sql`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        department,
        status,
        last_login,
        created_at
      FROM users
      ORDER BY created_at DESC
    `;

    // Generate CSV
    const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Status', 'Last Login', 'Created At'];
    const csvRows = [headers.join(',')];

    for (const user of users) {
      const row = [
        user.id,
        `"${user.name}"`,
        user.email,
        user.role,
        `"${user.department}"`,
        user.status || 'active',
        user.last_login ? new Date(user.last_login).toISOString() : 'Never',
        new Date(user.created_at).toISOString()
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    // Log audit entry
    await sql`
      INSERT INTO audit_logs (admin_user_id, action_type, target_type, target_id, details, status)
      VALUES (${session.user.id}, 'users_export', 'system', null, ${`Exported ${users.length} users to CSV`}, 'success')
    `.catch(() => {});

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users_export_${Date.now()}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    );
  }
}
