declare module '@point-of-sale/receipt-printer-encoder' {
  class ReceiptPrinterEncoder {
    line(text: string): ReceiptPrinterEncoder;
    text(text: string): ReceiptPrinterEncoder;
    newline(): ReceiptPrinterEncoder;
    cut(): ReceiptPrinterEncoder;
    encode(): Buffer;
  }

  export default ReceiptPrinterEncoder;
}
