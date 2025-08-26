import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from '@/components/ui/core/dashboard-header';
import { useAuthStore } from '@/state/useAuthStore';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the auth store
vi.mock('@/state/useAuthStore');

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

  it('renders logo and app name', () => {
    render(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    expect(screen.getByText('TUIZ')).toBeInTheDocument();
    expect(screen.getByText('Quiz Platform')).toBeInTheDocument();
  });

  it('renders user profile button with user information', () => {
    render(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByTitle('Profile Settings')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByTitle('Logout')).toBeInTheDocument();
  });

  it('calls onProfileClick when profile button is clicked', () => {
    render(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    const profileButton = screen.getByTitle('Profile Settings');
    fireEvent.click(profileButton);

    expect(mockOnProfileClick).toHaveBeenCalledTimes(1);
  });

  it('shows user initials when no avatar is provided', () => {
    render(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    expect(screen.getByText('T')).toBeInTheDocument();
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

    render(<DashboardHeader onProfileClick={mockOnProfileClick} />);

    expect(screen.getByText('Logging out...')).toBeInTheDocument();
  });
});
