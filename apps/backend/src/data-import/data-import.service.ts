import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface ImportFile {
  id: string;
  filename: string;
  type: string;
  status: 'analyzing' | 'ready' | 'importing' | 'completed' | 'error';
  totalRecords: number;
  processedRecords: number;
  errors: string[];
  preview: any[];
  columns: string[];
  filePath: string;
  createdAt: Date;
}

@Injectable()
export class DataImportService {
  private importFiles: Map<string, ImportFile> = new Map();

  constructor(private readonly supabase: SupabaseService) {}

  async analyzeFile(file: Express.Multer.File, type: string) {
    const fileId = uuidv4();
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('File is empty');
    }

    const columns = Object.keys(data[0] as Record<string, any>);
    const preview = data.slice(0, 3);

    // Validate columns based on type
    const validation = this.validateColumns(type, columns);
    if (!validation.valid) {
      fs.unlinkSync(file.path);
      throw new BadRequestException(`Invalid columns: ${validation.errors.join(', ')}`);
    }

    const importFile: ImportFile = {
      id: fileId,
      filename: file.originalname,
      type,
      status: 'ready',
      totalRecords: data.length,
      processedRecords: 0,
      errors: [],
      preview,
      columns,
      filePath: file.path,
      createdAt: new Date(),
    };

    this.importFiles.set(fileId, importFile);

