import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/ui';
import { Card, CardHeader, CardContent } from '@/ui';
import { Header, Main, Footer, Container } from '@/ui';
import { AiFillDashboard } from 'react-icons/ai';
import { IoLogoGameControllerB } from 'react-icons/io';
import { FaBolt } from 'react-icons/fa6';
import { MdSchool, MdColorLens } from 'react-icons/md';

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header>
        <Container size="sm">
          <div className="flex justify-center items-center mb-6">
            <Image
              src="/logo.png"
              alt="logo"
              width={100}
              height={100}
              className="animate-float rounded-full"
            />
          </div>
          <h1 className="text-6xl font-black mb-6 gradient-text tracking-tight leading-tight">
            TUIZ情報王
          </h1>
        </Container>
      </Header>

      <Main>
        <Container size="lg">
          <section className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card
                variant="glass"
                className="text-center hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <AiFillDashboard size={28} className="text-white" />
                  </div>
                  <CardHeader>
                    <h3 className="text-xl font-semibold text-gray-800">ホストとしてログイン</h3>
                  </CardHeader>
                  <p className="text-gray-600 mb-6">クイズを作成・管理し、クイズを開始、ホスト</p>
                  <Button variant="gradient" size="tall" className="mx-auto px-12">
                    ログイン
                  </Button>
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
                  <Button variant="gradient" size="tall" className="mx-auto px-12">
                    ゲーム参加
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mt-12">
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
    </div>
  );
}
