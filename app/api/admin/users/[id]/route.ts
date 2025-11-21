import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

type AdminUserRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string | null;
  created_at: string;
};

// PUT - Update user
export async function PUT(
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
    const body = await request.json();
    const { name, role, department, status } = body;

    // Validate required fields
    if (!name || !role || !department) {
      return NextResponse.json(
        { error: 'Name, role, and department are required' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUserResult = await sql`
      UPDATE users
      SET 
        name = ${name},
        role = ${role},
        department = ${department},
        status = ${status || 'active'}
      WHERE id = ${userId}
      RETURNING id, name, email, role, department, status, created_at
    `;

    const updatedUser = updatedUserResult as AdminUserRecord[];

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Log audit entry
    await sql`
      INSERT INTO audit_logs (admin_user_id, action_type, target_type, target_id, details, status)
      VALUES (${session.user.id}, 'user_update', 'user', ${userId}, ${`Updated user: ${name}`}, 'success')
    `.catch(() => {});

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
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

    // Prevent deleting yourself
    if (session.user.id === userId.toString()) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Get user info before deleting
    const userToDeleteResult = await sql`
      SELECT name, email FROM users WHERE id = ${userId}
    `;

    const userToDelete = userToDeleteResult as { name: string; email: string }[];

    if (userToDelete.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `;

    // Log audit entry
    await sql`
      INSERT INTO audit_logs (admin_user_id, action_type, target_type, target_id, details, status)
      VALUES (${session.user.id}, 'user_delete', 'user', ${userId}, ${`Deleted user: ${userToDelete[0].name} (${userToDelete[0].email})`}, 'success')
    `.catch(() => {});

    return NextResponse.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
