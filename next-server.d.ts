declare module 'next/server' {
  export class NextResponse {
    static json(data: any, init?: ResponseInit): Response;
  }

  export interface ResponseInit {
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
  }

  export type HeadersInit = Record<string, string>;
}
