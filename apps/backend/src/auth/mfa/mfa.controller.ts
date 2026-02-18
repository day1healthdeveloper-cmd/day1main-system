import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { MfaService } from './mfa.service'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'
import { SetupTotpDto, VerifyTotpSetupDto, VerifyTotpDto } from './dto'

@Controller('auth/mfa')
@UseGuards(JwtAuthGuard)
export class MfaController {
  constructor(private mfaService: MfaService) {}

  @Post('totp/setup')
  async setupTotp(@CurrentUser() user: any, @Body() dto: SetupTotpDto) {
    return this.mfaService.setupTotp(user.id, dto.device_name)
  }

  @Post('totp/verify-setup')
  async verifyTotpSetup(@CurrentUser() user: any, @Body() dto: VerifyTotpSetupDto) {
    return this.mfaService.verifyTotpSetup(user.id, dto.device_id, dto.code)
  }

  @Post('totp/verify')
  async verifyTotp(@CurrentUser() user: any, @Body() dto: VerifyTotpDto) {
    const isValid = await this.mfaService.verifyTotp(user.id, dto.code)
    return { valid: isValid }
  }

  @Get('devices')
  async getDevices(@CurrentUser() user: any) {
    return this.mfaService.getUserMfaDevices(user.id)
  }

  @Delete('devices/:deviceId')
  async removeDevice(@CurrentUser() user: any, @Param('deviceId') deviceId: string) {
    return this.mfaService.removeMfaDevice(user.id, deviceId)
  }
}
