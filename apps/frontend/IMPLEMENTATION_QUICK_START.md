# Claims System - Quick Start Implementation Guide

## Immediate Actions (This Week)

### 1. Database Schema Updates

Run these SQL migrations in order:

```sql
-- 1. Enhance providers table
ALTER TABLE providers ADD COLUMN IF NOT EXISTS
  hpcsa_number VARCHAR,
  hpcsa_verified_at TIMESTAMP,
  pcns_practice_number VARCHAR UNIQUE,
  pcns_verified_at TIMESTAMP,
  provider_tier VARCHAR CHECK (provider_tier IN ('preferred', 'network', 'out_of_network')) DEFAULT 'network',
  tariff_rate_percentage NUMERIC DEFAULT 100.00,
  direct_payment_status VARCHAR DEFAULT 'active',
  termination_reason TEXT,
  fraud_risk_score INTEGER DEFAULT 0,
  last_fraud_review_date TIMESTAMP,
  professional_indemnity_expiry DATE,
  contract_start_date DATE,
  contract_end_date DATE,
  performance_rating NUMERIC(3,2);

-- 2. Enhance claims table
ALTER TABLE claims ADD COLUMN IF NOT EXISTS
  icd10_codes TEXT[],
  tariff_codes TEXT[],
  pre_auth_number VARCHAR,
  pre_auth_required BOOLEAN DEFAULT false,
  is_pmb BOOLEAN DEFAULT false,
  benefit_type VARCHAR,
  rejection_code VARCHAR,
  rejection_reason TEXT,
  pended_reason TEXT,
  pended_date TIMESTAMP,
  additional_info_requested TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  paid_date TIMESTAMP,
  payment_reference VARCHAR,
  fraud_alert_triggered BOOLEAN DEFAULT false,
  fraud_risk_score INTEGER DEFAULT 0,
  fraud_review_status VARCHAR,
  fraud_reviewer_id UUID REFERENCES users(id),
  fraud_review_notes TEXT,
  appeal_status VARCHAR,
  appeal_date TIMESTAMP,
  appeal_notes TEXT,
  processing_time_hours NUMERIC,
  claim_source VARCHAR DEFAULT 'provider',
  submission_method VARCHAR;

-- 3. Create claim_documents table
CREATE TABLE IF NOT EXISTS claim_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  document_type VARCHAR NOT NULL,
  document_url TEXT NOT NULL,
  ocr_data JSONB,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT now()
);

-- 4. Create claim_audit_trail table
CREATE TABLE IF NOT EXISTS claim_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  action VARCHAR NOT NULL,
  performed_by UUID REFERENCES users(id),
  previous_status VARCHAR,
  new_status VARCHAR,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 5. Create provider_fraud_alerts table
CREATE TABLE IF NOT EXISTS provider_fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id),
  alert_type VARCHAR NOT NULL,
  severity VARCHAR CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  related_claims UUID[],
  status VARCHAR DEFAULT 'open',
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP,
  resolution_notes TEXT
);

-- 6. Create pmb_conditions table
CREATE TABLE IF NOT EXISTS pmb_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_name VARCHAR NOT NULL,
  icd10_codes TEXT[],
  category VARCHAR,
  description TEXT,
  treatment_guidelines TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- 7. Create tariff_codes table
CREATE TABLE IF NOT EXISTS tariff_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR,
  base_rate NUMERIC NOT NULL,
  pmb_applicable BOOLEAN DEFAULT false,
  requires_pre_auth BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE,
  expiry_date DATE
);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_member_id ON claims(member_id);
CREATE INDEX IF NOT EXISTS idx_claims_provider_id ON claims(provider_id);
CREATE INDEX IF NOT EXISTS idx_claims_service_date ON claims(service_date);
CREATE INDEX IF NOT EXISTS idx_claims_submission_date ON claims(submission_date);
CREATE INDEX IF NOT EXISTS idx_claims_fraud_alert ON claims(fraud_alert_triggered) WHERE fraud_alert_triggered = true;
CREATE INDEX IF NOT EXISTS idx_providers_pcns ON providers(pcns_practice_number);
CREATE INDEX IF NOT EXISTS idx_providers_tier ON providers(provider_tier);
CREATE INDEX IF NOT EXISTS idx_claim_audit_claim_id ON claim_audit_trail(claim_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_provider ON provider_fraud_alerts(provider_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON provider_fraud_alerts(status);
```

### 2. Create Claims API Route

**File:** `apps/frontend/src/app/api/admin/claims/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('claims')
      .select(`
        *,
        provider:providers(id, name, provider_number),
        member:members(id, first_name, last_name, member_number)
      `, { count: 'exact' })
      .order('submission_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`claim_number.ilike.%${search}%,member.first_name.ilike.%${search}%,member.last_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      claims: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    // Generate claim number
    const claimNumber = `CLM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const claimData = {
      claim_number: claimNumber,
      member_id: body.member_id,
      provider_id: body.provider_id,
      service_date: body.service_date,
      claim_type: body.claim_type,
      claimed_amount: body.claimed_amount,
      icd10_codes: body.icd10_codes || [],
      tariff_codes: body.tariff_codes || [],
      status: 'pending',
      submission_date: new Date().toISOString(),
      claim_source: body.claim_source || 'provider',
      submission_method: body.submission_method || 'portal'
    };

    const { data, error } = await supabase
      .from('claims')
      .insert(claimData)
      .select()
      .single();

    if (error) throw error;

    // Create audit trail entry
    await supabase.from('claim_audit_trail').insert({
      claim_id: data.id,
      action: 'submitted',
      new_status: 'pending',
      notes: 'Claim submitted via portal'
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}
```

