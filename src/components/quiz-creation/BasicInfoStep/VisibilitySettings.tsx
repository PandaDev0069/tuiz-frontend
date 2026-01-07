// ====================================================
// File Name   : VisibilitySettings.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-03
// Last Update : 2025-09-03
//
// Description:
// - Visibility settings component for quiz creation
// - Allows users to toggle quiz visibility (public/private)
// - Displays appropriate icon and label based on visibility state
// - Uses Switch component for toggle functionality
//
// Notes:
// - Client component (no 'use client' needed as parent handles it)
// - Uses conditional rendering for icon and label based on visibility
// - Implements responsive design for mobile and desktop
// ====================================================

import React from 'react';
import { Lock, Globe } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
} from '@/components/ui';
import { CreateQuizSetForm } from '@/types/quiz';
import { cn } from '@/lib/utils';

const DEFAULT_IS_PUBLIC = false;

const FORM_FIELD_IS_PUBLIC = 'is_public';

const LABEL_VARIANT_SUCCESS = 'success';
const LABEL_VARIANT_DEFAULT = 'default';
const SWITCH_VARIANT_SUCCESS = 'success';
const SWITCH_VARIANT_DEFAULT = 'default';

const ICON_SIZE_SMALL = 'w-4 h-4';
const ICON_COLOR_PUBLIC = 'text-green-600';
const ICON_COLOR_PRIVATE = 'text-gray-600';

interface VisibilitySettingsProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
}

/**
 * Component: VisibilitySettings
 * Description:
 * - Manages quiz visibility settings (public/private)
 * - Displays appropriate icon (Globe for public, Lock for private)
 * - Shows toggle switch to change visibility state
 * - Updates form data when visibility is changed
 *
 * Parameters:
 * - formData (Partial<CreateQuizSetForm>): Current form data including visibility state
 * - onFormDataChange (function): Callback function when form data changes
 *
 * Returns:
 * - React.ReactElement: The visibility settings component
 *
 * Example:
 * ```tsx
 * <VisibilitySettings
 *   formData={formData}
 *   onFormDataChange={(data) => setFormData(data)}
 * />
 * ```
 */
export const VisibilitySettings: React.FC<VisibilitySettingsProps> = ({
  formData,
  onFormDataChange,
}) => {
  const handleInputChange = (field: keyof CreateQuizSetForm, value: boolean) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const isPublic = formData.is_public || DEFAULT_IS_PUBLIC;
  const labelVariant = isPublic ? LABEL_VARIANT_SUCCESS : LABEL_VARIANT_DEFAULT;
  const switchVariant = isPublic ? SWITCH_VARIANT_SUCCESS : SWITCH_VARIANT_DEFAULT;

  return (
    <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
      <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
          {isPublic ? (
            <Globe className={cn(ICON_SIZE_SMALL, 'md:w-5 md:h-5', ICON_COLOR_PUBLIC)} />
          ) : (
            <Lock className={cn(ICON_SIZE_SMALL, 'md:w-5 md:h-5', ICON_COLOR_PRIVATE)} />
          )}
          公開設定
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          クイズの公開範囲を設定してください
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 md:px-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor={FORM_FIELD_IS_PUBLIC} variant={labelVariant}>
                {isPublic ? '公開' : '非公開'}
              </Label>
              <p className="text-xs text-gray-500">
                {isPublic ? '誰でもクイズに参加できます' : 'あなただけがアクセスできます'}
              </p>
            </div>
            <Switch
              id={FORM_FIELD_IS_PUBLIC}
              checked={isPublic}
              onCheckedChange={(checked) => handleInputChange(FORM_FIELD_IS_PUBLIC, checked)}
              variant={switchVariant}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
