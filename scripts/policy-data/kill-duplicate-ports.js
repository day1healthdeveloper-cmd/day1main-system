/**
 * Kill Duplicate Port Listeners
 * 
 * This script checks for multiple processes listening on the same port
 * and kills duplicates before starting the dev servers.
 */

const { execSync } = require('child_process');

const PORTS_TO_CHECK = [3000, 3001];

function getProcessesOnPort(port) {
  try {
    // Windows command to find processes on a port
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    
    const lines = output.split('\n').filter(line => line.includes('LISTENING'));
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        pids.add(pid);
      }
    });
    
    return Array.from(pids);
  } catch (error) {
    // No processes found on this port
    return [];
  }
}

function killProcess(pid) {
  try {
    execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf8' });
    return true;
  } catch (error) {
    return false;
  }
}

function getProcessName(pid) {
  try {
    const output = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf8' });
    const match = output.match(/"([^"]+)"/);
    return match ? match[1] : 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

console.log('🔍 Checking for duplicate processes on ports...\n');

let totalKilled = 0;

PORTS_TO_CHECK.forEach(port => {
  const pids = getProcessesOnPort(port);
  
  if (pids.length === 0) {
    console.log(`✅ Port ${port}: No processes found`);
  } else if (pids.length === 1) {
    const processName = getProcessName(pids[0]);
    console.log(`✅ Port ${port}: 1 process (PID ${pids[0]} - ${processName})`);
  } else {
    console.log(`⚠️  Port ${port}: ${pids.length} processes found!`);
    
    pids.forEach((pid, index) => {
      const processName = getProcessName(pid);
      console.log(`   ${index + 1}. PID ${pid} - ${processName}`);
    });
    
    // Kill all but the first process
    const toKill = pids.slice(1);
    console.log(`\n🔪 Killing ${toKill.length} duplicate process(es)...`);
    
    toKill.forEach(pid => {
      const processName = getProcessName(pid);
      if (killProcess(pid)) {
        console.log(`   ✅ Killed PID ${pid} (${processName})`);
        totalKilled++;
      } else {
        console.log(`   ❌ Failed to kill PID ${pid} (${processName})`);
      }
    });
  }
});

console.log('\n' + '='.repeat(50));
if (totalKilled > 0) {
  console.log(`✅ Cleaned up ${totalKilled} duplicate process(es)`);
} else {
  console.log('✅ No duplicate processes found');
}
console.log('='.repeat(50) + '\n');

process.exit(0);
