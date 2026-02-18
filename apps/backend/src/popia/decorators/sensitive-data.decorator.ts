import { SetMetadata } from '@nestjs/common'
import { ProcessingPurpose as ProcessingPurposeType } from '../constants/data-classification.constants'

export const SENSITIVE_DATA_KEY = 'sensitive_data'
export const PROCESSING_PURPOSE_KEY = 'processing_purpose'

export interface SensitiveDataMetadata {
  entityType: string
  requiresConsent: boolean
  purpose?: ProcessingPurposeType
}

/**
 * Decorator to mark endpoints that access sensitive personal information
 * This will trigger automatic audit logging and consent validation
 */
export const SensitiveData = (metadata: SensitiveDataMetadata) =>
  SetMetadata(SENSITIVE_DATA_KEY, metadata)

/**
 * Decorator to specify the processing purpose for an endpoint
 */
export const ProcessingPurposeDecorator = (purpose: ProcessingPurposeType) =>
  SetMetadata(PROCESSING_PURPOSE_KEY, purpose)
