'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cleanText, processDocxFile, generateTxtFile, generateDocxFile } from '../lib/textCleaner';

type OutputFormat = 'txt' | 'docx';

export default function TextCleaner() {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('txt');
  const [error, setError] = useState<string | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Manejar el cambio de texto en el área de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setFile(null);
    setError(null);
    setShowOutput(false);
  };

  // Manejar la subida de archivos
  const handleFileChange = (selectedFile: File | null) => {
    setError(null);
    setShowOutput(false);
    
    if (!selectedFile) {
      return;
    }
    
    if (!selectedFile.name.toLowerCase().endsWith('.docx')) {
      setError('Por favor, sube únicamente archivos DOCX.');
      return;
    }
    
    if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
      setError('El archivo es demasiado grande. El tamaño máximo es 20MB.');
      return;
    }
    
    setFile(selectedFile);
    setInputText(''); // Limpiar el área de texto cuando se sube un archivo
  };

  // Eventos de arrastrar y soltar
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isProcessing) return;
    
    setIsUploading(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }, [isProcessing]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isProcessing && !isUploading) {
      setIsUploading(true);
    }
  }, [isProcessing, isUploading]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsUploading(false);
  }, []);

  const handleClick = () => {
    if (fileInputRef.current && !isProcessing) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileChange(event.target.files[0]);
    }
  };

  // Procesar el texto o archivo
  const handleProcess = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      
      let cleanedText = '';
      let filename = 'texto_limpio';
      
      if (file) {
        // Procesar archivo DOCX
        cleanedText = await processDocxFile(file);
        filename = file.name.replace('.docx', '');
      } else if (inputText.trim()) {
        // Procesar texto ingresado
        cleanedText = cleanText(inputText);
      } else {
        setError('Por favor, ingresa texto o sube un archivo DOCX.');
        setIsProcessing(false);
        return;
      }
      
      // Mostrar el resultado
      setOutputText(cleanedText);
      setShowOutput(true);
      
      // Generar y descargar el archivo según el formato seleccionado
      // Solo descargar automáticamente si es formato DOCX
      if (outputFormat === 'docx') {
        generateDocxFile(cleanedText, filename);
      }
      // Ya no descargamos automáticamente el TXT
    } catch (err) {
      setError('Error al procesar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOutputFormat(event.target.value as OutputFormat);
  };

  const resetForm = () => {
    setInputText('');
    setFile(null);
    setError(null);
    setShowOutput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!file && (
        <div className="mb-4">
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pega el texto a limpiar:
          </label>
          <textarea
            id="text-input"
            rows={8}
            className="w-full px-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Pega aquí el texto con hipervínculos y textos subrayados entre paréntesis..."
            value={inputText}
            onChange={handleTextChange}
            disabled={isProcessing}
          ></textarea>
        </div>
      )}

      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          O sube un archivo DOCX:
        </div>
        <div
          ref={dropAreaRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isUploading ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept=".docx"
            className="hidden"
            disabled={isProcessing}
          />
          
          {!file ? (
            <div>
              <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  strokeWidth={2} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Haz clic para seleccionar</span> o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">DOCX (Máx. 20MB)</p>
            </div>
          ) : (
            <div>
              <svg className="mx-auto h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="mt-2 text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Formato de salida:</span>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="txt"
                  checked={outputFormat === 'txt'}
                  onChange={handleFormatChange}
                  className="form-radio h-4 w-4 text-blue-600"
                  disabled={isProcessing}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">TXT</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="docx"
                  checked={outputFormat === 'docx'}
                  onChange={handleFormatChange}
                  className="form-radio h-4 w-4 text-blue-600"
                  disabled={isProcessing}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">DOCX</span>
              </label>
            </div>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={resetForm}
              disabled={isProcessing}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleProcess}
              disabled={((!inputText.trim() && !file) || isProcessing)}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Procesando...' : 'Limpiar Texto'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showOutput && (
        <div className="mt-8">
          <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Texto limpio{outputFormat === 'docx' ? ' (se ha descargado automáticamente en formato DOCX)' : ''}:
          </div>
          <div className="border rounded-md bg-gray-50 dark:bg-gray-800">
            <textarea
              className="w-full h-full bg-transparent text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap border-none resize-none focus:outline-none focus:ring-0 p-3"
              value={outputText}
              readOnly
              rows={8}
              onClick={(e) => e.currentTarget.select()}
              onKeyDown={(e) => {
                // Prevenir que Cmd+A se extienda fuera del textarea
                if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
                  e.stopPropagation();
                }
              }}
            />
          </div>
          {outputFormat === 'txt' && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => generateTxtFile(outputText, 'texto_limpio')}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Descargar como TXT
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
