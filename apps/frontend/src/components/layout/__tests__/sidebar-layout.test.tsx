import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarLayout } from '../sidebar-layout';
import { useAuth } from '@/contexts/auth-context';
import { usePathname, useRouter } from 'next/navigation';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

describe('SidebarLayout', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockPush = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['member'],
        permissions: [],
      },
      loading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: mockLogout,
      register: jest.fn(),
    });
  });

  it('should render sidebar with navigation items', () => {
    render(
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
    expect(screen.getByText('Claims')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should render user information', () => {
    render(
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render search bar', () => {
    render(
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    mockUsePathname.mockReturnValue('/claims');

    render(
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    );

    const claimsLink = screen.getByText('Claims').closest('a');
    expect(claimsLink).toHaveClass('bg-primary');
  });

  it('should render Day1Main logo', () => {
    render(
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    );

    expect(screen.getByText('Day1Main')).toBeInTheDocument();
    expect(screen.getByText('D1')).toBeInTheDocument();
  });

  it('should render notification bell icon', () => {
    render(
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    );

    // Check for button with notification icon (bell)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  describe('Responsive Behavior', () => {
    it('should render mobile menu button', () => {
      render(
        <SidebarLayout>
          <div>Test Content</div>
        </SidebarLayout>
      );

      // Mobile menu button should be present
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have sidebar hidden on mobile by default', () => {
      const { container } = render(
        <SidebarLayout>
          <div>Test Content</div>
        </SidebarLayout>
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('-translate-x-full');
    });
  });

  describe('User Menu', () => {
    it('should render user initials', () => {
      render(
        <SidebarLayout>
          <div>Test Content</div>
        </SidebarLayout>
      );

      // User initials should be displayed
      const initials = screen.getAllByText('JD');
      expect(initials.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for dashboard', () => {
      render(
        <SidebarLayout>
          <div>Test Content</div>
        </SidebarLayout>
      );

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('should have correct href for policies', () => {
      render(
        <SidebarLayout>
          <div>Test Content</div>
        </SidebarLayout>
      );

      const policiesLink = screen.getByText('Policies').closest('a');
      expect(policiesLink).toHaveAttribute('href', '/policies');
    });

    it('should have correct href for claims', () => {
      render(
        <SidebarLayout>
          <div>Test Content</div>
        </SidebarLayout>
      );

      const claimsLink = screen.getByText('Claims').closest('a');
      expect(claimsLink).toHaveAttribute('href', '/claims');
    });
  });
});
