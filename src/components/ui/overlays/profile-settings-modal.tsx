'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../core/button';
import { Card, CardHeader, CardTitle, CardContent } from '../core/card';
import { Input } from '../forms/input';
import { Text } from '../core/typography';
import { cn } from '@/lib/utils';
import { X, Upload, User, Mail, Edit3, Save, Camera } from 'lucide-react';
import Image from 'next/image';

export interface ProfileData {
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
}

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSave?: (profile: ProfileData) => void;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileSettingsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(profile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData((prev) => ({ ...prev, avatarUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setAvatarPreview(profile.avatarUrl || null);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="relative bg-gradient-to-br from-purple-300 via-purple-500 to-blue-700 shadow-2xl border-0">
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">プロフィール設定</CardTitle>
                <Text className="text-muted-foreground">アカウント情報を管理</Text>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div
                  className={cn(
                    'w-24 h-24 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center',
                    avatarPreview ? 'border-primary/20' : 'border-dashed',
                  )}
                >
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="プロフィールアバター"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  アップロード
                </Button>
                {avatarPreview && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setAvatarPreview(null);
                      setFormData((prev) => ({ ...prev, avatarUrl: undefined }));
                    }}
                    className="text-destructive hover:text-destructive bg-red-500/80 hover:bg-red-800/90"
                  >
                    削除
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">ユーザー名</label>
                  {isEditing ? (
                    <Input
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="ユーザー名を入力"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md border">
                      <Text className="font-medium">{formData.username}</Text>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">表示名</label>
                  {isEditing ? (
                    <Input
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="表示名を入力"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md border">
                      <Text className="font-medium">{formData.displayName}</Text>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  メールアドレス
                </label>
                <div className="p-3 bg-muted rounded-md border">
                  <Text className="font-medium">{formData.email}</Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    メールアドレスは変更できません
                  </Text>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    キャンセル
                  </Button>
                  <Button
                    variant="gradient2"
                    onClick={handleSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    保存
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={onClose}>
                    閉じる
                  </Button>
                  <Button
                    variant="gradient2"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    編集
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
