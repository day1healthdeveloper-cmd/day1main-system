import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { AuditService } from '../audit/audit.service'
import { CreateRuleDto, EvaluateRuleDto, SimulateRuleDto } from './dto'

export interface RuleContext {
  policy?: any
  member?: any
  claim?: any
  benefit?: any
  provider?: any
  [key: string]: any
}

export interface RuleEvaluationResult {
  rule_id: string
  rule_name: string
  rule_version: string
  passed: boolean
  result: any
  explanation: string
  execution_time_ms: number
  context_used: string[]
  timestamp: Date
}

@Injectable()
export class RulesService {
  constructor(
    private supabaseService: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient()
  }

  /**
   * Create a new benefit rule
   * Rules are versioned and have effective dates
   */
  async createRule(benefitId: string, dto: CreateRuleDto, userId: string) {
    const { data: benefit, error } = await this.supabase
      .from('plan_benefits')
      .select('*')
      .eq('id', benefitId)
      .single()

    if (error || !benefit) {
      throw new NotFoundException('Benefit not found')
    }

    // Validate rule definition
    this.validateRuleDefinition(dto.rule_definition)

    // Create rule
    const { data: rule, error: ruleError } = await this.supabase
      .from('benefit_rules')
      .insert({
        benefit_id: benefitId,
        rule_name: dto.rule_name,
        rule_type: dto.rule_type,
        rule_definition: dto.rule_definition,
        version: dto.version,
        effective_date: new Date(dto.effective_date).toISOString(),
        end_date: dto.end_date ? new Date(dto.end_date).toISOString() : null,
        created_by: userId,
      })
      .select()
      .single()

    if (ruleError) {
      throw new BadRequestException('Failed to create rule')
    }

    // Log audit event
    await this.auditService.logEvent({
      event_type: 'rule',
      entity_type: 'benefit_rule',
      entity_id: rule.id,
      user_id: userId,
      action: 'created',
      metadata: {
        benefit_id: benefitId,
        rule_name: dto.rule_name,
        rule_type: dto.rule_type,
        version: dto.version,
      },
    })

    return rule
  }

  /**
   * Evaluate a rule against provided context
   */
  async evaluateRule(ruleId: string, dto: EvaluateRuleDto): Promise<RuleEvaluationResult> {
    const startTime = Date.now()

    const { data: rule, error } = await this.supabase
      .from('benefit_rules')
      .select('*')
      .eq('id', ruleId)
      .single()

    if (error || !rule) {
      throw new NotFoundException('Rule not found')
    }

    // Check if rule is active
    const now = new Date()
    if (new Date(rule.effective_date) > now || (rule.end_date && new Date(rule.end_date) < now)) {
      throw new BadRequestException('Rule is not currently active')
    }

    try {
      // Execute rule
      const result = await this.executeRule(rule.rule_definition, dto.context)
      const executionTime = Date.now() - startTime

      const evaluationResult: RuleEvaluationResult = {
        rule_id: rule.id,
        rule_name: rule.rule_name,
        rule_version: rule.version,
        passed: result.passed,
        result: result.value,
        explanation: result.explanation,
        execution_time_ms: executionTime,
        context_used: Object.keys(dto.context),
        timestamp: new Date(),
      }

      // Log evaluation
      await this.auditService.logEvent({
        event_type: 'rule',
        entity_type: 'rule_evaluation',
        entity_id: ruleId,
        user_id: 'system',
        action: 'evaluated',
        metadata: {
          rule_name: rule.rule_name,
          passed: result.passed,
          execution_time_ms: executionTime,
          context_keys: Object.keys(dto.context),
        },
      })

      return evaluationResult
    } catch (error: any) {
      const executionTime = Date.now() - startTime

      // Log error
      await this.auditService.logEvent({
        event_type: 'rule',
        entity_type: 'rule_evaluation',
        entity_id: ruleId,
        user_id: 'system',
        action: 'evaluation_failed',
        metadata: {
          rule_name: rule.rule_name,
          error: error.message,
          execution_time_ms: executionTime,
        },
      })

      throw new BadRequestException(`Rule evaluation failed: ${error.message}`)
    }
  }

  /**
   * Get active rules for a benefit
   */
  async getActiveBenefitRules(benefitId: string) {
    const now = new Date().toISOString()

    const { data: rules } = await this.supabase
      .from('benefit_rules')
      .select('*')
      .eq('benefit_id', benefitId)
      .lte('effective_date', now)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('effective_date', { ascending: false })

    return rules || []
  }

