/**
 * Payment Processing Library
 * Handles payment batch generation, EFT file creation, and payment tracking
 */

export interface ClaimPayment {
  claim_id: string;
  claim_number: string;
  payee_type: 'provider' | 'member';
  payee_id: string;
  payee_name: string;
  bank_name?: string;
  account_number?: string;
  branch_code?: string;
  account_holder_name?: string;
  payment_amount: number;
  service_date: string;
  approved_date: string;
}

export interface PaymentBatch {
  id?: string;
  batch_number: string;
  batch_type: 'provider' | 'member_refund' | 'mixed';
  batch_date: string;
  total_claims: number;
  total_amount: number;
  status: 'draft' | 'approved' | 'processing' | 'completed' | 'failed';
  payment_method: 'eft' | 'cheque' | 'cash';
  payments: ClaimPayment[];
}

export interface EFTRecord {
  recordType: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  amount: number;
  accountHolderName: string;
  reference: string;
  beneficiaryReference: string;
}

/**
 * Generate unique batch number
 * Format: PB-YYYYMMDD-XXXX
 */
export function generateBatchNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PB-${dateStr}-${random}`;
}

/**
 * Group claims by payee for batch processing
 * Combines multiple claims for same payee into single payment
 */
export function groupClaimsByPayee(claims: ClaimPayment[]): Map<string, ClaimPayment[]> {
  const grouped = new Map<string, ClaimPayment[]>();
  
  claims.forEach(claim => {
    const key = `${claim.payee_type}-${claim.payee_id}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(claim);
  });
  
  return grouped;
}

/**
 * Calculate total payment amount for grouped claims
 */
export function calculatePaymentTotal(claims: ClaimPayment[]): number {
  return claims.reduce((sum, claim) => sum + claim.payment_amount, 0);
}

/**
 * Validate banking details for payment
 */
export function validateBankingDetails(payment: ClaimPayment): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!payment.bank_name || payment.bank_name.trim() === '') {
    errors.push('Bank name is required');
  }
  
  if (!payment.account_number || payment.account_number.trim() === '') {
    errors.push('Account number is required');
  } else if (!/^\d{8,11}$/.test(payment.account_number.replace(/\s/g, ''))) {
    errors.push('Invalid account number format (8-11 digits required)');
  }
  
  if (!payment.branch_code || payment.branch_code.trim() === '') {
    errors.push('Branch code is required');
  } else if (!/^\d{6}$/.test(payment.branch_code.replace(/\s/g, ''))) {
    errors.push('Invalid branch code format (6 digits required)');
  }
  
  if (!payment.account_holder_name || payment.account_holder_name.trim() === '') {
    errors.push('Account holder name is required');
  }
  
  if (payment.payment_amount <= 0) {
    errors.push('Payment amount must be greater than zero');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate EFT file content (NAEDO format for South African banks)
 * This is a simplified version - production would use full NAEDO specification
 */
export function generateEFTFile(batch: PaymentBatch): string {
  const lines: string[] = [];
  
  // Header record
  const header = generateEFTHeader(batch);
  lines.push(header);
  
  // Group payments by payee
  const groupedPayments = groupClaimsByPayee(batch.payments);
  
  // Detail records
  groupedPayments.forEach((claims, key) => {
    const totalAmount = calculatePaymentTotal(claims);
    const firstClaim = claims[0];
    
    // Validate banking details
    const validation = validateBankingDetails(firstClaim);
    if (!validation.valid) {
      console.warn(`Skipping payment for ${firstClaim.payee_name}: ${validation.errors.join(', ')}`);
      return;
    }
    
    const detail = generateEFTDetail({
      recordType: '2',
      accountNumber: firstClaim.account_number!,
      branchCode: firstClaim.branch_code!,
      accountType: '1', // 1=Current, 2=Savings
      amount: totalAmount,
      accountHolderName: firstClaim.account_holder_name!,
      reference: batch.batch_number,
      beneficiaryReference: claims.map(c => c.claim_number).join(',').substring(0, 20)
    });
    lines.push(detail);
  });
  
  // Trailer record
  const trailer = generateEFTTrailer(batch, lines.length - 1); // Exclude header
  lines.push(trailer);
  
  return lines.join('\n');
}

/**
 * Generate EFT header record
 */
function generateEFTHeader(batch: PaymentBatch): string {
  const recordType = '1';
  const serviceType = '001'; // Credit
  const userCode = 'DAY1HEALTH'.padEnd(10, ' ');
  const creationDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const batchNumber = batch.batch_number.padEnd(20, ' ');
  
  return `${recordType}${serviceType}${userCode}${creationDate}${batchNumber}`;
}

/**
 * Generate EFT detail record
 */
function generateEFTDetail(record: EFTRecord): string {
  const recordType = record.recordType;
  const branchCode = record.branchCode.padStart(6, '0');
  const accountNumber = record.accountNumber.padStart(11, '0');
  const accountType = record.accountType;
  const amount = Math.round(record.amount * 100).toString().padStart(13, '0'); // Amount in cents
  const accountHolderName = record.accountHolderName.substring(0, 32).padEnd(32, ' ');
  const reference = record.reference.substring(0, 20).padEnd(20, ' ');
  const beneficiaryRef = record.beneficiaryReference.substring(0, 20).padEnd(20, ' ');
  
  return `${recordType}${branchCode}${accountNumber}${accountType}${amount}${accountHolderName}${reference}${beneficiaryRef}`;
}

/**
 * Generate EFT trailer record
 */
function generateEFTTrailer(batch: PaymentBatch, recordCount: number): string {
  const recordType = '9';
  const totalRecords = recordCount.toString().padStart(8, '0');
  const totalAmount = Math.round(batch.total_amount * 100).toString().padStart(15, '0'); // Amount in cents
  const hashTotal = '0'.padStart(15, '0'); // Simplified - production would calculate actual hash
  
  return `${recordType}${totalRecords}${totalAmount}${hashTotal}`;
}

/**
 * Generate payment reference
 * Format: PAY-CLAIMNUM-YYYYMMDD
 */
export function generatePaymentReference(claimNumber: string): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `PAY-${claimNumber}-${date}`;
}

