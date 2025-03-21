'use client';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';

/**
 * Limpia texto eliminando caracteres especiales como -, #, *, () mientras
 * mantiene la estructura de párrafos, espacios, títulos y subtítulos.
 * También elimina las referencias que aparecen al final del documento.
 * @param text Texto a limpiar
 * @returns Texto limpio
 */
export function cleanText(text: string): string {
  // 0. Eliminar referencias al final del texto
  // Buscar "Referencias:" o similar en las últimas partes del texto
  // Usamos case-insensitive match sin el flag 's'
  const referenciasMatch = text.match(/referencias:?/i);
  
  // Si encontramos la palabra "referencias", eliminamos desde ahí hasta el final
  let textWithoutReferences = text;
  if (referenciasMatch) {
    // Obtener la posición donde aparece "referencias"
    const referenciasIndex = text.toLowerCase().lastIndexOf("referencias");
    if (referenciasIndex !== -1) {
      // Tomar solo el texto antes de "referencias"
      textWithoutReferences = text.substring(0, referenciasIndex);
    }
  }
  
  // 1. Eliminar textos dentro de paréntesis que podrían contener hipervínculos
  let cleanedText = textWithoutReferences.replace(/\([^)]*\)/g, '');
  
  // 2. Eliminar los caracteres especiales -, #, *
  // Reemplazar - pero preservar los guiones en medio de palabras
  cleanedText = cleanedText.replace(/([^\w]|^)-+(?=\s|$)/g, '$1');  // Guiones al inicio de líneas/palabras
  cleanedText = cleanedText.replace(/(?<=\s|^)-+(?=\s|$)/g, '');   // Guiones sueltos
  
  // Eliminar los caracteres # y *
  cleanedText = cleanedText.replace(/[#*]/g, '');
  
  // 3. Eliminar los paréntesis solos que hayan quedado
  cleanedText = cleanedText.replace(/[\(\)]/g, '');
  
  // 4. Limpiar múltiples espacios en blanco y líneas vacías excesivas
  // pero manteniendo la estructura de párrafos
  cleanedText = cleanedText.replace(/[ \t]+/g, ' ');          // Múltiples espacios a uno solo
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');       // Limitar a máximo 2 saltos de línea
  cleanedText = cleanedText.replace(/^ +| +$/gm, '');         // Eliminar espacios al inicio y final de líneas
  
  return cleanedText;
}

/**
 * Procesa un archivo DOCX y limpia su contenido de hipervínculos y texto subrayado
 * @param file Archivo DOCX a procesar
 * @returns Promesa con el texto limpio
 */
export async function processDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Extraer texto del documento DOCX usando mammoth
    const result = await mammoth.extractRawText({ arrayBuffer });
    const extractedText = result.value;
    
    // Limpiar el texto de hipervínculos y textos subrayados
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
