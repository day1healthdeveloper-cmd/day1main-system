-- Distribute member strike dates across weekdays in March 2026 for testing
-- March 2026 Calendar:
-- Sun Mon Tue Wed Thu Fri Sat
--   1   2   3   4   5   6   7
--   8   9  10  11  12  13  14
--  15  16  17  18  19  20  21  (21 = Human Rights Day - Public Holiday)
--  22  23  24  25  26  27  28
--  29  30  31

-- SA Public Holidays in March 2026:
-- March 21 (Saturday) - Human Rights Day

-- Weekdays available for testing (excluding weekends):
-- Week 1: Mon 2, Tue 3, Wed 4, Thu 5, Fri 6
-- Week 2: Mon 9, Tue 10, Wed 11, Thu 12, Fri 13
-- Week 3: Mon 16, Tue 17, Wed 18, Thu 19, Fri 20
-- Week 4: Mon 23, Tue 24, Wed 25, Thu 26
-- Week 5: Mon 30, Tue 31

-- Strategy: Distribute members across different weekdays
-- Each day will have ~150-200 members for testing visibility

BEGIN;

-- Monday strikes (2, 9, 16, 23, 30)
UPDATE members 
SET debit_order_day = 2
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  ORDER BY id
  LIMIT 150
);

UPDATE members 
SET debit_order_day = 9
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 150
);

UPDATE members 
SET debit_order_day = 16
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 150
);

UPDATE members 
SET debit_order_day = 23
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 150
);

UPDATE members 
SET debit_order_day = 30
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 150
);

-- Tuesday strikes (3, 10, 17, 24, 31)
UPDATE members 
SET debit_order_day = 3
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 150
);

UPDATE members 
SET debit_order_day = 10
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 150
);

UPDATE members 
SET debit_order_day = 17
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 150
);

UPDATE members 
SET debit_order_day = 24
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 150
);

UPDATE members 
SET debit_order_day = 31
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 150
);

-- Wednesday strikes (4, 11, 18, 25)
UPDATE members 
SET debit_order_day = 4
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 200
);

UPDATE members 
SET debit_order_day = 11
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 200
);

UPDATE members 
SET debit_order_day = 18
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 200
);

UPDATE members 
SET debit_order_day = 25
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 200
);

-- Thursday strikes (5, 12, 19, 26)
UPDATE members 
SET debit_order_day = 5
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 200
);

UPDATE members 
SET debit_order_day = 12
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 200
);

UPDATE members 
SET debit_order_day = 19
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 200
);

UPDATE members 
SET debit_order_day = 26
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 200
);

-- Friday strikes (6, 13, 20)
UPDATE members 
SET debit_order_day = 6
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 250
);

UPDATE members 
SET debit_order_day = 13
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 250
);

UPDATE members 
SET debit_order_day = 20
WHERE id IN (
  SELECT id FROM members 
  WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
  AND status = 'active'
  AND debit_order_day IS NULL
  ORDER BY id
  LIMIT 250
);

-- Assign remaining members to day 15 (Sunday - for edge case testing)
UPDATE members 
SET debit_order_day = 15
WHERE collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
AND status = 'active'
AND debit_order_day IS NULL;

COMMIT;

-- Verification queries
SELECT 
  debit_order_day,
  COUNT(*) as member_count,
  COUNT(CASE WHEN collection_method = 'individual_debit_order' THEN 1 END) as individual_count,
  COUNT(CASE WHEN collection_method = 'group_debit_order' THEN 1 END) as group_count,
  COUNT(CASE WHEN collection_method = 'eft' THEN 1 END) as eft_count,
  CASE 
    WHEN debit_order_day IN (2, 9, 16, 23, 30) THEN 'Monday'
    WHEN debit_order_day IN (3, 10, 17, 24, 31) THEN 'Tuesday'
    WHEN debit_order_day IN (4, 11, 18, 25) THEN 'Wednesday'
    WHEN debit_order_day IN (5, 12, 19, 26) THEN 'Thursday'
    WHEN debit_order_day IN (6, 13, 20) THEN 'Friday'
    WHEN debit_order_day IN (1, 8, 15, 22, 29) THEN 'Sunday'
    WHEN debit_order_day IN (7, 14, 21, 28) THEN 'Saturday'
  END as day_of_week
FROM members
WHERE status = 'active'
AND collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
GROUP BY debit_order_day
ORDER BY debit_order_day;

-- Summary by day of week
SELECT 
  CASE 
    WHEN debit_order_day IN (2, 9, 16, 23, 30) THEN 'Monday'
    WHEN debit_order_day IN (3, 10, 17, 24, 31) THEN 'Tuesday'
    WHEN debit_order_day IN (4, 11, 18, 25) THEN 'Wednesday'
    WHEN debit_order_day IN (5, 12, 19, 26) THEN 'Thursday'
    WHEN debit_order_day IN (6, 13, 20) THEN 'Friday'
    WHEN debit_order_day IN (1, 8, 15, 22, 29) THEN 'Sunday'
    WHEN debit_order_day IN (7, 14, 21, 28) THEN 'Saturday'
  END as day_of_week,
  COUNT(*) as total_members,
  SUM(monthly_premium) as total_amount
FROM members
WHERE status = 'active'
AND collection_method IN ('individual_debit_order', 'group_debit_order', 'eft')
GROUP BY day_of_week
ORDER BY 
  CASE day_of_week
    WHEN 'Monday' THEN 1
    WHEN 'Tuesday' THEN 2
    WHEN 'Wednesday' THEN 3
    WHEN 'Thursday' THEN 4
    WHEN 'Friday' THEN 5
    WHEN 'Saturday' THEN 6
    WHEN 'Sunday' THEN 7
  END;
