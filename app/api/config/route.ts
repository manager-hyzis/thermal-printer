import { NextResponse } from 'next/server';

// Armazenar configuração em memória (em produção usar banco de dados)
let printerConfig = {
  ip: '192.168.1.87',
  port: 9100,
};

export async function GET() {
  return NextResponse.json(printerConfig);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.ip || !body.port) {
      return NextResponse.json(
        { error: 'IP e porta são obrigatórios' },
        { status: 400 }
      );
    }

    printerConfig = {
      ip: body.ip,
      port: body.port,
    };

    return NextResponse.json({
      success: true,
      message: 'Configuração salva',
      config: printerConfig,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao salvar configuração' },
      { status: 500 }
    );
  }
}
