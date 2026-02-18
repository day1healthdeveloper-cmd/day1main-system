import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    const { image, documentType } = await request.json()
    
    // Remove data URL prefix
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '')
    
    // Load service account credentials
    const keyPath = path.join(process.cwd(), 'google-vision-key.json')
    
    if (!fs.existsSync(keyPath)) {
      return NextResponse.json(
        { error: 'Google Cloud Vision credentials not found. Please add google-vision-key.json to the project root.' },
        { status: 500 }
      )
    }
    
    const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'))
    
    // Get access token using service account
    const jwtToken = await getAccessToken(credentials)
    
    // Call Google Cloud Vision API with OAuth token
    const response = await fetch(
      'https://vision.googleapis.com/v1/images:annotate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Google Vision API error:', error)
      return NextResponse.json(
        { error: 'OCR processing failed', details: error },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    if (!data.responses || !data.responses[0]) {
      return NextResponse.json(
        { error: 'No OCR results returned' },
        { status: 500 }
      )
    }
    
    const textAnnotations = data.responses[0].textAnnotations || []
    const fullText = textAnnotations[0]?.description || ''
    
    // Extract structured data based on document type
    const extractedData = extractDataFromText(fullText, documentType)
    
    return NextResponse.json({
      success: true,
      fullText,
      extractedData,
      rawResponse: data.responses[0],
    })
    
  } catch (error) {
    console.error('OCR API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Get OAuth2 access token from service account
async function getAccessToken(credentials: any): Promise<string> {
  const { client_email, private_key } = credentials
  
  const now = Math.floor(Date.now() / 1000)
  const expiry = now + 3600 // 1 hour
  
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }
  
  const payload = {
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/cloud-vision',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expiry,
    iat: now,
  }
  
  // Create JWT
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signatureInput = `${encodedHeader}.${encodedPayload}`
  
  // Sign with private key
  const crypto = require('crypto')
  const signature = crypto.createSign('RSA-SHA256')
  signature.update(signatureInput)
  signature.end()
  const signatureBytes = signature.sign(private_key)
  const encodedSignature = base64UrlEncode(signatureBytes)
  
  const jwt = `${signatureInput}.${encodedSignature}`
  
  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  
  if (!tokenResponse.ok) {
    const error = await tokenResponse.text()
    throw new Error(`Failed to get access token: ${error}`)
  }
  
  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

function base64UrlEncode(data: string | Buffer): string {
  const base64 = Buffer.from(data).toString('base64')
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function extractDataFromText(text: string, documentType: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  let idNumber = ''
  let firstName = ''
  let lastName = ''
  let dateOfBirth = ''
  let passportNumber = ''
  
  // Extract ID Number (13 digits for SA ID)
  const idMatch = text.match(/\b\d{13}\b/)
  if (idMatch) {
    idNumber = idMatch[0]
    
    // Calculate DOB from ID number
    const year = idNumber.substring(0, 2)
    const month = idNumber.substring(2, 4)
    const day = idNumber.substring(4, 6)
    const currentYear = new Date().getFullYear()
    const currentYearLastTwo = currentYear % 100
    const fullYear = parseInt(year) > currentYearLastTwo ? `19${year}` : `20${year}`
    dateOfBirth = `${fullYear}-${month}-${day}`
  }
  
  if (documentType === 'sa-passport') {
    // Extract passport number (format: A12345678)
    const passportMatch = text.match(/\b[A-Z]\d{8}\b/)
    if (passportMatch) {
      passportNumber = passportMatch[0]
    }
    
    // Look for surname and names
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase()
      const nextLine = i + 1 < lines.length ? lines[i + 1] : ''
      
      // Surname usually appears after "Surname" label or near top
      if (line.includes('SURNAME') && nextLine && !lastName) {
        lastName = cleanName(nextLine)
      } else if (line.includes('VAN') || line.includes('DU') || line.includes('DE')) {
        if (!lastName && isValidName(line)) {
          lastName = cleanName(line)
        }
      }
      
      // Names/Given names
      if ((line.includes('NAME') || line.includes('GIVEN')) && !line.includes('SURNAME') && nextLine && !firstName) {
        firstName = cleanName(nextLine)
      }
    }
    
    // If not found by labels, look for capitalized names
    if (!lastName || !firstName) {
      const nameLines = lines
        .filter(line => {
          const upper = line.toUpperCase()
          return upper === line && 
                 line.length > 2 && 
                 /^[A-Z\s]+$/.test(line) &&
                 !['REPUBLIC', 'SOUTH', 'AFRICA', 'PASSPORT', 'NATIONALITY', 'COUNTRY', 'DATE', 'BIRTH', 'SEX'].some(kw => line.includes(kw))
        })
      
      if (nameLines.length >= 2) {
        if (!lastName) lastName = cleanName(nameLines[0])
        if (!firstName) firstName = cleanName(nameLines[1])
      }
    }
  } else if (documentType === 'sa-id') {
    // SA ID Card extraction
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase()
      const nextLine = i + 1 < lines.length ? lines[i + 1] : ''
      
      if (line.includes('SURNAME') && nextLine && !lastName) {
        lastName = cleanName(nextLine)
      }
      
      if ((line.includes('NAME') || line.includes('VOORNAAM')) && !line.includes('SURNAME') && nextLine && !firstName) {
        firstName = cleanName(nextLine)
      }
    }
  }
  
  return {
    idNumber,
    firstName,
    lastName,
    dateOfBirth,
    passportNumber,
  }
}

function cleanName(text: string): string {
  return text
    .replace(/[^a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(word => word.length > 1)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function isValidName(text: string): boolean {
  if (!text || text.length < 2) return false
  const words = text.split(' ')
  return words.length >= 1 && words.length <= 4 && words.every(w => w.length >= 2)
}
