-- Admin Schema Updates
-- Run this to add missing columns and tables for admin functionality

-- Update users table to add status column
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER,
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id INTEGER,
  details TEXT,
  payload JSONB,
  status VARCHAR(20) DEFAULT 'success',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create import_history table
CREATE TABLE IF NOT EXISTS import_history (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  uploader_id INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  total_rows INTEGER,
  status VARCHAR(50) DEFAULT 'uploaded',
  validation_score NUMERIC,
  validation_report JSONB,
  import_mode VARCHAR(20) DEFAULT 'append',
  imported_at TIMESTAMP,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_import_history_uploader ON import_history(uploader_id);
CREATE INDEX IF NOT EXISTS idx_import_history_status ON import_history(status);

-- Create validation_rules table
CREATE TABLE IF NOT EXISTS validation_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) DEFAULT 'warning',
  expression TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create etl_jobs table
CREATE TABLE IF NOT EXISTS etl_jobs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  schedule_cron VARCHAR(50),
  last_run_at TIMESTAMP,
  last_run_status VARCHAR(20),
  next_scheduled_run TIMESTAMP,
  config JSONB,
  is_active BOOLEAN DEFAULT true
);

-- Create job_runs table
CREATE TABLE IF NOT EXISTS job_runs (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES etl_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  status VARCHAR(20) DEFAULT 'running',
  rows_processed INTEGER,
  error_message TEXT,
  logs TEXT
);

CREATE INDEX IF NOT EXISTS idx_job_runs_job_id ON job_runs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_runs_started_at ON job_runs(started_at DESC);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  category VARCHAR(50) DEFAULT 'general',
  updated_by INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category)
VALUES 
  ('app_name', 'AI Workforce Analytics Platform', 'string', 'general'),
  ('primary_theme', 'blue', 'string', 'general'),
  ('enable_notifications', 'true', 'boolean', 'notification'),
  ('enable_auto_backup', 'true', 'boolean', 'general'),
  ('session_timeout_minutes', '60', 'number', 'security'),
  ('password_min_length', '6', 'number', 'security')
ON CONFLICT (setting_key) DO NOTHING;

-- Update existing users to have active status
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Success message
SELECT 'Admin schema updates completed successfully!' as message;
