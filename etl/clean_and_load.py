#!/usr/bin/env python3
"""
============================================================================
AI Workforce Analytics Platform - ETL Pipeline
============================================================================
Description: Clean, validate, and load survey data into Neon PostgreSQL
Author: Group 14
Version: 1.0
============================================================================
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import os
import sys
from datetime import datetime
import json

# ============================================================================
# CONFIGURATION
# ============================================================================

# Data file paths
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'Data')
CSV_FILES = [
    os.path.join(DATA_DIR, 'industry_report_metrics.csv'),
    os.path.join(DATA_DIR, 'public_opinion_responses.csv'),
    os.path.join(DATA_DIR, 'survey_empirical_responses.csv')
]

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    print("Please set it using: export DATABASE_URL='your_neon_connection_string'")
    sys.exit(1)

# Benchmark ranges (from research)
BENCHMARKS = {
    'ai_adoption_rate': (12, 20),      # McKinsey 2024: 12-20%
    'worry_sentiment': (45, 60),        # Pew Research 2023: 45-60%
    'wage_premium': (45, 65),           # Stanford HAI: 45-65%
    'policy_adoption': (25, 45),        # Deloitte 2024: 25-45%
    'training_effectiveness': (20, 30)  # MIT/IBM 2024: 20-30%
}

# ============================================================================
# DATA READING
# ============================================================================

def read_and_merge_data(file_paths):
    """Read and merge all CSV files into a single DataFrame"""
    print("\n" + "="*80)
    print("STEP 1: READING DATA FILES")
    print("="*80)
    
    dataframes = []
    for file_path in file_paths:
        if os.path.exists(file_path):
            print(f"✓ Reading: {os.path.basename(file_path)}")
            df = pd.read_csv(file_path)
            print(f"  - Rows: {len(df)}, Columns: {len(df.columns)}")
            dataframes.append(df)
        else:
            print(f"✗ File not found: {file_path}")
    
    if not dataframes:
        print("ERROR: No data files found!")
        sys.exit(1)
    
    # For this project, we'll use the survey_empirical_responses as the main dataset
    # If multiple files exist, we'll concatenate them
    if len(dataframes) > 1:
        print(f"\n✓ Merging {len(dataframes)} datasets...")
        merged_df = pd.concat(dataframes, ignore_index=True)
    else:
        merged_df = dataframes[0]
    
    print(f"\n✓ Total merged data: {len(merged_df)} rows, {len(merged_df.columns)} columns")
    return merged_df

# ============================================================================
# DATA CLEANING FUNCTIONS
# ============================================================================

def fix_age_experience_mismatch(df):
    """Fix impossible age/experience combinations"""
    print("\n" + "="*80)
    print("STEP 2: FIXING AGE/EXPERIENCE MISMATCHES")
    print("="*80)
    
    # Define maximum experience by age group
    age_max_experience = {
        '18-29': 14,  # 29 - 15 (typical work start age)
        '30-49': 34,  # 49 - 15
        '50+': 55     # 70 - 15 (generous upper bound)
    }
    
    issues_fixed = 0
    
    if 'age_group' in df.columns and 'years_experience' in df.columns:
        for age_group, max_exp in age_max_experience.items():
            mask = (df['age_group'] == age_group) & (df['years_experience'] > max_exp)
            count = mask.sum()
            if count > 0:
                print(f"✓ Fixed {count} records in age group '{age_group}' with experience > {max_exp}")
                df.loc[mask, 'years_experience'] = np.random.randint(0, max_exp + 1, size=count)
                issues_fixed += count
    
    print(f"\n✓ Total issues fixed: {issues_fixed}")
    return df

def normalize_boolean_fields(df):
    """Normalize boolean fields to True/False"""
    print("\n" + "="*80)
    print("STEP 3: NORMALIZING BOOLEAN FIELDS")
    print("="*80)
    
    boolean_columns = [
        'is_ai_user', 'ai_training_received', 
        'is_worried', 'is_hopeful', 'is_overwhelmed', 'is_excited',
        'org_has_ai_policy', 'org_ai_sustainability_use'
    ]
    
    for col in boolean_columns:
        if col in df.columns:
            # Convert to string first, then map
            df[col] = df[col].astype(str).str.lower().str.strip()
            df[col] = df[col].map({
                'true': True, 'false': False,
                '1': True, '0': False,
                'yes': True, 'no': False,
                't': True, 'f': False
            }).fillna(False)
            print(f"✓ Normalized: {col}")
    
    return df

def standardize_categorical_fields(df):
    """Standardize categorical field values"""
    print("\n" + "="*80)
    print("STEP 4: STANDARDIZING CATEGORICAL FIELDS")
    print("="*80)
    
    # AI Usage Frequency
    if 'ai_usage_frequency' in df.columns:
        frequency_map = {
            'never': 'Never', 'rarely': 'Rarely', 
            'monthly': 'Monthly', 'weekly': 'Weekly', 'daily': 'Daily'
        }
        df['ai_usage_frequency'] = df['ai_usage_frequency'].astype(str).str.lower().str.strip()
        df['ai_usage_frequency'] = df['ai_usage_frequency'].map(frequency_map).fillna('Rarely')
        print(f"✓ Standardized: ai_usage_frequency")
    
    # Education Level
    if 'education_level' in df.columns:
        education_map = {
            'high school': 'High School',
            'some college': 'Some College',
            'bachelor': 'Bachelor',
            'bachelors': 'Bachelor',
            'master': 'Master',
            'masters': 'Master',
            'phd': 'PhD',
            'doctorate': 'PhD'
        }
        df['education_level'] = df['education_level'].astype(str).str.lower().str.strip()
        df['education_level'] = df['education_level'].map(education_map).fillna(df['education_level'])
        print(f"✓ Standardized: education_level")
    
    # Company Size
    if 'company_size' in df.columns:
        size_map = {
            '1-50': '1-50', '51-200': '51-200', 
            '201-1000': '201-1000', '1000+': '1000+'
        }
        df['company_size'] = df['company_size'].astype(str).str.strip()
        print(f"✓ Standardized: company_size")
    
    # Job Role
    if 'job_role' in df.columns:
        role_map = {
            'ic': 'Individual Contributor',
            'individual contributor': 'Individual Contributor',
            'manager': 'Manager',
            'executive': 'Executive',
            'exec': 'Executive',
            'other': 'Other'
        }
        df['job_role'] = df['job_role'].astype(str).str.lower().str.strip()
        df['job_role'] = df['job_role'].map(role_map).fillna('Other')
        print(f"✓ Standardized: job_role")
    
    return df

def handle_wage_premium(df):
    """Convert wage premium to consistent format"""
    print("\n" + "="*80)
    print("STEP 5: HANDLING WAGE PREMIUM CALCULATION")
    print("="*80)
    
    if 'wage_premium_ai_skills' in df.columns:
        # Check if values look like currency (> 1000) or percentage
        median_value = df['wage_premium_ai_skills'].median()
        
        if median_value > 1000:
            print(f"✓ Detected currency format (median: ${median_value:,.2f})")
            print("  Converting to percentage relative to income_level...")
            
            if 'income_level' in df.columns:
                # Calculate percentage premium
                df['wage_premium_pct'] = ((df['wage_premium_ai_skills'] - df['income_level']) / 
                                          df['income_level'] * 100).clip(-100, 200)
                print(f"✓ Created wage_premium_pct column")
            else:
                # If no income_level, assume wage_premium is already the premium amount
                df['wage_premium_pct'] = (df['wage_premium_ai_skills'] / 100000 * 50).clip(0, 100)
        else:
            print(f"✓ Detected percentage format (median: {median_value:.2f}%)")
            df['wage_premium_pct'] = df['wage_premium_ai_skills']
    
    return df

def validate_numeric_ranges(df):
    """Ensure numeric fields are within valid ranges"""
    print("\n" + "="*80)
    print("STEP 6: VALIDATING NUMERIC RANGES")
    print("="*80)
    
    # AI Comfort Level (1-5)
    if 'ai_comfort_level' in df.columns:
        df['ai_comfort_level'] = df['ai_comfort_level'].clip(1, 5)
        print(f"✓ Validated: ai_comfort_level (1-5)")
    
    # Productivity Change (-100 to +100)
    if 'productivity_change' in df.columns:
        df['productivity_change'] = df['productivity_change'].clip(-100, 100)
        print(f"✓ Validated: productivity_change (-100 to +100)")
    
    # Automation Risk Perception (1-10)
    if 'automation_risk_perception' in df.columns:
        df['automation_risk_perception'] = df['automation_risk_perception'].clip(1, 10)
        print(f"✓ Validated: automation_risk_perception (1-10)")
    
    # AI Agents Awareness Level (1-5)
    if 'ai_agents_awareness_level' in df.columns:
        df['ai_agents_awareness_level'] = df['ai_agents_awareness_level'].clip(1, 5)
        print(f"✓ Validated: ai_agents_awareness_level (1-5)")
    
    # Workflow Automation Potential (1-5)
    if 'workflow_automation_potential' in df.columns:
        df['workflow_automation_potential'] = df['workflow_automation_potential'].clip(1, 5)
        print(f"✓ Validated: workflow_automation_potential (1-5)")
    
    return df

def generate_respondent_ids(df):
    """Generate unique respondent IDs if not present"""
    print("\n" + "="*80)
    print("STEP 7: GENERATING RESPONDENT IDs")
    print("="*80)
    
    if 'respondent_id' not in df.columns:
        df['respondent_id'] = ['RESP_' + str(i).zfill(5) for i in range(1, len(df) + 1)]
        print(f"✓ Generated {len(df)} unique respondent IDs")
    else:
        print(f"✓ Respondent IDs already exist")
    
    return df

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

def validate_against_benchmarks(df):
    """Validate dataset against research benchmarks"""
    print("\n" + "="*80)
    print("STEP 8: VALIDATING AGAINST RESEARCH BENCHMARKS")
    print("="*80)
    
    validation_results = {}
    
    # AI Adoption Rate
    if 'is_ai_user' in df.columns:
        adoption_rate = df['is_ai_user'].mean() * 100
        min_bench, max_bench = BENCHMARKS['ai_adoption_rate']
        status = "✓" if min_bench <= adoption_rate <= max_bench else "✗"
        validation_results['ai_adoption_rate'] = {
            'value': adoption_rate,
            'benchmark': f"{min_bench}-{max_bench}%",
            'status': 'PASS' if status == "✓" else 'WARNING'
        }
        print(f"{status} AI Adoption Rate: {adoption_rate:.2f}% (benchmark: {min_bench}-{max_bench}%)")
    
    # Worry Sentiment
    if 'is_worried' in df.columns:
        worry_rate = df['is_worried'].mean() * 100
        min_bench, max_bench = BENCHMARKS['worry_sentiment']
        status = "✓" if min_bench <= worry_rate <= max_bench else "✗"
        validation_results['worry_sentiment'] = {
            'value': worry_rate,
            'benchmark': f"{min_bench}-{max_bench}%",
            'status': 'PASS' if status == "✓" else 'WARNING'
        }
        print(f"{status} Worry Sentiment: {worry_rate:.2f}% (benchmark: {min_bench}-{max_bench}%)")
    
    # Policy Adoption
    if 'org_has_ai_policy' in df.columns:
        policy_rate = df['org_has_ai_policy'].mean() * 100
        min_bench, max_bench = BENCHMARKS['policy_adoption']
        status = "✓" if min_bench <= policy_rate <= max_bench else "✗"
        validation_results['policy_adoption'] = {
            'value': policy_rate,
            'benchmark': f"{min_bench}-{max_bench}%",
            'status': 'PASS' if status == "✓" else 'WARNING'
        }
        print(f"{status} Policy Adoption: {policy_rate:.2f}% (benchmark: {min_bench}-{max_bench}%)")
    
    # Training Impact on Adoption
    if 'ai_training_received' in df.columns and 'is_ai_user' in df.columns:
        trained = df[df['ai_training_received'] == True]['is_ai_user'].mean() * 100
        untrained = df[df['ai_training_received'] == False]['is_ai_user'].mean() * 100
        improvement = trained - untrained
        min_bench, max_bench = BENCHMARKS['training_effectiveness']
        status = "✓" if min_bench <= improvement <= max_bench else "✗"
        validation_results['training_effectiveness'] = {
            'value': improvement,
            'benchmark': f"{min_bench}-{max_bench}%",
            'status': 'PASS' if status == "✓" else 'WARNING'
        }
        print(f"{status} Training Impact: +{improvement:.2f}% adoption (benchmark: {min_bench}-{max_bench}%)")
    
    # Save validation results
    validation_file = os.path.join(os.path.dirname(__file__), 'validation_results.json')
    with open(validation_file, 'w') as f:
        json.dump(validation_results, f, indent=2)
    print(f"\n✓ Validation results saved to: {validation_file}")
    
    return validation_results

def generate_data_quality_report(df):
    """Generate comprehensive data quality report"""
    print("\n" + "="*80)
    print("STEP 9: DATA QUALITY REPORT")
    print("="*80)
    
    report = {
        'total_rows': len(df),
        'total_columns': len(df.columns),
        'missing_values': df.isnull().sum().to_dict(),
        'duplicate_respondents': df['respondent_id'].duplicated().sum() if 'respondent_id' in df.columns else 0,
        'data_types': df.dtypes.astype(str).to_dict()
    }
    
    print(f"✓ Total Rows: {report['total_rows']}")
    print(f"✓ Total Columns: {report['total_columns']}")
    print(f"✓ Duplicate Respondents: {report['duplicate_respondents']}")
    
    missing_count = sum(report['missing_values'].values())
    if missing_count > 0:
        print(f"⚠ Missing Values: {missing_count}")
        for col, count in report['missing_values'].items():
            if count > 0:
                print(f"  - {col}: {count}")
    else:
        print(f"✓ No Missing Values")
    
    # Save report
    report_file = os.path.join(os.path.dirname(__file__), 'data_quality_report.json')
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    print(f"\n✓ Data quality report saved to: {report_file}")
    
    return report

# ============================================================================
# DATABASE LOADING
# ============================================================================

def load_to_database(df, database_url):
    """Load cleaned data into Neon PostgreSQL"""
    print("\n" + "="*80)
    print("STEP 10: LOADING DATA TO NEON DATABASE")
    print("="*80)
    
    try:
        # Create database engine
        engine = create_engine(database_url)
        print(f"✓ Connected to database")
        
        # Drop existing data and load new data
        df.to_sql('survey_respondents', engine, if_exists='replace', index=False, method='multi')
        print(f"✓ Loaded {len(df)} rows to survey_respondents table")
        
        # Verify load
        verification_query = "SELECT COUNT(*) as count FROM survey_respondents;"
        result = pd.read_sql(verification_query, engine)
        print(f"✓ Verification: {result['count'].iloc[0]} rows in database")
        
        engine.dispose()
        return True
        
    except Exception as e:
        print(f"✗ ERROR loading to database: {str(e)}")
        return False

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main ETL pipeline execution"""
    print("\n")
    print("="*80)
    print("AI WORKFORCE ANALYTICS PLATFORM - ETL PIPELINE")
    print("="*80)
    print(f"Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Step 1: Read data
        df = read_and_merge_data(CSV_FILES)
        
        # Step 2-7: Clean and transform data
        df = fix_age_experience_mismatch(df)
        df = normalize_boolean_fields(df)
        df = standardize_categorical_fields(df)
        df = handle_wage_premium(df)
        df = validate_numeric_ranges(df)
        df = generate_respondent_ids(df)
        
        # Step 8-9: Validate data
        validation_results = validate_against_benchmarks(df)
        quality_report = generate_data_quality_report(df)
        
        # Save cleaned CSV
        output_file = os.path.join(os.path.dirname(__file__), 'cleaned_survey_data.csv')
        df.to_csv(output_file, index=False)
        print(f"\n✓ Cleaned data saved to: {output_file}")
        
        # Step 10: Load to database
        success = load_to_database(df, DATABASE_URL)
        
        if success:
            print("\n" + "="*80)
            print("✓ ETL PIPELINE COMPLETED SUCCESSFULLY")
            print("="*80)
        else:
            print("\n" + "="*80)
            print("⚠ ETL PIPELINE COMPLETED WITH WARNINGS")
            print("="*80)
            
    except Exception as e:
        print("\n" + "="*80)
        print("✗ ETL PIPELINE FAILED")
        print("="*80)
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
