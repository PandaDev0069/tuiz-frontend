'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/state/useAuthStore';
import { useUiStore } from '@/state/useUiStore';
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

/**
 * Register page component
 * - Account creation form with validation
 * - Email, username, display name, password fields
 * - Form validation and error handling
 * @returns JSX.Element
 */

export default function RegisterPage() {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // If "use username as display name" is checked, sync display name
      if (name === 'username' && useUsernameAsDisplayName) {
        newData.displayName = value;
      }

      return newData;
    });

    // Clear error when user starts typing
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

    // Email validation
    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'ユーザー名を入力してください';
    } else if (formData.username.length < 3) {
      newErrors.username = '3文字以上で入力してください';
    } else if (formData.username.length > 20) {
      newErrors.username = '20文字以下で入力してください';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '英数字とアンダースコアのみ使用可能です';
    }

    // Display name validation
    if (!formData.displayName) {
      newErrors.displayName = '表示名を入力してください';
    } else if (formData.displayName.length < 1 || formData.displayName.length > 50) {
      newErrors.displayName = '表示名は1-50文字で入力してください';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    // Confirm password validation
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

      // Success - show message and redirect
      setSuccessMessage('アカウントが正常に作成されました！ダッシュボードに移動します...');
      setToast('アカウントを作成しました');

      // Reset form
      setFormData({
        email: '',
        username: '',
        displayName: '',
        password: '',
        confirmPassword: '',
      });
      setUseUsernameAsDisplayName(false);
      setErrors({});

      // Redirect after success
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

  return (
    <PageContainer
      entrance="scaleIn"
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <main role="main">
        <Container size="sm" className="w-full max-w-md mx-auto">
          {/* Header */}
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
            <p className="text-gray-600">クイズ作成・管理のためのアカウントを作成</p>
          </div>

          <AuthCard variant="success" className="shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* General Error */}
              {generalError && <FormError message={generalError} />}

              {/* Success Message */}
              {successMessage && <FormSuccess message={successMessage} />}

              {/* Email Field */}
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

              {/* Username Field */}
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

              {/* Display Name Field */}
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

              {/* Password Field */}
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

              {/* Confirm Password Field */}
              <PasswordField
                label="パスワード確認"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="パスワードを再入力"
                error={errors.confirmPassword}
                required
              />

              {/* Register Button */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {loading ? '作成中...' : 'アカウント作成'}
              </Button>

              {/* Login Link */}
              <RedirectLink
                text="既にアカウントをお持ちの方は"
                linkText="ログイン"
                href="/auth/login"
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
