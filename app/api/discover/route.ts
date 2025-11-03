import net from 'net';
import { NextResponse } from 'next/server';

interface DiscoveredPrinter {
  ip: string;
  port: number;
  connected: boolean;
  error?: string;
}

// Função para verificar se uma porta está aberta
async function checkPort(ip: string, port: number, timeout: number = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    const onError = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);

    socket.connect(port, ip, () => {
      socket.destroy();
      resolve(true);
    });
  });
}

// Função para descobrir impressoras na rede
async function discoverPrinters(): Promise<DiscoveredPrinter[]> {
  const printers: DiscoveredPrinter[] = [];
  
  // Obter IP local
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIp = '192.168.1.1';

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
  }

  // Extrair subnet (ex: 192.168.1)
  const subnet = localIp.substring(0, localIp.lastIndexOf('.'));
  
  // Escanear IPs de 1 a 254 na rede
  const promises: Promise<void>[] = [];
  
  for (let i = 1; i <= 254; i++) {
    const ip = `${subnet}.${i}`;
    
    promises.push(
      (async () => {
        try {
          const connected = await checkPort(ip, 9100, 500);
          if (connected) {
            printers.push({
              ip,
              port: 9100,
              connected: true,
            });
          }
        } catch (error) {
          // Silenciosamente ignorar erros
        }
      })()
    );

    // Limitar concorrência para não sobrecarregar
    if (promises.length >= 20) {
      await Promise.race(promises);
    }
  }

  await Promise.all(promises);
  return printers;
}

export async function GET() {
  try {
    const printers = await discoverPrinters();
    return NextResponse.json({
      success: true,
      printers,
      count: printers.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao descobrir impressoras',
      },
      { status: 500 }
    );
  }
}
