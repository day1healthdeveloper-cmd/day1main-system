# 🚀 Server Status Check

## Purpose
This document helps troubleshoot NaN errors and duplicate server issues by verifying only the correct servers are running.

---

## Expected Server Configuration

### Frontend Server
- **Port:** 3001
- **URL:** http://localhost:3001
- **Location:** `apps/frontend`
- **Start Command:** `npm run dev`

### Backend Server
- **Port:** 3000
- **URL:** http://localhost:3000
- **Location:** `apps/backend`
- **Start Command:** `npm run start:dev`

---

## Check Running Servers

### Windows (PowerShell)
```powershell
# Check what's running on port 3001 (Frontend)
Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue

# Check what's running on port 3000 (Backend)
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

# List all Node processes
Get-Process node
```

### Kill Duplicate Processes

If you find duplicate servers running:

```powershell
# Kill all Node processes
Stop-Process -Name node -Force

# Or kill specific port
# Frontend (3001)
$process = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($process) { Stop-Process -Id $process.OwningProcess -Force }

# Backend (3000)
$process = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($process) { Stop-Process -Id $process.OwningProcess -Force }
```

---

## Common NaN Error Causes

### 1. Multiple Servers on Same Port
**Symptom:** NaN errors, port conflicts, unexpected behavior

**Solution:**
1. Kill all Node processes
2. Start only one instance of each server
3. Verify ports are correct

### 2. Old Build Cache
**Symptom:** NaN errors, stale data, unexpected values

**Solution:**
```powershell
# Frontend
cd apps/frontend
Remove-Item -Recurse -Force .next
npm run dev

# Backend
cd apps/backend
Remove-Item -Recurse -Force dist
npm run start:dev
```

### 3. Environment Variables Not Set
**Symptom:** NaN when accessing config values

**Solution:**
- Check `apps/frontend/.env.local` exists
- Check `apps/backend/.env` exists
- Verify all required variables are set

---

## Verify Servers Are Working

### Frontend Health Check
```
http://localhost:3001
```
Should load the landing page without errors.

### Backend Health Check
```
http://localhost:3000
```
Should return API response (may show "Cannot GET /" which is normal).

---

## Clean Restart Procedure

If experiencing NaN errors or duplicate servers:

1. **Stop Everything**
   ```powershell
   Stop-Process -Name node -Force
   ```

2. **Clean Build Folders**
   ```powershell
   # Frontend
   cd apps/frontend
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   
   # Backend
   cd apps/backend
   Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
   ```

3. **Start Frontend** (Terminal 1)
   ```powershell
   cd apps/frontend
   npm run dev
   ```
   Wait for "Ready in X.Xs" message

4. **Start Backend** (Terminal 2)
   ```powershell
   cd apps/backend
   npm run start:dev
   ```
   Wait for "Nest application successfully started" message

5. **Verify**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000

---

## Quick Reference

### Ports
- **3001** = Frontend (Next.js)
- **3000** = Backend (NestJS)

### Process Check
```powershell
Get-Process node | Select-Object Id, ProcessName, StartTime
```

### Kill All Node
```powershell
Stop-Process -Name node -Force
```

### Check Port Usage
```powershell
netstat -ano | findstr :3001
netstat -ano | findstr :3000
```

---

**Use this document when:**
- Getting NaN errors
- Suspecting duplicate servers
- Need to verify clean server state
- Troubleshooting port conflicts
