import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST - Toggle user status (enable/disable)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.id);

    // Get current status
    const currentUser = await sql`
      SELECT name, status FROM users WHERE id = ${userId}
    `;

    if (currentUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentStatus = currentUser[0].status || 'active';
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';

    // Update status
    await sql`
      UPDATE users
      SET status = ${newStatus}
      WHERE id = ${userId}
    `;

    // Log audit entry
    await sql`
      INSERT INTO audit_logs (admin_user_id, action_type, target_type, target_id, details, status)
      VALUES (${session.user.id}, 'user_status_change', 'user', ${userId}, ${`Changed status to ${newStatus}: ${currentUser[0].name}`}, 'success')
    `.catch(() => {});

    return NextResponse.json({
      message: `User ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`,
      status: newStatus
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle user status' },
      { status: 500 }
    );
  }
}
