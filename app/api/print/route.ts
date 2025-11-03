import { client, encoder } from '@/lib/printer';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Criar um teste simples de impressão
    const result = encoder
      .line('TESTE DE IMPRESSORA')
      .line('')
      .line('Impressora Termica 80mm')
      .line('Rongta')
      .line('')
      .line('Data: ' + new Date().toLocaleString('pt-BR'))
      .line('')
      .line('Teste bem-sucedido!')
      .line('')
      .line('')
      .cut();

    const buffer = result.encode();

    // Enviar para impressora
    if (client.writable) {
      client.write(buffer);
      return NextResponse.json({ success: true, message: 'Impressão enviada' });
    } else {
      return NextResponse.json({ success: false, error: 'Impressora não conectada' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao imprimir:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
