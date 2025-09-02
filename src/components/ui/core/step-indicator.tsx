'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ClipboardList, HelpCircle, Settings, Target, CheckCheck } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color:
    | 'emerald'
    | 'purple'
    | 'orange'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'teal'
    | 'cyan'
    | 'lime'
    | 'red'
    | 'pink'
    | 'indigo';
}

const steps: Step[] = [
  {
    id: 1,
    title: '基本情報',
    icon: ClipboardList,
    color: 'emerald',
  },
  {
    id: 2,
    title: '問題作成',
    icon: HelpCircle,
    color: 'purple',
  },
  {
    id: 3,
    title: '設定',
    icon: Settings,
    color: 'orange',
  },
  {
    id: 4,
    title: '確認・保存',
    icon: Target,
    color: 'success',
  },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, className }) => {
  // Color mapping function
  const getColorClasses = (color: string, isActive: boolean, isCompleted: boolean) => {
    const colorMap = {
      emerald: {
        active:
          'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-500 shadow-emerald-200',
        completed:
          'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-500',
        inactive: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 border-gray-300',
        text: {
          active: 'text-emerald-600',
          completed: 'text-emerald-600',
          inactive: 'text-gray-500',
        },
        icon: {
          active: 'text-emerald-600',
          inactive: 'text-emerald-400',
        },
        connector: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
      },
      purple: {
        active:
          'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 border-purple-500 shadow-purple-200',
        completed: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-500',
        inactive:
          'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-400 border-purple-300 shadow-purple-100',
        text: {
          active: 'text-purple-600',
          completed: 'text-purple-600',
          inactive: 'text-purple-500',
        },
        icon: {
          active: 'text-purple-600',
          inactive: 'text-purple-500',
        },
        connector: 'bg-gradient-to-r from-purple-400 to-purple-500',
      },
      orange: {
        active:
          'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 border-orange-500 shadow-orange-200',
        completed: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-500',
        inactive:
          'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-400 border-orange-300 shadow-orange-100',
        text: {
          active: 'text-orange-600',
          completed: 'text-orange-600',
          inactive: 'text-orange-500',
        },
        icon: {
          active: 'text-orange-600',
          inactive: 'text-orange-400',
        },
        connector: 'bg-gradient-to-r from-orange-400 to-orange-500',
      },
      success: {
        active:
          'bg-gradient-to-br from-success-bg to-success-light/20 text-success border-success shadow-success/20',
        completed: 'bg-gradient-to-br from-success to-success-light text-white border-success',
        inactive:
          'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-400 border-emerald-300 shadow-emerald-100',
        text: {
          active: 'text-success',
          completed: 'text-success',
          inactive: 'text-emerald-500',
        },
        icon: {
          active: 'text-success',
          inactive: 'text-emerald-500',
        },
        connector: 'bg-gradient-to-r from-success to-success-light',
      },
    };

    const colors = colorMap[color as keyof typeof colorMap] || colorMap.emerald;

    if (isActive) {
      return {
        circle: colors.active,
        text: colors.text.active,
        icon: colors.icon.active,
        connector: colors.connector,
      };
    } else if (isCompleted) {
      return {
        circle: colors.completed,
        text: colors.text.completed,
        icon: colors.icon.active,
        connector: colors.connector,
      };
    } else {
      return {
        circle: colors.inactive,
        text: colors.text.inactive,
        icon: colors.icon.inactive,
        connector: 'bg-gradient-to-r from-gray-200 to-gray-300',
      };
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">クイズ作成</h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
            新しいクイズを作成して、学習者に素晴らしい体験を提供しましょう
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-3 sm:mb-4">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isLast = index === steps.length - 1;
            const colors = getColorClasses(step.color, isActive, isCompleted);

            return (
              <React.Fragment key={step.id}>
                {/* Step Circle */}
                <div className="flex flex-col items-center relative">
                  <div
                    className={cn(
                      'w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300',
                      'border-2 font-semibold text-xs sm:text-sm shadow-lg',
                      colors.circle,
                    )}
                  >
                    {isCompleted ? (
                      <CheckCheck
                        className={cn(
                          'w-4 h-4 sm:w-5 sm:h-5 text-white transition-all duration-300 drop-shadow-sm',
                        )}
                      />
                    ) : (
                      <step.icon
                        className={cn(
                          'w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 drop-shadow-sm',
                          colors.icon,
                        )}
                      />
                    )}
                  </div>

                  {/* Step Title */}
                  <span
                    className={cn(
                      'mt-1 sm:mt-2 text-[10px] sm:text-xs font-semibold text-center transition-all duration-300',
                      'max-w-[60px] sm:max-w-[80px] leading-tight',
                      colors.text,
                    )}
                  >
                    {step.title}
                  </span>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 mx-2 sm:mx-3">
                    <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full relative overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-700 ease-out rounded-full',
                          colors.connector,
                          isCompleted ? 'w-full' : 'w-0',
                        )}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
