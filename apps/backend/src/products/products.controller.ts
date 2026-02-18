import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { BenefitsService } from './benefits.service';
import { BenefitDetailsService } from './benefit-details.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly benefitsService: BenefitsService,
    private readonly benefitDetailsService: BenefitDetailsService,
  ) {}

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/with-benefits')
  async findOneWithBenefits(@Param('id') id: string) {
    return this.productsService.findOneWithBenefits(id);
  }

  @Post()
  async create(@Body() productData: any) {
    return this.productsService.create(productData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() productData: any) {
    return this.productsService.update(id, productData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get(':id/policy-document')
  async getPolicyDocument(@Param('id') productId: string) {
    return this.productsService.getPolicyDocument(productId);
  }

  @Post(':id/policy-document')
  async savePolicyDocumentSection(
    @Param('id') productId: string,
    @Body() data: { section_id: string; content: string },
  ) {
    return this.productsService.savePolicyDocumentSection(productId, data);
  }

  // Policy Definitions endpoints
  @Get(':id/definitions')
  async getDefinitions(@Param('id') productId: string) {
    return this.productsService.getDefinitions(productId);
  }

  @Post(':id/definitions')
  async addDefinition(
    @Param('id') productId: string,
    @Body() data: { term: string; definition: string; category?: string },
  ) {
    return this.productsService.addDefinition(productId, data);
  }

  @Put('definitions/:definitionId')
  async updateDefinition(
    @Param('definitionId') definitionId: string,
    @Body() data: { term: string; definition: string; category?: string },
  ) {
    return this.productsService.updateDefinition(definitionId, data);
  }

  @Delete('definitions/:definitionId')
  async deleteDefinition(@Param('definitionId') definitionId: string) {
    return this.productsService.deleteDefinition(definitionId);
  }

  // Policy Sections endpoints
  @Get(':id/sections/:sectionType')
  async getPolicySection(
    @Param('id') productId: string,
    @Param('sectionType') sectionType: string,
  ) {
    return this.productsService.getPolicySection(productId, sectionType);
  }

  @Post(':id/sections/:sectionType')
  async savePolicySection(
    @Param('id') productId: string,
    @Param('sectionType') sectionType: string,
    @Body() data: { content: string },
  ) {
    return this.productsService.savePolicySection(productId, sectionType, data.content);
  }

  // Policy Section Items endpoints
  @Get(':id/section-items/:sectionType')
  async getPolicySectionItems(
    @Param('id') productId: string,
    @Param('sectionType') sectionType: string,
  ) {
    return this.productsService.getPolicySectionItems(productId, sectionType);
  }

  @Post(':id/section-items/:sectionType')
  async addPolicySectionItem(
    @Param('id') productId: string,
    @Param('sectionType') sectionType: string,
    @Body() data: { title?: string; content: string },
  ) {
    return this.productsService.addPolicySectionItem(productId, sectionType, data);
  }

  @Put('section-items/:itemId')
  async updatePolicySectionItem(
    @Param('itemId') itemId: string,
    @Body() data: { title?: string; content: string },
  ) {
    return this.productsService.updatePolicySectionItem(itemId, data);
  }

  @Delete('section-items/:itemId')
  async deletePolicySectionItem(@Param('itemId') itemId: string) {
    return this.productsService.deletePolicySectionItem(itemId);
  }

  // Benefit Types endpoints
  @Get('benefit-types/all')
  async getBenefitTypes() {
    return this.benefitsService.getBenefitTypes();
  }

  @Get('benefit-types/category/:category')
  async getBenefitTypesByCategory(@Param('category') category: string) {
    return this.benefitsService.getBenefitTypes(category);
  }

  // Product Benefits endpoints
  @Get(':id/benefits')
  async getProductBenefits(@Param('id') id: string) {
    return this.benefitsService.getProductBenefits(id);
  }

  @Post(':id/benefits')
  async upsertProductBenefit(
    @Param('id') productId: string,
    @Body() benefitData: any,
  ) {
    return this.benefitsService.upsertProductBenefit(productId, benefitData);
  }

  @Delete('benefits/:benefitId')
  async deleteProductBenefit(@Param('benefitId') benefitId: string) {
    return this.benefitsService.deleteProductBenefit(benefitId);
  }

  // Member Benefit Usage endpoints
  @Get('members/:memberId/usage/:year')
  async getMemberBenefitUsage(
    @Param('memberId') memberId: string,
    @Param('year') year: string,
  ) {
    return this.benefitsService.getMemberBenefitUsage(memberId, parseInt(year));
  }

  // Comprehensive Benefit Details endpoints
  @Get('benefits/:benefitId/details')
  async getBenefitDetails(@Param('benefitId') benefitId: string) {
    return this.benefitDetailsService.getBenefitDetails(benefitId);
  }

  @Post('benefits/:benefitId/details')
  async upsertBenefitDetails(
    @Param('benefitId') benefitId: string,
    @Body() details: any,
  ) {
    return this.benefitDetailsService.upsertBenefitDetails(benefitId, details);
  }

  // Exclusions endpoints
  @Get('benefits/:benefitId/exclusions')
  async getBenefitExclusions(@Param('benefitId') benefitId: string) {
    return this.benefitDetailsService.getBenefitExclusions(benefitId);
  }

  @Post('benefits/:benefitId/exclusions')
  async addBenefitExclusion(
    @Param('benefitId') benefitId: string,
    @Body() exclusion: any,
  ) {
    return this.benefitDetailsService.addBenefitExclusion(benefitId, exclusion);
  }

  @Delete('exclusions/:exclusionId')
  async deleteBenefitExclusion(@Param('exclusionId') exclusionId: string) {
    return this.benefitDetailsService.deleteBenefitExclusion(exclusionId);
  }

  // Conditions endpoints
  @Get('benefits/:benefitId/conditions')
  async getBenefitConditions(@Param('benefitId') benefitId: string) {
    return this.benefitDetailsService.getBenefitConditions(benefitId);
  }

  @Post('benefits/:benefitId/conditions')
  async addBenefitCondition(
    @Param('benefitId') benefitId: string,
    @Body() condition: any,
  ) {
    return this.benefitDetailsService.addBenefitCondition(benefitId, condition);
  }

  @Delete('conditions/:conditionId')
  async deleteBenefitCondition(@Param('conditionId') conditionId: string) {
    return this.benefitDetailsService.deleteBenefitCondition(conditionId);
  }

  // Network Providers endpoints
  @Get('benefits/:benefitId/network-providers')
  async getNetworkProviders(@Param('benefitId') benefitId: string) {
    return this.benefitDetailsService.getNetworkProviders(benefitId);
  }

  @Post('benefits/:benefitId/network-providers')
  async addNetworkProvider(
    @Param('benefitId') benefitId: string,
    @Body() provider: any,
  ) {
    return this.benefitDetailsService.addNetworkProvider(benefitId, provider);
  }

  @Delete('network-providers/:providerId')
  async removeNetworkProvider(@Param('providerId') providerId: string) {
    return this.benefitDetailsService.removeNetworkProvider(providerId);
  }

  // Procedure Codes endpoints
  @Get('benefits/:benefitId/procedure-codes')
  async getProcedureCodes(@Param('benefitId') benefitId: string) {
    return this.benefitDetailsService.getProcedureCodes(benefitId);
  }

  @Post('benefits/:benefitId/procedure-codes')
  async addProcedureCode(
    @Param('benefitId') benefitId: string,
    @Body() code: any,
  ) {
    return this.benefitDetailsService.addProcedureCode(benefitId, code);
  }

  @Delete('procedure-codes/:codeId')
  async deleteProcedureCode(@Param('codeId') codeId: string) {
    return this.benefitDetailsService.deleteProcedureCode(codeId);
  }

  // Authorization Rules endpoints
  @Get('benefits/:benefitId/authorization-rules')
  async getAuthorizationRules(@Param('benefitId') benefitId: string) {
    return this.benefitDetailsService.getAuthorizationRules(benefitId);
  }

  @Post('benefits/:benefitId/authorization-rules')
  async upsertAuthorizationRule(
    @Param('benefitId') benefitId: string,
    @Body() rule: any,
  ) {
    return this.benefitDetailsService.upsertAuthorizationRule(benefitId, rule);
  }

  // Change History endpoints
  @Get('benefits/:benefitId/history')
  async getChangeHistory(@Param('benefitId') benefitId: string) {
    return this.benefitDetailsService.getChangeHistory(benefitId);
  }
}
