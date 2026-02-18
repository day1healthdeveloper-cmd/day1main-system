import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { authenticator } from 'otplib'
import { toDataURL } from 'qrcode'
import { SupabaseService } from '../../supabase/supabase.service'

@Injectable()
export class MfaService {
  constructor(private supabase: SupabaseService) {}

  async setupTotp(userId: string, deviceName?: string) {
    // Generate secret
    const secret = authenticator.generateSecret()

    // Get user email for QR code
    const user = await this.supabase.getClient().from('users').select('*').eq({
      where: { id: userId },
    })

    if (!user) {
      throw new BadRequestException('User not found')
    }

    // Generate OTP auth URL
    const otpauthUrl = authenticator.keyuri(user.email, 'Day1Main', secret)

    // Generate QR code
    const qrCode = await toDataURL(otpauthUrl)

    // Create MFA device (unverified)
    const device = await this.supabase.getClient().mfaDevice.create({
      data: {
        user_id: userId,
        device_type: 'totp',
        device_name: deviceName || 'Authenticator App',
        secret,
        is_verified: false,
        is_active: false,
      },
    })

    return {
      device_id: device.id,
      secret,
      qr_code: qrCode,
      otpauth_url: otpauthUrl,
    }
  }

  async verifyTotpSetup(userId: string, deviceId: string, code: string) {
    // Get device
    const device = await this.supabase.getClient().mfaDevice.findFirst({
      where: {
        id: deviceId,
        user_id: userId,
        device_type: 'totp',
        is_verified: false,
      },
    })

    if (!device || !device.secret) {
      throw new BadRequestException('Invalid device or already verified')
    }

    // Verify code
    const isValid = authenticator.verify({
      token: code,
      secret: device.secret,
    })

    if (!isValid) {
      throw new BadRequestException('Invalid verification code')
    }

    // Mark device as verified and active
    await this.supabase.getClient().mfaDevice.update({
      where: { id: device.id },
      data: {
        is_verified: true,
        is_active: true,
        last_used_at: new Date(),
      },
    })

    // Log audit event
    await this.supabase.getClient().auditEvent.create({
      data: {
        event_type: 'mfa',
        entity_type: 'mfa_device',
        entity_id: device.id,
        user_id: userId,
        action: 'setup_verified',
        metadata: {
          device_type: 'totp',
        },
      },
    })

    return { message: 'MFA device verified successfully' }
  }

  async verifyTotp(userId: string, code: string) {
    // Get active TOTP device
    const device = await this.supabase.getClient().mfaDevice.findFirst({
      where: {
        user_id: userId,
        device_type: 'totp',
        is_verified: true,
        is_active: true,
      },
    })

    if (!device || !device.secret) {
      throw new UnauthorizedException('MFA device not found')
    }

    // Verify code
    const isValid = authenticator.verify({
      token: code,
      secret: device.secret,
    })

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code')
    }

    // Update last used
    await this.supabase.getClient().mfaDevice.update({
      where: { id: device.id },
      data: {
        last_used_at: new Date(),
      },
    })

    return true
  }

  async getUserMfaDevices(userId: string) {
    const devices = await this.supabase.getClient().mfaDevice.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      select: {
        id: true,
        device_type: true,
        device_name: true,
        is_verified: true,
        last_used_at: true,
        created_at: true,
      },
    })

    return devices
  }

  async removeMfaDevice(userId: string, deviceId: string) {
    // Verify device belongs to user
    const device = await this.supabase.getClient().mfaDevice.findFirst({
      where: {
        id: deviceId,
        user_id: userId,
      },
    })

    if (!device) {
      throw new BadRequestException('Device not found')
    }

    // Deactivate device
    await this.supabase.getClient().mfaDevice.update({
      where: { id: deviceId },
      data: {
        is_active: false,
      },
    })

    // Log audit event
    await this.supabase.getClient().auditEvent.create({
      data: {
        event_type: 'mfa',
        entity_type: 'mfa_device',
        entity_id: deviceId,
        user_id: userId,
        action: 'device_removed',
        metadata: {
          device_type: device.device_type,
        },
      },
    })

    return { message: 'MFA device removed successfully' }
  }

  async isMfaEnabled(userId: string): Promise<boolean> {
    const count = await this.supabase.getClient().mfaDevice.count({
      where: {
        user_id: userId,
        is_verified: true,
        is_active: true,
      },
    })

    return count > 0
  }
}
