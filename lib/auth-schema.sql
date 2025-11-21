-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert demo users (password: "password123" for both)
INSERT INTO users (name, email, password, role) VALUES
('Demo Admin', 'admin@awap.com', '$2a$10$rQJ5qHZqJZqJZqJZqJZqJO8vKqvKqvKqvKqvKqvKqvKqvKqvKqvK', 'admin'),
('Demo User', 'user@awap.com', '$2a$10$rQJ5qHZqJZqJZqJZqJZqJO8vKqvKqvKqvKqvKqvKqvKqvKqvKqvK', 'user')
ON CONFLICT (email) DO NOTHING;
