import { IsString, IsOptional } from 'class-validator'

export class RequestApprovalDto {
  @IsOptional()
  @IsString()
  comments?: string
}

export class ApproveProductDto {
  @IsString()
  comments?: string
}

export class RejectProductDto {
  @IsString()
  reason: string
}
