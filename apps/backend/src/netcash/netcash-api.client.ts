import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';

@Injectable()
export class NetcashApiClient {
  private readonly logger = new Logger(NetcashApiClient.name);
  private readonly apiUrl = 'https://ws.netcash.co.za/NIWS/niws_nif.svc';
  private readonly serviceKey = process.env.NETCASH_SERVICE_KEY || '657eb988-5345-45f7-a5e5-07a1a586155f';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Upload debit order batch file to Netcash using SOAP/WCF service
   * @param filePath Path to the batch file
   * @param batchName Name of the batch
   * @returns Upload response from Netcash
   */
  async uploadBatch(filePath: string, batchName: string): Promise<any> {
    try {
      this.logger.log(`Uploading batch: ${batchName}`);
      this.logger.log(`File path: ${filePath}`);

      // Verify file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Batch file not found: ${filePath}`);
      }

      // Read file content as plain text (NOT base64 as per Netcash support)
      const fileContent = fs.readFileSync(filePath, 'utf8');

      // Create SOAP envelope for BatchFileUpload
      const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <BatchFileUpload xmlns="http://tempuri.org/">
      <ServiceKey>${this.serviceKey}</ServiceKey>
      <File>${fileContent}</File>
    </BatchFileUpload>
  </soap:Body>
</soap:Envelope>`;

      this.logger.log(`Uploading to: ${this.apiUrl}`);
      this.logger.log(`Service Key: ${this.serviceKey?.substring(0, 8)}...`);

      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, soapEnvelope, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/INIWS_NIF/BatchFileUpload',
          },
          timeout: 60000, // 60 second timeout for file upload
        })
      );

      this.logger.log(`Upload response status: ${response.status}`);
      this.logger.log(`Upload response data:`, response.data);

      // Parse SOAP response
      const result = this.parseSoapResponse(response.data, 'BatchFileUploadResult');

      // Check if result is a success code (200 = success)
      const resultCode = typeof result === 'object' && result.raw ? result.raw : result;
      const isSuccess = resultCode === '200' || resultCode === 200;

      return {
        success: isSuccess,
        status: response.status,
        data: result,
        batchName,
        resultCode,
        message: isSuccess ? 'Batch uploaded successfully' : `Upload failed with code: ${resultCode}`,
      };
    } catch (error: any) {
      this.logger.error(`Error uploading batch to Netcash:`, error);
      
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data:`, error.response.data);
        
        // Try to parse error from SOAP response
        const errorMessage = this.parseErrorFromSoap(error.response.data);
        
