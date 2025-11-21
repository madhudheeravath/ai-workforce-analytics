#!/usr/bin/env python3
"""
Setup database schema
"""
import os
from sqlalchemy import create_engine, text

database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("ERROR: DATABASE_URL not set")
    exit(1)

print("Reading schema file...")
with open('etl/schema.sql', 'r', encoding='utf-8') as f:
    schema_sql = f.read()

print("Connecting to database...")
engine = create_engine(database_url)

print("Creating schema...")
with engine.connect() as conn:
    # Execute the entire schema as one transaction
    try:
        conn.execute(text(schema_sql))
        conn.commit()
        print("✓ Schema created successfully!")
    except Exception as e:
        print(f"Note: Some statements may already exist: {str(e)[:200]}")
        # Try creating just the main table
        conn.rollback()
        
        # Create table without extensions and triggers
        create_table_sql = """
        DROP TABLE IF EXISTS survey_respondents CASCADE;
        
        CREATE TABLE survey_respondents (
            id SERIAL PRIMARY KEY,
            respondent_id TEXT UNIQUE NOT NULL,
            age_group TEXT,
            education_level TEXT,
            income_level NUMERIC,
            industry_sector TEXT,
            job_role TEXT,
            company_size TEXT,
            years_experience INTEGER,
            is_ai_user BOOLEAN DEFAULT FALSE,
            ai_usage_frequency TEXT,
            ai_comfort_level INTEGER,
            ai_training_received BOOLEAN DEFAULT FALSE,
            ai_tools_used_count INTEGER,
            ai_agents_awareness_level INTEGER,
            is_worried BOOLEAN DEFAULT FALSE,
            is_hopeful BOOLEAN DEFAULT FALSE,
            is_overwhelmed BOOLEAN DEFAULT FALSE,
            is_excited BOOLEAN DEFAULT FALSE,
            job_opportunity_outlook TEXT,
            automation_risk_perception INTEGER,
            workflow_automation_potential INTEGER,
            org_ai_adoption_level TEXT,
            org_ai_investment_trend TEXT,
            org_has_ai_policy BOOLEAN DEFAULT FALSE,
            org_ai_sustainability_use BOOLEAN DEFAULT FALSE,
            wage_premium_ai_skills NUMERIC,
            productivity_change NUMERIC,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """
        conn.execute(text(create_table_sql))
        conn.commit()
        print("✓ Basic schema created!")

engine.dispose()
