declare module 'pdfjs-dist/legacy/build/pdf.worker.entry' {
  const workerSrc: string;
  export default workerSrc;
}

declare module 'pdfjs-dist/build/pdf.worker.min.js' {
  const workerSrc: string;
  export default workerSrc;
}

declare module 'pdfjs-dist' {
  interface TextItem {
    str: string;
  }

  interface TextMarkedContent {
    type: string;
    items: TextItem[];
  }

  type TextContent = TextItem | TextMarkedContent;
}

declare module 'pdfjs-dist/legacy/build/pdf' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface TextContent {
    items: Array<TextItem | TextMarkedContent>;
  }

  export interface TextItem {
    str: string;
  }

  export interface TextMarkedContent {
    type: string;
    items: TextItem[];
  }

  export interface GlobalWorkerOptions {
    workerSrc: string;
  }

  export const GlobalWorkerOptions: GlobalWorkerOptions;

  export function getDocument(data: Uint8Array): {
    promise: Promise<PDFDocumentProxy>;
  };
}

declare module 'pdfjs-dist/build/pdf.worker.min.js' {
  const workerSrc: string;
  export default workerSrc;
}