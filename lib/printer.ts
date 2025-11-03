import net from 'node:net';
import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';

// Configuração dinâmica (será atualizada via API)
let printerConfig = {
  ip: '192.168.2.212',
  port: 9100,
};

export function updatePrinterConfig(ip: string, port: number) {
  printerConfig = { ip, port };
  console.log(`[THERMAL] Configuração atualizada: ${ip}:${port}`);
}

export function getPrinterConfig() {
  return printerConfig;
}

const PORT = printerConfig.port;
const HOST = printerConfig.ip;

const printerClientSingleton = () => {
  console.log('Creating new socket...');
  return new net.Socket();
};

// This singleton pattern is used to ensure that the client is only created once and reused across hot reloads in Next.js
export const client = globalThis.printerClientGlobal ?? printerClientSingleton();
globalThis.printerClientGlobal = client;

if (!globalThis.printerConnected) {
  console.log('[THERMAL] Connecting to printer for the first time');
  client.connect(PORT, HOST, () => {
    globalThis.printerConnected = true;
    console.log('[THERMAL] Connected to printer');
  });
}

client.on('data', (data) => {
  console.log('[THERMAL] Received:', data.toString('hex'));
});

client.on('error', (err) => {
  console.error('[THERMAL] Error connecting to printer:', err);
});

client.on('close', () => {
  console.log('[THERMAL] Disconnected from printer');
});

const socketEvents = [
  'close',
  'connectionAttempt',
  'connectionAttemptFailed',
  'connectionAttemptTimeout',
  'drain',
  'end',
  'lookup',
  'connect',
  'ready',
  'timeout',
];

socketEvents.forEach((event) => {
  client.on(event, (data) => {
    console.log('[THERMAL] Event:', event);
  });
});

declare const globalThis: {
  printerClientGlobal: ReturnType<typeof printerClientSingleton>;
  printerConnected: boolean;
} & typeof global;

export const encoder = new ReceiptPrinterEncoder();
