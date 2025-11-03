import { client } from '@/lib/printer';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const status = {
      connected: client.readyState === 'open',
      readyState: client.readyState,
      remoteAddress: client.remoteAddress,
      remotePort: client.remotePort,
      localAddress: client.localAddress,
      localPort: client.localPort,
      timestamp: new Date().toLocaleString('pt-BR'),
    };

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toLocaleString('pt-BR'),
      },
      { status: 500 }
    );
  }
}