### 3. Create Claim Actions API

**File:** `apps/frontend/src/app/api/admin/claims/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        provider:providers(*),
        member:members(*),
        documents:claim_documents(*),
        audit_trail:claim_audit_trail(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching claim:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claim' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { action, ...updateData } = body;

    // Get current claim
    const { data: currentClaim } = await supabase
      .from('claims')
      .select('status')
      .eq('id', params.id)
      .single();

    // Update claim
    const { data, error } = await supabase
      .from('claims')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Create audit trail
    await supabase.from('claim_audit_trail').insert({
      claim_id: params.id,
      action: action || 'updated',
      previous_status: currentClaim?.status,
      new_status: updateData.status,
      notes: updateData.notes || `Claim ${action || 'updated'}`
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}
```

### 4. Update Claims Page to Use Real Data

**File:** `apps/frontend/src/app/admin/claims/page.tsx`

Replace the hardcoded claims array with:

```typescript
const [claims, setClaims] = useState<Claim[]>([]);
const [loading, setLoading] = useState(true);
const [totalClaims, setTotalClaims] = useState(0);

useEffect(() => {
  fetchClaims();
}, [searchTerm, statusFilter]);

const fetchClaims = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter) params.append('status', statusFilter);
    
    const response = await fetch(`/api/admin/claims?${params}`);
    const data = await response.json();
    
    setClaims(data.claims || []);
    setTotalClaims(data.total || 0);
  } catch (error) {
    console.error('Error fetching claims:', error);
  } finally {
    setLoading(false);
  }
};

const handleApprove = async (claimId: string) => {
  try {
    await fetch(`/api/admin/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approved',
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_amount: selectedClaim?.claimed_amount
      })
    });
    fetchClaims();
    setShowClaimDetails(false);
  } catch (error) {
    console.error('Error approving claim:', error);
  }
};

const handlePend = async (claimId: string) => {
  try {
    await fetch(`/api/admin/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'pended',
        status: 'pended',
        pended_date: new Date().toISOString(),
        pended_reason: 'Additional information required'
      })
    });
    fetchClaims();
    setShowClaimDetails(false);
  } catch (error) {
    console.error('Error pending claim:', error);
  }
};

const handleReject = async (claimId: string) => {
  try {
    await fetch(`/api/admin/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'rejected',
        status: 'rejected',
        rejection_code: 'R09',
        rejection_reason: 'Service excluded from coverage'
      })
    });
    fetchClaims();
    setShowClaimDetails(false);
  } catch (error) {
    console.error('Error rejecting claim:', error);
  }
};
```

### 5. Seed Sample Data (For Testing)

Create a script: `apps/frontend/scripts/seed-claims-data.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedClaims() {
  // Get first member and provider
  const { data: members } = await supabase.from('members').select('id').limit(10);
  const { data: providers } = await supabase.from('providers').select('id').limit(10);

  if (!members?.length || !providers?.length) {
    console.log('Need members and providers first');
    return;
  }

  const sampleClaims = [
    {
      claim_number: 'CLM-20260327-001',
      member_id: members[0].id,
      provider_id: providers[0].id,
      service_date: '2026-03-25',
      claim_type: 'Consultation',
      claimed_amount: 850.00,
      status: 'pending',
      icd10_codes: ['Z00.0'],
      tariff_codes: ['0190']
    },
    {
      claim_number: 'CLM-20260327-002',
      member_id: members[1].id,
      provider_id: providers[1].id,
      service_date: '2026-03-24',
      claim_type: 'Hospitalization',
      claimed_amount: 125000.00,
      status: 'pending',
      icd10_codes: ['I21.9'],
      tariff_codes: ['0010', '0190'],
      is_pmb: true,
      fraud_alert_triggered: true,
      fraud_risk_score: 75
    }
  ];

  const { data, error } = await supabase.from('claims').insert(sampleClaims).select();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Created ${data.length} sample claims`);
  }
}

seedClaims();
```

Run with: `node apps/frontend/scripts/seed-claims-data.js`

---

## Priority Order

1. ✅ Run database migrations
2. ✅ Create API routes
3. ✅ Update claims page to use real data
4. ✅ Test with sample data
5. ⏳ Add provider registration workflow
6. ⏳ Implement fraud detection
7. ⏳ Build member portal
8. ⏳ Add AI enhancements

---

## Testing Checklist

- [ ] Claims list loads from database
- [ ] Search filters work
- [ ] Status filters work
- [ ] Claim details modal shows full info
- [ ] Approve button updates status
- [ ] Pend button updates status
- [ ] Reject button updates status
- [ ] Audit trail records all actions
- [ ] Dashboard stats reflect real claims

---

## Next Steps After Basic Implementation

1. Provider onboarding workflow
2. Member claim submission portal
3. Document upload and OCR
4. Pre-authorization system
5. Payment processing integration
6. Fraud detection algorithms
7. Reporting and analytics
8. Mobile app development

---

Ready to start? Begin with the database migrations!
