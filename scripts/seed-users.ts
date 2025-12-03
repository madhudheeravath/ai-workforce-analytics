/**
 * Seed users script for AI Workforce Analytics Platform
 * Run this to create default users with proper bcrypt hashes
 */

import bcrypt from 'bcryptjs';

// Generate proper bcrypt hashes for the passwords
async function generateHashes() {
  const users = [
    { email: 'admin@awap.com', password: 'admin123', role: 'super_admin', name: 'Admin User', department: 'Administration' },
    { email: 'manager@awap.com', password: 'manager123', role: 'manager', name: 'Team Manager', department: 'Engineering' },
    { email: 'hr@awap.com', password: 'hr123', role: 'hr', name: 'HR Manager', department: 'Human Resources' },
    { email: 'lnd@awap.com', password: 'lnd123', role: 'lnd', name: 'L&D Specialist', department: 'Learning & Development' },
  ];

  console.log('-- SQL to insert users with proper bcrypt hashes:');
  console.log('-- Run these in your Neon database console\n');

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`-- User: ${user.email} (Password: ${user.password})`);
    console.log(`INSERT INTO users (name, email, password, role, department, is_active, created_at) VALUES`);
    console.log(`('${user.name}', '${user.email}', '${hash}', '${user.role}', '${user.department}', true, NOW())`);
    console.log(`ON CONFLICT (email) DO UPDATE SET password = '${hash}', role = '${user.role}', is_active = true;\n`);
  }
}

generateHashes();
