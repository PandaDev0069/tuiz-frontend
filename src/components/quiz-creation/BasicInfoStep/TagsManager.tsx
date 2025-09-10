import React, { useState } from 'react';
import { CreateQuizSetForm } from '@/types/quiz';
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
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

interface TagsManagerProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
}

export const TagsManager: React.FC<TagsManagerProps> = ({ formData, onFormDataChange }) => {
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof CreateQuizSetForm, value: string[]) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter((tag) => tag !== tagToRemove) || []);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
              type="button"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1 text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
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
