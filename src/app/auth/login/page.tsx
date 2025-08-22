'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/state/useAuthStore';
import { useUiStore } from '@/state/useUiStore';
import { credentialsService } from '@/lib/credentials';
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
} from '@/components/ui';

/**
 * Login page component
 * - Tailwind CSS for styling
 * - React Hook Form for form handling
 * @returns JSX.Element
 */

export default function LoginPage() {
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

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = credentialsService.getSavedCredentials();
    if (savedCredentials) {
      setFormData({
        email: savedCredentials.email,
        password: '',
      });
      setRememberMe(true); // Auto-check remember me if credentials were saved
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
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

    // Basic validation
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
      // Save credentials (email only) if "Remember Me" is checked
      if (rememberMe) {
        credentialsService.saveCredentials(formData.email);
      } else {
        // Clear any previously saved credentials if user unchecks remember me
        credentialsService.clearCredentials();
      }

      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: rememberMe,
      });

      // Success - redirect to dashboard
      setToast('ログインしました');
      router.push('/dashboard');
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : 'ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。',
      );
    }
  };

  return (
    <PageContainer
      entrance="scaleIn"
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <main role="main">
        <Container size="sm" className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <AnimatedHeading size="lg" animation="float" className="mb-2">
              TUIZ情報王
            </AnimatedHeading>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ホストログイン</h2>
            <p className="text-gray-600">クイズを作成・管理するためにログインしてください</p>
          </div>

          <AuthCard variant="success" className="shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* General Error */}
              {generalError && <FormError message={generalError} />}

              {/* Email Field */}
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

              {/* Password Field */}
              <PasswordField
                label="パスワード"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="パスワードを入力"
                error={errors.password}
                required
              />

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  label="次回からログイン情報を記憶する"
                  variant="accent"
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </Button>

              {/* Register Link */}
              <RedirectLink
                text="アカウントをお持ちでない方は"
                linkText="新規登録"
                href="/auth/register"
                variant="primary"
                className="mt-6"
              />
            </form>
          </AuthCard>

          {/* Back to Home Link */}
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
    </PageContainer>
  );
}
