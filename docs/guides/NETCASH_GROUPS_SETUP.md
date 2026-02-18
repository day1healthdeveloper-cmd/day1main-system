# Netcash Debit Order Groups Setup

## 🎯 Overview

Netcash requires you to create **Debit Order Groups** (also called Master File Groups) to organize members. Each group has its own master file and can be processed separately.

---

## 📋 Your 19 Broker Groups

You need to create these groups in Netcash dashboard:

1. **DAY1** - Day1Health Direct (715 members)
2. **D1PAR** - Parabellum (10 members)
3. **D1MAM** - Mamela (10 members)
4. **D1ACU** - Acumen Holdings (10 members)
5. **D1AIB** - Assurity Insurance Broker (10 members)
6. **D1ARC** - ARC BPO (10 members)
7. **D1AXS** - Accsure (10 members)
8. **D1BOU** - Boulderson (10 members)
9. **D1BPO** - Agency BPO (10 members)
10. **D1CSS** - CSS Credit Solutions (10 members)
11. **D1MED** - Medi-Safu Brokers (10 members)
12. **D1MEM** - Medi-Safu Montana (10 members)
13. **D1MKT** - MKT Marketing (10 members)
14. **D1MTS** - All My T (10 members)
15. **D1NAV** - Day1 Navigator (10 members)
16. **D1RCO** - Right Cover Online (10 members)
17. **D1TFG** - The Foschini Group (10 members)
18. **D1THR** - 360 Financial Service (10 members)
19. **D1TLD** - Teledirect (10 members)

---

## 🔧 How to Create Groups in Netcash Dashboard

### Step 1: Navigate to Debit Order Master File
1. Login to Netcash dashboard
2. Go to **Transactions** → **Debit Orders** → **Master File**
3. Click **"Manage Groups"** or **"Add Group"**

### Step 2: Create Each Group
For each of the 19 broker groups:

1. Click **"Add New Group"**
2. Enter:
   - **Group Code:** DAY1 (or D1PAR, D1MAM, etc.)
   - **Group Name:** Day1Health Direct (or Parabellum, Mamela, etc.)
   - **Description:** Broker channel for [name]
3. Click **"Save"**

### Step 3: Note the Group IDs
Netcash will assign a numeric ID to each group. Note these down:

```
DAY1  → Group ID: _____ (e.g., 1)
D1PAR → Group ID: _____ (e.g., 2)
D1MAM → Group ID: _____ (e.g., 3)
... etc
```

---

## 📊 Group Structure in Netcash

### Master File Groups
Each group maintains its own:
- Member list (master file)
- Debit order history
- Success/failure rates
- Collection reports

### Benefits of Separate Groups
- ✅ Process groups independently
- ✅ Different debit dates per group
- ✅ Separate reporting per broker
- ✅ Commission tracking per broker
- ✅ Performance analysis per broker

---

## 🔄 Integration with Day1Health System

### Database Mapping
We'll store the Netcash group ID in our database:

```sql
-- Add netcash_group_id to members table
ALTER TABLE members ADD COLUMN netcash_group_id INT;

-- Update members with their group IDs
UPDATE members SET netcash_group_id = 1 WHERE broker_group = 'DAY1';
UPDATE members SET netcash_group_id = 2 WHERE broker_group = 'D1PAR';
-- ... etc for all 19 groups
```

### File Generation
When generating debit order files, include the group ID:

```
Field 281: Debit masterfile group
Value: 1 (for DAY1), 2 (for D1PAR), etc.
```

---

## 📝 Setup Checklist

### In Netcash Dashboard:
- [ ] Create group: DAY1
- [ ] Create group: D1PAR
- [ ] Create group: D1MAM
- [ ] Create group: D1ACU
- [ ] Create group: D1AIB
- [ ] Create group: D1ARC
- [ ] Create group: D1AXS
- [ ] Create group: D1BOU
- [ ] Create group: D1BPO
- [ ] Create group: D1CSS
- [ ] Create group: D1MED
- [ ] Create group: D1MEM
- [ ] Create group: D1MKT
- [ ] Create group: D1MTS
- [ ] Create group: D1NAV
- [ ] Create group: D1RCO
- [ ] Create group: D1TFG
- [ ] Create group: D1THR
- [ ] Create group: D1TLD
- [ ] Note all group IDs

### In Day1Health System:
- [ ] Add netcash_group_id column to members table
- [ ] Update members with correct group IDs
- [ ] Update file generator to include group IDs
- [ ] Test file generation with groups
- [ ] Upload test file to Netcash

---

## 🧪 Testing Strategy

### Phase 1: Create One Group (DAY1)
1. Create DAY1 group in Netcash
2. Add 5 test members to DAY1 group
3. Generate batch file with group ID
4. Upload to Netcash
5. Verify members appear in DAY1 group

### Phase 2: Create All Groups
1. Create remaining 18 groups
2. Note all group IDs
3. Update database with group IDs
4. Generate test file with all groups
5. Upload and verify

### Phase 3: Production
1. Process each group separately
2. Monitor success rates per group
3. Generate reports per group
4. Track commissions per group

---

## 📋 Group ID Mapping Template

Once you create the groups, fill this in:

```javascript
const NETCASH_GROUP_MAPPING = {
  'DAY1': 1,   // Replace with actual Netcash group ID
  'D1PAR': 2,  // Replace with actual Netcash group ID
  'D1MAM': 3,  // Replace with actual Netcash group ID
  'D1ACU': 4,
  'D1AIB': 5,
  'D1ARC': 6,
  'D1AXS': 7,
  'D1BOU': 8,
  'D1BPO': 9,
  'D1CSS': 10,
  'D1MED': 11,
  'D1MEM': 12,
  'D1MKT': 13,
  'D1MTS': 14,
  'D1NAV': 15,
  'D1RCO': 16,
  'D1TFG': 17,
  'D1THR': 18,
  'D1TLD': 19,
};
```

---

## 🎯 Next Steps

1. **Go to Netcash Dashboard**
2. **Create the 19 groups** (start with DAY1 for testing)
3. **Note the group IDs** Netcash assigns
4. **Come back** and I'll update the system with the group IDs

---

## 📞 Need Help?

**Netcash Support:**
- Email: support@netcash.co.za
- Phone: Check dashboard for support number
- Ask: "How do I create debit order master file groups?"

**What to Ask:**
- "I need to create 19 separate debit order groups for different broker channels"
- "Can you guide me through creating master file groups?"
- "What's the best practice for managing multiple broker groups?"

---

**Status:** Waiting for Netcash group creation
**Next:** Update system with group IDs once created
