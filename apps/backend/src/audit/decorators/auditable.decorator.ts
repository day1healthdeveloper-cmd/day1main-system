import { SetMetadata } from '@nestjs/common'

export const AUDITABLE_KEY = 'auditable'

export interface AuditableOptions {
  eventType: string
  entityType: string
  action: string
}

/**
 * Decorator to mark a method as auditable
 * Use this to automatically log specific operations
 */
export const Auditable = (options: AuditableOptions) =>
  SetMetadata(AUDITABLE_KEY, options)
