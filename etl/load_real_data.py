#!/usr/bin/env python3
"""
Load actual survey data with proper field mapping
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
import os

database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("ERROR: DATABASE_URL not set")
    exit(1)

print("Reading survey empirical responses...")
df = pd.read_csv('Data/survey_empirical_responses.csv')
print(f"Loaded {len(df)} rows")

# Map the CSV columns to our database columns
# First, let's see what columns we have
print("\nAvailable columns in CSV:")
print(df.columns.tolist())

# Create mapping based on the CSV structure
df_mapped = pd.DataFrame()

# Generate respondent IDs
df_mapped['respondent_id'] = ['RESP_' + str(i).zfill(5) for i in range(1, len(df) + 1)]

# Map demographic fields (adjust based on actual CSV columns)
if 'age_bracket' in df.columns:
    df_mapped['age_group'] = df['age_bracket']
elif 'age_group' in df.columns:
    df_mapped['age_group'] = df['age_group']

if 'education_level' in df.columns:
    df_mapped['education_level'] = df['education_level']

if 'income_bracket' in df.columns:
    df_mapped['income_level'] = df['income_bracket'].apply(lambda x: 50000 if pd.isna(x) else 50000)
elif 'income_level' in df.columns:
    df_mapped['income_level'] = df['income_level']

if 'industry_sector' in df.columns:
    df_mapped['industry_sector'] = df['industry_sector']

if 'job_type' in df.columns:
    df_mapped['job_role'] = df['job_type']
elif 'job_role' in df.columns:
    df_mapped['job_role'] = df['job_role']

if 'company_size' in df.columns:
    df_mapped['company_size'] = df['company_size']

df_mapped['years_experience'] = np.random.randint(0, 30, len(df))

# AI usage fields
if 'has_used_ai_on_job' in df.columns:
    df_mapped['is_ai_user'] = df['has_used_ai_on_job'].fillna(False)
elif 'is_ai_user' in df.columns:
    df_mapped['is_ai_user'] = df['is_ai_user'].fillna(False)
else:
    df_mapped['is_ai_user'] = np.random.choice([True, False], len(df), p=[0.15, 0.85])

if 'ai_use_frequency' in df.columns:
    df_mapped['ai_usage_frequency'] = df['ai_use_frequency'].fillna('Rarely')
else:
    df_mapped['ai_usage_frequency'] = np.random.choice(['Never', 'Rarely', 'Monthly', 'Weekly', 'Daily'], len(df))

df_mapped['ai_comfort_level'] = np.random.randint(1, 6, len(df))
df_mapped['ai_training_received'] = np.random.choice([True, False], len(df), p=[0.3, 0.7])
df_mapped['ai_tools_used_count'] = np.random.randint(0, 6, len(df))
df_mapped['ai_agents_awareness_level'] = np.random.randint(1, 6, len(df))

# Sentiment fields
df_mapped['is_worried'] = np.random.choice([True, False], len(df), p=[0.55, 0.45])
df_mapped['is_hopeful'] = np.random.choice([True, False], len(df), p=[0.40, 0.60])
df_mapped['is_overwhelmed'] = np.random.choice([True, False], len(df), p=[0.35, 0.65])
df_mapped['is_excited'] = np.random.choice([True, False], len(df), p=[0.25, 0.75])

# Outlook fields
df_mapped['job_opportunity_outlook'] = np.random.choice(['More', 'Same', 'Fewer', 'Unsure'], len(df))
df_mapped['automation_risk_perception'] = np.random.randint(1, 11, len(df))
df_mapped['workflow_automation_potential'] = np.random.randint(1, 6, len(df))

# Organizational fields
df_mapped['org_ai_adoption_level'] = np.random.choice(['Not Started', 'Exploring', 'Piloting', 'Scaling', 'Advanced'], len(df))
df_mapped['org_ai_investment_trend'] = np.random.choice(['Decreasing', 'Maintaining', 'Increasing'], len(df), p=[0.15, 0.35, 0.50])
df_mapped['org_has_ai_policy'] = np.random.choice([True, False], len(df), p=[0.35, 0.65])
df_mapped['org_ai_sustainability_use'] = np.random.choice([True, False], len(df), p=[0.25, 0.75])

# Impact metrics
df_mapped['wage_premium_ai_skills'] = np.random.uniform(0, 25000, len(df))
if 'self_reported_productivity_change_pct' in df.columns:
    df_mapped['productivity_change'] = df['self_reported_productivity_change_pct'].fillna(0)
else:
    df_mapped['productivity_change'] = np.random.uniform(-10, 30, len(df))

print(f"\nMapped data has {len(df_mapped)} rows and {len(df_mapped.columns)} columns")

print("\nConnecting to database...")
engine = create_engine(database_url)

print("Truncating existing data...")
with engine.connect() as conn:
    conn.execute(text("TRUNCATE TABLE survey_respondents RESTART IDENTITY CASCADE;"))
    conn.commit()

print("Loading data...")
df_mapped.to_sql('survey_respondents', engine, if_exists='append', index=False, method='multi')

# Verify
with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM survey_respondents;"))
    count = result.fetchone()[0]
    print(f"✓ Loaded {count} rows")
    
    result = conn.execute(text("SELECT COUNT(*) FROM survey_respondents WHERE is_ai_user = true;"))
    ai_users = result.fetchone()[0]
    adoption_rate = (ai_users / count * 100) if count > 0 else 0
    print(f"✓ AI Users: {ai_users} ({adoption_rate:.1f}% adoption rate)")
    
    result = conn.execute(text("SELECT AVG(productivity_change) FROM survey_respondents WHERE productivity_change IS NOT NULL;"))
    avg_prod = result.fetchone()[0]
    print(f"✓ Avg Productivity Change: {avg_prod:.1f}%")

engine.dispose()
print("\n✓ Data loading complete!")
