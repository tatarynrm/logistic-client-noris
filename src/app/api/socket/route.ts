import { NextRequest } from 'next/server';

export function GET(req: NextRequest) {
  return new Response('Socket.IO server', { status: 200 });
}
