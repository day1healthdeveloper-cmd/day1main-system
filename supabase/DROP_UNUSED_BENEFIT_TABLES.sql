-- Drop unused structured benefits tables
-- Run this in Supabase SQL Editor to clean up unused tables

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS benefit_change_history CASCADE;
DROP TABLE IF EXISTS benefit_authorization_rules CASCADE;
DROP TABLE IF EXISTS benefit_procedure_codes CASCADE;
DROP TABLE IF EXISTS benefit_network_providers CASCADE;
DROP TABLE IF EXISTS benefit_conditions CASCADE;
DROP TABLE IF EXISTS benefit_exclusions CASCADE;
DROP TABLE IF EXISTS benefit_details CASCADE;
DROP TABLE IF EXISTS benefit_plan_documents CASCADE;
DROP TABLE IF EXISTS benefit_usage CASCADE;
DROP TABLE IF EXISTS product_chronic_benefits CASCADE;
DROP TABLE IF EXISTS product_benefits CASCADE;
DROP TABLE IF EXISTS benefit_types CASCADE;

-- Note: We're keeping policy_sections and policy_section_items as those contain the actual data
