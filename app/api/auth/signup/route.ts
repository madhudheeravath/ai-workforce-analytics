import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

type SignupUserRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  created_at: string;
};

export async function POST(request: Request) {
  try {
    const { name, email, password, role, department } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserResult = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    const existingUser = existingUserResult as { id: number }[];

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await sql`
      INSERT INTO users (name, email, password, role, department, created_at)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role || 'hr'}, ${department || 'General'}, NOW())
      RETURNING id, name, email, role, department, created_at
    `;

    const rows = result as SignupUserRecord[];
    const newUser = rows[0];

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
