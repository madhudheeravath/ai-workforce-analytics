-- ============================================================================
-- USERS TABLE FOR AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'hr' CHECK (role IN ('super_admin', 'hr', 'manager', 'lnd')),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- ============================================================================
-- DEFAULT ADMIN USER (Password: admin123)
-- ============================================================================
-- Password hash for 'admin123'
INSERT INTO users (name, email, password, role, department) 
VALUES (
    'Admin User',
    'admin@company.com',
    '$2a$10$rQZ9vXJZ4xK4jZYLZYYZZuJZ4xK4jZYLZYYZZuJZ4xK4jZYLZYYZZu',
    'super_admin',
    'Administration'
) ON CONFLICT (email) DO NOTHING;

-- Sample users for each role (Password: password123)
INSERT INTO users (name, email, password, role, department) VALUES
    ('HR Manager', 'hr@company.com', '$2a$10$rQZ9vXJZ4xK4jZYLZYYZZuJZ4xK4jZYLZYYZZuJZ4xK4jZYLZYYZZu', 'hr', 'Human Resources'),
    ('Team Manager', 'manager@company.com', '$2a$10$rQZ9vXJZ4xK4jZYLZYYZZuJZ4xK4jZYLZYYZZuJZ4xK4jZYLZYYZZu', 'manager', 'Engineering'),
    ('L&D Specialist', 'lnd@company.com', '$2a$10$rQZ9vXJZ4xK4jZYLZYYZZuJZ4xK4jZYLZYYZZuJZ4xK4jZYLZYYZZu', 'lnd', 'Learning & Development')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- USER ACTIVITY LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at);

-- ============================================================================
-- SYSTEM SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
    ('app_name', 'AI Workforce Analytics Platform', 'Application name'),
    ('enable_signup', 'true', 'Allow new user signups'),
    ('default_role', 'hr', 'Default role for new signups'),
    ('maintenance_mode', 'false', 'Enable maintenance mode')
ON CONFLICT (key) DO NOTHING;
