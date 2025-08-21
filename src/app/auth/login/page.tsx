'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from '@/ui';

/**
 * Login page component
 * - Tailwind CSS for styling
 * - React Hook Form for form handling
 * @returns JSX.Element
 */

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

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

    setIsLoading(true);

    try {
      // TODO: Implement actual login logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Login attempt:', { ...formData, rememberMe });

      // For demo - simulate error
      setGeneralError('ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。');
    } catch {
      setGeneralError('ログインに失敗しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
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
                  label="ログイン状態を保持する"
                  variant="accent"
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                loading={isLoading}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
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
