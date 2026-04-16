# Day1Health Company Documentation

This folder contains all company documentation used as the source of truth for system implementation.

## Folder Structure

### 📋 Claims Documentation (`claims/`)
All claims-related documents including procedures, guidelines, forms, tariffs, and workflows.

**Subfolders:**
- `procedures/` - Claims processing procedures
- `guidelines/` - Adjudication guidelines
- `forms/` - Claim forms and templates
- `tariffs/` - Tariff codes and pricing
- `rejection-codes/` - Rejection code definitions
- `workflows/` - Process flowcharts
- `pre-authorization/` - Pre-authorization and GOP documents

### 💊 Benefits Documentation (`benefits/`)
Benefit-related documentation including limits, waiting periods, and exclusions.

**Subfolders:**
- `limits/` - Benefit limits and annual caps
- `waiting-periods/` - Waiting period definitions
- `exclusions/` - Exclusions and limitations

### ⚖️ Compliance Documentation (`compliance/`)
Regulatory and compliance documentation.

**Subfolders:**
- `medical-schemes-act/` - Medical Schemes Act requirements
- `pmb/` - Prescribed Minimum Benefits
- `cms-guidelines/` - Council for Medical Schemes guidelines

### 🏥 Operations Documentation (`operations/`)
Operational documentation including contracts, SLAs, and training.

**Subfolders:**
- `provider-contracts/` - Provider agreements
- `sla/` - Service level agreements
- `training/` - Training materials

## How to Use

### For Developers

When implementing features:
1. Read relevant documents in this folder
2. Extract business rules and requirements
3. Implement according to documented procedures
4. Reference document sections in code comments
5. Update steering documents with document references

### For Adding Documents

1. Place documents in the appropriate subfolder
2. Use descriptive filenames (e.g., `claims-adjudication-guidelines-v2.pdf`)
3. Update the README in that folder if needed
4. Commit to git for version control

### For AI Assistant (Kiro)

When working on features:
1. Check this folder for relevant documents
2. Read documents to understand business rules
3. Implement features based on actual company procedures
4. Reference specific document sections in implementation
5. Flag any discrepancies between documents and requirements

## Document Types Supported

- ✅ PDF documents
- ✅ Word documents (.docx)
- ✅ Excel spreadsheets (.xlsx)
- ✅ Images (flowcharts, diagrams)
- ✅ Markdown files

## Version Control

All documents in this folder are tracked in git. When updating documents:
1. Replace the old version
2. Commit with a descriptive message
3. Document major changes in the folder's README

## Security Note

⚠️ **Important:** This folder contains internal company documents. Ensure:
- Documents are not exposed in public routes
- Sensitive information is redacted if needed
- Access is restricted to authorized personnel
- Documents comply with POPIA (Protection of Personal Information Act)

## Related Folders

- `/public/plan exact wording/` - Policy documents (public-facing)
- `/public/brochures as text/` - Plan brochures (public-facing)
- `/.kiro/steering/` - AI steering documents and implementation guides

## Last Updated

April 16, 2026

## Questions?

If you're unsure where to place a document, consider:
- **Is it about claims processing?** → `claims/`
- **Is it about benefits and limits?** → `benefits/`
- **Is it regulatory/compliance?** → `compliance/`
- **Is it operational/contractual?** → `operations/`

When in doubt, place it in the most relevant folder and update the README.
