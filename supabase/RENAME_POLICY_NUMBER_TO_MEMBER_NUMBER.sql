-- Rename policy_number column to member_number in policies table

ALTER TABLE policies 
RENAME COLUMN policy_number TO member_number;
