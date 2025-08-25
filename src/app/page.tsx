'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/state/useAuthStore';
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
import { StructuredData } from '@/components/SEO';
import { AiFillDashboard } from 'react-icons/ai';
import { IoLogoGameControllerB } from 'react-icons/io';
import { FaBolt } from 'react-icons/fa6';
import { MdSchool, MdColorLens } from 'react-icons/md';

export default function Page() {
  const { user } = useAuthStore();

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="software" />

      <PageContainer entrance="fadeIn" className="min-h-screen flex flex-col">
        <Header>
          <Container size="sm">
            <div className="flex justify-center items-center mb-6">
              <Image
                src="/logo.png"
                alt="TUIZ情報王 ロゴ"
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
                      <h3 className="text-xl font-semibold text-gray-800">ゲームに参加</h3>
                    </CardHeader>
                    <p className="text-gray-600 mb-6">ルームコードを入力してクイズゲームに参加</p>
                    <Link href="/join" aria-label="ゲーム参加ページへ移動">
                      <Button variant="gradient" size="tall" className="mx-auto px-12">
                        ゲーム参加
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
                    <h4 className="text-lg font-semibold mb-2">リアルタイム</h4>
                    <p className="text-sm text-gray-600">瞬時に同期</p>
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
                    <h4 className="text-lg font-semibold mb-2">教育的</h4>
                    <p className="text-sm text-gray-600">学習に最適</p>
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
                    <h4 className="text-lg font-semibold mb-2">インタラクティブ</h4>
                    <p className="text-sm text-gray-600">魅力的な体験</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </Container>
        </Main>

        <Footer>
          <Container size="lg">
            <div className="text-gray-600">
              <p>&copy; 2025 TUIZ情報王. All rights reserved.</p>
              <p className="text-sm">Next.js + Socket.IO • Real-time Quiz Platform</p>
            </div>
          </Container>
        </Footer>
      </PageContainer>
    </>
  );
}
