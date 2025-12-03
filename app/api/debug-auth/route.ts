import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'manager@awap.com';
    const password = searchParams.get('password') || 'manager123';
    
    const sqlClient = neon(process.env.DATABASE_URL!);
    
    // Check if users table exists and what users are there
    const allUsers = await sqlClient`
      SELECT id, email, name, role, department, 
             LEFT(password, 20) as password_prefix,
             LENGTH(password) as password_length
      FROM users 
      LIMIT 10
    `;
    
    // Check specific user
    const userResult = await sqlClient`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    
    let passwordCheck = null;
    if (userResult.length > 0) {
      const user = userResult[0];
      // Test password comparison
      try {
        const isValid = await bcrypt.compare(password, user.password);
        passwordCheck = {
          provided_password: password,
          stored_hash_prefix: user.password?.substring(0, 30),
          stored_hash_length: user.password?.length,
          is_valid: isValid
        };
      } catch (e) {
        passwordCheck = {
          error: e instanceof Error ? e.message : 'Unknown error',
          stored_hash_prefix: user.password?.substring(0, 30),
        };
      }
    }

    return NextResponse.json({
      database_connected: true,
      total_users: allUsers.length,
      users: allUsers,
      specific_user_check: {
        email_searched: email,
        found: userResult.length > 0,
        user_data: userResult.length > 0 ? {
          id: userResult[0].id,
          email: userResult[0].email,
          name: userResult[0].name,
          role: userResult[0].role,
        } : null
      },
      password_check: passwordCheck
    });
  } catch (error) {
    return NextResponse.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
