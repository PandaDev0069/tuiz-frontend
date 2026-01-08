// ====================================================
// File Name   : quiz-creation-header.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-31
// Last Update : 2025-09-03
//
// Description:
// - Quiz creation header component with logo, navigation, and save draft
// - Responsive design with separate mobile and desktop layouts
// - Provides navigation to dashboard and draft saving functionality
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Next.js Image component for optimized images
// - Supports keyboard navigation for accessibility
// ====================================================

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { AnimatedHeading } from './animated-heading';
import { cn } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import Image from 'next/image';

const LOGO_PATH = '/logo.png';
const DASHBOARD_PATH = '/dashboard';
const HOME_PATH = '/';

const MOBILE_LOGO_SIZE = 60;
const DESKTOP_LOGO_SIZE = 56;

const KEYBOARD_ENTER = 'Enter';
const KEYBOARD_SPACE = ' ';

const DEFAULT_IS_SAVING = false;

interface QuizCreationHeaderProps {
  className?: string;
  onProfileClick?: () => void;
  onSaveDraft?: () => void;
  isSaving?: boolean;
  currentStep?: number;
  totalSteps?: number;
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
 * Component: QuizCreationHeader
 * Description:
 * - Quiz creation header component with responsive design
 * - Displays logo, navigation buttons, and save draft functionality
 * - Provides separate mobile and desktop layouts
 * - Supports keyboard navigation for accessibility
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - onProfileClick (() => void, optional): Callback for profile button click
 * - onSaveDraft (() => void, optional): Callback for save draft button click
 * - isSaving (boolean, optional): Whether draft is being saved (default: false)
 * - currentStep (number, optional): Current step number
 * - totalSteps (number, optional): Total number of steps
 *
 * Returns:
 * - React.ReactElement: The quiz creation header component
 *
 * Example:
 * ```tsx
 * <QuizCreationHeader
 *   onSaveDraft={() => handleSave()}
 *   isSaving={isSaving}
 * />
 * ```
 */
export const QuizCreationHeader: React.FC<QuizCreationHeaderProps> = ({
  className,
  onSaveDraft,
  isSaving = DEFAULT_IS_SAVING,
}) => {
  const router = useRouter();

  const handleReturnToDashboard = (): void => {
    router.push(DASHBOARD_PATH);
  };

  const handleLogoClick = (): void => {
    router.push(HOME_PATH);
  };

  return (
    <header
      className={cn(
        'w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-b border-border/40',
        className,
      )}
    >
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-3 md:!hidden">
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

          <div className="flex items-center justify-between px-2">
            <Button
              variant="gradient"
              size="sm"
              onClick={handleReturnToDashboard}
              className="flex items-center space-x-2 px-3 py-1.5 h-9 rounded-xl bg-gradient-to-r from-amber-400 to-blue-500 text-white hover:from-amber-500 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className={cn('h-4 w-4')} />
              <span className="text-sm font-medium">ダッシュボード</span>
            </Button>
            {onSaveDraft && (
              <Button
                variant="gradient2"
                size="sm"
                onClick={onSaveDraft}
                disabled={isSaving}
                className="flex items-center space-x-2 px-3 py-1.5 h-9 shadow-lg"
              >
                <Save className={cn('h-4 w-4')} />
                <span className="text-sm font-medium">{isSaving ? '保存中...' : '一時保存'}</span>
              </Button>
            )}
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
          <div className="flex items-center space-x-4">
            <Button
              variant="gradient"
              size="sm"
              onClick={handleReturnToDashboard}
              className="flex items-center space-x-2 px-4 py-2 h-11 rounded-xl bg-gradient-to-r from-amber-400 to-blue-500 text-white hover:from-amber-500 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className={cn('h-4 w-4')} />
              <span className="text-sm font-medium">ダッシュボード</span>
            </Button>

            {onSaveDraft && (
              <Button
                variant="gradient2"
                size="sm"
                onClick={onSaveDraft}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 h-11 shadow-lg"
              >
                <Save className={cn('h-4 w-4')} />
                <span className="text-sm font-medium">{isSaving ? '保存中...' : '一時保存'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
