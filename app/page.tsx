'use client';

import { useState, useEffect } from 'react';

interface PrinterStatus {
  connected: boolean;
  readyState: string;
  remoteAddress?: string;
  remotePort?: number;
  timestamp: string;
}

interface Log {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: string;
}

interface DiscoveredPrinter {
  ip: string;
  port: number;
  connected: boolean;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [status, setStatus] = useState<PrinterStatus | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<DiscoveredPrinter[]>([]);
  const [showDiscovery, setShowDiscovery] = useState(false);

  // Buscar status da impressora
  const checkStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data);

      addLog(
        data.connected ? 'success' : 'error',
        data.connected
          ? `Impressora conectada em ${data.remoteAddress}:${data.remotePort}`
          : `Impressora desconectada - ${data.error || 'Erro desconhecido'}`
      );
    } catch (error) {
      addLog('error', `Erro ao verificar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Adicionar log
  const addLog = (type: Log['type'], message: string) => {
    const newLog: Log = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    };
    setLogs((prev: Log[]) => [newLog, ...prev].slice(0, 50)); // Manter últimos 50 logs
  };

  // Descobrir impressoras na rede
  const discoverPrinters = async () => {
    setDiscovering(true);
    addLog('info', 'Iniciando descoberta de impressoras na rede...');

    try {
      const response = await fetch('/api/discover');
      const data = await response.json();

      if (data.success && data.printers.length > 0) {
        setDiscoveredPrinters(data.printers);
        addLog('success', `Encontradas ${data.printers.length} impressora(s) na rede`);
      } else {
        addLog('warning', 'Nenhuma impressora encontrada na rede');
      }
    } catch (error) {
      addLog('error', `Erro ao descobrir impressoras: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setDiscovering(false);
    }
  };

  // Configurar impressora
  const configurePrinter = async (ip: string, port: number) => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, port }),
      });

      const data = await response.json();
      if (data.success) {
        addLog('success', `Impressora configurada: ${ip}:${port}`);
        setShowDiscovery(false);
        // Aguardar um pouco e verificar status
        setTimeout(() => checkStatus(), 1000);
      } else {
        addLog('error', `Erro ao configurar: ${data.error}`);
      }
    } catch (error) {
      addLog('error', `Erro ao configurar impressora: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Verificar status ao carregar
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Verificar a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const handlePrint = async () => {
    setLoading(true);
    addLog('info', 'Iniciando impressão...');

    try {
      const response = await fetch('/api/print', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        addLog('success', 'Impressão enviada com sucesso!');
      } else {
        addLog('error', `Erro na impressão: ${data.error}`);
      }
    } catch (error) {
      addLog('error', `Erro ao imprimir: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Painel de Controle */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h1 className="text-2xl font-bold text-white mb-4">Impressora Térmica</h1>

              {/* Status */}
              <div className="mb-6 p-4 rounded-lg bg-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${status?.connected ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                  <span className={status?.connected ? 'text-green-400' : 'text-red-400'}>
                    {status?.connected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                {status && (
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Estado: {status.readyState}</p>
                    {status.remoteAddress && <p>IP: {status.remoteAddress}:{status.remotePort}</p>}
                    <p>Atualizado: {status.timestamp}</p>
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="space-y-2">
                <button
                  onClick={handlePrint}
                  disabled={loading || !status?.connected}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  {loading ? 'Imprimindo...' : 'Imprimir Teste'}
                </button>
                <button
                  onClick={checkStatus}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
                >
                  Verificar Status
                </button>
                <button
                  onClick={() => setShowDiscovery(!showDiscovery)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
                >
                  Descobrir Impressoras
                </button>
              </div>

              {/* Painel de Descoberta */}
              {showDiscovery && (
                <div className="mt-6 p-4 rounded-lg bg-slate-700 border border-purple-500">
                  <button
                    onClick={discoverPrinters}
                    disabled={discovering}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded mb-3 transition-all"
                  >
                    {discovering ? 'Procurando...' : 'Escanear Rede'}
                  </button>

                  {discoveredPrinters.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300 mb-2">Impressoras encontradas:</p>
                      {discoveredPrinters.map((printer: DiscoveredPrinter) => (
                        <button
                          key={printer.ip}
                          onClick={() => configurePrinter(printer.ip, printer.port)}
                          className="w-full text-left p-2 bg-slate-600 hover:bg-slate-500 rounded text-sm text-white transition-all"
                        >
                          {printer.ip}:{printer.port}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Console de Logs */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl h-full">
              <h2 className="text-xl font-bold text-white mb-4">Console</h2>
              <div className="bg-slate-900 rounded p-4 h-96 overflow-y-auto font-mono text-sm space-y-1">
                {logs.length === 0 ? (
                  <div className="text-slate-500">Aguardando eventos...</div>
                ) : (
                  logs.map((log: Log) => (
                    <div
                      key={log.id}
                      className={`flex gap-2 ${
                        log.type === 'success'
                          ? 'text-green-400'
                          : log.type === 'error'
                            ? 'text-red-400'
                            : log.type === 'warning'
                              ? 'text-yellow-400'
                              : 'text-blue-400'
                      }`}
                    >
                      <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                      <span className="flex-shrink-0">
                        {log.type === 'success' ? '✓' : log.type === 'error' ? '✗' : log.type === 'warning' ? '!' : 'i'}
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
