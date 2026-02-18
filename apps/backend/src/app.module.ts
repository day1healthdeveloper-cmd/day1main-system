import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SupabaseModule } from './supabase/supabase.module'
import { AuthModule } from './auth/auth.module'
import { RbacModule } from './rbac/rbac.module'
import { AuditModule } from './audit/audit.module'
import { MembersModule } from './members/members.module'
import { KycModule } from './kyc/kyc.module'
import { PoliciesModule } from './policies/policies.module'
import { PopiaModule } from './popia/popia.module'
import { ProductsModule } from './products/products.module'
import { RulesModule } from './rules/rules.module'
import { PmbModule } from './pmb/pmb.module'
import { RegimeModule } from './regime/regime.module'
import { ProvidersModule } from './providers/providers.module'
import { ClaimsModule } from './claims/claims.module'
import { PaymentsModule } from './payments/payments.module'
import { FinanceModule } from './finance/finance.module'
import { BrokerModule } from './broker/broker.module'
import { ComplianceModule } from './compliance/compliance.module'
import { MarketingModule } from './marketing/marketing.module'
import { DataImportModule } from './data-import/data-import.module'
import { NetcashModule } from './netcash/netcash.module'
import { AuditInterceptor } from './audit/interceptors/audit.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    AuthModule,
    RbacModule,
    AuditModule,
    MembersModule,
    KycModule,
    PoliciesModule,
    PopiaModule,
    ProductsModule,
    RulesModule,
    PmbModule,
    RegimeModule,
    ProvidersModule,
    ClaimsModule,
    PaymentsModule,
    FinanceModule,
    BrokerModule,
    ComplianceModule,
    MarketingModule,
    DataImportModule,
    NetcashModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
