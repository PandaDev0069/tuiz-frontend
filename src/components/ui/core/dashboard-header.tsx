'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/state/useAuthStore';
import { Button } from './button';
import { AnimatedHeading } from './animated-heading';
import { cn } from '@/lib/utils';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';

interface DashboardHeaderProps {
  className?: string;
  onProfileClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className, onProfileClick }) => {
  const { user, logout, loading } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleLogoClick = () => {
    router.push('/');
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
        {/* Mobile Layout - Only shows on screens smaller than 768px */}
        <div className="flex flex-col space-y-4 md:!hidden">
          {/* Mobile Row 1 - Centered Logo and App Name */}
          <div className="flex justify-center items-center">
            <div
              className="flex items-center space-x-3 cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLogoClick();
                }
              }}
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="TUIZ Logo"
                  width={70}
                  height={70}
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

          {/* Mobile Row 2 - Profile on left, Logout on right */}
          <div className="flex items-center justify-between">
            {/* Profile and Name - Left side */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="flex items-center space-x-2 px-3 py-2 h-11 rounded-xl hover:bg-accent/50 transition-all duration-200"
                title="Profile Settings"
              >
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center overflow-hidden shadow-sm">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={`${user.displayName || user.username || 'User'} avatar`}
                      width={36}
                      height={36}
                      priority
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
              </Button>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground leading-tight">
                  {user?.displayName || user?.username || 'User'}
                </span>
              </div>
            </div>

            {/* Logout Button - Right side */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 h-11 rounded-xl border-2 border-red-500/70 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 shadow-sm"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">
                {loading ? 'Logging out...' : 'ログアウト'}
              </span>
            </Button>
          </div>
        </div>

        {/* Desktop Layout - Only shows on screens 768px and larger */}
        <div className="!hidden md:!flex items-center justify-between min-h-[80px]">
          {/* Left side - Logo and App Name */}
          <div
            className="flex items-center space-x-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogoClick();
              }
            }}
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="TUIZ Logo"
                width={56}
                height={56}
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

          {/* Right side - Profile and Logout */}
          <div className="flex items-center space-x-6">
            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="flex items-center space-x-3 px-4 py-3 h-14 rounded-xl hover:bg-accent/50 transition-all duration-200"
                title="Profile Settings"
              >
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center overflow-hidden shadow-md">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={`${user.displayName || user.username || 'User'} avatar`}
                      width={44}
                      height={44}
                      priority
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold text-foreground leading-tight">
                    {user?.displayName || user?.username || 'User'}
                  </span>
                </div>
              </Button>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center space-x-3 px-6 py-3 h-14 rounded-xl border-2 border-red-500/70 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 shadow-md"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
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
