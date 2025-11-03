import net from 'node:net';
import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';

const PORT = 9100; // Most printers use port 9100
const HOST = '192.168.2.212'; // The IP address of the printer, I got this by holding the feed button on the printer while turning it on

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