        return {
          success: false,
          error: errorMessage || error.response.data,
          status: error.response.status,
          message: errorMessage || error.message,
        };
      }

      return {
        success: false,
        error: error.message,
        message: 'Failed to upload batch to Netcash',
      };
    }
  }

  /**
   * Get batch status from Netcash using SOAP/WCF service
   * @param serviceKey The service key (retrieves last 10 batches)
   */
  async getBatchStatus(serviceKey?: string): Promise<any> {
    try {
      const key = serviceKey || this.serviceKey;
      this.logger.log(`Getting batch status with service key: ${key?.substring(0, 8)}...`);

      // Create SOAP envelope for RetrieveBatchStatus
      const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <RetrieveBatchStatus xmlns="http://tempuri.org/">
      <ServiceKey>${key}</ServiceKey>
    </RetrieveBatchStatus>
  </soap:Body>
</soap:Envelope>`;

      const statusUrl = 'https://ws.netcash.co.za/NIWS/NIWS_NIF.svc';
      
      const response = await firstValueFrom(
        this.httpService.post(statusUrl, soapEnvelope, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/INIWS_NIF/RetrieveBatchStatus',
          },
          timeout: 30000,
        })
      );

      this.logger.log(`Status response:`, response.data);

      // Parse SOAP response
      const result = this.parseSoapResponse(response.data, 'RetrieveBatchStatusResult');

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error(`Error getting batch status:`, error);
      
      if (error.response) {
        const errorMessage = this.parseErrorFromSoap(error.response.data);
        return {
          success: false,
          error: errorMessage || error.message,
        };
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Parse SOAP XML response
   */
  private parseSoapResponse(xmlData: string, resultTag: string): any {
    try {
      // Simple XML parsing - extract result content
      const regex = new RegExp(`<${resultTag}[^>]*>([\\s\\S]*?)<\/${resultTag}>`, 'i');
      const match = xmlData.match(regex);
      
      if (match && match[1]) {
        const content = match[1];
        
        // Try to parse as JSON if it looks like JSON
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
          try {
            return JSON.parse(content);
          } catch (e) {
            // Not JSON, return as string
            return { raw: content };
          }
        }
        
        // Parse XML tags into object
        const result: any = {};
        const tagRegex = /<(\w+)>([^<]*)<\/\1>/g;
        let tagMatch;
        
        while ((tagMatch = tagRegex.exec(content)) !== null) {
          result[tagMatch[1]] = tagMatch[2];
        }
        
        return Object.keys(result).length > 0 ? result : { raw: content };
      }
      
      return { raw: xmlData };
    } catch (error: any) {
      this.logger.error('Error parsing SOAP response:', error);
      return { raw: xmlData };
    }
  }

  /**
   * Parse error message from SOAP fault
   */
  private parseErrorFromSoap(xmlData: string): string | null {
    try {
      // Look for fault string
      const faultMatch = xmlData.match(/<faultstring>([^<]*)<\/faultstring>/i);
      if (faultMatch) {
        return faultMatch[1];
      }
      
      // Look for error code
      const codeMatch = xmlData.match(/<Code>(\d+)<\/Code>/i);
      const messageMatch = xmlData.match(/<Message>([^<]*)<\/Message>/i);
      
      if (codeMatch && messageMatch) {
        return `Error ${codeMatch[1]}: ${messageMatch[1]}`;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<any> {
    try {
      this.logger.log('Testing Netcash SOAP API connection...');
      this.logger.log(`API URL: ${this.apiUrl}`);
      this.logger.log(`Service Key: ${this.serviceKey?.substring(0, 8)}...`);

      // Test by retrieving batch status (returns last 10 batches)
      const result = await this.getBatchStatus();
      
      return {
        success: result.success,
        message: result.success ? 'Netcash API connection successful' : 'Connection test failed',
        apiUrl: this.apiUrl,
        data: result.data,
      };
    } catch (error: any) {
      this.logger.error('API connection test failed:', error);
      
      return {
        success: false,
        message: 'Failed to connect to Netcash API',
        error: error.message,
        apiUrl: this.apiUrl,
      };
    }
  }

  /**
   * Process refund via Netcash API
   * Note: This is a placeholder implementation - actual Netcash refund API needs to be confirmed
   */
  async processRefund(params: {
    refundAmount: number;
    originalReference?: string;
    reason: string;
  }): Promise<any> {
    try {
      this.logger.log(`Processing refund: R${params.refundAmount}`);

      // TODO: Implement actual Netcash refund SOAP method when available
      // This is a placeholder that simulates the API call
      
      // Create SOAP envelope for refund (example structure)
      const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <ProcessRefund xmlns="http://tempuri.org/">
      <ServiceKey>${this.serviceKey}</ServiceKey>
      <OriginalReference>${params.originalReference || ''}</OriginalReference>
      <RefundAmount>${Math.round(params.refundAmount * 100)}</RefundAmount>
      <Reason>${params.reason}</Reason>
    </ProcessRefund>
  </soap:Body>
</soap:Envelope>`;

      // For now, return a simulated success response
      // In production, this would make the actual SOAP call
      this.logger.warn('Refund processing is simulated - actual Netcash refund API not yet implemented');

      return {
        success: true,
        refundReference: `REF-${Date.now()}`,
        message: 'Refund processed successfully (simulated)',
        amount: params.refundAmount,
      };

      /* Uncomment when actual Netcash refund API is available:
      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, soapEnvelope, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/INIWS_NIF/ProcessRefund',
          },
          timeout: 30000,
        })
      );

      const result = this.parseSoapResponse(response.data, 'ProcessRefundResult');

      return {
        success: true,
        refundReference: result.RefundReference,
        data: result,
      };
      */
    } catch (error: any) {
      this.logger.error('Error processing refund:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to process refund',
      };
    }
  }

  /**
   * Validate batch file format
   */
  validateBatchFile(filePath: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      if (!fs.existsSync(filePath)) {
        errors.push('File does not exist');
        return { valid: false, errors };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      // Check header
      if (!lines[0] || !lines[0].startsWith('H')) {
        errors.push('Missing or invalid header record');
      }

      // Check key record
      if (!lines[1] || !lines[1].startsWith('K')) {
        errors.push('Missing or invalid key record');
      }

      // Check footer
      const lastLine = lines[lines.length - 1];
      if (!lastLine || !lastLine.startsWith('F')) {
        errors.push('Missing or invalid footer record');
      }

      // Check for transaction records
      const transactionCount = lines.filter(line => line.startsWith('T')).length;
      if (transactionCount === 0) {
        errors.push('No transaction records found');
      }

      this.logger.log(`Batch validation: ${errors.length === 0 ? 'PASSED' : 'FAILED'}`);
      if (errors.length > 0) {
        this.logger.warn(`Validation errors:`, errors);
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error: any) {
      errors.push(`Validation error: ${error.message}`);
      return { valid: false, errors };
    }
  }
}
