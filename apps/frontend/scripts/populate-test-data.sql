-- ============================================================================
-- POPULATE TEST DATA FOR SOUTH AFRICAN INSURANCE SYSTEM
-- ============================================================================
-- This script populates members table with realistic SA test data for:
-- 1. Valid SA ID numbers (format: YYMMDD SSSS C A Z)
-- 2. SA bank account formats
-- 3. Varied debit order and EFT dates
-- 4. Data needed for fee collections, commissions, and claims testing
-- ============================================================================

-- Update 50 members with realistic SA test data
-- We'll update existing members to avoid foreign key issues

-- ============================================================================
-- PART 1: SA ID NUMBERS
-- ============================================================================
-- SA ID Format: YYMMDD SSSS C A Z
-- YY = Year of birth (2 digits)
-- MM = Month of birth (01-12)
-- DD = Day of birth (01-31)
-- SSSS = Sequence number (0000-4999 female, 5000-9999 male)
-- C = Citizenship (0=SA citizen, 1=permanent resident)
-- A = Usually 8 (legacy race classifier, now always 8)
-- Z = Checksum digit

UPDATE members 
SET 
  id_number = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 1 THEN '8501155800084'  -- Male, 15 Jan 1985
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 2 THEN '9203203456089'  -- Female, 20 Mar 1992
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 3 THEN '7809127890081'  -- Male, 12 Sep 1978
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 4 THEN '8806251234087'  -- Female, 25 Jun 1988
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 5 THEN '9512108765083'  -- Male, 10 Dec 1995
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 6 THEN '8307142345086'  -- Female, 14 Jul 1983
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 7 THEN '9001055678082'  -- Male, 05 Jan 1990
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 8 THEN '8604183210089'  -- Female, 18 Apr 1986
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 9 THEN '9408229012084'  -- Male, 22 Aug 1994
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 10 THEN '8710304567088' -- Female, 30 Oct 1987
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 11 THEN '9106156789085' -- Male, 15 Jun 1991
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 12 THEN '8902081234086' -- Female, 08 Feb 1989
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 13 THEN '9611205432087' -- Male, 20 Nov 1996
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 14 THEN '8508273456082' -- Female, 27 Aug 1985
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 15 THEN '9209147890089' -- Male, 14 Sep 1992
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 16 THEN '8403192345081' -- Female, 19 Mar 1984
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 17 THEN '9305116543088' -- Male, 11 May 1993
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 18 THEN '8807042109083' -- Female, 04 Jul 1988
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 19 THEN '9710288765086' -- Male, 28 Oct 1997
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 20 THEN '8612154321084' -- Female, 15 Dec 1986
    ELSE id_number -- Keep existing for others
  END,
  
  -- ============================================================================
  -- PART 2: BANKING DETAILS (SA Bank Account Formats)
  -- ============================================================================
  -- Major SA Banks: Standard Bank, FNB, ABSA, Nedbank, Capitec
  -- Account numbers: 9-11 digits
  -- Branch codes: 6 digits
  
  bank_name = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 1 THEN 'Standard Bank'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 2 THEN 'FNB'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 3 THEN 'ABSA'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 4 THEN 'Nedbank'
    ELSE 'Capitec'
  END,
  
  account_number = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 1 THEN '1234567890'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 2 THEN '62345678901'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 3 THEN '4056789012'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 4 THEN '1987654321'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 5 THEN '1160123456'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 6 THEN '1098765432'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 7 THEN '62876543210'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 8 THEN '4067890123'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 9 THEN '1923456789'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 10 THEN '1160234567'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 11 THEN '1234509876'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 12 THEN '62456789012'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 13 THEN '4078901234'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 14 THEN '1956781234'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 15 THEN '1160345678'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 16 THEN '1345678901'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 17 THEN '62567890123'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 18 THEN '4089012345'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 19 THEN '1987612345'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 20 THEN '1160456789'
    ELSE LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0')
  END,
  
  branch_code = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 1 THEN '051001' -- Standard Bank
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 2 THEN '250655' -- FNB
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 3 THEN '632005' -- ABSA
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 4 THEN '198765' -- Nedbank
    ELSE '470010' -- Capitec
  END,
  
  -- ============================================================================
  -- PART 3: DEBIT ORDER & EFT DATES (Varied for testing)
  -- ============================================================================
  -- Spread across different days of the month for testing
  
  debit_order_day = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 10 = 1 THEN 1   -- 1st of month
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 10 = 2 THEN 7   -- 7th
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 10 = 3 THEN 15  -- 15th
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 10 = 4 THEN 20  -- 20th
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 10 = 5 THEN 25  -- 25th
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 10 = 6 THEN 28  -- 28th
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 10 = 7 THEN 5   -- 5th
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 10 = 8 THEN 10  -- 10th
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 10 = 9 THEN 18  -- 18th
    ELSE 26 -- 26th
  END,
  
  -- ============================================================================
  -- PART 4: PAYMENT & COLLECTION DATA (For fee collection testing)
  -- ============================================================================
  
  collection_method = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 1 THEN 'individual_debit_order'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 2 THEN 'group_debit_order'
    ELSE 'eft'
  END,
  
  payment_status = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 1 THEN 'paid'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 2 THEN 'pending'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 3 THEN 'failed'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 4 THEN 'overdue'
    ELSE 'paid'
  END,
  
  debit_order_status = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 4 = 1 THEN 'active'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 4 = 2 THEN 'pending'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 4 = 3 THEN 'suspended'
    ELSE 'active'
  END,
  
  -- Netcash account reference (unique per member)
  netcash_account_reference = 'NC' || LPAD((ROW_NUMBER() OVER (ORDER BY id))::TEXT, 8, '0'),
  
  -- Last payment date (varied - some recent, some older)
  last_payment_date = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 1 THEN CURRENT_DATE - INTERVAL '5 days'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 2 THEN CURRENT_DATE - INTERVAL '15 days'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 3 THEN CURRENT_DATE - INTERVAL '35 days'
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 4 THEN CURRENT_DATE - INTERVAL '60 days'
    ELSE CURRENT_DATE - INTERVAL '10 days'
  END,
  
  -- Next debit date (based on debit_order_day)
  next_debit_date = CASE 
    WHEN EXTRACT(DAY FROM CURRENT_DATE) < debit_order_day 
    THEN DATE_TRUNC('month', CURRENT_DATE) + (debit_order_day - 1) * INTERVAL '1 day'
    ELSE DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month') + (debit_order_day - 1) * INTERVAL '1 day'
  END,
  
  -- Total arrears (some members with arrears for testing)
  total_arrears = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 3 THEN monthly_premium * 1  -- 1 month arrears
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 5 = 4 THEN monthly_premium * 2  -- 2 months arrears
    ELSE 0
  END,
  
  -- ============================================================================
  -- PART 5: BROKER & POLICY DATA (For commission testing)
  -- ============================================================================
  
  -- Assign some members to brokers (get first 5 broker IDs)
  broker_id = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 1 THEN (SELECT id FROM brokers ORDER BY created_at LIMIT 1 OFFSET 0)
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 2 THEN (SELECT id FROM brokers ORDER BY created_at LIMIT 1 OFFSET 1)
    ELSE NULL
  END,
  
  broker_code = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 1 THEN (SELECT code FROM brokers ORDER BY created_at LIMIT 1 OFFSET 0)
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 2 THEN (SELECT code FROM brokers ORDER BY created_at LIMIT 1 OFFSET 1)
    ELSE NULL
  END,
  
  -- ============================================================================
  -- PART 6: PAYMENT GROUP ASSIGNMENT (For group payment testing)
  -- ============================================================================
  
  payment_group_id = CASE 
    WHEN collection_method = 'group_debit_order' THEN (SELECT id FROM payment_groups WHERE collection_method = 'group_debit_order' ORDER BY created_at LIMIT 1)
    WHEN collection_method = 'eft' THEN (SELECT id FROM payment_groups WHERE collection_method = 'eft' ORDER BY created_at LIMIT 1)
    ELSE NULL
  END,
  
  -- ============================================================================
  -- PART 7: CONTACT INFORMATION (Mobile vs Phone)
  -- ============================================================================
  
  mobile = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 1 THEN '0821234567'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 2 THEN '0739876543'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 3 THEN '0845678901'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 4 THEN '0712345678'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 5 THEN '0769012345'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 6 THEN '0823456789'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 7 THEN '0734567890'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 8 THEN '0845678902'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 9 THEN '0718901234'
    WHEN ROW_NUMBER() OVER (ORDER BY id) = 10 THEN '0762345678'
    ELSE '082' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 7, '0')
  END,
  
  phone = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 1 THEN '0215551234'  -- Cape Town landline
    WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 2 THEN '0115552345'  -- Johannesburg landline
    ELSE NULL -- Some members don't have landlines
  END,
  
  updated_at = NOW()
  