  /**
   * Get rule version history
   */
  async getRuleVersionHistory(benefitId: string, ruleName: string) {
    const { data: rules } = await this.supabase
      .from('benefit_rules')
      .select('*')
      .eq('benefit_id', benefitId)
      .eq('rule_name', ruleName)
      .order('effective_date', { ascending: false })

    return rules || []
  }

  /**
   * Validate rule definition structure
   */
  private validateRuleDefinition(ruleDefinition: any) {
    if (!ruleDefinition || typeof ruleDefinition !== 'object') {
      throw new BadRequestException('Rule definition must be a valid object')
    }

    // Basic validation - rules should have conditions and actions
    if (!ruleDefinition.conditions && !ruleDefinition.expression) {
      throw new BadRequestException('Rule must have either conditions or expression')
    }

    if (!ruleDefinition.actions && !ruleDefinition.result) {
      throw new BadRequestException('Rule must have either actions or result definition')
    }
  }

  /**
   * Execute rule logic
   */
  private async executeRule(ruleDefinition: any, context: RuleContext): Promise<any> {
    // This is a simplified rule engine
    // In production, you might use a more sophisticated rule engine like json-rules-engine
    
    try {
      if (ruleDefinition.expression) {
        // Simple expression evaluation
        return this.evaluateExpression(ruleDefinition.expression, context)
      }

      if (ruleDefinition.conditions) {
        // Condition-based evaluation
        return this.evaluateConditions(ruleDefinition.conditions, ruleDefinition.actions, context)
      }

      throw new Error('Invalid rule definition')
    } catch (error: any) {
      throw new Error(`Rule execution failed: ${error.message}`)
    }
  }

  /**
   * Evaluate simple expressions
   */
  private evaluateExpression(expression: string, context: RuleContext): any {
    // Simple expression evaluator - replace with proper parser in production
    let result = expression

    // Replace context variables
    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g')
      result = result.replace(regex, String(value))
    }

    // Basic arithmetic and comparison operations
    try {
      // This is unsafe - use a proper expression parser in production
      const passed = eval(result)
      return {
        passed: Boolean(passed),
        value: passed,
        explanation: `Expression "${expression}" evaluated to ${passed}`,
      }
    } catch (error: any) {
      throw new Error(`Expression evaluation failed: ${error.message}`)
    }
  }

  /**
   * Evaluate condition-based rules
   */
  private evaluateConditions(conditions: any[], actions: any[], context: RuleContext): any {
    let allConditionsMet = true
    const explanations: string[] = []

    for (const condition of conditions) {
      const conditionMet = this.evaluateCondition(condition, context)
      explanations.push(`Condition "${condition.description || condition.field}": ${conditionMet ? 'PASS' : 'FAIL'}`)
      
      if (!conditionMet) {
        allConditionsMet = false
        if (condition.required !== false) {
          break // Stop on first failed required condition
        }
      }
    }

    let result = null
    if (allConditionsMet && actions) {
      result = this.executeActions(actions, context)
    }

    return {
      passed: allConditionsMet,
      value: result,
      explanation: explanations.join('; '),
    }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: any, context: RuleContext): boolean {
    const { field, operator, value } = condition
    const contextValue = this.getNestedValue(context, field)

    switch (operator) {
      case 'equals':
        return contextValue === value
      case 'not_equals':
        return contextValue !== value
      case 'greater_than':
        return Number(contextValue) > Number(value)
      case 'less_than':
        return Number(contextValue) < Number(value)
      case 'greater_than_or_equal':
        return Number(contextValue) >= Number(value)
      case 'less_than_or_equal':
        return Number(contextValue) <= Number(value)
      case 'contains':
        return String(contextValue).includes(String(value))
      case 'in':
        return Array.isArray(value) && value.includes(contextValue)
      case 'exists':
        return contextValue !== undefined && contextValue !== null
      default:
        throw new Error(`Unknown operator: ${operator}`)
    }
  }

  /**
   * Execute actions when conditions are met
   */
  private executeActions(actions: any[], context: RuleContext): any {
    const results = []

    for (const action of actions) {
      switch (action.type) {
        case 'set_value':
          results.push({ [action.field]: action.value })
          break
        case 'calculate':
          const calculated = this.calculateValue(action.expression, context)
          results.push({ [action.field]: calculated })
          break
        case 'return':
          return action.value
        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }
    }

    return results.length === 1 ? results[0] : results
  }

  /**
   * Calculate values using expressions
   */
  private calculateValue(expression: string, context: RuleContext): number {
    // Simple calculator - replace with proper math parser in production
    let result = expression

    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g')
      result = result.replace(regex, String(value))
    }

    try {
      return eval(result)
    } catch (error: any) {
      throw new Error(`Calculation failed: ${error.message}`)
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
}