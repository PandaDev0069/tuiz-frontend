// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-26
//
// Description:
// - Registration page component for new account creation
// - Handles user registration with email, username, display name, and password
// - Includes form validation and error handling
//
// Notes:
// - Uses auth store for registration state
// - Supports username as display name option
// - Redirects to dashboard on success
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
// (No external libraries needed)

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import {
  AuthCard,
  InputField,
  PasswordField,
  Button,
  FormError,
  FormSuccess,
  RedirectLink,
  Container,
  Checkbox,
  ValidationMessage,
  AnimatedHeading,
  PageContainer,
  Footer,
} from '@/components/ui';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { useAuthStore } from '@/state/useAuthStore';
import { useUiStore } from '@/state/useUiStore';

//----------------------------------------------------
// 5. Main Component
//----------------------------------------------------
/**
 * Component: RegisterPage
 * Description:
 * - Registration page component for new account creation
 * - Handles user registration with email, username, display name, and password
 * - Includes form validation and error handling
 */
export default function RegisterPage() {
  //----------------------------------------------------
  // 5.1. Setup & State
  //----------------------------------------------------
  const router = useRouter();
  const { register, loading } = useAuthStore();
  const { setToast } = useUiStore();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [useUsernameAsDisplayName, setUseUsernameAsDisplayName] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  //----------------------------------------------------
  // 5.2. Event Handlers
  //----------------------------------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      if (name === 'username' && useUsernameAsDisplayName) {
        newData.displayName = value;
      }

      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleUsernameAsDisplayNameChange = (checked: boolean) => {
    setUseUsernameAsDisplayName(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        displayName: prev.username,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.username) {
      newErrors.username = 'ユーザー名を入力してください';
    } else if (formData.username.length < 3) {
      newErrors.username = '3文字以上で入力してください';
    } else if (formData.username.length > 20) {
      newErrors.username = '20文字以下で入力してください';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '英数字とアンダースコアのみ使用可能です';
    }

    if (!formData.displayName) {
      newErrors.displayName = '表示名を入力してください';
    } else if (formData.displayName.length < 1 || formData.displayName.length > 50) {
      newErrors.displayName = '表示名は1-50文字で入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワード確認を入力してください';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        username: formData.username || undefined,
        displayName: formData.displayName || undefined,
      });

      setSuccessMessage('アカウントが正常に作成されました！ダッシュボードに移動します...');
      setToast('アカウントを作成しました');

      setFormData({
        email: '',
        username: '',
        displayName: '',
        password: '',
        confirmPassword: '',
      });
      setUseUsernameAsDisplayName(false);
      setErrors({});

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : 'アカウント作成に失敗しました。しばらく時間をおいて再度お試しください。',
      );
    }
  };

  //----------------------------------------------------
  // 5.3. Main Render
  //----------------------------------------------------
  return (
    <PageContainer
      entrance="scaleIn"
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <main role="main">
        <Container size="sm" className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <Image
                src="/logo.png"
                alt="logo"
                width={80}
                height={80}
                className="animate-float rounded-full"
                priority
              />
            </div>
            <AnimatedHeading size="lg" animation="float" className="mb-2">
              TUIZ情報王
            </AnimatedHeading>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">新規アカウント作成</h2>
            <p className="text-gray-600">クイズ作成・管理のためのアカウントを作成しましょう</p>
          </div>

          <AuthCard variant="success" className="shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {generalError && <FormError message={generalError} />}

              {successMessage && <FormSuccess message={successMessage} />}

              <InputField
                label="メールアドレス"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="例: user@example.com"
                error={errors.email}
                required
              />

              <div className="space-y-1">
                <InputField
                  label="ユーザー名"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="例: tanaka_taro"
                  error={errors.username}
                  required
                />
                <ValidationMessage
                  variant="info"
                  message="3-20文字、英数字とアンダースコアのみ"
                  size="sm"
                />
              </div>

              <div className="space-y-2">
                <InputField
                  label="表示名"
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="例: 田中太郎"
                  error={errors.displayName}
                  disabled={useUsernameAsDisplayName}
                  required
                />
                <Checkbox
                  id="useUsernameAsDisplayName"
                  checked={useUsernameAsDisplayName}
                  onChange={(e) => handleUsernameAsDisplayNameChange(e.target.checked)}
                  label="ユーザー名を表示名として使用"
                  variant="accent"
                />
              </div>

              <div className="space-y-1">
                <PasswordField
                  label="パスワード"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="6文字以上のパスワード"
                  error={errors.password}
                  required
                />
                <ValidationMessage variant="info" message="6文字以上のパスワード" size="sm" />
              </div>

              <PasswordField
                label="パスワード確認"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="パスワードを再入力"
                error={errors.confirmPassword}
                required
              />

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {loading ? '作成中...' : 'アカウント作成'}
              </Button>

              <RedirectLink
                text="既にアカウントをお持ちの方は"
                linkText="ログイン"
                href="/auth/login"
                variant="primary"
                className="mt-6"
              />
            </form>
          </AuthCard>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← ホームに戻る
            </Link>
          </div>
        </Container>
      </main>

      <Footer>
        <Container size="lg">
          <div className="text-gray-600">
            <p>&copy; 2025 TUIZ情報王. All rights reserved.</p>
            <p className="text-sm">Next.js + Socket.IO • Real-time Quiz Platform</p>
          </div>
        </Container>
      </Footer>
    </PageContainer>
  );
}
