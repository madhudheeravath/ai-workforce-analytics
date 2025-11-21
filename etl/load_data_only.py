#!/usr/bin/env python3
"""
Load cleaned data into database (simpler version)
"""
import pandas as pd
from sqlalchemy import create_engine, text
import os

database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("ERROR: DATABASE_URL not set")
    exit(1)

print("Reading cleaned data...")
df = pd.read_csv('etl/cleaned_survey_data.csv')
print(f"✓ Loaded {len(df)} rows")

# Keep only the columns that exist in our schema
schema_columns = [
    'respondent_id', 'age_group', 'education_level', 'income_level',
    'industry_sector', 'job_role', 'company_size', 'years_experience',
    'is_ai_user', 'ai_usage_frequency', 'ai_comfort_level', 
    'ai_training_received', 'ai_tools_used_count', 'ai_agents_awareness_level',
    'is_worried', 'is_hopeful', 'is_overwhelmed', 'is_excited',
    'job_opportunity_outlook', 'automation_risk_perception', 
    'workflow_automation_potential', 'org_ai_adoption_level',
    'org_ai_investment_trend', 'org_has_ai_policy', 
    'org_ai_sustainability_use', 'wage_premium_ai_skills', 
    'productivity_change'
]

# Filter to only columns that exist in both dataframe and schema
available_columns = [col for col in schema_columns if col in df.columns]
df_filtered = df[available_columns]

print(f"Using {len(available_columns)} columns from schema")

print("Connecting to database...")
engine = create_engine(database_url)

print("Truncating existing data...")
with engine.connect() as conn:
    conn.execute(text("TRUNCATE TABLE survey_respondents RESTART IDENTITY CASCADE;"))
    conn.commit()

print("Loading data...")
df_filtered.to_sql('survey_respondents', engine, if_exists='append', index=False, method='multi')

# Verify
with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM survey_respondents;"))
    count = result.fetchone()[0]
    print(f"✓ Loaded {count} rows into database")

engine.dispose()
print("\n✓ Data loading complete!")
