import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PopiaService } from '../popia.service'
import {
  SENSITIVE_DATA_KEY,
  PROCESSING_PURPOSE_KEY,
  SensitiveDataMetadata,
} from '../decorators/sensitive-data.decorator'
import { ProcessingPurpose } from '../constants/data-classification.constants'

@Injectable()
export class PopiaGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private popiaService: PopiaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const sensitiveDataMetadata = this.reflector.get<SensitiveDataMetadata>(
      SENSITIVE_DATA_KEY,
      context.getHandler(),
    )

    const processingPurpose = this.reflector.get<ProcessingPurpose>(
      PROCESSING_PURPOSE_KEY,
      context.getHandler(),
    )

    // If no sensitive data metadata, allow access
    if (!sensitiveDataMetadata) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user
    const memberId = request.params.memberId || request.body.member_id

    if (!user) {
      throw new ForbiddenException('User not authenticated')
    }

    // If consent is required, validate it
    if (sensitiveDataMetadata.requiresConsent && memberId) {
      const purpose = processingPurpose || sensitiveDataMetadata.purpose

      if (!purpose) {
        throw new ForbiddenException('Processing purpose not specified for sensitive data access')
      }

      const hasConsent = await this.popiaService.validateConsent(memberId, purpose, user.userId)

      if (!hasConsent) {
        throw new ForbiddenException(
          `No valid consent found for purpose: ${purpose}. Cannot access sensitive data.`,
        )
      }
    }

    // Log the access attempt
    if (memberId) {
      await this.popiaService.logSensitiveDataAccess(
        sensitiveDataMetadata.entityType,
        memberId,
        ['sensitive_data_access'],
        user.userId,
        'access',
        processingPurpose,
      )
    }

    return true
  }
}
