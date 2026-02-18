import { AuditService } from '../audit.service'

/**
 * Helper functions for common audit operations
 */
export class AuditHelper {
  /**
   * Log a claim decision
   */
  static async logClaimDecision(
    auditService: AuditService,
    claimId: string,
    userId: string,
    decision: string,
    beforeState: any,
    afterState: any,
    metadata?: Record<string, any>,
  ) {
    return auditService.logEvent({
      event_type: 'claim',
      entity_type: 'claim',
      entity_id: claimId,
      user_id: userId,
      action: `claim_${decision}`,
      before_state: beforeState,
      after_state: afterState,
      metadata: {
        decision,
        ...metadata,
      },
    })
  }

  /**
   * Log a benefit rule change
   */
  static async logBenefitRuleChange(
    auditService: AuditService,
    ruleId: string,
    userId: string,
    action: string,
    beforeState: any,
    afterState: any,
  ) {
    return auditService.logEvent({
      event_type: 'benefit_rule',
      entity_type: 'benefit_rule',
      entity_id: ruleId,
      user_id: userId,
      action,
      before_state: beforeState,
      after_state: afterState,
      metadata: {
        rule_type: 'benefit',
      },
    })
  }

  /**
   * Log a product approval
   */
  static async logProductApproval(
    auditService: AuditService,
    productId: string,
    userId: string,
    approvalType: string,
    metadata?: Record<string, any>,
  ) {
    return auditService.logEvent({
      event_type: 'product',
      entity_type: 'product',
      entity_id: productId,
      user_id: userId,
      action: 'product_approved',
      metadata: {
        approval_type: approvalType,
        ...metadata,
      },
    })
  }

  /**
   * Log a payment transaction
   */
  static async logPayment(
    auditService: AuditService,
    paymentId: string,
    userId: string,
    action: string,
    amount: number,
    metadata?: Record<string, any>,
  ) {
    return auditService.logEvent({
      event_type: 'payment',
      entity_type: 'payment',
      entity_id: paymentId,
      user_id: userId,
      action,
      metadata: {
        amount,
        ...metadata,
      },
    })
  }

  /**
   * Log a member status change
   */
  static async logMemberStatusChange(
    auditService: AuditService,
    memberId: string,
    userId: string,
    beforeStatus: string,
    afterStatus: string,
    reason?: string,
  ) {
    return auditService.logEvent({
      event_type: 'member',
      entity_type: 'member',
      entity_id: memberId,
      user_id: userId,
      action: 'status_changed',
      before_state: { status: beforeStatus },
      after_state: { status: afterStatus },
      metadata: {
        reason,
      },
    })
  }

  /**
   * Log a refund decision
   */
  static async logRefund(
    auditService: AuditService,
    refundId: string,
    userId: string,
    action: string,
    amount: number,
    reason: string,
  ) {
    return auditService.logEvent({
      event_type: 'refund',
      entity_type: 'refund',
      entity_id: refundId,
      user_id: userId,
      action,
      metadata: {
        amount,
        reason,
      },
    })
  }

  /**
   * Log a commission calculation
   */
  static async logCommissionCalculation(
    auditService: AuditService,
    commissionId: string,
    userId: string,
    brokerId: string,
    amount: number,
    calculationDetails: Record<string, any>,
  ) {
    return auditService.logEvent({
      event_type: 'commission',
      entity_type: 'commission',
      entity_id: commissionId,
      user_id: userId,
      action: 'commission_calculated',
      metadata: {
        broker_id: brokerId,
        amount,
        calculation: calculationDetails,
      },
    })
  }

  /**
   * Log a POPIA data subject request
   */
  static async logDataSubjectRequest(
    auditService: AuditService,
    requestId: string,
    userId: string,
    requestType: string,
    memberId: string,
  ) {
    return auditService.logEvent({
      event_type: 'popia',
      entity_type: 'data_subject_request',
      entity_id: requestId,
      user_id: userId,
      action: `dsr_${requestType}`,
      metadata: {
        request_type: requestType,
        member_id: memberId,
      },
    })
  }
}
