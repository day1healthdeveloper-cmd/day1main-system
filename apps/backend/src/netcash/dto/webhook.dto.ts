import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class NetcashWebhookDto {
  @IsString()
  @IsOptional()
  transactionReference?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  memberReference?: string;

  @IsString()
  @IsOptional()
  batchReference?: string;

  @IsString()
  @IsOptional()
  netcashReference?: string;

  @IsString()
  @IsOptional()
  responseCode?: string;

  @IsString()
  @IsOptional()
  responseMessage?: string;

  @IsString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  signature?: string;
}

export class QueryWebhookLogsDto {
  @IsString()
  @IsOptional()
  transactionReference?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  processed?: boolean;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  offset?: number;
}
