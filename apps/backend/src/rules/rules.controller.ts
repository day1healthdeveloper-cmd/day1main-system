import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common'
import { RulesService } from './rules.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../rbac/guards/permissions.guard'
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator'
import { CreateRuleDto, EvaluateRuleDto, SimulateRuleDto } from './dto'

@Controller('api/v1/rules')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  /**
   * Create a new benefit rule
   * POST /api/v1/rules/benefits/:benefitId
   */
  @Post('benefits/:benefitId')
  @RequirePermissions('rule:create')
  async createRule(
    @Param('benefitId') benefitId: string,
    @Body() dto: CreateRuleDto,
    @Request() req: any,
  ) {
    return this.rulesService.createRule(benefitId, dto, req.user.userId)
  }

  /**
   * Evaluate a rule
   * POST /api/v1/rules/:ruleId/evaluate
   */
  @Post(':ruleId/evaluate')
  @RequirePermissions('rule:evaluate')
  async evaluateRule(
    @Param('ruleId') ruleId: string,
    @Body() dto: EvaluateRuleDto,
  ) {
    return this.rulesService.evaluateRule(ruleId, dto)
  }

  /**
   * Get active rules for a benefit
   * GET /api/v1/rules/benefits/:benefitId/active
   */
  @Get('benefits/:benefitId/active')
  @RequirePermissions('rule:read')
  async getActiveBenefitRules(@Param('benefitId') benefitId: string) {
    return this.rulesService.getActiveBenefitRules(benefitId)
  }

  /**
   * Get rule version history
   * GET /api/v1/rules/benefits/:benefitId/history/:ruleName
   */
  @Get('benefits/:benefitId/history/:ruleName')
  @RequirePermissions('rule:read')
  async getRuleVersionHistory(
    @Param('benefitId') benefitId: string,
    @Param('ruleName') ruleName: string,
  ) {
    return this.rulesService.getRuleVersionHistory(benefitId, ruleName)
  }
}
