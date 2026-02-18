import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import * as crypto from 'crypto';

export interface SARSSubmissionDto {
  tax_year: number; // Format: YYYY as number
  submission_type: 'medical_scheme' | 'insurance';
}

export interface SARSSubmissionFile {
  submission_number: string;
  file_name: string;
  file_content: string;
  file_hash: string;
  record_count: number;
  submission_date: Date;
}

export interface SARSThirdPartyRecord {
  tax_reference_number: string;
  id_number: string;
  initials: string;
  surname: string;
  payment_date: string;
  payment_amount: number;
  payment_type: string;
  source_code: string;
}

@Injectable()
export class SARSReportingService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  async generateThirdPartySubmission(
    dto: SARSSubmissionDto,
    userId: string,
  ): Promise<SARSSubmissionFile> {
    // Validate submission data
    this.validateSubmissionData(dto);

    // Get payment data for the tax year
    const payments = await this.getPaymentsForTaxYear(dto.tax_year, dto.submission_type);

    // Generate SARS records
    const records = await this.generateSARSRecords(payments, dto.submission_type);

    // Create file content
    const fileContent = this.formatSARSFile(records, dto);

    // Calculate file hash
    const fileHash = this.calculateFileHash(fileContent);

    // Generate unique submission number
    const submissionNumber = await this.generateSubmissionNumber();

    // Store submission record
    const submission = await this.supabase.getClient().sarsSubmission.create({
      data: {
        submission_number: submissionNumber,
        tax_year: dto.tax_year,
        submission_type: dto.submission_type,
        file_path: `sars/${submissionNumber}.csv`,
        file_hash: fileHash,
        record_count: records.length,
        status: 'generated',
        submitted_at: new Date(),
        submitted_by: userId,
      },
    });

    // Log to audit trail
    await this.auditService.logEvent({
      event_type: 'sars_submission_generated',
      user_id: userId,
      entity_type: 'sars_submission',
      entity_id: submission.id,
      action: 'create',
      metadata: {
        submission_number: submissionNumber,
        tax_year: dto.tax_year,
        submission_type: dto.submission_type,
        file_hash: fileHash,
        record_count: records.length,
      },
    });

    return {
      submission_number: submissionNumber,
      file_name: `SARS_${dto.submission_type}_${dto.tax_year}.csv`,
      file_content: fileContent,
      file_hash: fileHash,
      record_count: records.length,
      submission_date: submission.submitted_at || new Date(),
    };
  }

  private validateSubmissionData(dto: SARSSubmissionDto): void {
    // Validate tax year
    const currentYear = new Date().getFullYear();
    if (dto.tax_year < 2000 || dto.tax_year > currentYear) {
      throw new Error(`Tax year must be between 2000 and ${currentYear}`);
    }

    // Validate submission type
    const validTypes = ['medical_scheme', 'insurance'];
    if (!validTypes.includes(dto.submission_type)) {
      throw new Error('Invalid submission type');
    }
  }

  private async getPaymentsForTaxYear(taxYear: number, submissionType: string): Promise<any[]> {
    const startDate = new Date(`${taxYear}-03-01`); // SA tax year starts March 1
    const endDate = new Date(`${taxYear + 1}-02-28`);

    // Get all payments for members with policies in the specified regime
    const payments = await this.supabase.getClient().payment.findMany({
      where: {
        status: 'completed',
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        invoice: {
          policy: {
            plan: {
              product: {
                regime: submissionType,
              },
            },
          },
        },
      },
      include: {
        invoice: {
          include: {
            policy: {
              include: {
                plan: {
                  include: {
                    product: true,
                  },
                },
                policy_members: {
                  include: {
                    member: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return payments;
  }

  private async generateSARSRecords(
    payments: any[],
    submissionType: string,
  ): Promise<SARSThirdPartyRecord[]> {
    const records: SARSThirdPartyRecord[] = [];

    for (const payment of payments) {
      const policy = payment.invoice.policy;
      const principalMember = policy.policy_members.find((pm: any) => pm.relationship === 'self');

      if (!principalMember) {
        continue; // Skip if no principal member found
      }

      const member = principalMember.member;

      // Determine payment type based on submission type
      const paymentType = submissionType === 'insurance' ? '3810' : '3801';

      records.push({
        tax_reference_number: member.tax_reference_number || '',
        id_number: member.id_number,
        initials: this.extractInitials(member.first_name),
        surname: member.last_name,
        payment_date: payment.created_at.toISOString().slice(0, 10),
        payment_amount: payment.amount,
        payment_type: paymentType,
        source_code: '01', // Default source code
      });
    }

    return records;
  }

  private extractInitials(firstName: string): string {
    if (!firstName) return '';
    return firstName
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .join('');
  }

  private formatSARSFile(records: SARSThirdPartyRecord[], dto: SARSSubmissionDto): string {
    // CSV format for SARS third-party submissions
    const headers = [
      'Tax Reference Number',
      'ID Number',
      'Initials',
      'Surname',
      'Payment Date',
      'Payment Amount',
      'Payment Type',
      'Source Code',
    ];

    const rows = records.map((record) => [
      record.tax_reference_number,
      record.id_number,
      record.initials,
      record.surname,
      record.payment_date,
      record.payment_amount.toFixed(2),
      record.payment_type,
      record.source_code,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return csvContent;
  }

  private calculateFileHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async generateSubmissionNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await this.supabase.getClient().sarsSubmission.count({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(6, '0');
    return `SARS-${dateStr}-${sequence}`;
  }

  async getSubmissionByNumber(submissionNumber: string): Promise<any> {
    return this.supabase.getClient().sarsSubmission.findUnique({
      where: { submission_number: submissionNumber },
    });
  }

  async getSubmissionsByTaxYear(taxYear: number): Promise<any[]> {
    return this.supabase.getClient().sarsSubmission.findMany({
      where: { tax_year: taxYear },
      orderBy: { created_at: 'desc' },
    });
  }

  async getSubmissionsByType(submissionType: string): Promise<any[]> {
    return this.supabase.getClient().sarsSubmission.findMany({
      where: { submission_type: submissionType },
      orderBy: { created_at: 'desc' },
    });
  }

  async markSubmissionAsSubmitted(submissionNumber: string, userId: string): Promise<any> {
    const submission = await this.getSubmissionByNumber(submissionNumber);

    if (!submission) {
      throw new Error('Submission not found');
    }

    const updated = await this.supabase.getClient().sarsSubmission.update({
      where: { submission_number: submissionNumber },
      data: {
        status: 'submitted',
      },
    });

    await this.auditService.logEvent({
      event_type: 'sars_submission_submitted',
      user_id: userId,
      entity_type: 'sars_submission',
      entity_id: submission.id,
      action: 'update',
      metadata: {
        submission_number: submissionNumber,
        tax_year: submission.tax_year,
        submission_type: submission.submission_type,
      },
    });

    return updated;
  }

  async getSubmissionStatistics(): Promise<{
    total: number;
    by_tax_year: Record<string, number>;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
  }> {
    const total = await this.supabase.getClient().sarsSubmission.count();

    const byTaxYear = await this.supabase.getClient().sarsSubmission.groupBy({
      by: ['tax_year'],
      _count: true,
    });

    const byType = await this.supabase.getClient().sarsSubmission.groupBy({
      by: ['submission_type'],
      _count: true,
    });

    const byStatus = await this.supabase.getClient().sarsSubmission.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      total,
      by_tax_year: Object.fromEntries(byTaxYear.map((item) => [item.tax_year.toString(), item._count])),
      by_type: Object.fromEntries(byType.map((item) => [item.submission_type, item._count])),
      by_status: Object.fromEntries(byStatus.map((item) => [item.status, item._count])),
    };
  }
}
