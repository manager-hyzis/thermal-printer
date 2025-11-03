# Teste Impressora Térmica

Página simples para testar impressão em impressora térmica 80mm usando ReceiptPrinterEncoder e TCP sockets.

## Como usar

1. Configure o IP da impressora em `./lib/printer.ts` (linha 5)
2. Execute `pnpm install`
3. Execute `pnpm dev`
4. Acesse `http://localhost:3000`
5. Clique no botão "Imprimir Teste"

## Configuração

- **IP da Impressora**: `./lib/printer.ts` linha 5 (padrão: `192.168.1.87`)
- **Porta**: `9100` (padrão para impressoras ESC/POS)

## Biblioteca

- [ReceiptPrinterEncoder](https://github.com/NielsLeenheer/ReceiptPrinterEncoder) v3.0.3
- Suporta ESC/POS, StarLine e StarPRNT

## Impressora Testada

[Rongta 80mm](https://amzn.to/3SXqX94) - Conexão Ethernet
