import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { AuditService } from '../audit.service'

/**
 * Audit Interceptor
 * Automatically logs HTTP requests to the audit trail
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const method = request.method
    const url = request.url
    const ip = request.ip
    const userAgent = request.headers['user-agent']

    // Skip audit logging for GET requests (read operations)
    // Only log mutations (POST, PUT, PATCH, DELETE)
    if (method === 'GET') {
      return next.handle()
    }

    // Skip audit logging if no user (unauthenticated requests)
    if (!user) {
      return next.handle()
    }

    const startTime = Date.now()

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime

          // Log successful request
          this.auditService
            .logEvent({
              event_type: 'http_request',
              entity_type: 'api',
              entity_id: url,
              user_id: user.id,
              action: method.toLowerCase(),
              metadata: {
                url,
                method,
                duration_ms: duration,
                status: 'success',
              },
              ip_address: ip,
              user_agent: userAgent,
            })
            .catch((error) => {
              console.error('Failed to log audit event:', error)
            })
        },
        error: (error) => {
          const duration = Date.now() - startTime

          // Log failed request
          this.auditService
            .logEvent({
              event_type: 'http_request',
              entity_type: 'api',
              entity_id: url,
              user_id: user.id,
              action: method.toLowerCase(),
              metadata: {
                url,
                method,
                duration_ms: duration,
                status: 'error',
                error_message: error.message,
                error_code: error.status,
              },
              ip_address: ip,
              user_agent: userAgent,
            })
            .catch((logError) => {
              console.error('Failed to log audit event:', logError)
            })
        },
      }),
    )
  }
}
