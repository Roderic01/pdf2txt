'use client';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Genera y descarga un archivo TXT con el texto
 * @param text Texto a guardar
 * @param filename Nombre del archivo
 */
export function generateTxtFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${filename}.txt`);
}

/**
 * Genera y descarga un archivo DOCX con el texto
 * @param text Texto a guardar
 * @param filename Nombre del archivo
 */
export function generateDocxFile(text: string, filename: string): void {
  // Crear un nuevo documento
  const doc = new Document({
    sections: [{
      properties: {},
      children: text.split('\n').map(paragraph => 
        new Paragraph({
          children: [new TextRun(paragraph)]
        })
      )
    }]
  });
  
  // Generar y guardar el documento
  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `${filename}.docx`);
  });
}
