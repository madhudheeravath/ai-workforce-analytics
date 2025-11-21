-- ============================================================================
-- AI Workforce Analytics Platform - Database Schema
-- ============================================================================
-- Description: PostgreSQL schema for survey respondents data
-- Database: Neon PostgreSQL (Serverless)
-- Version: 1.0
-- ============================================================================

-- Enable UUID extension for auto-generating primary keys
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing table if exists (for clean setup)
DROP TABLE IF EXISTS survey_respondents CASCADE;

-- ============================================================================
-- Main Survey Respondents Table
-- ============================================================================
CREATE TABLE survey_respondents (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Unique Identifier
    respondent_id TEXT UNIQUE NOT NULL,
    
    -- ========================================================================
    -- DEMOGRAPHICS
    -- ========================================================================
    age_group TEXT CHECK (age_group IN ('18-29', '30-49', '50+')),
    education_level TEXT CHECK (education_level IN ('High School', 'Some College', 'Bachelor', 'Master', 'PhD')),
    income_level NUMERIC CHECK (income_level >= 0 AND income_level <= 500000),
    industry_sector TEXT CHECK (industry_sector IN (
        'Technology', 'Finance', 'Healthcare', 'Manufacturing', 
        'Retail', 'Education', 'Government', 'Professional Services',
        'Media', 'Hospitality'
    )),
    job_role TEXT CHECK (job_role IN ('Individual Contributor', 'Manager', 'Executive', 'Other')),
    company_size TEXT CHECK (company_size IN ('1-50', '51-200', '201-1000', '1000+')),
    years_experience INTEGER CHECK (years_experience >= 0 AND years_experience <= 60),
    
    -- ========================================================================
    -- AI USAGE & SKILLS
    -- ========================================================================
    is_ai_user BOOLEAN NOT NULL DEFAULT FALSE,
    ai_usage_frequency TEXT CHECK (ai_usage_frequency IN ('Never', 'Rarely', 'Monthly', 'Weekly', 'Daily')),
    ai_comfort_level INTEGER CHECK (ai_comfort_level >= 1 AND ai_comfort_level <= 5),
    ai_training_received BOOLEAN NOT NULL DEFAULT FALSE,
    ai_tools_used_count INTEGER CHECK (ai_tools_used_count >= 0 AND ai_tools_used_count <= 20),
    ai_agents_awareness_level INTEGER CHECK (ai_agents_awareness_level >= 1 AND ai_agents_awareness_level <= 5),
    
    -- ========================================================================
    -- SENTIMENT INDICATORS (Boolean Flags)
    -- ========================================================================
    is_worried BOOLEAN NOT NULL DEFAULT FALSE,
    is_hopeful BOOLEAN NOT NULL DEFAULT FALSE,
    is_overwhelmed BOOLEAN NOT NULL DEFAULT FALSE,
    is_excited BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- ========================================================================
    -- WORKFORCE OUTLOOK & RISK
    -- ========================================================================
    job_opportunity_outlook TEXT CHECK (job_opportunity_outlook IN ('More', 'Same', 'Fewer', 'Unsure')),
    automation_risk_perception INTEGER CHECK (automation_risk_perception >= 1 AND automation_risk_perception <= 10),
    workflow_automation_potential INTEGER CHECK (workflow_automation_potential >= 1 AND workflow_automation_potential <= 5),
    
    -- ========================================================================
    -- ORGANIZATIONAL CONTEXT
    -- ========================================================================
    org_ai_adoption_level TEXT CHECK (org_ai_adoption_level IN ('Not Started', 'Exploring', 'Piloting', 'Scaling', 'Advanced')),
    org_ai_investment_trend TEXT CHECK (org_ai_investment_trend IN ('Decreasing', 'Maintaining', 'Increasing')),
    org_has_ai_policy BOOLEAN NOT NULL DEFAULT FALSE,
    org_ai_sustainability_use BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- ========================================================================
    -- IMPACT METRICS
    -- ========================================================================
    wage_premium_ai_skills NUMERIC CHECK (wage_premium_ai_skills >= 0 AND wage_premium_ai_skills <= 500000),
    productivity_change NUMERIC CHECK (productivity_change >= -100 AND productivity_change <= 100),
    
    -- ========================================================================
    -- SYSTEM METADATA
    -- ========================================================================
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance Optimization
-- ============================================================================

-- Index on respondent_id for fast lookups
CREATE INDEX idx_respondent_id ON survey_respondents(respondent_id);

-- Index on demographics for filtering
CREATE INDEX idx_age_group ON survey_respondents(age_group);
CREATE INDEX idx_education_level ON survey_respondents(education_level);
CREATE INDEX idx_industry_sector ON survey_respondents(industry_sector);
CREATE INDEX idx_company_size ON survey_respondents(company_size);
CREATE INDEX idx_job_role ON survey_respondents(job_role);

-- Index on AI usage patterns
CREATE INDEX idx_is_ai_user ON survey_respondents(is_ai_user);
CREATE INDEX idx_ai_usage_frequency ON survey_respondents(ai_usage_frequency);
CREATE INDEX idx_ai_training_received ON survey_respondents(ai_training_received);

-- Index on organizational context
CREATE INDEX idx_org_adoption_level ON survey_respondents(org_ai_adoption_level);
CREATE INDEX idx_org_has_policy ON survey_respondents(org_has_ai_policy);

-- Composite index for common queries
CREATE INDEX idx_industry_company_size ON survey_respondents(industry_sector, company_size);
CREATE INDEX idx_age_education ON survey_respondents(age_group, education_level);

-- Index on timestamps for time-based queries
CREATE INDEX idx_created_at ON survey_respondents(created_at);

-- ============================================================================
-- TRIGGER for automatic updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_survey_respondents_updated_at
    BEFORE UPDATE ON survey_respondents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS for Common Analytics Queries
-- ============================================================================

-- View: AI Adoption Overview
CREATE OR REPLACE VIEW vw_ai_adoption_overview AS
SELECT 
    COUNT(*) as total_respondents,
    SUM(CASE WHEN is_ai_user THEN 1 ELSE 0 END) as ai_users,
    ROUND(AVG(CASE WHEN is_ai_user THEN 1 ELSE 0 END) * 100, 2) as adoption_rate_pct,
    ROUND(AVG(productivity_change), 2) as avg_productivity_change,
    ROUND(AVG(ai_comfort_level), 2) as avg_comfort_level,
    SUM(CASE WHEN ai_training_received THEN 1 ELSE 0 END) as trained_users,
    ROUND(AVG(CASE WHEN ai_training_received THEN 1 ELSE 0 END) * 100, 2) as training_rate_pct
FROM survey_respondents;

-- View: Sentiment Breakdown
CREATE OR REPLACE VIEW vw_sentiment_breakdown AS
SELECT 
    COUNT(*) as total_respondents,
    SUM(CASE WHEN is_worried THEN 1 ELSE 0 END) as worried_count,
    ROUND(AVG(CASE WHEN is_worried THEN 1 ELSE 0 END) * 100, 2) as worried_pct,
    SUM(CASE WHEN is_hopeful THEN 1 ELSE 0 END) as hopeful_count,
    ROUND(AVG(CASE WHEN is_hopeful THEN 1 ELSE 0 END) * 100, 2) as hopeful_pct,
    SUM(CASE WHEN is_overwhelmed THEN 1 ELSE 0 END) as overwhelmed_count,
    ROUND(AVG(CASE WHEN is_overwhelmed THEN 1 ELSE 0 END) * 100, 2) as overwhelmed_pct,
    SUM(CASE WHEN is_excited THEN 1 ELSE 0 END) as excited_count,
    ROUND(AVG(CASE WHEN is_excited THEN 1 ELSE 0 END) * 100, 2) as excited_pct
FROM survey_respondents;

-- View: Adoption by Company Size
CREATE OR REPLACE VIEW vw_adoption_by_company_size AS
SELECT 
    company_size,
    COUNT(*) as total_respondents,
    SUM(CASE WHEN is_ai_user THEN 1 ELSE 0 END) as ai_users,
    ROUND(AVG(CASE WHEN is_ai_user THEN 1 ELSE 0 END) * 100, 2) as adoption_rate_pct,
    ROUND(AVG(productivity_change), 2) as avg_productivity_change
FROM survey_respondents
GROUP BY company_size
ORDER BY 
    CASE company_size
        WHEN '1-50' THEN 1
        WHEN '51-200' THEN 2
        WHEN '201-1000' THEN 3
        WHEN '1000+' THEN 4
    END;

-- View: Adoption by Industry
CREATE OR REPLACE VIEW vw_adoption_by_industry AS
SELECT 
    industry_sector,
    COUNT(*) as total_respondents,
    SUM(CASE WHEN is_ai_user THEN 1 ELSE 0 END) as ai_users,
    ROUND(AVG(CASE WHEN is_ai_user THEN 1 ELSE 0 END) * 100, 2) as adoption_rate_pct,
    ROUND(AVG(productivity_change), 2) as avg_productivity_change,
    ROUND(AVG(wage_premium_ai_skills), 2) as avg_wage_premium
FROM survey_respondents
GROUP BY industry_sector
ORDER BY adoption_rate_pct DESC;

-- View: Training Impact Analysis
CREATE OR REPLACE VIEW vw_training_impact AS
SELECT 
    ai_training_received,
    COUNT(*) as respondents,
    ROUND(AVG(CASE WHEN is_ai_user THEN 1 ELSE 0 END) * 100, 2) as adoption_rate_pct,
    ROUND(AVG(ai_comfort_level), 2) as avg_comfort_level,
    ROUND(AVG(productivity_change), 2) as avg_productivity_change,
    ROUND(AVG(ai_tools_used_count), 2) as avg_tools_used
FROM survey_respondents
GROUP BY ai_training_received;

-- View: Organizational Maturity
CREATE OR REPLACE VIEW vw_org_maturity AS
SELECT 
    org_ai_adoption_level,
    COUNT(*) as organizations,
    ROUND(AVG(CASE WHEN org_has_ai_policy THEN 1 ELSE 0 END) * 100, 2) as policy_rate_pct,
    ROUND(AVG(CASE WHEN org_ai_sustainability_use THEN 1 ELSE 0 END) * 100, 2) as sustainability_rate_pct,
    ROUND(AVG(productivity_change), 2) as avg_productivity_change
FROM survey_respondents
GROUP BY org_ai_adoption_level
ORDER BY 
    CASE org_ai_adoption_level
        WHEN 'Not Started' THEN 1
        WHEN 'Exploring' THEN 2
        WHEN 'Piloting' THEN 3
        WHEN 'Scaling' THEN 4
        WHEN 'Advanced' THEN 5
    END;

-- ============================================================================
-- SAMPLE VALIDATION QUERIES
-- ============================================================================

-- Query to validate benchmark: AI adoption should be 12-20%
-- SELECT * FROM vw_ai_adoption_overview;

-- Query to validate sentiment: Worried should be 45-60%
-- SELECT * FROM vw_sentiment_breakdown;

-- Query to validate training impact: Training should improve adoption
-- SELECT * FROM vw_training_impact;

-- ============================================================================
-- DATA QUALITY CHECKS
-- ============================================================================

-- Check for age/experience mismatches (experience > age - 15)
CREATE OR REPLACE VIEW vw_data_quality_age_experience AS
SELECT 
    respondent_id,
    age_group,
    years_experience,
    CASE 
        WHEN age_group = '18-29' AND years_experience > 14 THEN 'INVALID'
        WHEN age_group = '30-49' AND years_experience > 34 THEN 'INVALID'
        WHEN age_group = '50+' AND years_experience > 55 THEN 'WARNING'
        ELSE 'VALID'
    END as validation_status
FROM survey_respondents
WHERE 
    (age_group = '18-29' AND years_experience > 14) OR
    (age_group = '30-49' AND years_experience > 34) OR
    (age_group = '50+' AND years_experience > 55);

-- Check for missing critical fields
CREATE OR REPLACE VIEW vw_data_quality_completeness AS
SELECT 
    COUNT(*) as total_records,
    SUM(CASE WHEN respondent_id IS NULL THEN 1 ELSE 0 END) as missing_id,
    SUM(CASE WHEN age_group IS NULL THEN 1 ELSE 0 END) as missing_age,
    SUM(CASE WHEN education_level IS NULL THEN 1 ELSE 0 END) as missing_education,
    SUM(CASE WHEN industry_sector IS NULL THEN 1 ELSE 0 END) as missing_industry,
    SUM(CASE WHEN is_ai_user IS NULL THEN 1 ELSE 0 END) as missing_ai_user
FROM survey_respondents;

-- ============================================================================
-- GRANT PERMISSIONS (if using role-based access)
-- ============================================================================

-- GRANT SELECT ON survey_respondents TO readonly_role;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO readonly_role;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

COMMENT ON TABLE survey_respondents IS 'Main table storing survey responses about AI workforce adoption, sentiment, and impact';
COMMENT ON COLUMN survey_respondents.respondent_id IS 'Unique pseudonymized identifier for each respondent';
COMMENT ON COLUMN survey_respondents.productivity_change IS 'Productivity change percentage (-100 to +100)';
COMMENT ON COLUMN survey_respondents.wage_premium_ai_skills IS 'Estimated wage premium for AI skills in local currency';
