'use client';

import { Button, Card, CardHeader, CardBody, CardFooter, Input } from '@/ui';

export default function Page() {
  return (
    <main className="container">
      <Card>
        <CardHeader>
          <h1>TUIZ</h1>
        </CardHeader>
        <CardBody>
          <p>Frontend skeleton running.</p>
          <Input placeholder="Room ID…" style={{ maxWidth: 240 }} />
        </CardBody>
        <CardFooter>
          <Button>Continue</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
