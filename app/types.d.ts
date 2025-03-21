declare module 'file-saver' {
  export function saveAs(data: Blob | File, filename?: string, options?: object): void;
}

declare module 'mammoth' {
  export interface ExtractRawTextResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  export function extractRawText(options: {
    arrayBuffer: ArrayBuffer;
  }): Promise<ExtractRawTextResult>;
}
