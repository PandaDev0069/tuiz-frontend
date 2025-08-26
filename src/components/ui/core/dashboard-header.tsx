'use client';

import React from 'react';
import { useAuthStore } from '@/state/useAuthStore';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';

interface DashboardHeaderProps {
  className?: string;
  onProfileClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className, onProfileClick }) => {
  const { user, logout, loading } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout failed
      window.location.href = '/';
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header
      className={cn(
        'w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-b border-border/40',
        'sticky top-0 z-50',
        className,
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and App Name */}
          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="TUIZ Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground leading-tight">TUIZ</h1>
              <span className="text-xs text-muted-foreground leading-tight">Quiz Platform</span>
            </div>
          </div>

          {/* Right side - Profile and Logout */}
          <div className="flex items-center space-x-3">
            {/* Profile Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfileClick}
              className="flex items-center space-x-2 px-3 py-2 h-10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Profile Settings"
            >
              <div className="relative w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={`${user.displayName || user.username || 'User'} avatar`}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-primary">{getUserInitials()}</span>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-medium">
                {user?.displayName || user?.username || 'User'}
              </span>
              <User className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 h-10 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">
                {loading ? 'Logging out...' : 'Logout'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
