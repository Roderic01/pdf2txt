'use client';

import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

// Configurar el worker de PDF.js para que apunte al archivo en la carpeta public
if (typeof window !== 'undefined') {
  // En el entorno del navegador, establecemos la ruta al worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';
}

interface TextItem {
  text: string;
  x: number;
  y: number;
  height: number;
  width: number;
  fontName?: string;
}

export async function processFile(file: File, outputFormat: 'txt' | 'docx'): Promise<void> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    
    // Extract text from all pages
    const numPages = pdf.numPages;
    const extractedTextItems: TextItem[][] = [];
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text with position information
      const items = textContent.items.map((item: any) => {
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const x = transform[4];
        const y = transform[5];
        
        return {
          text: item.str,
          x,
          y,
          height: item.height || 0,
          width: item.width || 0,
          fontName: item.fontName
        };
      });
      
      extractedTextItems.push(items);
    }
    
    // Process the extracted text to maintain structure
    const processedText = processExtractedText(extractedTextItems);
    
    // Generate the output file based on the selected format
    if (outputFormat === 'txt') {
      generateTxtFile(processedText, file.name.replace('.pdf', ''));
    } else {
      generateDocxFile(processedText, file.name.replace('.pdf', ''));
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

function processExtractedText(pages: TextItem[][]): string[] {
  // Process the text items to try to maintain the original structure
  return pages.map(page => {
    // Sort items by Y position first (top to bottom), then by X (left to right)
    // This helps to maintain reading order
    page.sort((a, b) => {
      // Group items that are approximately on the same line
      const yThreshold = Math.max(a.height, b.height) / 2;
      if (Math.abs(a.y - b.y) < yThreshold) {
        return a.x - b.x; // Same line, sort left to right
      }
      return b.y - a.y; // Different lines, sort top to bottom (PDF coordinates are bottom-up)
    });
    
    let lastY = -1;
    let lastX = -1;
    const lines: string[] = [];
    let currentLine = '';
    
    // Combine items into lines based on their positions
    for (const item of page) {
      if (item.text.trim() === '') continue;
      
      const yThreshold = item.height / 2;
      const xThreshold = item.width * 0.5; // For detecting spaces between words
      
      // Check if we're on a new line
      if (lastY === -1 || Math.abs(item.y - lastY) > yThreshold) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        currentLine = item.text;
      } else {
        // Check if we need to add a space
        const spaceNeeded = (item.x - lastX) > xThreshold && !currentLine.endsWith(' ') && !item.text.startsWith(' ');
        currentLine += (spaceNeeded ? ' ' : '') + item.text;
      }
      
      lastY = item.y;
      lastX = item.x + item.width;
    }
    
    // Add the last line
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Further process the lines to identify paragraphs
    const paragraphs: string[] = [];
    let currentParagraph = '';
    
    for (const line of lines) {
      // If the line is very short compared to the others, it might be a title or heading
      if (line.length < 30 && line.trim().length > 0) {
        if (currentParagraph) {
          paragraphs.push(currentParagraph);
          currentParagraph = '';
        }
        paragraphs.push(line);
      } else if (line.trim().length === 0) {
        // Empty line might indicate paragraph break
        if (currentParagraph) {
          paragraphs.push(currentParagraph);
          currentParagraph = '';
        }
        // Add an empty line to maintain spacing
        paragraphs.push('');
      } else {
        // Continue the current paragraph
        if (currentParagraph) {
          currentParagraph += ' ' + line;
        } else {
          currentParagraph = line;
        }
      }
    }
    
    // Add the last paragraph
    if (currentParagraph) {
      paragraphs.push(currentParagraph);
    }
    
    return paragraphs.join('\n');
  });
}

function generateTxtFile(textContent: string[], filename: string): void {
  // Usamos dos saltos de línea extra en lugar del texto '--- Página Nueva ---'
  // para mantener la separación visual entre páginas pero sin texto explícito
  const combinedText = textContent.join('\n\n\n\n');
  const blob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${filename}.txt`);
}

function generateDocxFile(textContent: string[], filename: string): void {
  // Create a new document
  const doc = new Document({
    sections: [{
      properties: {},
      children: textContent.flatMap((pageText, pageIndex) => {
        // Split page text into paragraphs
        const pageParagraphs = pageText.split('\n').map(text => {
          return new Paragraph({
            children: [new TextRun(text)]
          });
        });
        
        // Add page break after each page (except the last one) pero sin el texto '--- Página Nueva ---'
        if (pageIndex < textContent.length - 1) {
          // Agregamos un párrafo vacío y luego un salto de página
          pageParagraphs.push(new Paragraph({
            children: [new TextRun("")],
            pageBreakBefore: true,
          }));
        }
        
        return pageParagraphs;
      })
    }]
  });
  
  // Generate and save the document
  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `${filename}.docx`);
  });
}
