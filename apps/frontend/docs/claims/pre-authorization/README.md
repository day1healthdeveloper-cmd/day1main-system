# Pre-Authorization Documentation

This folder contains all pre-authorization and Guarantee of Payment (GOP) related documents.

## Documents to Add

### Guarantee of Payment (GOP)
- GOP request forms
- GOP approval templates
- GOP validity periods
- GOP terms and conditions
- GOP number format and generation rules
- GOP tracking procedures

### Pre-Authorization
- Pre-authorization request forms
- Pre-authorization approval criteria
- Pre-authorization validity periods
- Services requiring pre-auth
- Emergency pre-auth procedures
- Retrospective authorization rules

### Hospital Admissions
- Planned admission pre-auth
- Emergency admission procedures
- GOP for hospital stays
- GOP for surgical procedures
- GOP for specialist procedures

### Procedures
- GOP issuance process
- GOP verification process
- GOP expiry and renewal
- GOP cancellation procedures
- GOP dispute resolution

## Format

- PDF documents
- Word documents
- Excel templates

## Usage

GOP documents are used to:
- Authorize treatment before it occurs
- Guarantee payment to providers
- Manage high-value claims
- Reduce claim rejections
- Improve provider confidence

## System Integration

The pre-authorization system will:
- Generate GOP numbers
- Track GOP validity
- Link GOP to claims
- Validate claims against GOP
- Flag expired GOP

## Current Status

⚠️ Pre-authorization system is not yet implemented (5% remaining work).

When implemented, it will:
- Issue GOP electronically
- Track GOP usage
- Validate claims against GOP
- Alert on GOP expiry
- Generate GOP reports

## Related Tables (To Be Created)

- `pre_authorizations` - Pre-auth requests and GOP records
- `pre_auth_services` - Services covered by GOP
- `pre_auth_documents` - Supporting documents

## Related Files

- See: `.kiro/steering/provider-claims-system.md` (Section: Pre-Authorization System)
