import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    // Remove data URL prefix
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
    
    // Load service account credentials
    const keyPath = path.join(process.cwd(), 'google-vision-key.json');
    
    if (!fs.existsSync(keyPath)) {
      return NextResponse.json(
        { error: 'Google Cloud Vision credentials not found. Please add google-vision-key.json to the project root.' },
        { status: 500 }
      );
    }
    
    const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    
    // Get access token using service account
    const jwtToken = await getAccessToken(credentials);
    
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
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Google Vision API error:', error);
      return NextResponse.json(
        { error: 'OCR processing failed', details: error },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    if (!data.responses || !data.responses[0]) {
      return NextResponse.json(
        { error: 'No OCR results returned' },
        { status: 500 }
      );
    }
    
    const textAnnotations = data.responses[0].textAnnotations || [];
    const fullText = textAnnotations[0]?.description || '';
    
    // Extract benefit plan data
    const extractedBenefits = extractBenefitPlanData(fullText);
    
    return NextResponse.json({
      success: true,
      fullText,
      extractedBenefits,
      rawResponse: data.responses[0],
    });
    
  } catch (error) {
    console.error('Benefit plan OCR error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get OAuth2 access token from service account
async function getAccessToken(credentials: any): Promise<string> {
  const { client_email, private_key } = credentials;
  
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour
  
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  
  const payload = {
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/cloud-vision',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expiry,
    iat: now,
  };
  
  // Create JWT
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  // Sign with private key
  const crypto = require('crypto');
  const signature = crypto.createSign('RSA-SHA256');
  signature.update(signatureInput);
  signature.end();
  const signatureBytes = signature.sign(private_key);
  const encodedSignature = base64UrlEncode(signatureBytes);
  
  const jwt = `${signatureInput}.${encodedSignature}`;
  
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
  });
  
  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${error}`);
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function base64UrlEncode(data: string | Buffer): string {
  const base64 = Buffer.from(data).toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function extractBenefitPlanData(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const benefits: any[] = [];
  
  // Common benefit keywords to look for
  const benefitKeywords = {
    hospital: ['hospital', 'admission', 'in-patient', 'inpatient', 'ward'],
    icu: ['icu', 'intensive care', 'high care'],
    maternity: ['maternity', 'childbirth', 'pregnancy'],
    surgery: ['surgery', 'surgical', 'operation'],
    specialist: ['specialist', 'consultation'],
    gp: ['gp', 'general practitioner', 'doctor visit'],
    dentistry: ['dental', 'dentist', 'dentistry'],
    optometry: ['optical', 'optometry', 'spectacles', 'glasses', 'eye test'],
    pathology: ['pathology', 'blood test', 'lab test'],
    radiology: ['radiology', 'x-ray', 'xray'],
    mri: ['mri', 'ct scan', 'ct-scan'],
    physiotherapy: ['physio', 'physiotherapy'],
    psychology: ['psychology', 'psychologist', 'counselling'],
    ambulance: ['ambulance', 'emergency transport'],
    chronic: ['chronic', 'chronic medication'],
    acute: ['acute medication', 'acute medicine'],
  };
  
  // Extract monetary amounts (R1,000 or R1000 or 1000)
  const amountRegex = /R?\s*(\d{1,3}(?:[\s,]\d{3})*(?:\.\d{2})?)/g;
  
  // Extract percentages
  const percentageRegex = /(\d+)%/g;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const originalLine = lines[i];
    
    // Check if line contains benefit keywords
    for (const [benefitType, keywords] of Object.entries(benefitKeywords)) {
      if (keywords.some(keyword => line.includes(keyword))) {
        // Look for amounts in this line and next few lines
        const contextLines = lines.slice(i, Math.min(i + 3, lines.length)).join(' ');
        
        // Extract amounts
        const amounts: number[] = [];
        let match;
        while ((match = amountRegex.exec(contextLines)) !== null) {
          const amount = parseFloat(match[1].replace(/[\s,]/g, ''));
          if (amount > 0) amounts.push(amount);
        }
        
        // Extract percentages (for copayments)
        const percentages: number[] = [];
        while ((match = percentageRegex.exec(contextLines)) !== null) {
          const percentage = parseInt(match[1]);
          if (percentage > 0 && percentage <= 100) percentages.push(percentage);
        }
        
        // Determine coverage type
        let coverageType = 'unlimited';
        let annualLimit = null;
        let copayment = null;
        let copaymentType = null;
        
        if (line.includes('unlimited') || line.includes('full cover')) {
          coverageType = 'unlimited';
        } else if (amounts.length > 0) {
          coverageType = 'annual_limit';
          annualLimit = Math.max(...amounts); // Take the largest amount as annual limit
        }
        
        if (percentages.length > 0) {
          copaymentType = 'percentage';
          copayment = percentages[0];
        } else if (amounts.length > 1) {
          // If multiple amounts, smaller one might be copayment
          const sortedAmounts = amounts.sort((a, b) => a - b);
          if (sortedAmounts[0] < 1000) {
            copaymentType = 'fixed';
            copayment = sortedAmounts[0];
            annualLimit = sortedAmounts[sortedAmounts.length - 1];
          }
        }
        
        // Check for waiting periods
        let waitingPeriodMonths = 0;
        const waitingMatch = contextLines.match(/(\d+)\s*month/i);
        if (waitingMatch) {
          waitingPeriodMonths = parseInt(waitingMatch[1]);
        }
        
        // Check for preauth requirement
        const requiresPreauth = contextLines.toLowerCase().includes('pre-auth') || 
                               contextLines.toLowerCase().includes('preauth') ||
                               contextLines.toLowerCase().includes('authorization required');
        
        benefits.push({
          benefitType,
          benefitName: originalLine,
          coverageType,
          annualLimit,
          copaymentType,
          copaymentAmount: copayment,
          waitingPeriodMonths,
          requiresPreauth,
          extractedFrom: originalLine,
        });
        
        break; // Found a match, move to next line
      }
    }
  }
  
  // Extract plan name and monthly premium
  let planName = '';
  let monthlyPremium = null;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('plan') || line.toLowerCase().includes('option')) {
      planName = line;
    }
    
    if (line.toLowerCase().includes('premium') || line.toLowerCase().includes('monthly')) {
      const match = line.match(/R?\s*(\d{1,3}(?:[\s,]\d{3})*(?:\.\d{2})?)/);
      if (match) {
        monthlyPremium = parseFloat(match[1].replace(/[\s,]/g, ''));
      }
    }
  }
  
  return {
    planName,
    monthlyPremium,
    benefits,
    totalBenefitsFound: benefits.length,
  };
}
