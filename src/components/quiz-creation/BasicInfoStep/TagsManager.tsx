// ====================================================
// File Name   : TagsManager.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-03
// Last Update : 2025-09-03
//
// Description:
// - Tag management component for quiz creation
// - Allows users to add and remove tags for quizzes
// - Supports keyboard input (Enter key) for adding tags
// - Displays tags as removable badges
//
// Notes:
// - Client component (no 'use client' needed as parent handles it)
// - Prevents duplicate tags
// - Trims whitespace from tag input
// ====================================================

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
} from '@/components/ui';
import { CreateQuizSetForm } from '@/types/quiz';
import { cn } from '@/lib/utils';

const DEFAULT_NEW_TAG = '';

const FORM_FIELD_TAGS = 'tags';

const KEY_ENTER = 'Enter';

const BUTTON_TYPE_BUTTON = 'button';
const BUTTON_SIZE_SM = 'sm';
const BUTTON_VARIANT_OUTLINE = 'outline';
const BADGE_VARIANT_SECONDARY = 'secondary';

const ICON_SIZE_SMALL = 'w-4 h-4';
const ICON_SIZE_XSMALL = 'w-3 h-3';

interface TagsManagerProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
}

/**
 * Component: TagsManager
 * Description:
 * - Manages tag input and display for quiz creation
 * - Provides input field with add button for creating new tags
 * - Displays existing tags as removable badges
 * - Handles keyboard events (Enter key) for quick tag addition
 * - Prevents duplicate tags and trims whitespace
 *
 * Parameters:
 * - formData (Partial<CreateQuizSetForm>): Current form data including tags array
 * - onFormDataChange (function): Callback function when form data changes
 *
 * Returns:
 * - React.ReactElement: The tags manager component
 *
 * Example:
 * ```tsx
 * <TagsManager
 *   formData={formData}
 *   onFormDataChange={(data) => setFormData(data)}
 * />
 * ```
 */
export const TagsManager: React.FC<TagsManagerProps> = ({ formData, onFormDataChange }) => {
  const [newTag, setNewTag] = useState(DEFAULT_NEW_TAG);

  const handleInputChange = (field: keyof CreateQuizSetForm, value: string[]) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      handleInputChange(FORM_FIELD_TAGS, [...(formData.tags || []), trimmedTag]);
      setNewTag(DEFAULT_NEW_TAG);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange(FORM_FIELD_TAGS, formData.tags?.filter((tag) => tag !== tagToRemove) || []);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === KEY_ENTER) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
      <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
        <CardTitle className="text-sm md:text-base">タグ</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          クイズのタグを追加してください
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 px-3 md:px-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="タグを入力"
              value={newTag}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
              onKeyDown={handleKeyPress}
              className={cn(
                'flex-1 border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-300',
              )}
            />
            <Button
              type={BUTTON_TYPE_BUTTON}
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              size={BUTTON_SIZE_SM}
              variant={BUTTON_VARIANT_OUTLINE}
            >
              <Plus className={ICON_SIZE_SMALL} />
            </Button>
          </div>

          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant={BADGE_VARIANT_SECONDARY}
                  className="flex items-center gap-1 px-2 py-1 text-xs"
                >
                  {tag}
                  <button
                    type={BUTTON_TYPE_BUTTON}
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className={ICON_SIZE_XSMALL} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
