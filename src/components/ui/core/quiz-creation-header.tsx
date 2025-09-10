'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { AnimatedHeading } from './animated-heading';
import { cn } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import Image from 'next/image';

interface QuizCreationHeaderProps {
  className?: string;
  onProfileClick?: () => void;
  onSaveDraft?: () => void;
  isSaving?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export const QuizCreationHeader: React.FC<QuizCreationHeaderProps> = ({
  className,
  onSaveDraft,
  isSaving = false,
}) => {
  const router = useRouter();

  const handleReturnToDashboard = () => {
    router.push('/dashboard');
  };
  const handleLogoClick = () => {
    router.push('/');
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
        {/* Mobile Layout */}
        <div className="flex flex-col space-y-3 md:!hidden">
          {/* Mobile Row 1 - Logo and App Name */}
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
                  width={60}
                  height={60}
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

          {/* Mobile Row 2 - Return to Dashboard, Current Step, and Save Draft */}
          <div className="flex items-center justify-between px-2">
            <Button
              variant="gradient"
              size="sm"
              onClick={handleReturnToDashboard}
              className="flex items-center space-x-2 px-3 py-1.5 h-9 rounded-xl bg-gradient-to-r from-amber-400 to-blue-500 text-white hover:from-amber-500 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">ダッシュボード</span>
            </Button>
            {/* Save Draft Button - Right */}
            {onSaveDraft && (
              <Button
                variant="gradient2"
                size="sm"
                onClick={onSaveDraft}
                disabled={isSaving}
                className="flex items-center space-x-2 px-3 py-1.5 h-9 shadow-lg"
              >
                <Save className="h-4 w-4" />
                <span className="text-sm font-medium">{isSaving ? '保存中...' : '一時保存'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
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
          {/* Right side - Return to Dashboard, Save Draft, and Profile */}
          <div className="flex items-center space-x-4">
            <Button
              variant="gradient"
              size="sm"
              onClick={handleReturnToDashboard}
              className="flex items-center space-x-2 px-4 py-2 h-11 rounded-xl bg-gradient-to-r from-amber-400 to-blue-500 text-white hover:from-amber-500 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
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
                <Save className="h-4 w-4" />
                <span className="text-sm font-medium">{isSaving ? '保存中...' : '一時保存'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
