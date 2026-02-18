# Netcash Groups - Next Steps

## 🎯 Current Situation

You have **19 broker groups** in your Day1Health system, but Netcash needs you to create corresponding **master file groups** in their dashboard.

---

## 📋 Step-by-Step Process

### Step 1: Add Column to Database ✅

**Run this SQL in Supabase Dashboard:**

1. Go to: https://ldygmpaipxbokxzyzyti.supabase.co
2. Click: SQL Editor
3. Click: New Query
4. Paste this SQL:

```sql
ALTER TABLE members ADD COLUMN IF NOT EXISTS netcash_group_id INT;
CREATE INDEX IF NOT EXISTS idx_members_netcash_group ON members(netcash_group_id);
```

5. Click: Run

---

### Step 2: Create Groups in Netcash Dashboard ⏳

**Go to Netcash Dashboard:**
https://merchant.netcash.co.za

**Navigate to:**
Transactions → Debit Orders → Master File → Manage Groups

**Create these 19 groups:**

1. **DAY1** - Day1Health Direct
2. **D1PAR** - Parabellum  
3. **D1MAM** - Mamela
4. **D1ACU** - Acumen Holdings
5. **D1AIB** - Assurity Insurance Broker
6. **D1ARC** - ARC BPO
7. **D1AXS** - Accsure
8. **D1BOU** - Boulderson
9. **D1BPO** - Agency BPO
10. **D1CSS** - CSS Credit Solutions
11. **D1MED** - Medi-Safu Brokers
12. **D1MEM** - Medi-Safu Montana
13. **D1MKT** - MKT Marketing
14. **D1MTS** - All My T
15. **D1NAV** - Day1 Navigator
16. **D1RCO** - Right Cover Online
17. **D1TFG** - The Foschini Group
18. **D1THR** - 360 Financial Service
19. **D1TLD** - Teledirect

**For each group:**
- Click "Add New Group"
- Enter Group Code (e.g., DAY1)
- Enter Group Name (e.g., Day1Health Direct)
- Click Save
- **Note the Group ID** Netcash assigns (e.g., 1, 2, 3...)

---

### Step 3: Update Mapping Script ⏳

Once you have the actual Netcash group IDs, update this file:

**File:** `supabase/add-netcash-groups.js`

**Update this section:**
```javascript
const groupMapping = {
  'DAY1': 1,   // Replace 1 with actual Netcash group ID
  'D1PAR': 2,  // Replace 2 with actual Netcash group ID
  'D1MAM': 3,  // Replace 3 with actual Netcash group ID
  // ... etc
};
```

---

### Step 4: Run Update Script ⏳

**In terminal:**
```bash
cd supabase
node add-netcash-groups.js
```

This will update all 900 members with their correct Netcash group IDs.

---

### Step 5: Test File Generation ⏳

**Generate a test file:**
```bash
cd netcash-integration
node test-file-generation.js
```

**Check the file includes group IDs:**
- Open: `netcash-integration/output/TEST_BATCH_[date].txt`
- Look for field 281 in transaction records
- Should show group IDs (1, 2, 3, etc.)

---

### Step 6: Upload Test File ⏳

**In Netcash Dashboard:**
1. Go to: Debit Orders → Batch Upload
2. Select: Two-day debit order
3. Select: Action date (2+ business days ahead)
4. Upload: Test batch file
5. Submit
6. Check: Members appear in correct groups

---

## 🔍 Quick Test (Start with DAY1 Only)

**To test the process:**

1. Create just **ONE group** in Netcash: **DAY1**
2. Note the group ID (e.g., 101)
3. Update script: `'DAY1': 101`
4. Run script to update DAY1 members only
5. Generate test file with 5 DAY1 members
6. Upload to Netcash
7. Verify members appear in DAY1 group
8. If successful, create remaining 18 groups

---

## 📊 Group ID Template

Fill this in as you create groups in Netcash:

```
DAY1  → Netcash Group ID: _____
D1PAR → Netcash Group ID: _____
D1MAM → Netcash Group ID: _____
D1ACU → Netcash Group ID: _____
D1AIB → Netcash Group ID: _____
D1ARC → Netcash Group ID: _____
D1AXS → Netcash Group ID: _____
D1BOU → Netcash Group ID: _____
D1BPO → Netcash Group ID: _____
D1CSS → Netcash Group ID: _____
D1MED → Netcash Group ID: _____
D1MEM → Netcash Group ID: _____
D1MKT → Netcash Group ID: _____
D1MTS → Netcash Group ID: _____
D1NAV → Netcash Group ID: _____
D1RCO → Netcash Group ID: _____
D1TFG → Netcash Group ID: _____
D1THR → Netcash Group ID: _____
D1TLD → Netcash Group ID: _____
```

---

## ❓ Need Help?

**Can't find "Manage Groups" in Netcash?**
- Contact: support@netcash.co.za
- Ask: "How do I create debit order master file groups?"
- Mention: "I need to create 19 separate groups for different broker channels"

**Groups not showing in dashboard?**
- Check: Account Profile → Services → Debit Orders
- Ensure: Debit order service is fully activated
- May need: Netcash to enable group management feature

---

## ✅ Checklist

- [ ] Step 1: Add netcash_group_id column to database
- [ ] Step 2: Create 19 groups in Netcash dashboard
- [ ] Step 3: Note all group IDs
- [ ] Step 4: Update mapping script with real IDs
- [ ] Step 5: Run update script
- [ ] Step 6: Generate test file
- [ ] Step 7: Upload and verify

---

**Current Status:** Waiting for Netcash group creation
**Next Action:** Create groups in Netcash dashboard
