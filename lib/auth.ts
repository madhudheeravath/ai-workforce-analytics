import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

type AuthUserRecord = {
  id: number;
  email: string;
  name: string;
  role: string;
  department: string | null;
  password: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        try {
          // Check if user exists
          const result = await sql`
            SELECT * FROM users WHERE email = ${credentials.email} LIMIT 1
          `;

          const rows = result as AuthUserRecord[];

          if (rows.length === 0) {
            throw new Error("No user found with this email");
          }

          const user = rows[0];

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department ?? undefined,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error("Authentication failed");
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.department = token.department as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};
