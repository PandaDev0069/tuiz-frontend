// ====================================================
// File Name   : dashboard-header.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-26
// Last Update : 2025-09-16
//
// Description:
// - Dashboard header component with logo, profile, and logout
// - Responsive design with separate mobile and desktop layouts
// - Integrates with authentication and profile hooks
// - Provides navigation and user actions
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Next.js Image component for optimized images
// - Supports keyboard navigation for accessibility
// ====================================================

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/state/useAuthStore';
import { useProfile } from '@/hooks/useProfile';
import { Button } from './button';
import { AnimatedHeading } from './animated-heading';
import { cn } from '@/lib/utils';
import { LogOut, User, Loader2 } from 'lucide-react';
import Image from 'next/image';

const LOGO_PATH = '/logo.png';
const HOME_PATH = '/';

const MOBILE_LOGO_SIZE = 70;
const DESKTOP_LOGO_SIZE = 56;

const MOBILE_SKELETON_WIDTH = 80;
const DESKTOP_SKELETON_WIDTH = 112;

const IMAGE_QUALITY = 95;

const KEYBOARD_ENTER = 'Enter';
const KEYBOARD_SPACE = ' ';

interface DashboardHeaderProps {
  className?: string;
  onProfileClick?: () => void;
}

/**
 * Function: handleKeyboardNavigation
 * Description:
 * - Handles keyboard navigation for clickable elements
 * - Supports Enter and Space key activation
 * - Prevents default behavior and triggers callback
 *
 * Parameters:
 * - e (React.KeyboardEvent): Keyboard event
 * - callback (() => void): Function to call on activation
 *
 * Returns:
 * - void
 *
 * Example:
 * ```ts
 * onKeyDown={(e) => handleKeyboardNavigation(e, handleClick)}
 * ```
 */
const handleKeyboardNavigation = (e: React.KeyboardEvent, callback: () => void): void => {
  if (e.key === KEYBOARD_ENTER || e.key === KEYBOARD_SPACE) {
    e.preventDefault();
    callback();
  }
};

/**
 * Function: getAvatarAltText
 * Description:
 * - Generates alt text for user avatar image
 * - Falls back to 'User' if no name is available
 *
 * Parameters:
 * - displayName (string | null | undefined): User display name
 * - username (string | null | undefined): User username
 *
 * Returns:
 * - string: Alt text for avatar image
 *
 * Example:
 * ```ts
 * const alt = getAvatarAltText(profile.displayName, profile.username);
 * // Returns "John Doe avatar" or "User avatar"
 * ```
 */
const getAvatarAltText = (
  displayName: string | null | undefined,
  username: string | null | undefined,
): string => {
  const name = displayName || username || 'User';
  return `${name} avatar`;
};

/**
 * Function: getUserDisplayName
 * Description:
 * - Gets user display name with fallback chain
 * - Returns displayName, username, or 'User' as fallback
 *
 * Parameters:
 * - displayName (string | null | undefined): User display name
 * - username (string | null | undefined): User username
 *
 * Returns:
 * - string: User display name
 *
 * Example:
 * ```ts
 * const name = getUserDisplayName(profile.displayName, profile.username);
 * // Returns displayName, username, or 'User'
 * ```
 */
const getUserDisplayName = (
  displayName: string | null | undefined,
  username: string | null | undefined,
): string => {
  return displayName || username || 'User';
};

