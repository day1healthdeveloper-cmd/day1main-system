import { IsString, IsNumber, IsOptional, IsEnum, IsUUID } from 'class-validator';

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export class CreateTransactionDto {
  @IsUUID()
  runId: string;

  @IsUUID()
  @IsOptional()
  memberId?: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  transactionReference?: string;
}

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsString()
  @IsOptional()
  netcashStatus?: string;

  @IsString()
  @IsOptional()
  netcashResponse?: string;

  @IsString()
  @IsOptional()
  failureReason?: string;
}

export class QueryTransactionsDto {
  @IsUUID()
  @IsOptional()
  runId?: string;

  @IsUUID()
  @IsOptional()
  memberId?: string;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  offset?: number;
}
