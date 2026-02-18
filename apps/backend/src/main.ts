import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import * as net from 'net'
import { execSync } from 'child_process'

async function killDuplicateProcesses(port: number): Promise<void> {
  try {
    console.log(`🔍 Checking for duplicate processes on port ${port}...`)
    
    // Get all processes listening on the port
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' })
    const lines = output.split('\n').filter(line => line.includes('LISTENING'))
    
    const pids = new Set<string>()
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/)
      const pid = parts[parts.length - 1]
      if (pid && pid !== '0') {
        pids.add(pid)
      }
    })
    
    if (pids.size > 1) {
      console.log(`⚠️  Found ${pids.size} processes on port ${port}. Killing duplicates...`)
      Array.from(pids).forEach(pid => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf8' })
          console.log(`✅ Killed process PID ${pid}`)
        } catch (err) {
          // Process might already be dead
        }
      })
      // Wait a moment for ports to be released
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else if (pids.size === 1) {
      console.log(`⚠️  Found 1 process on port ${port}. Killing it...`)
      const pid = Array.from(pids)[0]
      try {
        execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf8' })
        console.log(`✅ Killed process PID ${pid}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (err) {
        // Process might already be dead
      }
    } else {
      console.log(`✅ No processes found on port ${port}`)
    }
  } catch (err) {
    // No processes found on port - this is good
    console.log(`✅ Port ${port} is clear`)
  }
}

async function checkPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false)
      } else {
        resolve(true)
      }
    })
    
    server.once('listening', () => {
      server.close()
      resolve(true)
    })
    
    server.listen(port)
  })
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const port = configService.get('PORT', 3000)
  
  // ALWAYS kill any duplicate processes first
  await killDuplicateProcesses(port)
  
  // Check if port is already in use
  const isPortAvailable = await checkPortAvailable(port)
  
  if (!isPortAvailable) {
    console.error(`❌ ERROR: Port ${port} is STILL in use after cleanup!`)
    console.error(`❌ Please manually check what's using this port.`)
    process.exit(1)
  }

  console.log(`✅ Port ${port} is available, starting server...`)

  // Log all requests
  app.use((req: any, res: any, next: any) => {
    console.log(`📥 ${req.method} ${req.url}`);
    next();
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  })

  // API prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1')
  app.setGlobalPrefix(apiPrefix)

  await app.listen(port)

  console.log(`🚀 Day1Main Backend running on: http://localhost:${port}/${apiPrefix}`)
}

bootstrap()
