// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-09-11
//
// Description:
// - Login page component for host authentication
// - Handles user login with email and password
// - Supports remember me functionality
//
// Notes:
// - Uses auth store for authentication state
// - Supports credential saving for remember me
// - Redirects to dashboard or intended page on success
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { useState, useEffect } from 'react';
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
  RedirectLink,
  Container,
  Checkbox,
  AnimatedHeading,
  PageContainer,
  Footer,
} from '@/components/ui';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { useAuthStore } from '@/state/useAuthStore';
import { useUiStore } from '@/state/useUiStore';
import { credentialsService } from '@/lib/credentials';

//----------------------------------------------------
// 5. Main Component
//----------------------------------------------------
/**
 * Component: LoginPage
 * Description:
 * - Login page component for host authentication
 * - Handles user login with email and password
 * - Supports remember me functionality
 */
export default function LoginPage() {
  //----------------------------------------------------
  // 5.1. Setup & State
  //----------------------------------------------------
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const { setToast } = useUiStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');

  //----------------------------------------------------
  // 5.2. Effects
  //----------------------------------------------------
  useEffect(() => {
    const savedCredentials = credentialsService.getSavedCredentials();
    if (savedCredentials) {
      setFormData({
        email: savedCredentials.email,
        password: '',
      });
      setRememberMe(true);
    }
  }, []);

  //----------------------------------------------------
  // 5.3. Event Handlers
  //----------------------------------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (rememberMe) {
        credentialsService.saveCredentials(formData.email);
      } else {
        credentialsService.clearCredentials();
      }

      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: rememberMe,
      });

      setToast('ログインしました');

      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');

      if (redirectTo) {
        router.push(decodeURIComponent(redirectTo));
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : 'ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。',
      );
    }
  };

  //----------------------------------------------------
  // 5.4. Main Render
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
                alt="TUIZ情報王 ロゴ - ログイン・リアルタイムクイズ作成・管理"
                width={80}
                height={80}
                className="animate-float rounded-full"
                priority
              />
            </div>
            <AnimatedHeading size="lg" animation="float" className="mb-2">
              TUIZ情報王
            </AnimatedHeading>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ホストログイン</h2>
            <p className="text-gray-600">クイズを作成・管理するためにログインしてください</p>
          </div>

          <AuthCard variant="success" className="shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {generalError && <FormError message={generalError} />}

              <InputField
                label="メールアドレス"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                error={errors.email}
                required
              />

              <PasswordField
                label="パスワード"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="パスワードを入力"
                error={errors.password}
                required
              />

              <div className="flex items-center">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  label="次回からログイン情報を記憶する"
                  variant="accent"
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </Button>

              <RedirectLink
                text="アカウントをお持ちでない方は"
                linkText="新規登録"
                href="/auth/register"
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
