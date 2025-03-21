'use client';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';

/**
 * Limpia texto eliminando texto dentro de paréntesis y caracteres especiales.
 * Mantiene la estructura de párrafos y todo el contenido relevante.
 * @param text Texto a limpiar
 * @returns Texto limpio
 */
export function cleanText(text: string): string {
  if (!text) return '';
  
  let cleanedText = text;
  
  // 1. Eliminar textos dentro de paréntesis
  cleanedText = cleanedText.replace(/\([^)]*\)/g, '');
  
  // 2. Eliminar los caracteres especiales -, #, *
  // Primero, guardar los guiones entre palabras (como en "país-ciudad")
  cleanedText = cleanedText.replace(/(\w)-(\w)/g, '$1_GUION_$2');
  
  // Eliminar guiones sueltos
  cleanedText = cleanedText.replace(/[-]/g, '');
  
  // Restaurar los guiones entre palabras
  cleanedText = cleanedText.replace(/_GUION_/g, '-');
  
  // Eliminar los caracteres # y *
  cleanedText = cleanedText.replace(/[#*]/g, '');
  
  // 3. Eliminar los paréntesis solos que hayan quedado
  cleanedText = cleanedText.replace(/[\(\)]/g, '');
  
  // 4. Limpiar múltiples espacios en blanco consecutivos pero 
  // preservar saltos de línea y estructura de párrafos
  cleanedText = cleanedText.replace(/[ \t]+/g, ' ');
  cleanedText = cleanedText.replace(/^ +| +$/gm, '');
  
  return cleanedText;
}

/**
 * Procesa un archivo DOCX y limpia su contenido
 * @param file Archivo DOCX a procesar
 * @returns Promesa con el texto limpio
 */
export async function processDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Extraer texto del documento DOCX usando mammoth
    const result = await mammoth.extractRawText({ arrayBuffer });
    const extractedText = result.value;
    
    // Limpiar el texto
    const cleanedText = cleanText(extractedText);
    
    return cleanedText;
  } catch (error) {
    console.error('Error procesando archivo DOCX:', error);
    throw error;
  }
}

/**
 * Genera y descarga un archivo TXT con el texto limpio
 * @param text Texto a guardar
 * @param filename Nombre del archivo
 */
export function generateTxtFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${filename}.txt`);
}

/**
 * Genera y descarga un archivo DOCX con el texto limpio
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
