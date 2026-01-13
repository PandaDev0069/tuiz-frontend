// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-19
// Last Update : 2025-09-01
//
// Description:
// - Home page component for TUIZ platform
// - Landing page with features, login, and join options
// - Includes SEO structured data and keywords
//
// Notes:
// - Main entry point for the application
// - Provides links to dashboard (if logged in) or login
// - Includes TUIZ参加 (join game) functionality
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import { AiFillDashboard } from 'react-icons/ai';
import { IoLogoGameControllerB } from 'react-icons/io';
import { FaBolt, FaGraduationCap, FaLightbulb } from 'react-icons/fa';
import { MdSchool, MdColorLens } from 'react-icons/md';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import {
  Button,
  AnimatedHeading,
  PageContainer,
  Card,
  CardHeader,
  CardContent,
  Header,
  Main,
  Footer,
  Container,
} from '@/components/ui';
import { StructuredData, SEOKeywords } from '@/components/SEO';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { useAuthStore } from '@/state/useAuthStore';

//----------------------------------------------------
// 5. Main Component
//----------------------------------------------------
/**
 * Component: Page
 * Description:
 * - Home page component for TUIZ platform
 * - Landing page with features, login, and join options
 * - Includes SEO structured data and keywords
 */
export default function Page() {
  //----------------------------------------------------
  // 5.1. Setup & State
  //----------------------------------------------------
  const { user } = useAuthStore();

  //----------------------------------------------------
  // 5.2. Main Render
  //----------------------------------------------------
  return (
    <>
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="software" />
      <StructuredData type="quiz" />

      <SEOKeywords
        keywords={[
          'Quiz',
          'TUIZ',
          'TUIZ情報王',
          'TUIZ参加',
          'リアルタイムクイズ',
          'クイズ作成',
          'クイズ参加',
          '学習クイズアプリ',
          'インタラクティブクイズ',
        ]}
        description="対応機能"
      />

      <PageContainer entrance="fadeIn" className="min-h-screen flex flex-col">
        <Header>
          <Container size="sm">
            <div className="flex justify-center items-center mb-6">
              <Image
                src="/logo.png"
                alt="TUIZ情報王 ロゴ - リアルタイムクイズプラットフォーム"
                width={100}
                height={100}
                priority
                className="animate-float rounded-full"
              />
            </div>
            <AnimatedHeading size="2xl" animation="float" className="mb-6">
              TUIZ情報王
            </AnimatedHeading>
            <p className="text-lg text-gray-700 mb-4">
              リアルタイムでクイズを作成・参加できる革新的な学習プラットフォーム
            </p>
            <p className="text-base text-gray-600 mb-6">
              TUIZ参加で友達と一緒に楽しく学習しましょう！
            </p>
          </Container>
        </Header>

        <Main>
          <Container size="lg">
            <section className="mt-2" aria-labelledby="main-features">
              <h2 id="main-features" className="sr-only">
                メイン機能
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card
                  variant="glass"
                  className="text-center hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r  from-green-400 to-blue-600 flex items-center justify-center shadow-lg">
                      <AiFillDashboard size={28} className="text-white" />
                    </div>
                    <CardHeader>
                      <h3 className="text-xl font-semibold text-gray-800">ホストとしてログイン</h3>
                    </CardHeader>
                    <p className="text-gray-600 mb-6">クイズを作成・管理し、クイズを開始、ホスト</p>
                    {user ? (
                      <Link href="/dashboard" aria-label="ダッシュボードページへ移動">
                        <Button variant="gradient" size="tall" className="mx-auto px-12">
                          ダッシュボードへ
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/auth/login" aria-label="ログインページへ移動">
                        <Button variant="gradient" size="tall" className="mx-auto px-12">
                          ログイン
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>

                <Card
                  variant="glass"
                  className="text-center hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                      <IoLogoGameControllerB size={28} className="text-white" />
                    </div>
                    <CardHeader>
                      <h3 className="text-xl font-semibold text-gray-800">
                        TUIZ参加 - ゲームに参加
                      </h3>
                    </CardHeader>
                    <p className="text-gray-600 mb-6">ルームコードを入力してクイズゲームに参加</p>
                    <Link href="/join" aria-label="TUIZ参加・ゲーム参加ページへ移動">
                      <Button variant="gradient" size="tall" className="mx-auto px-12">
                        TUIZ参加
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mt-12" aria-labelledby="features">
              <h2 id="features" className="sr-only">
                プラットフォームの特徴
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card
                  variant="accent"
                  className="text-center hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                      <FaBolt size={28} className="text-white" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">リアルタイムクイズ</h4>
                    <p className="text-sm text-gray-600">瞬時に同期、TUIZ参加で楽しく対戦</p>
                  </CardContent>
                </Card>

                <Card
                  variant="success"
                  className="text-center hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                      <MdSchool size={28} className="text-white" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">学習クイズアプリ</h4>
                    <p className="text-sm text-gray-600">教育に最適、インタラクティブな体験</p>
                  </CardContent>
                </Card>

                <Card
                  variant="warning"
                  className="text-center hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
                      <MdColorLens size={28} className="text-white" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">クイズ作成</h4>
                    <p className="text-sm text-gray-600">魅力的なクイズを簡単に作成</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mt-16" aria-labelledby="platform-features">
              <h2
                id="platform-features"
                className="text-3xl font-bold text-center text-gray-800 mb-8"
              >
                プラットフォームの詳細機能
              </h2>
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-4">
                            <FaGraduationCap className="text-white text-xl" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800">TUIZ情報王とは</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          TUIZ情報王は、リアルタイムでクイズを作成・参加できる無料の学習プラットフォームです。
                          友達と一緒にTUIZ参加して、学びながら楽しむことができます。
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-4">
                            <FaLightbulb className="text-white text-xl" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800">主な特徴</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          リアルタイムクイズ作成、インタラクティブな参加体験、教育機関向け機能など、
                          様々な用途に対応した学習クイズアプリです。
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-4">
                            <FaBolt className="text-white text-xl" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800">利用シーン</h3>
                        </div>
                        <ul className="text-gray-700 space-y-2">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                            学校教育での学習支援
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                            企業研修での知識確認
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                            イベントでの参加者エンゲージメント
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                            友達との楽しい学習時間
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center mr-4">
                            <FaLightbulb className="text-white text-xl" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            プラットフォームの利点
                          </h3>
                        </div>
                        <ul className="text-gray-700 space-y-2">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                            無料で利用可能
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                            簡単セットアップ
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                            モバイル対応
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                            リアルタイム同期
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>
          </Container>
        </Main>

        <Footer>
          <Container size="lg">
            <div className="text-gray-600">
              <p>&copy; 2025 TUIZ情報王. All rights reserved.</p>
              <p className="text-sm">Next.js + Socket.IO • Real-time Quiz Platform</p>
              <a href="https://github.com/PandaDev0069/tuiz-frontend">Github</a>
            </div>
          </Container>
        </Footer>
      </PageContainer>
    </>
  );
}
