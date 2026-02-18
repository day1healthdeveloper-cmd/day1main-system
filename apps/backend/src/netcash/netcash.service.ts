import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NetcashApiClient } from './netcash-api.client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NetcashService {
  private readonly logger = new Logger(NetcashService.name);
  private readonly serviceKey = process.env.NETCASH_SERVICE_KEY || '657eb988-5345-45f7-a5e5-07a1a586155f';
  private readonly softwareVendorKey = '24ade73c-98cf-47b3-99be-cc7b867b3080';

  constructor(
    private readonly supabase: SupabaseService,
    private readonly apiClient: NetcashApiClient,
  ) {}

  /**
   * Generate monthly debit order batch
   */
  async generateMonthlyBatch(options: {
    actionDate: string; // CCYYMMDD format
    instruction?: 'Sameday' | 'TwoDay';
    brokerGroups?: string[];
    autoSubmit?: boolean; // New option to auto-submit to Netcash
  }) {
    const { actionDate, instruction = 'TwoDay', brokerGroups, autoSubmit = false } = options;

    this.logger.log(`Generating monthly batch for action date: ${actionDate}`);

    // Fetch active members
    let query = this.supabase.getClient()
      .from('members')
      .select('*, netcash_group_id')
      .eq('debit_order_status', 'active')
      .not('monthly_premium', 'is', null)
      .gt('monthly_premium', 0);

    // Filter by broker groups if specified
    if (brokerGroups && brokerGroups.length > 0) {
      query = query.in('broker_group', brokerGroups);
    }

    const { data: members, error } = await query;

    if (error) {
      this.logger.error('Error fetching members:', error);
      throw new Error(`Failed to fetch members: ${error.message}`);
    }

    if (!members || members.length === 0) {
      throw new Error('No active members found for debit order processing');
    }

    this.logger.log(`Found ${members.length} active members`);

    // Validate members
    const validationErrors = this.validateMembers(members);
    if (validationErrors.length > 0) {
      this.logger.warn(`Validation errors found for ${validationErrors.length} members`);
      // Filter out invalid members
      const validMemberNumbers = new Set(
        members.map(m => m.member_number).filter(
          mn => !validationErrors.find(e => e.member_number === mn)
        )
      );
      const validMembers = members.filter(m => validMemberNumbers.has(m.member_number));
      
      if (validMembers.length === 0) {
        throw new Error('No valid members after validation');
      }
      
      members.length = 0;
      members.push(...validMembers);
    }

    // Generate file content
    const batchName = `BATCH_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
    const fileContent = this.generateFileContent(members, {
      batchName,
      actionDate,
      instruction,
    });

    // Create debit order run record
    const { data: run, error: runError } = await this.supabase.getClient()
      .from('debit_order_runs')
      .insert({
        run_date: new Date().toISOString().split('T')[0],
        batch_name: batchName,
        batch_type: instruction.toLowerCase(),
        total_members: members.length,
        total_amount: members.reduce((sum, m) => sum + m.monthly_premium, 0),
        status: 'pending',
        file_path: `batches/${batchName}.txt`,
      })
      .select()
      .single();

    if (runError) {
      this.logger.error('Error creating run record:', runError);
      throw new Error(`Failed to create run record: ${runError.message}`);
    }

    // Save file
    const outputDir = path.join(process.cwd(), 'uploads', 'netcash', 'batches');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, `${batchName}.txt`);
    fs.writeFileSync(filepath, fileContent, 'utf8');

    this.logger.log(`Batch file generated: ${filepath}`);

    // Auto-submit to Netcash if requested
    let uploadResult = null;
    if (autoSubmit) {
      this.logger.log('Auto-submitting batch to Netcash...');
      uploadResult = await this.submitBatchToNetcash(run.id, filepath, batchName);
    }

    return {
      runId: run.id,
      batchName,
      filepath,
      memberCount: members.length,
      totalAmount: members.reduce((sum, m) => sum + m.monthly_premium, 0),
      actionDate,
      fileContent,
      validationErrors,
      uploadResult,
    };
  }

  /**
   * Generate Netcash file content
   */
  private generateFileContent(
    members: any[],
    options: {
      batchName: string;
      actionDate: string;
      instruction: string;
    }
  ): string {
    const lines = [];

    // Header record - TAB-DELIMITED as per Netcash documentation
    const header = [
      'H',
      this.serviceKey,
      '1',
      options.instruction,
      options.batchName,
      options.actionDate,
      this.softwareVendorKey,
    ].join('\t');

    lines.push(header);

    // Key record - TAB-DELIMITED (EXACT official format - 14 fields)
    const keyRecord = [
      'K',
      '101', '102', '131', '132', '133', '134', '135', '136', '137', '162', '201', '301', '302', '303',
    ].join('\t');

    lines.push(keyRecord);

    // Transaction records - TAB-DELIMITED (EXACT official format - 15 fields)
    let totalAmount = 0;

    members.forEach(member => {
      const amountInCents = Math.round(member.monthly_premium * 100);
      totalAmount += amountInCents;

      const accountType = this.getAccountType(member.bank_name);

      const transaction = [
        'T',
        member.netcash_account_reference || `D1-${member.member_number}`,  // 101: Account reference
        `${member.first_name} ${member.last_name}`.substring(0, 30),        // 102: Account name
        '1',                                                                 // 131: Active
        member.account_holder_name || `${member.first_name} ${member.last_name}`, // 132: Account holder
        accountType,                                                         // 133: Account type
        member.branch_code || '',                                           // 134: Branch code
        '0',                                                                 // 135: Filler
        member.account_number || '',                                        // 136: Account number
        '',                                                                  // 137: Masked card
        amountInCents.toString(),                                           // 162: Amount in cents
        member.email || '',                                                 // 201: Email
        member.broker_group || '',                                          // 301: Custom field 1
        member.member_number || '',                                         // 302: Custom field 2
        member.next_debit_date || '',                                       // 303: Custom field 3
      ].join('\t');

      lines.push(transaction);
    });

    // Footer record - TAB-DELIMITED
    const footer = ['F', members.length.toString(), totalAmount.toString(), '9999'].join('\t');
    lines.push(footer);

    // Use CRLF line endings as per Windows standard
    return lines.join('\r\n');
  }

  /**
   * Get account type based on bank name
   */
  private getAccountType(bankName: string): string {
    const savingsKeywords = ['savings', 'save'];
    const lowerBank = (bankName || '').toLowerCase();

    if (savingsKeywords.some(kw => lowerBank.includes(kw))) {
      return '1'; // Savings
    }

    return '2'; // Cheque (default)
  }

  /**
   * Validate member data
   */
  private validateMembers(members: any[]): any[] {
    const errors: any[] = [];

    members.forEach((member, index) => {
      const memberErrors = [];

      if (!member.member_number) memberErrors.push('Missing member_number');
      if (!member.first_name) memberErrors.push('Missing first_name');
      if (!member.last_name) memberErrors.push('Missing last_name');
      if (!member.bank_name) memberErrors.push('Missing bank_name');
      if (!member.account_number) memberErrors.push('Missing account_number');
      if (!member.branch_code) memberErrors.push('Missing branch_code');
      if (!member.monthly_premium || member.monthly_premium <= 0)
        memberErrors.push('Invalid monthly_premium');

      // Validate branch code (6 digits)
      if (member.branch_code && !/^\d{6}$/.test(member.branch_code)) {
        memberErrors.push('Invalid branch_code format (must be 6 digits)');
      }

      // Validate account number (max 15 digits)
      if (member.account_number && member.account_number.length > 15) {
        memberErrors.push('Account number too long (max 15 digits)');
      }

      if (memberErrors.length > 0) {
        errors.push({
          index,
          member_number: member.member_number,
          errors: memberErrors,
        });
      }
    });

    return errors;
  }

  /**
   * Get batch status
   */
  async getBatchStatus(runId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('debit_order_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (error) {
      throw new Error(`Failed to get batch status: ${error.message}`);
    }

    return data;
  }

  /**
   * Get batch history
   */
  async getBatchHistory(limit = 10) {
    const { data, error } = await this.supabase.getClient()
      .from('debit_order_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get batch history: ${error.message}`);
    }

    return data;
  }

  /**
   * Get member debit order summary
   */
  async getMemberSummary(filters?: {
    brokerGroup?: string;
    status?: string;
  }) {
    let query = this.supabase.getClient()
      .from('members')
      .select('broker_group, debit_order_status, monthly_premium, total_arrears');

    if (filters?.brokerGroup) {
      query = query.eq('broker_group', filters.brokerGroup);
    }

    if (filters?.status) {
      query = query.eq('debit_order_status', filters.status);
    }

    const { data: members, error } = await query;

    if (error) {
      throw new Error(`Failed to get member summary: ${error.message}`);
    }

    // Group by broker and status
    const summary: {
      total: number;
      totalPremium: number;
      totalArrears: number;
      byBroker: Record<string, { count: number; premium: number; arrears: number }>;
      byStatus: Record<string, { count: number; premium: number; arrears: number }>;
    } = {
      total: members.length,
      totalPremium: members.reduce((sum, m) => sum + (m.monthly_premium || 0), 0),
      totalArrears: members.reduce((sum, m) => sum + (m.total_arrears || 0), 0),
      byBroker: {},
      byStatus: {},
    };

    members.forEach(m => {
      // By broker
      if (!summary.byBroker[m.broker_group]) {
        summary.byBroker[m.broker_group] = {
          count: 0,
          premium: 0,
          arrears: 0,
        };
      }
      summary.byBroker[m.broker_group].count++;
      summary.byBroker[m.broker_group].premium += m.monthly_premium || 0;
      summary.byBroker[m.broker_group].arrears += m.total_arrears || 0;

      // By status
      if (!summary.byStatus[m.debit_order_status]) {
        summary.byStatus[m.debit_order_status] = {
          count: 0,
          premium: 0,
          arrears: 0,
        };
      }
      summary.byStatus[m.debit_order_status].count++;
      summary.byStatus[m.debit_order_status].premium += m.monthly_premium || 0;
      summary.byStatus[m.debit_order_status].arrears += m.total_arrears || 0;
    });

    return summary;
  }

  /**
   * Calculate next debit date
   */
  getNextDebitDate(daysAhead = 2): string {
    const date = new Date();
    let businessDays = 0;

    while (businessDays < daysAhead) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();

      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
    }

    // Format as CCYYMMDD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
  }

  /**
   * Calculate submission date (3 business days before strike date)
   * If strike date is weekend, move to Monday
   */
  calculateSubmissionDate(strikeDate: Date): Date {
    // First, adjust strike date if it falls on weekend
    const adjustedStrikeDate = this.adjustForWeekend(strikeDate);
    
    // Then calculate 3 business days before
    const submissionDate = new Date(adjustedStrikeDate);
    let businessDays = 0;
    
    while (businessDays < 3) {
      submissionDate.setDate(submissionDate.getDate() - 1);
      const dayOfWeek = submissionDate.getDay();
      
      // Count only weekdays
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
    }
    
    return submissionDate;
  }

  /**
   * Adjust date if it falls on weekend - move to next Monday
   */
  private adjustForWeekend(date: Date): Date {
    const adjusted = new Date(date);
    const dayOfWeek = adjusted.getDay();
    
    if (dayOfWeek === 0) {
      // Sunday -> Monday
      adjusted.setDate(adjusted.getDate() + 1);
    } else if (dayOfWeek === 6) {
      // Saturday -> Monday
      adjusted.setDate(adjusted.getDate() + 2);
    }
    
    return adjusted;
  }

  /**
   * Get batches that need to be submitted today
   * Groups members by their adjusted strike date (weekends moved to Monday)
   */
  async getBatchesForSubmission(submissionDate?: Date): Promise<any[]> {
    const targetDate = submissionDate || new Date();
    
    this.logger.log(`Getting batches for submission on ${targetDate.toISOString().split('T')[0]}`);
    
    // Fetch all active members
    const { data: members, error } = await this.supabase.getClient()
      .from('members')
      .select('*')
      .eq('debit_order_status', 'active')
      .not('monthly_premium', 'is', null)
      .gt('monthly_premium', 0)
      .not('next_debit_date', 'is', null);

    if (error) {
      this.logger.error('Error fetching members:', error);
      throw new Error(`Failed to fetch members: ${error.message}`);
    }

    if (!members || members.length === 0) {
      this.logger.log('No active members found');
      return [];
    }

    // Group members by their submission date
    const batchGroups = new Map<string, any[]>();
    
    members.forEach(member => {
      const strikeDate = new Date(member.next_debit_date);
      const calculatedSubmissionDate = this.calculateSubmissionDate(strikeDate);
      const adjustedStrikeDate = this.adjustForWeekend(strikeDate);
      
      // Check if this member should be submitted on target date
      const submissionDateStr = calculatedSubmissionDate.toISOString().split('T')[0];
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      if (submissionDateStr === targetDateStr) {
        const strikeDateKey = adjustedStrikeDate.toISOString().split('T')[0];
        
        if (!batchGroups.has(strikeDateKey)) {
          batchGroups.set(strikeDateKey, []);
        }
        
        const group = batchGroups.get(strikeDateKey);
        if (group) {
          group.push(member);
        }
      }
    });

    // Convert to array of batch objects
    const batches = Array.from(batchGroups.entries()).map(([strikeDate, members]) => {
      const totalAmount = members.reduce((sum, m) => sum + (m.monthly_premium || 0), 0);
      const brokerGroups = [...new Set(members.map(m => m.broker_group))];
      
      return {
        strikeDate,
        submissionDate: targetDate.toISOString().split('T')[0],
        memberCount: members.length,
        totalAmount,
        brokerGroups,
        members,
      };
    });

    this.logger.log(`Found ${batches.length} batches for submission`);
    
    return batches;
  }

  /**
   * Get upcoming submission schedule (next 30 days)
   */
  async getSubmissionSchedule(daysAhead = 30): Promise<any[]> {
    const today = new Date();
    const schedule: any[] = [];
    
    // Fetch all active members
    const { data: members, error } = await this.supabase.getClient()
      .from('members')
      .select('*')
      .eq('debit_order_status', 'active')
      .not('monthly_premium', 'is', null)
      .gt('monthly_premium', 0)
      .not('next_debit_date', 'is', null);

    if (error || !members || members.length === 0) {
      return [];
    }

    // Group by submission date
    const submissionMap = new Map<string, any>();
    
    members.forEach(member => {
      const strikeDate = new Date(member.next_debit_date);
      const submissionDate = this.calculateSubmissionDate(strikeDate);
      const adjustedStrikeDate = this.adjustForWeekend(strikeDate);
      
      // Only include if within the next X days
      const daysUntilSubmission = Math.floor((submissionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilSubmission >= 0 && daysUntilSubmission <= daysAhead) {
        const submissionKey = submissionDate.toISOString().split('T')[0];
        const strikeKey = adjustedStrikeDate.toISOString().split('T')[0];
        
        if (!submissionMap.has(submissionKey)) {
          submissionMap.set(submissionKey, {
            submissionDate: submissionKey,
            daysUntilSubmission,
            batches: new Map(),
          });
        }
        
        const dayData = submissionMap.get(submissionKey);
        
        if (!dayData.batches.has(strikeKey)) {
          dayData.batches.set(strikeKey, {
            strikeDate: strikeKey,
            members: [],
            totalAmount: 0,
          });
        }
        
        const batch = dayData.batches.get(strikeKey);
        batch.members.push(member);
        batch.totalAmount += member.monthly_premium || 0;
      }
    });

    // Convert to array and sort
    submissionMap.forEach((dayData, submissionDate) => {
      const batches = Array.from(dayData.batches.values()).map((batch: any) => ({
        strikeDate: batch.strikeDate,
        memberCount: batch.members.length,
        totalAmount: batch.totalAmount,
        brokerGroups: [...new Set(batch.members.map((m: any) => m.broker_group))],
      }));
      
      schedule.push({
        submissionDate: dayData.submissionDate,
        daysUntilSubmission: dayData.daysUntilSubmission,
        batches,
        totalMembers: batches.reduce((sum, b) => sum + b.memberCount, 0),
        totalAmount: batches.reduce((sum, b) => sum + b.totalAmount, 0),
      });
    });

    // Sort by submission date
    schedule.sort((a, b) => a.submissionDate.localeCompare(b.submissionDate));
    
    return schedule;
  }

  /**
   * Get broker groups with statistics
   */
  async getBrokerGroups() {
    try {
      this.logger.log('=== START getBrokerGroups ===');
      this.logger.log('Fetching broker groups from database...');
      
      const { data: members, error } = await this.supabase.getClient()
        .from('members')
        .select('broker_group, debit_order_status, monthly_premium, total_arrears');

      this.logger.log(`Query completed. Error: ${error ? JSON.stringify(error) : 'none'}`);
      this.logger.log(`Members data: ${members ? `Array with ${members.length} items` : 'null/undefined'}`);

      if (error) {
        this.logger.error('Error fetching broker groups:', JSON.stringify(error));
        throw new Error(`Failed to fetch broker groups: ${error.message}`);
      }

      if (!members || members.length === 0) {
        this.logger.warn('No members found in database - returning empty array');
        return [];
      }

      this.logger.log(`Processing ${members.length} members...`);

      // Group by broker_group
      const groupMap = new Map();

      members.forEach((member, index) => {
        const group = member.broker_group;
        
        if (!group) {
          this.logger.warn(`Member at index ${index} has no broker_group`);
          return;
        }
        
        if (!groupMap.has(group)) {
          groupMap.set(group, {
            broker_group: group,
            member_count: 0,
            active_count: 0,
            pending_count: 0,
            suspended_count: 0,
            failed_count: 0,
            total_premium: 0,
            total_arrears: 0,
          });
        }

        const stats = groupMap.get(group);
        stats.member_count++;
        stats.total_premium += member.monthly_premium || 0;
        stats.total_arrears += member.total_arrears || 0;

        if (member.debit_order_status === 'active') stats.active_count++;
        if (member.debit_order_status === 'pending') stats.pending_count++;
        if (member.debit_order_status === 'suspended') stats.suspended_count++;
        if (member.debit_order_status === 'failed') stats.failed_count++;
      });

      const result = Array.from(groupMap.values()).sort((a, b) => 
        a.broker_group.localeCompare(b.broker_group)
      );
      
      this.logger.log(`Created ${result.length} broker groups from ${groupMap.size} unique groups`);
      this.logger.log(`Sample groups: ${result.slice(0, 3).map(g => g.broker_group).join(', ')}`);
      this.logger.log('=== END getBrokerGroups ===');
      
      return result;
    } catch (error) {
      this.logger.error('Exception in getBrokerGroups:', error);
      throw error;
    }
  }

  /**
   * Get members with filters
   */
  async getMembers(filters: {
    brokerGroup?: string;
    status?: string;
    search?: string;
    limit?: number;
  }) {
    let query = this.supabase.getClient()
      .from('members')
      .select('id, member_number, first_name, last_name, broker_group, debit_order_status, monthly_premium, total_arrears, next_debit_date, email, mobile');

    if (filters.brokerGroup) {
      query = query.eq('broker_group', filters.brokerGroup);
    }

    if (filters.status) {
      query = query.eq('debit_order_status', filters.status);
    }

    if (filters.search) {
      query = query.or(`member_number.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
    }

    query = query.limit(filters.limit || 50);
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch members: ${error.message}`);
    }

    return data;
  }

  /**
   * Submit batch to Netcash via API
   */
  async submitBatchToNetcash(runId: string, filepath: string, batchName: string): Promise<any> {
    try {
      this.logger.log(`Submitting batch ${batchName} to Netcash...`);

      // Validate file first
      const validation = this.apiClient.validateBatchFile(filepath);
      if (!validation.valid) {
        this.logger.error('Batch file validation failed:', validation.errors);
        
        // Update run status
        await this.supabase.getClient()
          .from('debit_order_runs')
          .update({
            status: 'failed',
            error_message: `Validation failed: ${validation.errors.join(', ')}`,
          })
          .eq('id', runId);

        return {
          success: false,
          error: 'Batch file validation failed',
          validationErrors: validation.errors,
        };
      }

      // Upload to Netcash
      const uploadResult = await this.apiClient.uploadBatch(filepath, batchName);

      if (uploadResult.success) {
        this.logger.log('Batch uploaded successfully to Netcash');

        // Update run status
        await this.supabase.getClient()
          .from('debit_order_runs')
          .update({
            status: 'submitted',
            netcash_batch_reference: uploadResult.data?.BatchReference || batchName,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', runId);

        return {
          success: true,
          batchReference: uploadResult.data?.BatchReference,
          message: 'Batch submitted successfully to Netcash',
          data: uploadResult.data,
        };
      } else {
        this.logger.error('Batch upload failed:', uploadResult.error);

        // Update run status
        await this.supabase.getClient()
          .from('debit_order_runs')
          .update({
            status: 'failed',
            error_message: uploadResult.message || 'Upload failed',
          })
          .eq('id', runId);

        return {
          success: false,
          error: uploadResult.error,
          message: uploadResult.message,
        };
      }
    } catch (error: any) {
      this.logger.error('Error submitting batch to Netcash:', error);

      // Update run status
      await this.supabase.getClient()
        .from('debit_order_runs')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', runId);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check batch status from Netcash
   */
  async checkNetcashBatchStatus(runId: string): Promise<any> {
    try {
      // Get run record
      const { data: run, error } = await this.supabase.getClient()
        .from('debit_order_runs')
        .select('*')
        .eq('id', runId)
        .single();

      if (error || !run) {
        throw new Error('Batch run not found');
      }

      // Get status from Netcash (returns last 10 batches)
      const statusResult = await this.apiClient.getBatchStatus();

      if (statusResult.success) {
        // Update local status
        await this.supabase.getClient()
          .from('debit_order_runs')
          .update({
            netcash_status: statusResult.data?.Status || 'checked',
            last_status_check: new Date().toISOString(),
          })
          .eq('id', runId);

        return {
          success: true,
          status: statusResult.data?.Status,
          data: statusResult.data,
          message: 'Status retrieved successfully',
        };
      }

      return statusResult;
    } catch (error: any) {
      this.logger.error('Error checking Netcash batch status:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error',
      };
    }
  }

  /**
   * Get batch results from Netcash (Note: Uses same status endpoint)
   */
  async getNetcashBatchResults(runId: string): Promise<any> {
    try {
      // Netcash returns batch status which includes results
      return this.checkNetcashBatchStatus(runId);
    } catch (error: any) {
      this.logger.error('Error getting Netcash batch results:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error',
      };
    }
  }

  /**
   * Test Netcash API connection
   */
  async testNetcashConnection(): Promise<any> {
    return this.apiClient.testConnection();
  }
}