/**
 * Component: DashboardHeader
 * Description:
 * - Dashboard header component with responsive design
 * - Displays logo, user profile, and logout button
 * - Provides separate mobile and desktop layouts
 * - Integrates with authentication and profile management
 * - Supports keyboard navigation for accessibility
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - onProfileClick (() => void, optional): Callback for profile button click
 *
 * Returns:
 * - React.ReactElement: The dashboard header component
 *
 * Example:
 * ```tsx
 * <DashboardHeader onProfileClick={() => router.push('/profile')} />
 * ```
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className, onProfileClick }) => {
  const { logout, loading } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      router.push(HOME_PATH);
    } catch (error) {
      console.error('Logout failed:', error);
      router.push(HOME_PATH);
    }
  };

  const handleProfileClick = (): void => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleLogoClick = (): void => {
    router.push(HOME_PATH);
  };

  return (
    <header
      className={cn(
        'w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-b border-border/40',
        'py-3 md:py-4',
        className,
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 md:!hidden">
          <div className="flex justify-center items-center">
            <div
              className="flex items-center space-x-3 cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyboardNavigation(e, handleLogoClick)}
            >
              <div className="relative">
                <Image
                  src={LOGO_PATH}
                  alt="TUIZ Logo"
                  width={MOBILE_LOGO_SIZE}
                  height={MOBILE_LOGO_SIZE}
                  priority
                  className="animate-float object-contain rounded-full ring-2 ring-primary/20"
                />
              </div>
              <AnimatedHeading
                size="md"
                animation="float"
                className="text-lg font-bold tracking-wide"
              >
                TUIZ情報王
              </AnimatedHeading>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="flex items-center space-x-3 px-4 py-2 h-12 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-200 border border-transparent hover:border-primary/20 hover:shadow-md"
                title="Profile Settings"
              >
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary flex items-center justify-center overflow-hidden shadow-lg">
                  {profileLoading ? (
                    <Loader2 className={cn('h-5 w-5 text-primary animate-spin')} />
                  ) : profile?.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={getAvatarAltText(profile.displayName, profile.username)}
                      fill
                      priority
                      quality={IMAGE_QUALITY}
                      className="object-cover rounded-full"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <User className={cn('h-5 w-5 text-primary')} data-testid="user-icon" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground leading-tight px-2 py-1 rounded-md bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary shadow-md">
                    {profileLoading ? (
                      <div
                        className={cn(
                          'h-4 rounded animate-pulse bg-gradient-to-r from-gray-200 to-gray-300',
                        )}
                        style={{ width: MOBILE_SKELETON_WIDTH }}
                      />
                    ) : (
                      getUserDisplayName(profile?.displayName, profile?.username)
                    )}
                  </span>
                </div>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 h-11 rounded-xl border-2 border-red-500/70 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 shadow-sm"
              title="Logout"
            >
              <LogOut className={cn('h-4 w-4')} />
              <span className="text-sm font-medium">
                {loading ? 'Logging out...' : 'ログアウト'}
              </span>
            </Button>
          </div>
        </div>

        <div className="!hidden md:!flex items-center justify-between min-h-[80px]">
          <div
            className="flex items-center space-x-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyboardNavigation(e, handleLogoClick)}
          >
            <div className="relative">
              <Image
                src={LOGO_PATH}
                alt="TUIZ Logo"
                width={DESKTOP_LOGO_SIZE}
                height={DESKTOP_LOGO_SIZE}
                priority
                className="animate-float object-contain rounded-full ring-2 ring-primary/20 shadow-lg"
              />
            </div>
            <AnimatedHeading
              size="lg"
              animation="float"
              className="text-2xl font-bold tracking-wide"
            >
              TUIZ情報王
            </AnimatedHeading>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="flex items-center space-x-4 px-5 py-3 h-16 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-200 border border-transparent hover:border-primary/20 hover:shadow-lg group"
                title="Profile Settings"
              >
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary flex items-center justify-center overflow-hidden shadow-lg">
                  {profileLoading ? (
                    <Loader2 className={cn('h-6 w-6 text-primary animate-spin')} />
                  ) : profile?.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={getAvatarAltText(profile.displayName, profile.username)}
                      fill
                      priority
                      quality={IMAGE_QUALITY}
                      className="object-cover rounded-full"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <User className={cn('h-6 w-6 text-primary')} data-testid="user-icon" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-bold text-foreground leading-tight px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary shadow-md">
                    {profileLoading ? (
                      <div
                        className={cn(
                          'h-5 rounded animate-pulse bg-gradient-to-r from-gray-200 to-gray-300',
                        )}
                        style={{ width: DESKTOP_SKELETON_WIDTH }}
                      />
                    ) : (
                      getUserDisplayName(profile?.displayName, profile?.username)
                    )}
                  </span>
                </div>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center space-x-3 px-6 py-3 h-14 rounded-xl border-2 border-red-500/70 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 shadow-md"
              title="Logout"
            >
              <LogOut className={cn('h-5 w-5')} />
              <span className="text-base font-medium">
                {loading ? 'Logging out...' : 'ログアウト'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
