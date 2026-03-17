# Feedback System

This directory contains user feedback submitted through the feedback widget.

## Directory Structure

```
.kiro/feedback/
├── pending/       # New feedback awaiting review
├── in-progress/   # Feedback currently being worked on
├── completed/     # Implemented feedback
└── archived/      # Old or rejected feedback
```

## Feedback File Format

Each feedback is stored as a JSON file with the following structure:

```json
{
  "id": "2026-03-17T12-30-00-000Z-admin-dashboard",
  "status": "pending",
  "category": "feature",
  "priority": "medium",
  "title": "Add export button to members list",
  "description": "It would be helpful to have an export to CSV button...",
  "pageName": "Admin Dashboard",
  "userRole": "admin",
  "submittedAt": "2026-03-17T12:30:00.000Z",
  "submittedBy": "user",
  "developerComments": [
    {
      "comment": "Working on this now",
      "timestamp": "2026-03-17T14:00:00.000Z",
      "author": "developer"
    }
  ],
  "updatedAt": "2026-03-17T14:00:00.000Z"
}
```

## Categories

- `bug` - Bugs and errors
- `feature` - New feature requests
- `layout` - UI/Layout changes
- `filter` - Filter requests
- `rule` - Business logic/rules
- `other` - Other feedback

## Priority Levels

- `low` - Nice to have
- `medium` - Important
- `high` - Urgent
- `critical` - Blocking work

## Workflow

1. User submits feedback via widget → Saved to `pending/`
2. Developer reviews → Moves to `in-progress/`
3. Developer implements → Moves to `completed/`
4. Old feedback → Moves to `archived/`

## Developer Review

Access the feedback management page at:
- `/admin/feedback`

## Git Integration

Feedback files are tracked in Git by default. To exclude them:
1. Uncomment the line in `.gitignore`
2. Run `git rm -r --cached .kiro/feedback/`

## Adding Feedback Widget to Pages

```tsx
import { FeedbackWidget } from '@/components/feedback/feedback-widget';

// In your component:
<FeedbackWidget pageName="Your Page Name" userRole="admin" />
```
