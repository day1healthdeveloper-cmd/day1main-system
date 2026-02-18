import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { BenefitsService } from './benefits.service';
import { BenefitDetailsService } from './benefit-details.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService, BenefitsService, BenefitDetailsService],
  exports: [ProductsService, BenefitsService, BenefitDetailsService],
})
export class ProductsModule {}
