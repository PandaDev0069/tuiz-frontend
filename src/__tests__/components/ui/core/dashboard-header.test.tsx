import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from '@/components/ui/core/dashboard-header';
import { useAuthStore } from '@/state/useAuthStore';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '@/__tests__/setupTests';

// Mock the auth store
vi.mock('@/state/useAuthStore');

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={width} height={height} className={className} {...props} />
    );
  },
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('DashboardHeader', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: undefined,
  };

  const mockOnProfileClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      clearAuth: vi.fn(),
      initializeAuth: vi.fn(),
      session: null,
    });
  });

  it('renders logo and app name in both mobile and desktop layouts', () => {
    renderWithProviders(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    // Check for the new Japanese app name
    expect(screen.getAllByText('TUIZ情報王')).toHaveLength(2); // Mobile and desktop versions
    expect(screen.getAllByAltText('TUIZ Logo')).toHaveLength(2); // Mobile and desktop versions
  });

  it('renders user profile button with user information', () => {
    renderWithProviders(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    expect(screen.getAllByText('Test User')).toHaveLength(2); // Mobile and desktop versions
    expect(screen.getAllByTitle('Profile Settings')).toHaveLength(2); // Mobile and desktop versions
  });

  it('renders logout button with Japanese text', () => {
    renderWithProviders(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    expect(screen.getAllByText('ログアウト')).toHaveLength(2); // Mobile and desktop versions
    expect(screen.getAllByTitle('Logout')).toHaveLength(2); // Mobile and desktop versions
  });

  it('calls onProfileClick when profile button is clicked', () => {
    renderWithProviders(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    const profileButtons = screen.getAllByTitle('Profile Settings');
    fireEvent.click(profileButtons[0]); // Click mobile version

    expect(mockOnProfileClick).toHaveBeenCalledTimes(1);
  });

  it('shows User icon when no avatar is provided', () => {
    renderWithProviders(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    // Check that User icons are present (mobile and desktop versions)
    const userIcons = screen.getAllByTestId('user-icon');
    expect(userIcons).toHaveLength(2);
  });

  it('shows loading state on logout button when loading', () => {
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      loading: true,
      login: vi.fn(),
      register: vi.fn(),
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      clearAuth: vi.fn(),
      initializeAuth: vi.fn(),
      session: null,
    });

    renderWithProviders(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    expect(screen.getAllByText('Logging out...')).toHaveLength(2); // Mobile and desktop versions
  });

  it('navigates to home page when logo is clicked', () => {
    renderWithProviders(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    const logoButtons = screen.getAllByRole('button');
    const logoButton = logoButtons.find((button) => button.querySelector('img[alt="TUIZ Logo"]'));

    if (logoButton) {
      fireEvent.click(logoButton);
      expect(mockPush).toHaveBeenCalledWith('/');
    }
  });

  it('handles logout and navigates to home page', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      clearAuth: vi.fn(),
      initializeAuth: vi.fn(),
      session: null,
    });

    renderWithProviders(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    const logoutButtons = screen.getAllByTitle('Logout');
    await fireEvent.click(logoutButtons[0]); // Click mobile version

    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('handles logout error and still navigates to home page', async () => {
    const mockLogout = vi.fn().mockRejectedValue(new Error('Logout failed'));
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      clearAuth: vi.fn(),
      initializeAuth: vi.fn(),
      session: null,
    });

    // Mock console.error to avoid test noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    const logoutButtons = screen.getAllByTitle('Logout');
    await fireEvent.click(logoutButtons[0]); // Click mobile version

    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('displays avatar when user has avatarUrl', () => {
    const userWithAvatar = {
      ...mockUser,
      avatarUrl: '/test-avatar.jpg',
    };

    mockUseAuthStore.mockReturnValue({
      user: userWithAvatar,
      logout: vi.fn(),
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      clearAuth: vi.fn(),
      initializeAuth: vi.fn(),
      session: null,
    });

    renderWithProviders(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    const avatarImages = screen.getAllByAltText('Test User avatar');
    expect(avatarImages).toHaveLength(2); // Mobile and desktop versions
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-header-class';
    renderWithProviders(
      <DashboardHeader onProfileClick={mockOnProfileClick} className={customClass} />,
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveClass(customClass);
  });
});
