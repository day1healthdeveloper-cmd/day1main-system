import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Landing Page', () => {
  it('should render the page', () => {
    render(<Home />);
    expect(screen.getByText('Day1Main')).toBeInTheDocument();
  });

  it('should render hero section with main heading', () => {
    render(<Home />);
    expect(screen.getByText('Medical Coverage')).toBeInTheDocument();
    expect(screen.getByText('Made Simple')).toBeInTheDocument();
  });

  it('should render hero description', () => {
    render(<Home />);
    expect(
      screen.getByText(/South African medical insurer and health-financing operating system/)
    ).toBeInTheDocument();
  });

  it('should render trust indicators', () => {
    render(<Home />);
    expect(screen.getByText('POPIA Compliant')).toBeInTheDocument();
    expect(screen.getByText('CMS Registered')).toBeInTheDocument();
    expect(screen.getByText('FICA Compliant')).toBeInTheDocument();
  });

  it('should render features section', () => {
    render(<Home />);
    expect(screen.getByText('Everything You Need')).toBeInTheDocument();
    expect(screen.getByText('Medical Schemes & Insurance')).toBeInTheDocument();
    expect(screen.getByText('Claims Processing')).toBeInTheDocument();
    expect(screen.getByText('POPIA Compliance')).toBeInTheDocument();
    expect(screen.getByText('Payments & Billing')).toBeInTheDocument();
    expect(screen.getByText('Regulatory Reporting')).toBeInTheDocument();
    expect(screen.getByText('Provider Network')).toBeInTheDocument();
  });

  it('should render CTA section', () => {
    render(<Home />);
    expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
    expect(screen.getByText('Contact Sales')).toBeInTheDocument();
  });

  it('should render footer with company info', () => {
    render(<Home />);
    expect(
      screen.getByText('Medical insurance operating system built for South African compliance')
    ).toBeInTheDocument();
  });

  it('should render footer navigation sections', () => {
    render(<Home />);
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('should render footer links', () => {
    render(<Home />);
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('should render copyright notice', () => {
    render(<Home />);
    expect(screen.getByText(/© 2026 Day1Main. All rights reserved./)).toBeInTheDocument();
  });

  describe('Navigation Links', () => {
    it('should have Sign In link in navigation', () => {
      render(<Home />);
      const signInLinks = screen.getAllByText('Sign In');
      expect(signInLinks.length).toBeGreaterThan(0);
    });

    it('should have Get Started links', () => {
      render(<Home />);
      const getStartedLinks = screen.getAllByText('Get Started');
      expect(getStartedLinks.length).toBeGreaterThan(0);
    });

    it('should have Learn More button', () => {
      render(<Home />);
      const learnMoreButtons = screen.getAllByText('Learn More');
      expect(learnMoreButtons.length).toBeGreaterThan(0);
    });

    it('should link to login page', () => {
      render(<Home />);
      const links = screen.getAllByRole('link');
      const loginLinks = links.filter((link) => link.getAttribute('href') === '/login');
      expect(loginLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should render navigation bar', () => {
      render(<Home />);
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should render feature cards', () => {
      render(<Home />);
      // Check for feature card titles
      expect(screen.getByText('Medical Schemes & Insurance')).toBeInTheDocument();
      expect(screen.getByText('Claims Processing')).toBeInTheDocument();
      expect(screen.getByText('POPIA Compliance')).toBeInTheDocument();
    });
  });
});
