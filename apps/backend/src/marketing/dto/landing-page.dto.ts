export class CreateLandingPageDto {
  name: string;
  slug: string;
  title?: string;
  description?: string;
  template: string; // 'day1health', 'simple', 'custom'
  content: any; // JSON content for the page
  status: 'draft' | 'active' | 'archived';
  metadata?: any; // SEO, OG tags, etc.
}

export class UpdateLandingPageDto {
  name?: string;
  slug?: string;
  title?: string;
  description?: string;
  template?: string;
  content?: any;
  status?: 'draft' | 'active' | 'archived';
  metadata?: any;
}

export class LandingPageStatsDto {
  landingPageId: string;
  visits: number;
  leads: number;
  conversionRate: number;
  bounceRate: number;
  avgTimeOnPage: string;
}

export class CaptureLandingPageLeadDto {
  landingPageSlug: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  metadata?: any; // Additional form data
}
