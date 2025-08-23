'use client';

import * as React from 'react';
import Image from 'next/image';
import { PageContainer, Header, Main, Footer, Container, AnimatedHeading } from '@/components/ui';

export default function Page() {
  return (
    <PageContainer entrance="fadeIn" className="min-h-screen flex flex-col">
      <Header>
        <Container size="sm">
          <div className="flex justify-center items-center mb-6">
            <Image
              src="/logo.png"
              alt="logo"
              width={80}
              height={80}
              priority
              className="animate-float rounded-full"
            />
          </div>
          <AnimatedHeading size="md" animation="float" className="mb-6">
            TUIZ情報王
          </AnimatedHeading>
        </Container>
      </Header>

      <Main>
        <Container size="lg">
          <div className="max-w-xl mx-auto mt-12">
            {/* Blank starter page for /join - add form or UI here */}
            <div className="p-8 rounded-lg border border-dashed border-gray-200 text-center">
              <p className="text-gray-600">This is the /join page. Add the room join UI here.</p>
            </div>
          </div>
        </Container>
      </Main>

      <Footer>
        <Container size="lg">
          <p className="text-sm text-gray-500">© 2025 TUIZ情報王</p>
        </Container>
      </Footer>
    </PageContainer>
  );
}
