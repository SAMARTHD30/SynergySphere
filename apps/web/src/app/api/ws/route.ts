import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // For now, just return a simple response
  // In a real app, you'd implement WebSocket handling here
  return new Response('WebSocket endpoint', { status: 200 });
}
