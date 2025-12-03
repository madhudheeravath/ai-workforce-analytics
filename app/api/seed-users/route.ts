import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sqlClient = neon(process.env.DATABASE_URL!);
    
    // Define users to seed
    const users = [
      { email: 'admin@awap.com', password: 'admin123', role: 'super_admin', name: 'Admin User', department: 'Administration' },
      { email: 'manager@awap.com', password: 'manager123', role: 'manager', name: 'Team Manager', department: 'Engineering' },
      { email: 'hr@awap.com', password: 'hr123', role: 'hr', name: 'HR Manager', department: 'Human Resources' },
      { email: 'lnd@awap.com', password: 'lnd123', role: 'lnd', name: 'L&D Specialist', department: 'Learning & Development' },
    ];

    const results = [];

    for (const user of users) {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Upsert user (insert or update if exists)
      await sqlClient`
        INSERT INTO users (name, email, password, role, department, is_active, created_at, updated_at)
        VALUES (${user.name}, ${user.email}, ${hashedPassword}, ${user.role}, ${user.department}, true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET 
          password = ${hashedPassword},
          role = ${user.role},
          name = ${user.name},
          department = ${user.department},
          is_active = true,
          updated_at = NOW()
      `;
      
      results.push({
        email: user.email,
        role: user.role,
        status: 'created/updated'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Users seeded successfully',
      users: results
    });
  } catch (error) {
    console.error("Seed users error:", error);
    return NextResponse.json(
      { error: "Failed to seed users", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
