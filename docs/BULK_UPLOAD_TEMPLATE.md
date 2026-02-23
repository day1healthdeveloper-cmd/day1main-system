# Bulk Upload Members - Excel Template

## Excel Format

Your Excel file should have the following columns in the first row (header row):

| Member Number | Name | Surname | ID Number | Commence Date | Premium | Employee Nr |
|---------------|------|---------|-----------|---------------|---------|-------------|

## Column Details

1. **Member Number** (Required)
   - Format: Text (e.g., DAY17000390)
   - Unique identifier for each member

2. **Name** (Required)
   - Format: Text (e.g., DIKARABO SHIRLEY)
   - Will be automatically capitalized properly (Dikarabo Shirley)

3. **Surname** (Required)
   - Format: Text (e.g., MASIYA)
   - Will be automatically capitalized properly (Masiya)

4. **ID Number** (Optional)
   - Format: Text (e.g., 7812230767080)
   - South African ID number

5. **Commence Date** (Optional)
   - Format: Date (e.g., 2013-10-01 or Excel date format)
   - Member's start date

6. **Premium** (Required)
   - Format: Number (e.g., 745.00 or 745,00)
   - Monthly premium amount
   - Commas will be automatically removed

7. **Employee Nr** (Optional)
   - Format: Text (e.g., 2135)
   - Employee number for reporting

## Example Data

```
Member Number    Name                Surname      ID Number       Commence Date    Premium    Employee Nr
DAY17000390      DIKARABO SHIRLEY    MASIYA       7812230767080   2013-10-01      745.00     2135
DAY17000408      MOSWAZI             LETLALO      9006085804084   2013-10-01      1689.00    870
DAY17000414      TIMOTHY RISINGA     CHAUKE       9009026223083   2013-10-01      745.00     1940
```

## How to Use

1. Go to Operations > Manage Groups
2. Click on "Member Management" tab
3. Select the group you want to add members to
4. Click "View Members" button
5. Click "📤 Bulk Upload Excel" button
6. Select your Excel file (.xlsx or .xls)
7. Wait for upload to complete
8. Members will be automatically added to the selected group

## Notes

- Names in UPPERCASE will be automatically converted to proper Title Case
- The system will skip rows with missing required fields and show errors
- Duplicate member numbers will cause errors
- All members are automatically assigned to the selected group
- Collection method is inherited from the group
- All uploaded members are set to "active" status
