'use client';

import * as React from 'react';
import { PageContainer, Header, Main, Footer, Container } from '@/components/ui';

export default function Page() {
  return (
    <PageContainer entrance="fadeIn" className="min-h-screen flex flex-col">
      <Header>
        <Container size="sm">
          <h1 className="text-2xl font-semibold">Join Game</h1>
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
