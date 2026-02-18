import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json();
    
    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Load service account credentials
    const keyPath = path.join(process.cwd(), 'google-vision-key.json');
    
    if (!fs.existsSync(keyPath)) {
      return NextResponse.json(
        { error: 'Google Cloud Vision credentials not found' },
        { status: 500 }
      );
    }
    
    const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    const jwtToken = await getAccessToken(credentials);

    // Process all images and extract full text
    const allPages: any[] = [];
    let fullDocumentText = '';

    for (let i = 0; i < images.length; i++) {
      const base64Image = images[i].replace(/^data:image\/\w+;base64,/, '');
      
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
                image: { content: base64Image },
                features: [
                  { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        console.error(`Failed to process page ${i + 1}`);
        continue;
      }

      const data = await response.json();
      const textAnnotations = data.responses[0]?.textAnnotations || [];
      const pageText = textAnnotations[0]?.description || '';
      
      allPages.push({
        pageNumber: i + 1,
        text: pageText,
        rawResponse: data.responses[0],
      });

      fullDocumentText += `\n\n=== PAGE ${i + 1} ===\n\n${pageText}`;
    }

    // Intelligent extraction from full document
    const extractedData = intelligentExtraction(fullDocumentText, allPages);
    
    return NextResponse.json({
      success: true,
      totalPages: images.length,
      fullText: fullDocumentText,
      pages: allPages,
      extractedData,
    });
    
  } catch (error) {
    console.error('Intelligent extraction error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function intelligentExtraction(fullText: string, pages: any[]) {
  const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Extract document metadata
  const metadata = extractMetadata(fullText);
  
  // Extract all benefits with comprehensive details
  const benefits = extractComprehensiveBenefits(fullText, lines);
  
  // Extract exclusions
  const exclusions = extractExclusions(fullText, lines);
  
  // Extract conditions
  const conditions = extractConditions(fullText, lines);
  
  // Extract waiting periods
  const waitingPeriods = extractWaitingPeriods(fullText, lines);
  
  // Extract network information
  const networkInfo = extractNetworkInfo(fullText, lines);
  
  // Extract authorization requirements
  const authorizationRules = extractAuthorizationRules(fullText, lines);
  
  return {
    metadata,
    benefits,
    exclusions,
    conditions,
    waitingPeriods,
    networkInfo,
    authorizationRules,
    summary: {
      totalBenefits: benefits.length,
      totalExclusions: exclusions.length,
      totalConditions: conditions.length,
      hasNetworkRequirements: networkInfo.length > 0,
      requiresAuthorization: authorizationRules.length > 0,
    },
  };
}

function extractMetadata(text: string) {
  const metadata: any = {
    planName: '',
    planCode: '',
    monthlyPremium: null,
    effectiveDate: '',
    version: '',
    issuer: '',
  };

  // Extract plan name
  const planMatch = text.match(/(?:plan|option|product)[\s:]+([^\n]+)/i);
  if (planMatch) metadata.planName = planMatch[1].trim();

  // Extract plan code
  const codeMatch = text.match(/(?:code|plan code|product code)[\s:]+([A-Z0-9-]+)/i);
  if (codeMatch) metadata.planCode = codeMatch[1].trim();

  // Extract premium
  const premiumMatch = text.match(/(?:premium|monthly premium|monthly cost)[\s:]+R?\s*(\d{1,3}(?:[\s,]\d{3})*(?:\.\d{2})?)/i);
  if (premiumMatch) {
    metadata.monthlyPremium = parseFloat(premiumMatch[1].replace(/[\s,]/g, ''));
  }

  // Extract effective date
  const dateMatch = text.match(/(?:effective|effective date|valid from)[\s:]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (dateMatch) metadata.effectiveDate = dateMatch[1];

  // Extract version
  const versionMatch = text.match(/(?:version|v\.)[\s:]*(\d+\.?\d*)/i);
  if (versionMatch) metadata.version = versionMatch[1];

  return metadata;
}

function extractComprehensiveBenefits(fullText: string, lines: string[]) {
  const benefits: any[] = [];
  
  const benefitSections = [
    { keyword: 'hospital', category: 'hospital' },
    { keyword: 'specialist', category: 'specialist' },
    { keyword: 'gp|general practitioner', category: 'day_to_day' },
    { keyword: 'dentist|dental', category: 'day_to_day' },
    { keyword: 'optical|optometry', category: 'day_to_day' },
    { keyword: 'maternity|childbirth', category: 'hospital' },
    { keyword: 'ambulance', category: 'emergency' },
    { keyword: 'pathology|blood test', category: 'diagnostic' },
    { keyword: 'radiology|x-ray', category: 'diagnostic' },
    { keyword: 'mri|ct scan', category: 'diagnostic' },
    { keyword: 'physiotherapy|physio', category: 'allied_health' },
    { keyword: 'psychology|counselling', category: 'allied_health' },
    { keyword: 'chronic', category: 'day_to_day' },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    for (const section of benefitSections) {
      const regex = new RegExp(section.keyword, 'i');
      if (regex.test(line)) {
        // Extract context (current line + next 10 lines)
        const context = lines.slice(i, Math.min(i + 10, lines.length)).join(' ');
        
        const benefit = {
          name: lines[i],
          category: section.category,
          fullDescription: context,
          ...extractBenefitDetails(context),
          sourceLineNumber: i + 1,
        };
        
        benefits.push(benefit);
        break;
      }
    }
  }

  return benefits;
}

function extractBenefitDetails(context: string) {
  const details: any = {
    limits: [],
    copayments: [],
    inclusions: [],
    exclusions: [],
    conditions: [],
    requiresPreauth: false,
  };

  // Extract limits
  const limitRegex = /R?\s*(\d{1,3}(?:[\s,]\d{3})*(?:\.\d{2})?)/g;
  let match;
  while ((match = limitRegex.exec(context)) !== null) {
    const amount = parseFloat(match[1].replace(/[\s,]/g, ''));
    if (amount > 0) details.limits.push(amount);
  }

  // Extract copayments
  const copayRegex = /(\d+)%|copay|co-payment/gi;
  if (copayRegex.test(context)) {
    const percentMatch = context.match(/(\d+)%/);
    if (percentMatch) {
      details.copayments.push({
        type: 'percentage',
        amount: parseInt(percentMatch[1]),
      });
    }
  }

  // Check for preauth
  if (/pre-auth|preauth|authorization|approval required/i.test(context)) {
    details.requiresPreauth = true;
  }

  // Check for unlimited
  if (/unlimited|full cover|no limit/i.test(context)) {
    details.coverageType = 'unlimited';
  } else if (details.limits.length > 0) {
    details.coverageType = 'annual_limit';
    details.annualLimit = Math.max(...details.limits);
  }

  return details;
}

function extractExclusions(fullText: string, lines: string[]) {
  const exclusions: any[] = [];
  
  // Find exclusion sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (/exclusion|not covered|excluded|does not cover/i.test(line)) {
      // Extract next 20 lines as potential exclusions
      const exclusionLines = lines.slice(i + 1, Math.min(i + 21, lines.length));
      
      for (const exLine of exclusionLines) {
        if (exLine.length > 10 && !exLine.match(/^\d+$/)) {
          exclusions.push({
            description: exLine,
            type: 'general',
            sourceLineNumber: i + 1,
          });
        }
      }
      
      break; // Only process first exclusion section
    }
  }

  return exclusions;
}