WHERE id IN (
  SELECT id FROM members ORDER BY id LIMIT 50
);

-- ============================================================================
-- SUMMARY QUERY: View the updated test data
-- ============================================================================

SELECT 
  member_number,
  first_name,
  last_name,
  id_number,
  bank_name,
  account_number,
  branch_code,
  debit_order_day,
  collection_method,
  payment_status,
  debit_order_status,
  netcash_account_reference,
  last_payment_date,
  next_debit_date,
  total_arrears,
  broker_code,
  payment_group_id,
  mobile,
  phone
FROM members 
WHERE id IN (SELECT id FROM members ORDER BY id LIMIT 50)
ORDER BY member_number;

-- ============================================================================
-- COLUMNS NEEDED FOR TESTING SUMMARY
-- ============================================================================
-- 
-- FEE COLLECTIONS:
-- ✓ netcash_account_reference - Unique reference for Netcash
-- ✓ debit_order_day - Day of month for collection
-- ✓ debit_order_status - active/pending/suspended
-- ✓ payment_status - paid/pending/failed/overdue
-- ✓ last_payment_date - Track payment history
-- ✓ next_debit_date - Schedule next collection
-- ✓ total_arrears - Outstanding amounts
-- ✓ collection_method - individual_debit_order/group_debit_order/eft
-- ✓ payment_group_id - For group collections
-- ✓ monthly_premium - Amount to collect
-- ✓ bank_name, account_number, branch_code - Banking details
--
-- COMMISSIONS:
-- ✓ broker_id - Link to broker
-- ✓ broker_code - Broker identifier
-- ✓ monthly_premium - Base for commission calculation
-- ✓ payment_status - Only pay commission on successful payments
-- ✓ Broker table has: broker_commission_rate, branch_commission_rate, agent_commission_rate
--
-- CLAIMS:
-- ✓ member_id - Link to member
-- ✓ plan_id - Determines coverage
-- ✓ monthly_premium - Verify member is paid up
-- ✓ payment_status - Must be active/paid for claims
-- ✓ status - Member must be 'active'
-- ✓ Claims table needs: policy_id, provider_id, service_date, claimed_amount
--
-- ============================================================================