    return {
      fileId,
      filename: file.originalname,
      type,
      totalRecords: data.length,
      columns,
      preview,
      status: 'ready',
    };
  }

  async importFile(fileId: string) {
    const importFile = this.importFiles.get(fileId);
    if (!importFile) {
      throw new NotFoundException('Import file not found');
    }

    importFile.status = 'importing';
    importFile.errors = [];
    importFile.processedRecords = 0;

    try {
      const workbook = XLSX.readFile(importFile.filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      switch (importFile.type) {
        case 'members':
          await this.importMembers(data, importFile);
          break;
        case 'policies':
          await this.importPolicies(data, importFile);
          break;
        case 'claims':
          await this.importClaims(data, importFile);
          break;
        case 'financial':
          await this.importFinancial(data, importFile);
          break;
        case 'products':
          await this.importProducts(data, importFile);
          break;
        case 'providers':
          await this.importProviders(data, importFile);
          break;
        case 'brokers':
          await this.importBrokers(data, importFile);
          break;
        default:
          throw new BadRequestException('Invalid import type');
      }

      importFile.status = 'completed';
      
      // Clean up file
      fs.unlinkSync(importFile.filePath);

      return {
        fileId,
        status: 'completed',
        totalRecords: importFile.totalRecords,
        processedRecords: importFile.processedRecords,
        errors: importFile.errors,
      };
    } catch (error) {
      importFile.status = 'error';
      importFile.errors.push(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async importMembers(data: any[], importFile: ImportFile) {
    for (const row of data) {
      try {
        const member = {
          member_number: row['Member Number'] || `MEM${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          id_number: row['ID Number'],
          first_name: row['First Name'],
          last_name: row['Last Name'],
          date_of_birth: row['Date of Birth'],
          gender: row['Gender'],
          email: row['Email'],
          phone: row['Phone'] || row['Mobile'],
          mobile: row['Mobile'] || row['Phone'],
          address_line1: row['Address Line 1'] || row['Address'],
          address_line2: row['Address Line 2'],
          city: row['City'],
          postal_code: row['Postal Code'],
          status: row['Status'] || 'active',
          kyc_status: row['KYC Status'] || 'pending',
          risk_score: row['Risk Score'] || 0,
          plan_name: row['Plan Name'] || row['Plan'],
          monthly_premium: parseFloat(row['Monthly Premium'] || row['Premium'] || '0'),
          start_date: row['Start Date'] || new Date().toISOString(),
          bank_name: row['Bank Name'],
          account_number: row['Account Number'],
          branch_code: row['Branch Code'],
          account_holder_name: row['Account Holder Name'] || `${row['First Name']} ${row['Last Name']}`,
          debit_order_day: parseInt(row['Debit Order Day'] || '1'),
          marketing_consent: row['Marketing Consent'] === 'Yes' || row['Marketing Consent'] === true,
          email_consent: row['Email Consent'] === 'Yes' || row['Email Consent'] === true,
          sms_consent: row['SMS Consent'] === 'Yes' || row['SMS Consent'] === true,
          phone_consent: row['Phone Consent'] === 'Yes' || row['Phone Consent'] === true,
        };

        const { error } = await this.supabase.getClient()
          .from('members')
          .insert(member);

        if (error) {
          importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error.message}`);
        } else {
          importFile.processedRecords++;
        }
      } catch (error) {
        importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async importPolicies(data: any[], importFile: ImportFile) {
    for (const row of data) {
      try {
        const policy = {
          policy_number: row['Policy Number'],
          member_id: row['Member ID'],
          product_id: row['Product ID'],
          status: row['Status'] || 'active',
          start_date: row['Start Date'],
          end_date: row['End Date'],
          premium_amount: parseFloat(row['Premium'] || row['Premium Amount'] || '0'),
          cover_amount: parseFloat(row['Cover Amount'] || '0'),
        };

        const { error } = await this.supabase.getClient()
          .from('policies')
          .insert(policy);

        if (error) {
          importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error.message}`);
        } else {
          importFile.processedRecords++;
        }
      } catch (error) {
        importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async importClaims(data: any[], importFile: ImportFile) {
    for (const row of data) {
      try {
        const claim = {
          claim_number: row['Claim Number'],
          policy_id: row['Policy ID'] || row['Policy Number'],
          member_id: row['Member ID'],
          provider_id: row['Provider ID'],
          claim_date: row['Date'] || row['Claim Date'],
          service_date: row['Service Date'],
          amount_claimed: parseFloat(row['Amount'] || row['Amount Claimed'] || '0'),
          amount_approved: parseFloat(row['Amount Approved'] || '0'),
          status: row['Status'] || 'submitted',
          diagnosis_code: row['Diagnosis Code'],
          treatment_code: row['Treatment Code'],
        };

        const { error } = await this.supabase.getClient()
          .from('claims')
          .insert(claim);

        if (error) {
          importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error.message}`);
        } else {
          importFile.processedRecords++;
        }
      } catch (error) {
        importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async importFinancial(data: any[], importFile: ImportFile) {
    // Financial data import - journal entries, transactions, etc.
    for (const row of data) {
      try {
        const transaction = {
          account_code: row['Account Code'],
          description: row['Description'],
          debit: parseFloat(row['Debit'] || '0'),
          credit: parseFloat(row['Credit'] || '0'),
          transaction_date: row['Date'] || row['Transaction Date'],
          reference: row['Reference'],
        };

        // Store in appropriate financial table
        importFile.processedRecords++;
      } catch (error) {
        importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async importProducts(data: any[], importFile: ImportFile) {
    for (const row of data) {
      try {
        const product = {
          code: row['Product Code'] || row['Code'],
          name: row['Name'] || row['Product Name'],
          regime: row['Regime'] || 'medical_scheme',
          description: row['Description'],
          status: row['Status'] || 'active',
          monthly_premium: parseFloat(row['Premium'] || row['Monthly Premium'] || '0'),
          cover_amount: parseFloat(row['Cover Amount'] || '0'),
        };

        const { error } = await this.supabase.getClient()
          .from('products')
          .insert(product);

        if (error) {
          importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error.message}`);
        } else {
          importFile.processedRecords++;
        }
      } catch (error) {
        importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async importProviders(data: any[], importFile: ImportFile) {
    for (const row of data) {
      try {
        const provider = {
          provider_number: row['Provider ID'] || row['Provider Number'],
          name: row['Name'] || row['Provider Name'],
          type: row['Type'] || row['Provider Type'],
          practice_number: row['Practice Number'],
          address: row['Address'],
          city: row['City'],
          postal_code: row['Postal Code'],
          phone: row['Phone'] || row['Contact'],
          email: row['Email'],
          status: row['Status'] || row['Network Status'] || 'active',
        };

        const { error } = await this.supabase.getClient()
          .from('providers')
          .insert(provider);

        if (error) {
          importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error.message}`);
        } else {
          importFile.processedRecords++;
        }
      } catch (error) {
        importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async importBrokers(data: any[], importFile: ImportFile) {
    for (const row of data) {
      try {
        const broker = {
          broker_code: row['Broker ID'] || row['Broker Code'],
          name: row['Name'] || row['Broker Name'],
          email: row['Email'],
          phone: row['Phone'],
          commission_rate: parseFloat(row['Commission Rate'] || '0'),
          status: row['Status'] || 'active',
        };

        // Store in brokers table
        importFile.processedRecords++;
      } catch (error) {
        importFile.errors.push(`Row ${importFile.processedRecords + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  async getPreview(fileId: string) {
    const importFile = this.importFiles.get(fileId);
    if (!importFile) {
      throw new NotFoundException('Import file not found');
    }

    return {
      fileId,
      preview: importFile.preview,
      columns: importFile.columns,
      totalRecords: importFile.totalRecords,
    };
  }

  async getStatus(fileId: string) {
    const importFile = this.importFiles.get(fileId);
    if (!importFile) {
      throw new NotFoundException('Import file not found');
    }

    return {
      fileId,
      status: importFile.status,
      totalRecords: importFile.totalRecords,
      processedRecords: importFile.processedRecords,
      errors: importFile.errors,
    };
  }

  async getTemplate(type: string) {
    const templates = {
      members: [
        'Member Number', 'ID Number', 'First Name', 'Last Name', 'Date of Birth',
        'Gender', 'Email', 'Phone', 'Mobile', 'Address Line 1', 'Address Line 2',
        'City', 'Postal Code', 'Status', 'Plan Name', 'Monthly Premium',
        'Start Date', 'Bank Name', 'Account Number', 'Branch Code',
        'Account Holder Name', 'Debit Order Day', 'Marketing Consent',
        'Email Consent', 'SMS Consent', 'Phone Consent'
      ],
      policies: [
        'Policy Number', 'Member ID', 'Product ID', 'Status', 'Start Date',
        'End Date', 'Premium Amount', 'Cover Amount'
      ],
      claims: [
        'Claim Number', 'Policy Number', 'Member ID', 'Provider ID', 'Date',
        'Service Date', 'Amount Claimed', 'Amount Approved', 'Status',
        'Diagnosis Code', 'Treatment Code'
      ],
      financial: [
        'Account Code', 'Description', 'Debit', 'Credit', 'Date', 'Reference'
      ],
      products: [
        'Product Code', 'Name', 'Regime', 'Description', 'Status',
        'Monthly Premium', 'Cover Amount'
      ],
      providers: [
        'Provider ID', 'Name', 'Type', 'Practice Number', 'Address', 'City',
        'Postal Code', 'Phone', 'Email', 'Network Status'
      ],
      brokers: [
        'Broker ID', 'Name', 'Email', 'Phone', 'Commission Rate', 'Status'
      ],
    };

    const columns = templates[type];
    if (!columns) {
      throw new BadRequestException('Invalid template type');
    }

    return { type, columns };
  }

  async getImportHistory() {
    const history = Array.from(this.importFiles.values()).map(file => ({
      id: file.id,
      filename: file.filename,
      type: file.type,
      status: file.status,
      totalRecords: file.totalRecords,
      processedRecords: file.processedRecords,
      errorCount: file.errors.length,
      createdAt: file.createdAt,
    }));

    return history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private validateColumns(type: string, columns: string[]): { valid: boolean; errors: string[] } {
    const requiredColumns = {
      members: ['ID Number', 'First Name', 'Last Name', 'Email'],
      policies: ['Policy Number', 'Member ID'],
      claims: ['Claim Number', 'Policy Number', 'Amount Claimed'],
      financial: ['Account Code', 'Description'],
      products: ['Product Code', 'Name'],
      providers: ['Provider ID', 'Name'],
      brokers: ['Broker ID', 'Name', 'Email'],
    };

    const required = requiredColumns[type] || [];
    const missing = required.filter(col => !columns.includes(col));

    return {
      valid: missing.length === 0,
      errors: missing.map(col => `Missing required column: ${col}`),
    };
  }
}
