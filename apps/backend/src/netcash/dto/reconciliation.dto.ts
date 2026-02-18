import { IsUUID, IsString, IsOptional, IsNumber, IsDate, IsBoolean, IsEnum } from 'class-validator';

export enum ReconciliationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
  FAILED = 'failed',
}

export class CreateReconciliationDto {
  @IsString()
  reconciliationDate: string;

  @IsNumber()
  totalExpected: number;

  @IsNumber()
  totalReceived: number;
}

export class QueryReconciliationsDto {
  @IsEnum(ReconciliationStatus)
  @IsOptional()
  status?: ReconciliationStatus;

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

export class ResolveDiscrepancyDto {
  @IsUUID()
  discrepancyId: string;

  @IsString()
  resolution: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class QueryDiscrepanciesDto {
  @IsUUID()
  @IsOptional()
  reconciliationId?: string;

  @IsUUID()
  @IsOptional()
  memberId?: string;

  @IsBoolean()
  @IsOptional()
  resolved?: boolean;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  offset?: number;
}
