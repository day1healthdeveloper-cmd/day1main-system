-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS landing_page_leads CASCADE;
DROP TABLE IF EXISTS landing_page_visits CASCADE;
DROP TABLE IF EXISTS landing_pages CASCADE;

-- Landing Pages Table
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(500),
  description TEXT,
  template VARCHAR(100) NOT NULL DEFAULT 'day1health',
  content JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Landing Page Visits Table (for analytics)
CREATE TABLE landing_page_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER DEFAULT 0, -- in seconds
  user_agent TEXT,
  ip_address VARCHAR(45),
  referrer TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Landing Page Leads Table (leads captured from landing pages)
CREATE TABLE landing_page_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_status ON landing_pages(status);
CREATE INDEX idx_landing_pages_created_at ON landing_pages(created_at DESC);
CREATE INDEX idx_landing_page_visits_landing_page_id ON landing_page_visits(landing_page_id);
CREATE INDEX idx_landing_page_visits_visited_at ON landing_page_visits(visited_at DESC);
CREATE INDEX idx_landing_page_leads_landing_page_id ON landing_page_leads(landing_page_id);
CREATE INDEX idx_landing_page_leads_email ON landing_page_leads(email);
CREATE INDEX idx_landing_page_leads_created_at ON landing_page_leads(created_at DESC);

-- RLS Policies for landing_pages
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

-- Marketing managers can view all landing pages
CREATE POLICY landing_pages_select_policy ON landing_pages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.name IN ('marketing:view', 'marketing:write')
    )
  );

-- Marketing managers can insert landing pages
CREATE POLICY landing_pages_insert_policy ON landing_pages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.name = 'marketing:write'
    )
  );

-- Marketing managers can update landing pages
CREATE POLICY landing_pages_update_policy ON landing_pages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.name = 'marketing:write'
    )
  );

-- Marketing managers can delete landing pages
CREATE POLICY landing_pages_delete_policy ON landing_pages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.name = 'marketing:write'
    )
  );

-- RLS Policies for landing_page_visits (public can insert, marketing can view)
ALTER TABLE landing_page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY landing_page_visits_insert_policy ON landing_page_visits
  FOR INSERT
  WITH CHECK (true); -- Anyone can track visits

CREATE POLICY landing_page_visits_select_policy ON landing_page_visits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.name IN ('marketing:view', 'marketing:write')
    )
  );

CREATE POLICY landing_page_visits_update_policy ON landing_page_visits
  FOR UPDATE
  USING (true); -- Anyone can update their visit duration

-- RLS Policies for landing_page_leads (public can insert, marketing can view)
ALTER TABLE landing_page_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY landing_page_leads_insert_policy ON landing_page_leads
  FOR INSERT
  WITH CHECK (true); -- Anyone can submit leads

CREATE POLICY landing_page_leads_select_policy ON landing_page_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.name IN ('marketing:view', 'marketing:write')
    )
  );

-- Comments
COMMENT ON TABLE landing_pages IS 'Stores marketing landing pages with their content and configuration';
COMMENT ON TABLE landing_page_visits IS 'Tracks visits to landing pages for analytics';
COMMENT ON TABLE landing_page_leads IS 'Stores leads captured from landing pages';
COMMENT ON COLUMN landing_pages.slug IS 'URL-friendly unique identifier for the landing page';
COMMENT ON COLUMN landing_pages.template IS 'Template type: day1health, simple, custom';
COMMENT ON COLUMN landing_pages.content IS 'JSON content defining the page structure and data';
COMMENT ON COLUMN landing_pages.status IS 'Page status: draft, active, or archived';
