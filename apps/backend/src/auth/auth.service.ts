import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { SupabaseService } from '../supabase/supabase.service'
import { LoginDto, RegisterDto } from './dto'

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    console.log('🔐 Login attempt:', dto.email);
    console.log('🔧 Supabase client status:', this.supabase ? 'Initialized' : 'NOT INITIALIZED');
    
    try {
      // Find user
      console.log('📊 Querying Supabase for user...');
      const { data: user, error } = await this.supabase
        .from('users')
        .select(`
          *,
          profile:profiles(*),
          user_roles!user_roles_user_id_fkey(
            role:roles(*)
          )
        `)
        .eq('email', dto.email)
        .single();

      console.log('📊 Supabase response - Data:', user ? 'Found' : 'Not found', 'Error:', error);

      if (error) {
        console.error('❌ Supabase query error:', JSON.stringify(error, null, 2));
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user) {
        console.error('❌ User not found');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('✅ User found:', user.email);

      // Verify password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);

      if (!isPasswordValid) {
        console.error('❌ Invalid password');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('✅ Password valid');

      // Check if user is active
      if (!user.is_active) {
        console.error('❌ User inactive');
        throw new UnauthorizedException('Account is inactive');
      }

      console.log('✅ User is active');

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email);
      console.log('✅ Tokens generated');

      // Create session
      await this.createSession(
        user.id,
        tokens.access_token,
        tokens.refresh_token,
        ipAddress,
        userAgent,
      );

      console.log('✅ Session created');

      // Log audit event
      await this.supabase.from('audit_events').insert({
        event_type: 'auth',
        entity_type: 'user',
        entity_id: user.id,
        user_id: user.id,
        action: 'login',
        metadata: {
          ip_address: ipAddress,
          user_agent: userAgent,
        },
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      console.log('✅ Login successful for:', user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile,
          roles: user.user_roles?.map((ur: any) => ur.role.name) || [],
        },
        ...tokens,
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async register(dto: RegisterDto) {
    // Check if user already exists
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('id')
      .eq('email', dto.email)
      .single();

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .insert({
        email: dto.email,
        password_hash: passwordHash,
        is_active: true,
      })
      .select()
      .single();

    if (userError || !user) {
      throw new Error('Failed to create user');
    }

    // Create profile
    await this.supabase.from('profiles').insert({
      user_id: user.id,
      first_name: dto.first_name,
      last_name: dto.last_name,
      phone: dto.phone,
    });

    // Assign default member role
    const { data: memberRole } = await this.supabase
      .from('roles')
      .select('id')
      .eq('name', 'member')
      .single();

    if (memberRole) {
      await this.supabase.from('user_roles').insert({
        user_id: user.id,
        role_id: memberRole.id,
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Create session
    await this.createSession(user.id, tokens.access_token, tokens.refresh_token);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      ...tokens,
    };
  }

  async logout(userId: string, token: string) {
    // Delete session
    await this.supabase
      .from('sessions')
      .delete()
      .eq('user_id', userId)
      .eq('token', token);

    // Log audit event
    await this.supabase.from('audit_events').insert({
      event_type: 'auth',
      entity_type: 'user',
      entity_id: userId,
      user_id: userId,
      action: 'logout',
      metadata: {},
    });

    return { message: 'Logged out successfully' };
  }

  async validateUser(userId: string) {
    const { data: user, error } = await this.supabase
      .from('users')
      .select(`
        *,
        profile:profiles(*),
        user_roles!user_roles_user_id_fkey(
          role:roles(
            *,
            role_permissions(
              permission:permissions(*)
            )
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !user || !user.is_active) {
      return null;
    }

    // Extract roles and permissions
    const roles = user.user_roles?.map((ur: any) => ur.role.name) || [];
    const permissions = user.user_roles?.flatMap((ur: any) =>
      ur.role.role_permissions?.map((rp: any) => rp.permission.name) || []
    ) || [];

    return {
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles,
      permissions: [...new Set(permissions)], // Remove duplicates
    };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.supabase.from('sessions').insert({
      user_id: userId,
      token,
      refresh_token: refreshToken,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString(),
    });
  }
}
