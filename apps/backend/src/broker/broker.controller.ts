import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  BrokerService,
  RegisterBrokerDto,
  CalculateCommissionDto,
  GenerateStatementDto,
} from './broker.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('api/v1/brokers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BrokerController {
  constructor(private brokerService: BrokerService) {}

  @Post('register')
  @RequirePermissions('brokers:write')
  async registerBroker(@Body() dto: RegisterBrokerDto, @Request() req: AuthRequest) {
    return this.brokerService.registerBroker(dto, req.user.userId);
  }

  @Get()
  @RequirePermissions('brokers:read')
  async getAllBrokers() {
    return this.brokerService.getAllBrokers();
  }

  @Get(':brokerId')
  @RequirePermissions('brokers:read')
  async getBrokerById(@Param('brokerId') brokerId: string) {
    return this.brokerService.getBrokerById(brokerId);
  }

  @Get(':brokerId/policies')
  @RequirePermissions('brokers:read')
  async getPoliciesByBroker(@Param('brokerId') brokerId: string) {
    return this.brokerService.getPoliciesByBroker(brokerId);
  }

  @Get(':brokerId/statistics')
  @RequirePermissions('brokers:read')
  async getBrokerStatistics(@Param('brokerId') brokerId: string) {
    return this.brokerService.getBrokerStatistics(brokerId);
  }

  @Post('commissions/calculate')
  @RequirePermissions('brokers:write')
  async calculateCommissions(@Body() dto: CalculateCommissionDto, @Request() req: AuthRequest) {
    return this.brokerService.calculateCommissions(dto, req.user.userId);
  }

  @Get(':brokerId/commissions')
  @RequirePermissions('brokers:read')
  async getCommissionsByBroker(
    @Param('brokerId') brokerId: string,
    @Query('status') status?: string,
  ) {
    return this.brokerService.getCommissionsByBroker(brokerId, status);
  }

  @Put('commissions/:commissionId/mark-paid')
  @RequirePermissions('brokers:write')
  async markCommissionAsPaid(
    @Param('commissionId') commissionId: string,
    @Request() req: AuthRequest,
  ) {
    return this.brokerService.markCommissionAsPaid(commissionId, req.user.userId);
  }

  @Post('statements/generate')
  @RequirePermissions('brokers:write')
  async generateCommissionStatement(
    @Body() dto: GenerateStatementDto,
    @Request() req: AuthRequest,
  ) {
    return this.brokerService.generateCommissionStatement(dto, req.user.userId);
  }

  @Get('statements/:statementId')
  @RequirePermissions('brokers:read')
  async getStatementById(@Param('statementId') statementId: string) {
    return this.brokerService.getStatementById(statementId);
  }

  @Get(':brokerId/statements')
  @RequirePermissions('brokers:read')
  async getStatementsByBroker(@Param('brokerId') brokerId: string) {
    return this.brokerService.getStatementsByBroker(brokerId);
  }
}