/**
 * Calculate payment processing fee (if applicable)
 */
export function calculateProcessingFee(amount: number, method: string): number {
  // EFT fees (example rates)
  if (method === 'eft') {
    return 5.00; // Flat R5 per EFT
  }
  
  // Cheque fees
  if (method === 'cheque') {
    return 15.00; // Flat R15 per cheque
  }
  
  return 0;
}

/**
 * Determine payment method based on amount and payee type
 */
export function determinePaymentMethod(amount: number, payeeType: string): 'eft' | 'cheque' {
  // Large amounts via EFT
  if (amount > 10000) {
    return 'eft';
  }
  
  // Member refunds typically via EFT
  if (payeeType === 'member') {
    return 'eft';
  }
  
  // Default to EFT
  return 'eft';
}

/**
 * Validate payment batch before processing
 */
export function validatePaymentBatch(batch: PaymentBatch): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check batch has payments
  if (!batch.payments || batch.payments.length === 0) {
    errors.push('Batch has no payments');
  }
  
  // Check total amount matches
  const calculatedTotal = batch.payments.reduce((sum, p) => sum + p.payment_amount, 0);
  if (Math.abs(calculatedTotal - batch.total_amount) > 0.01) {
    errors.push(`Total amount mismatch: expected R${batch.total_amount}, calculated R${calculatedTotal}`);
  }
  
  // Check total claims matches
  if (batch.payments.length !== batch.total_claims) {
    errors.push(`Total claims mismatch: expected ${batch.total_claims}, found ${batch.payments.length}`);
  }
  
  // Validate each payment
  batch.payments.forEach((payment, index) => {
    const validation = validateBankingDetails(payment);
    if (!validation.valid) {
      errors.push(`Payment ${index + 1} (${payment.payee_name}): ${validation.errors.join(', ')}`);
    }
  });
  
  // Check for duplicate payees (warning only)
  const payeeIds = batch.payments.map(p => p.payee_id);
  const duplicates = payeeIds.filter((id, index) => payeeIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    warnings.push(`Duplicate payees found: ${duplicates.length} payments to same payee`);
  }
  
  // Check for large amounts (warning only)
  const largePayments = batch.payments.filter(p => p.payment_amount > 100000);
  if (largePayments.length > 0) {
    warnings.push(`${largePayments.length} payment(s) exceed R100,000`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Get payment status badge color
 */
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get batch status badge color
 */
export function getBatchStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    approved: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
