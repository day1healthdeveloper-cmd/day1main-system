import { IsUUID, IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';

export enum FailedPaymentAction {
  RETRY = 'retry',
  SUSPEND = 'suspend',
  ESCALATE = 'escalate',
  NOTIFY = 'notify',
}

export class QueryFailedPaymentsDto {
  @IsUUID()
  @IsOptional()
  memberId?: string;

  @IsString()
  @IsOptional()
  brokerGroup?: string;

  @IsNumber()
  @IsOptional()
  minRetries?: number;

  @IsBoolean()
  @IsOptional()
  escalated?: boolean;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  offset?: number;
}

export class RetryFailedPaymentDto {
  @IsUUID()
  transactionId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class SuspendMemberDto {
  @IsUUID()
  memberId: string;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class EscalateFailedPaymentDto {
  @IsUUID()
  transactionId: string;

  @IsString()
  escalationReason: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;
}

export class NotifyMemberDto {
  @IsUUID()
  memberId: string;

  @IsString()
  notificationType: 'email' | 'sms' | 'both';

  @IsString()
  message: string;
}
