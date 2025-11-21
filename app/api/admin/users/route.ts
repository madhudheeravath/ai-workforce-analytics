import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List all users
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

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user (redundant with /api/auth/signup but included for completeness)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, password, role, department } = body;

    // Validate required fields
    if (!name || !email || !password || !role || !department) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await sql`
      INSERT INTO users (name, email, password, role, department, status)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, ${department}, 'active')
      RETURNING id, name, email, role, department, status, created_at
    `;

    // Log audit entry
    await sql`
      INSERT INTO audit_logs (admin_user_id, action_type, target_type, target_id, details, status)
      VALUES (${session.user.id}, 'user_create', 'user', ${newUser[0].id}, ${`Created user: ${name} (${email})`}, 'success')
    `.catch(() => {
      // Audit log is optional, don't fail if table doesn't exist yet
    });

    return NextResponse.json({ 
      message: 'User created successfully',
      user: newUser[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
