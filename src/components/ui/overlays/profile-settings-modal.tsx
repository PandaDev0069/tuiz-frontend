'use client';

import React, { useState, useRef, useEffect } from 'react';
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

  // Update form data when profile prop changes
  useEffect(() => {
    setFormData(profile);
    setAvatarPreview(profile.avatarUrl || null);
  }, [profile]);

  // Check if there are any changes
  const hasChanges = JSON.stringify(profile) !== JSON.stringify(formData);

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
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 px-4 sm:px-0 max-h-[90vh] overflow-y-auto">
        <Card className="relative bg-gradient-to-br from-rose-200 via-purple-300 to-indigo-400 shadow-2xl border-0">
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-200 to-pink-300 rounded-lg shadow-md">
                <User className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800 font-bold">プロフィール設定</CardTitle>
                <Text className="text-gray-700 font-medium">アカウント情報を管理</Text>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 bg-gradient-to-br from-red-200 to-pink-300 hover:from-red-300 hover:to-pink-400 text-red-700 hover:text-red-800 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-4 sm:px-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div
                  className={cn(
                    'w-24 h-24 rounded-full overflow-hidden border-4 bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 flex items-center justify-center shadow-lg',
                    avatarPreview
                      ? 'border-gradient-to-r from-emerald-400 to-cyan-500'
                      : 'border-dashed border-pink-400',
                  )}
                >
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="プロフィールアバター"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="h-12 w-12 text-purple-600" />
                  )}
                </div>

                {/* Upload overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/60 to-pink-600/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full w-full text-yellow-200 hover:bg-gradient-to-br hover:from-orange-400/30 hover:to-yellow-400/30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-full w-full " />
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
                  className="flex items-center gap-2 border-2 border-cyan-400 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 hover:from-cyan-200 hover:to-blue-200 hover:border-cyan-500 transition-all duration-200 shadow-md"
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
                    className="text-red-700 hover:text-red-800 bg-gradient-to-r from-red-200 to-pink-200 hover:from-red-300 hover:to-pink-300 border-2 border-red-400 hover:border-red-500 shadow-md"
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
                  <label className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    ユーザー名
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="ユーザー名を入力"
                      className="border-2 border-blue-400 bg-gradient-to-r from-blue-100 to-cyan-100 text-gray-800 placeholder:text-blue-500 transition-all duration-200 shadow-md"
                    />
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-150 rounded-lg border-2 border-blue-300 shadow-md">
                      <Text className="font-semibold text-blue-800">{formData.username}</Text>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    表示名
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="表示名を入力"
                      className="border-2 border-green-400 bg-gradient-to-r from-green-100 to-emerald-100 text-gray-800 placeholder:text-green-500 transition-all duration-200 shadow-md"
                    />
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-150 rounded-lg border-2 border-green-300 shadow-md">
                      <Text className="font-semibold text-green-800">{formData.displayName}</Text>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  メールアドレス
                </label>
                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300 shadow-md">
                  <Text className="font-semibold text-purple-800">{formData.email}</Text>
                  <Text className="text-sm text-purple-700 mt-1">
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
              ) : hasChanges ? (
                <>
                  <Button variant="outline" onClick={onClose}>
                    閉じる
                  </Button>
                  <Button
                    variant="gradient2"
                    onClick={handleSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    変更を保存
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
