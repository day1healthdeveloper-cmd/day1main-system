# Audit Module

The Audit Module provides comprehensive audit logging for Day1Main, ensuring all critical operations are tracked in an immutable audit trail.

## Features

- ✅ **Immutable Audit Trail**: Audit events can only be created, never updated or deleted
- ✅ **Automatic HTTP Logging**: All mutation requests (POST, PUT, PATCH, DELETE) are automatically logged
- ✅ **Entity Audit Trail**: Track complete history of any entity
- ✅ **User Activity Tracking**: View all actions performed by a user
- ✅ **Audit Statistics**: Generate reports on audit activity
- ✅ **Helper Functions**: Pre-built helpers for common audit operations

## Usage

### Automatic Audit Logging

The `AuditInterceptor` automatically logs all HTTP mutation requests:

```typescript
// Automatically logged:
POST /api/v1/members
PUT /api/v1/policies/:id
DELETE /api/v1/claims/:id
```

### Manual Audit Logging

Use the `AuditService` to manually log events:

```typescript
import { AuditService } from './audit/audit.service'

@Injectable()
export class ClaimsService {
  constructor(private auditService: AuditService) {}

  async approveClaim(claimId: string, userId: string) {
    // ... approve claim logic ...

    // Log the decision
    await this.auditService.logEvent({
      event_type: 'claim',
      entity_type: 'claim',
      entity_id: claimId,
      user_id: userId,
      action: 'claim_approved',
      before_state: { status: 'pending' },
      after_state: { status: 'approved' },
      metadata: {
        approved_amount: 1500.00,
      },
    })
  }
}
```

### Using Audit Helpers

Pre-built helpers for common operations:

```typescript
import { AuditHelper } from './audit/helpers/audit.helper'

// Log a claim decision
await AuditHelper.logClaimDecision(
  auditService,
  claimId,
  userId,
  'approved',
  beforeState,
  afterState,
  { approved_amount: 1500.00 }
)

// Log a benefit rule change
await AuditHelper.logBenefitRuleChange(
  auditService,
  ruleId,
  userId,
  'rule_updated',
  oldRule,
  newRule
)

// Log a product approval
await AuditHelper.logProductApproval(
  auditService,
  productId,
  userId,
  'compliance_officer',
  { notes: 'Approved after review' }
)
```

## API Endpoints

### Query Audit Events
```
GET /api/v1/audit/events?event_type=claim&start_date=2024-01-01
```

### Get Entity Audit Trail
```
GET /api/v1/audit/events/entity/claim/claim-123
```

### Get User Audit Events
```
GET /api/v1/audit/events/user/user-456
```

### Get Recent Events
```
GET /api/v1/audit/events/recent?limit=100
```

### Get Audit Statistics
```
GET /api/v1/audit/statistics?start_date=2024-01-01&end_date=2024-12-31
```

### Get My Audit Events
```
GET /api/v1/audit/me
```

## Audit Event Structure

```typescript
{
  id: string
  event_type: string        // e.g., 'claim', 'payment', 'member'
  entity_type: string       // e.g., 'claim', 'policy', 'product'
  entity_id: string         // ID of the entity
  user_id: string           // User who performed the action
  action: string            // e.g., 'claim_approved', 'payment_processed'
  before_state: object      // State before the action
  after_state: object       // State after the action
  metadata: object          // Additional context
  ip_address: string        // IP address of the user
  user_agent: string        // User agent string
  timestamp: Date           // When the event occurred
}
```

## Compliance

The audit module ensures compliance with:

- **POPIA**: All access to special personal information is logged
- **FICA**: All KYC and risk assessment activities are logged
- **CMS/FSCA**: All regulatory-relevant actions are logged
- **SARS**: All financial transactions are logged

## Immutability

Audit events are immutable by design:

1. No UPDATE operations on audit_events table
2. No DELETE operations on audit_events table
3. Database constraints prevent modifications
4. Verification methods to check immutability

## Performance

- Audit logging is asynchronous and non-blocking
- Failed audit logs don't break the main operation
- Indexed for fast querying by entity, user, and date
- Pagination support for large result sets
