/**
 * ============================================================================
 * Database Connection Module
 * ============================================================================
 * Description: Neon PostgreSQL serverless connection
 * ============================================================================
 */

import { neon } from '@neondatabase/serverless';

// Validate environment variable
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not defined. Please add it to your .env.local file.'
  );
}

// Create serverless SQL client
export const sql = neon(process.env.DATABASE_URL);

// Type definitions for our data models
export interface SurveyRespondent {
  id: string;
  respondent_id: string;
  age_group: string;
  education_level: string;
  income_level: number;
  industry_sector: string;
  job_role: string;
  company_size: string;
  years_experience: number;
  is_ai_user: boolean;
  ai_usage_frequency: string;
  ai_comfort_level: number;
  ai_training_received: boolean;
  ai_tools_used_count: number;
  ai_agents_awareness_level: number;
  is_worried: boolean;
  is_hopeful: boolean;
  is_overwhelmed: boolean;
  is_excited: boolean;
  job_opportunity_outlook: string;
  automation_risk_perception: number;
  workflow_automation_potential: number;
  org_ai_adoption_level: string;
  org_ai_investment_trend: string;
  org_has_ai_policy: boolean;
  org_ai_sustainability_use: boolean;
  wage_premium_ai_skills: number;
  productivity_change: number;
  created_at: string;
}

export interface KPIMetrics {
  adoptionRate: number;
  avgProductivity: number;
  avgIncome: number;
  totalRespondents: number;
}

export interface AdoptionBySize {
  companySize: string;
  adoptionRate: number;
  totalRespondents: number;
}

export interface SentimentMetrics {
  worried: number;
  hopeful: number;
  overwhelmed: number;
  excited: number;
}
