import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CampaignService } from './campaign.service';
import { ReferralService } from './referral.service';
import { LandingPageService } from './landing-page.service';
import { LeadController } from './lead.controller';
import { CampaignController } from './campaign.controller';
import { ReferralController } from './referral.controller';
import { LandingPageController, PublicLandingPageController } from './landing-page.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [SupabaseModule, AuditModule, RbacModule],
  controllers: [
    LeadController,
    CampaignController,
    ReferralController,
    LandingPageController,
    PublicLandingPageController,
  ],
  providers: [LeadService, CampaignService, ReferralService, LandingPageService],
  exports: [LeadService, CampaignService, ReferralService, LandingPageService],
})
export class MarketingModule {}
