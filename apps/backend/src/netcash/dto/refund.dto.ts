import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateRefundDto {
  @IsUUID()
  memberId: string;

  @IsUUID()
  @IsOptional()
  originalTransactionId?: string;

  @IsUUID()
  @IsOptional()
  originalRunId?: string;

  @IsNumber()
  @Min(0.01)
  refundAmount: number;

  @IsString()
  refundReason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ProcessRefundDto {
  @IsUUID()
  refundId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateRefundStatusDto {
  @IsString()
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsString()
  @IsOptional()
  netcashRefundReference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
