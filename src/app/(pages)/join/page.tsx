// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-23
// Last Update : 2025-09-23
//
// Description:
// - Join page component for players to enter game
// - Collects player name and room code
// - Validates input and redirects to waiting room
//
// Notes:
// - Form validation for name and 6-digit room code
// - Redirects to waiting room with query parameters
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import { FaUser } from 'react-icons/fa';
import { MdPin } from 'react-icons/md';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import {
  PageContainer,
  Header,
  Footer,
  Container,
  AnimatedHeading,
  InputField,
  Button,
  Text,
  AuthCard,
} from '@/components/ui';

//----------------------------------------------------
// 4. Main Component
//----------------------------------------------------
/**
 * Component: JoinPage
 * Description:
 * - Join page component for players to enter game
 * - Collects player name and room code
 * - Validates input and redirects to waiting room
 */
export default function Page() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [touched, setTouched] = React.useState({ name: false, code: false });

  const nameId = React.useId();
  const codeId = React.useId();

  const nameError = React.useMemo(() => {
    const v = name.trim();
    if (!touched.name) return '';
    if (v.length === 0) return '名前を入力してください。';
    if (v.length < 1) return '名前は1文字以上で入力してください。';
    if (/[<>]/.test(v)) return '無効な文字が含まれています。';
    return '';
  }, [name, touched.name]);

  const codeError = React.useMemo(() => {
    if (!touched.code) return '';
    if (!/^[0-9]{6}$/.test(code)) return 'コードは6桁の数字で入力してください。';
    return '';
  }, [code, touched.code]);

  const isFormValid =
    !nameError && !codeError && name.trim().length >= 1 && /^[0-9]{6}$/.test(code);

  return (
    <PageContainer
      entrance="scaleIn"
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <Header>
        <Container size="sm">
          <div className="flex justify-center items-center mb-6">
            <Image
              src="/logo.png"
              alt="TUIZ情報王 ロゴ - TUIZ参加・クイズゲーム参加"
              width={80}
              height={80}
              priority
              className="animate-float rounded-full"
            />
          </div>
          <AnimatedHeading size="md" animation="float" className="mb-6">
            TUIZ情報王
          </AnimatedHeading>
          <Text weight="bold" className="text-2xl text-cyan-500">
            こんにちは！
          </Text>
          <Text weight="semibold" variant="accent" size="lg" className=" text-cyan-500">
            ルームに参加するには、以下に名前と6桁のルームコードを入力してください。
          </Text>
        </Container>
      </Header>

      <main role="main">
        <Container size="sm" className="w-full max-w-md mx-auto">
          <AuthCard variant="success" className="shadow-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isFormValid) {
                  router.push(`/waiting-room?name=${encodeURIComponent(name.trim())}&code=${code}`);
                } else {
                  setTouched({ name: true, code: true });
                }
              }}
              className="space-y-4"
              noValidate
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <FaUser size={28} className="text-white" />
                </div>
                <label htmlFor={`${nameId}-name`} className="text-sm font-medium">
                  名前
                </label>
              </div>
              <InputField
                id={`${nameId}-name`}
                placeholder="あなたの名前"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((s) => ({ ...s, name: true }))}
                error={nameError || undefined}
                required
              />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <MdPin size={28} className="text-white" />
                </div>
                <label htmlFor={`${codeId}-code`} className="text-sm font-medium">
                  ルームコード
                </label>
              </div>
              <InputField
                id={`${codeId}-code`}
                placeholder="123456"
                value={code}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, '');
                  setCode(digits.slice(0, 6));
                }}
                onBlur={() => setTouched((s) => ({ ...s, code: true }))}
                error={codeError || undefined}
                required
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
              />
              <div className="text-center">
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  variant="gradient"
                  size="tall"
                  className="mx-auto px-12"
                >
                  TUIZ参加する
                </Button>
              </div>
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
