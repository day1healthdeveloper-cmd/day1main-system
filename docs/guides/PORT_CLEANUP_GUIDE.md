# Port Cleanup Guide

## Problem
Sometimes multiple Node.js processes listen on the same port (3000 or 3001), causing "Invalid API key" errors or connection issues.

## Solution
We've added automatic port cleanup that runs before starting the dev servers.

## Usage

### Automatic Cleanup (Recommended)
The cleanup script runs automatically when you start the dev servers:

```bash
npm run dev
```

This will:
1. Check ports 3000 and 3001 for duplicate processes
2. Kill any duplicates (keeping the first one)
3. Start the dev servers

### Manual Cleanup
If you need to clean up ports manually:

**Option 1: Run the Node script**
```bash
npm run kill-ports
```

**Option 2: Run the batch file (Windows)**
```bash
cleanup-ports.bat
```

**Option 3: Run directly**
```bash
node kill-duplicate-ports.js
```

### Force Clean Start
To ensure a completely clean start:

```bash
npm run dev:clean
```

This explicitly runs the cleanup before starting servers.

## What It Does

The script:
1. ✅ Checks ports 3000 (backend) and 3001 (frontend)
2. ✅ Identifies all processes listening on each port
3. ✅ Keeps the first process (if any)
4. ✅ Kills all duplicate processes
5. ✅ Reports what was cleaned up

## Example Output

```
🔍 Checking for duplicate processes on ports...

⚠️  Port 3000: 2 processes found!
   1. PID 2296 - node.exe
   2. PID 3132 - node.exe

🔪 Killing 1 duplicate process(es)...
   ✅ Killed PID 3132 (node.exe)

✅ Port 3001: 1 process (PID 1852 - node.exe)

==================================================
✅ Cleaned up 1 duplicate process(es)
==================================================
```

## Files

- `kill-duplicate-ports.js` - Main cleanup script
- `cleanup-ports.bat` - Windows batch file for easy execution
- `package.json` - Updated with `predev` hook and `kill-ports` command

## Troubleshooting

### Script doesn't kill processes
- Make sure you're running as Administrator (if needed)
- Check if processes are protected/system processes

### Ports still in use after cleanup
- Wait a few seconds for ports to be released
- Check for other applications using these ports (not Node.js)

### Need to check other ports
Edit `kill-duplicate-ports.js` and modify:
```javascript
const PORTS_TO_CHECK = [3000, 3001, 8080]; // Add your ports here
```

## Prevention

To prevent duplicates in the future:
1. Always use `npm run dev` (which includes cleanup)
2. Stop servers properly with Ctrl+C
3. Don't run multiple terminal sessions with dev servers
4. Use the cleanup script if you notice issues

## Technical Details

The script uses:
- `netstat -ano` to find processes on ports
- `tasklist` to get process names
- `taskkill /F /PID` to force-kill duplicate processes

It's Windows-specific but can be adapted for Linux/Mac by changing the commands.
