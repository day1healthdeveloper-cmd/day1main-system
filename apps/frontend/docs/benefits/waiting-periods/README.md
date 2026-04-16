# Waiting Periods

This folder contains waiting period definitions by benefit type.

## Documents to Add

- General waiting period (3 months)
- Specialist waiting period (3 months)
- Hospital waiting period (3 months)
- Maternity waiting period (12 months)
- Pre-existing condition exclusion periods
- Waiting period waivers
- Continuous cover credit rules

## Format

- PDF documents
- Excel spreadsheets

## Usage

These waiting periods are validated during claims submission to ensure members have completed required waiting periods.

## Current Implementation

See: `apps/frontend/src/lib/benefit-validation-server.ts` for waiting period validation logic.
