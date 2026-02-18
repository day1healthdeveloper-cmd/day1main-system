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
    const { data: user, error } = await this.supabase.getClient()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new BadRequestException('User not found')
    }

    // Generate OTP auth URL
    const otpauthUrl = authenticator.keyuri(user.email, 'Day1Main', secret)

    // Generate QR code
    const qrCode = await toDataURL(otpauthUrl)

    // Create MFA device (unverified)
    const { data: device, error: deviceError } = await this.supabase.getClient()
      .from('mfa_devices')
      .insert({
        user_id: userId,
        device_type: 'totp',
        device_name: deviceName || 'Authenticator App',
        secret,
        is_verified: false,
        is_active: false,
      })
      .select()
      .single();

    if (deviceError) {
      throw new BadRequestException('Failed to create MFA device')
    }

    return {
      device_id: device.id,
      secret,
      qr_code: qrCode,
      otpauth_url: otpauthUrl,
    }
  }

  async verifyTotpSetup(userId: string, deviceId: string, code: string) {
    // Get device
    const { data: device, error } = await this.supabase.getClient()
      .from('mfa_devices')
      .select('*')
      .eq('id', deviceId)
      .eq('user_id', userId)
      .eq('device_type', 'totp')
      .eq('is_verified', false)
      .single();

    if (error || !device || !device.secret) {
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
    await this.supabase.getClient()
      .from('mfa_devices')
      .update({
        is_verified: true,
        is_active: true,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', device.id);

    // Log audit event
    await this.supabase.getClient()
      .from('audit_events')
      .insert({
        event_type: 'mfa',
        entity_type: 'mfa_device',
        entity_id: device.id,
        user_id: userId,
        action: 'setup_verified',
        metadata: {
          device_type: 'totp',
        },
      });

    return { message: 'MFA device verified successfully' }
  }

  async verifyTotp(userId: string, code: string) {
    // Get active TOTP device
    const { data: device, error } = await this.supabase.getClient()
      .from('mfa_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('device_type', 'totp')
      .eq('is_verified', true)
      .eq('is_active', true)
      .single();

    if (error || !device || !device.secret) {
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
    await this.supabase.getClient()
      .from('mfa_devices')
      .update({
        last_used_at: new Date().toISOString(),
      })
      .eq('id', device.id);

    return true
  }

  async getUserMfaDevices(userId: string) {
    const { data: devices } = await this.supabase.getClient()
      .from('mfa_devices')
      .select('id, device_type, device_name, is_verified, last_used_at, created_at')
      .eq('user_id', userId)
      .eq('is_active', true);

    return devices || []
  }

  async removeMfaDevice(userId: string, deviceId: string) {
    // Verify device belongs to user
    const { data: device, error } = await this.supabase.getClient()
      .from('mfa_devices')
      .select('*')
      .eq('id', deviceId)
      .eq('user_id', userId)
      .single();

    if (error || !device) {
      throw new BadRequestException('Device not found')
    }

    // Deactivate device
    await this.supabase.getClient()
      .from('mfa_devices')
      .update({
        is_active: false,
      })
      .eq('id', deviceId);

    // Log audit event
    await this.supabase.getClient()
      .from('audit_events')
      .insert({
        event_type: 'mfa',
        entity_type: 'mfa_device',
        entity_id: deviceId,
        user_id: userId,
        action: 'device_removed',
        metadata: {
          device_type: device.device_type,
        },
      });

    return { message: 'MFA device removed successfully' }
  }

  async isMfaEnabled(userId: string): Promise<boolean> {
    const { count } = await this.supabase.getClient()
      .from('mfa_devices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_verified', true)
      .eq('is_active', true);

    return (count || 0) > 0
  }
}