function extractConditions(fullText: string, lines: string[]) {
  const conditions: any[] = [];
  
  const conditionKeywords = [
    'subject to',
    'provided that',
    'on condition',
    'must',
    'required',
    'only if',
    'when',
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    for (const keyword of conditionKeywords) {
      if (line.includes(keyword)) {
        conditions.push({
          description: lines[i],
          type: 'requirement',
          sourceLineNumber: i + 1,
        });
        break;
      }
    }
  }

  return conditions;
}

function extractWaitingPeriods(fullText: string, lines: string[]) {
  const waitingPeriods: any[] = [];
  
  const waitingRegex = /(\d+)\s*(?:month|day)s?\s*waiting/gi;
  let match;
  
  while ((match = waitingRegex.exec(fullText)) !== null) {
    const period = parseInt(match[1]);
    const unit = match[0].toLowerCase().includes('month') ? 'months' : 'days';
    
    // Get context
    const startIndex = Math.max(0, match.index - 100);
    const endIndex = Math.min(fullText.length, match.index + 100);
    const context = fullText.substring(startIndex, endIndex);
    
    waitingPeriods.push({
      period,
      unit,
      context: context.trim(),
    });
  }

  return waitingPeriods;
}

function extractNetworkInfo(fullText: string, lines: string[]) {
  const networkInfo: any[] = [];
  
  if (/network|approved|designated|panel/i.test(fullText)) {
    networkInfo.push({
      hasNetwork: true,
      description: 'Network requirements mentioned in document',
    });
  }

  return networkInfo;
}

function extractAuthorizationRules(fullText: string, lines: string[]) {
  const rules: any[] = [];
  
  if (/pre-authorization|preauth|approval|authorization/i.test(fullText)) {
    rules.push({
      type: 'preauthorization',
      description: 'Pre-authorization requirements mentioned',
    });
  }

  return rules;
}

async function getAccessToken(credentials: any): Promise<string> {
  const { client_email, private_key } = credentials;
  
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600;
  
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/cloud-vision',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expiry,
    iat: now,
  };
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const crypto = require('crypto');
  const signature = crypto.createSign('RSA-SHA256');
  signature.update(signatureInput);
  signature.end();
  const signatureBytes = signature.sign(private_key);
  const encodedSignature = base64UrlEncode(signatureBytes);
  
  const jwt = `${signatureInput}.${encodedSignature}`;
  
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  
  if (!tokenResponse.ok) {
    throw new Error('Failed to get access token');
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function base64UrlEncode(data: string | Buffer): string {
  const base64 = Buffer.from(data).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
