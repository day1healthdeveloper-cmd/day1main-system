import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import {
  DataClassification,
  ProcessingPurpose,
  SPECIAL_PERSONAL_INFO_FIELDS,
  SPECIAL_INFO_PERMISSIONS,
} from './constants/data-classification.constants'

@Injectable()
export class PopiaService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
  ) {}

  /**
   * Check if a field contains special personal information (health data)
   */
  isSpecialPersonalInfo(entityType: string, fieldName: string): boolean {
    const fields = SPECIAL_PERSONAL_INFO_FIELDS[entityType as keyof typeof SPECIAL_PERSONAL_INFO_FIELDS]
    return fields ? fields.includes(fieldName) : false
  }

  /**
   * Get data classification for a field
   */
  getFieldClassification(entityType: string, fieldName: string): DataClassification {
    if (this.isSpecialPersonalInfo(entityType, fieldName)) {
      return DataClassification.SPECIAL_PERSONAL
    }

    // Personal identifiable information
    const personalFields = [
      'id_number',
      'email',
      'phone',
      'first_name',
      'last_name',
      'date_of_birth',
      'address',
      'bank_account',
    ]

    if (personalFields.includes(fieldName)) {
      return DataClassification.PERSONAL
    }

    return DataClassification.PUBLIC
  }

  /**
   * Validate that user has consent to process data for a specific purpose
   */
  async validateConsent(
    memberId: string,
    purpose: ProcessingPurpose,
    userId: string,
  ): Promise<boolean> {
    // Get active consent for the purpose
    const { data: consent } = await this.supabase.getClient()
      .from('member_consents')
      .select('*')
      .eq('member_id', memberId)
      .eq('purpose', purpose)
      .eq('is_granted', true)
      .is('revoked_at', null)
      .single();

    if (!consent) {
      // Log the consent violation
      await this.auditService.logEvent({
        event_type: 'popia',
        entity_type: 'member',
        entity_id: memberId,
        user_id: userId,
        action: 'consent_violation',
        metadata: {
          purpose,
          reason: 'No active consent found',
        },
      })

      return false
    }

    return true
  }

  /**
   * Validate that user has permission to access special personal information
   */
  async validateAccessPermission(
    userId: string,
    requiredPermission: string,
  ): Promise<boolean> {
    // Get user's permissions
    const { data: userRoles } = await this.supabase.getClient()
      .from('user_roles')
      .select(`
        role:roles(
          role_permissions(
            permission:permissions(name)
          )
        )
      `)
      .eq('user_id', userId);

    if (!userRoles) return false;

    const permissions = userRoles.flatMap((ur: any) =>
      (ur.role?.role_permissions || []).map((rp: any) => rp.permission?.name),
    ).filter(Boolean);

    return permissions.includes(requiredPermission);
  }

  /**
   * Log access to special personal information
   */
  async logSensitiveDataAccess(
    entityType: string,
    entityId: string,
    fieldNames: string[],
    userId: string,
    action: string,
    purpose?: ProcessingPurpose,
  ): Promise<void> {
    // Filter to only special personal info fields
    const sensitiveFields = fieldNames.filter((field) =>
      this.isSpecialPersonalInfo(entityType, field),
    )

    if (sensitiveFields.length === 0) {
      return
    }

    // Log audit event for sensitive data access
    await this.auditService.logEvent({
      event_type: 'popia',
      entity_type: entityType,
      entity_id: entityId,
      user_id: userId,
      action: `sensitive_data_${action}`,
      metadata: {
        fields_accessed: sensitiveFields,
        data_classification: DataClassification.SPECIAL_PERSONAL,
        purpose: purpose || 'not_specified',
        timestamp: new Date(),
      },
    })
  }

  /**
   * Validate data minimization - ensure only necessary fields are requested
   */
  validateDataMinimization(
    requestedFields: string[],
    necessaryFields: string[],
    purpose: ProcessingPurpose,
  ): { valid: boolean; unnecessaryFields: string[] } {
    const unnecessaryFields = requestedFields.filter(
      (field) => !necessaryFields.includes(field),
    )

    return {
      valid: unnecessaryFields.length === 0,
      unnecessaryFields,
    }
  }

  /**
   * Validate purpose limitation - ensure data is used only for stated purpose
   */
  async validatePurposeLimitation(
    memberId: string,
    consentPurpose: ProcessingPurpose,
    actualPurpose: ProcessingPurpose,
    userId: string,
  ): Promise<boolean> {
    if (consentPurpose !== actualPurpose) {
      // Log purpose violation
      await this.auditService.logEvent({
        event_type: 'popia',
        entity_type: 'member',
        entity_id: memberId,
        user_id: userId,
        action: 'purpose_violation',
        metadata: {
          consent_purpose: consentPurpose,
          actual_purpose: actualPurpose,
          reason: 'Purpose mismatch',
        },
      })

      return false
    }

    return true
  }

  /**
   * Check if user has least privilege access to health data
   */
  async enforceHealthDataAccess(
    userId: string,
    memberId: string,
    action: 'read' | 'write',
  ): Promise<void> {
    const requiredPermission =
      action === 'read'
        ? SPECIAL_INFO_PERMISSIONS.READ_HEALTH_DATA
        : SPECIAL_INFO_PERMISSIONS.WRITE_HEALTH_DATA

    const hasPermission = await this.validateAccessPermission(userId, requiredPermission)

    if (!hasPermission) {
      // Log unauthorized access attempt
      await this.auditService.logEvent({
        event_type: 'popia',
        entity_type: 'member',
        entity_id: memberId,
        user_id: userId,
        action: 'unauthorized_health_data_access',
        metadata: {
          required_permission: requiredPermission,
          action,
        },
      })

      throw new ForbiddenException(
        'Insufficient permissions to access health data. Least privilege principle violated.',
      )
    }

    // Log authorized access
    await this.logSensitiveDataAccess('member', memberId, ['health_data'], userId, action)
  }

  /**
   * Mask sensitive fields for users without proper permissions
   */
  maskSensitiveData<T extends Record<string, any>>(
    data: T,
    entityType: string,
    userPermissions: string[],
  ): T {
    const maskedData = { ...data } as any

    Object.keys(maskedData).forEach((key) => {
      if (this.isSpecialPersonalInfo(entityType, key)) {
        // Check if user has permission to view this field
        const hasPermission = userPermissions.includes(SPECIAL_INFO_PERMISSIONS.READ_HEALTH_DATA)

        if (!hasPermission) {
          maskedData[key] = '[REDACTED - INSUFFICIENT PERMISSIONS]'
        }
      }
    })

    return maskedData as T
  }

  /**
   * Get all fields that require encryption
   */
  getFieldsRequiringEncryption(entityType: string): string[] {
    return SPECIAL_PERSONAL_INFO_FIELDS[entityType as keyof typeof SPECIAL_PERSONAL_INFO_FIELDS] || []
  }

  /**
   * Validate that consent exists before processing health data
   */
  async enforceConsentBeforeProcessing(
    memberId: string,
    purpose: ProcessingPurpose,
    userId: string,
  ): Promise<void> {
    const hasConsent = await this.validateConsent(memberId, purpose, userId)

    if (!hasConsent) {
      throw new ForbiddenException(
        `No valid consent found for purpose: ${purpose}. Cannot process health data without consent.`,
      )
    }
  }

  /**
   * Get data processing report for a member (for POPIA access requests)
   */
  async getDataProcessingReport(memberId: string) {
    // Get all consents
    const { data: consents } = await this.supabase.getClient()
      .from('member_consents')
      .select('*')
      .eq('member_id', memberId)
      .order('granted_at', { ascending: false });

    // Get all audit events related to this member
    const { data: auditEvents } = await this.supabase.getClient()
      .from('audit_events')
      .select('*')
      .eq('entity_type', 'member')
      .eq('entity_id', memberId)
      .order('timestamp', { ascending: false })
      .limit(100);

    // Get sensitive data access events
    const sensitiveDataAccess = (auditEvents || []).filter(
      (event: any) => event.action?.includes('sensitive_data') || event.event_type === 'popia',
    );

    return {
      member_id: memberId,
      consents: (consents || []).map((c: any) => ({
        purpose: c.purpose,
        is_granted: c.is_granted,
        granted_at: c.granted_at,
        revoked_at: c.revoked_at,
      })),
      data_access_summary: {
        total_access_events: sensitiveDataAccess.length,
        recent_access: sensitiveDataAccess.slice(0, 10),
      },
      data_retention: {
        member_data_retention_days: 365 * 7,
        can_request_deletion: true,
      },
    }
  }

  /**
   * Anonymize member data (for data subject deletion requests)
   */
  async anonymizeMemberData(memberId: string, userId: string, reason: string) {
    // This is a placeholder - in production, implement proper anonymization
    // that maintains referential integrity while removing PII

    await this.auditService.logEvent({
      event_type: 'popia',
      entity_type: 'member',
      entity_id: memberId,
      user_id: userId,
      action: 'data_anonymization_requested',
      metadata: {
        reason,
        timestamp: new Date(),
      },
    })

    return {
      member_id: memberId,
      status: 'anonymization_requested',
      message:
        'Data anonymization request logged. Will be processed according to POPIA requirements.',
    }
  }
}
