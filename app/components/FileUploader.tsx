'use client';

import React, { useState, useRef, useCallback } from 'react';
import { processFile } from '../lib/pdfProcessor';

// Definir una interfaz temporal para procesamiento de archivos
// hasta que el módulo real esté disponible
// const processFile = async (file: File, format: 'txt' | 'docx') => {
//   console.log('Procesando archivo:', file.name, 'en formato:', format);
//   // Simulamos un delay
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   alert(`Procesamiento de ${file.name} completado. La función real de conversión será implementada pronto.`);
// };

type OutputFormat = 'txt' | 'docx';

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('txt');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setError(null);
    
    if (!selectedFile) {
      return;
    }
    
    if (!selectedFile.type.includes('pdf')) {
      setError('Por favor, sube únicamente archivos PDF.');
      return;
    }
    
    if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
      setError('El archivo es demasiado grande. El tamaño máximo es 20MB.');
      return;
    }
    
    setFile(selectedFile);
  };

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

  const handleSubmit = async () => {
    if (!file) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      await processFile(file, outputFormat);
      // No alert needed as the processFile function will handle the file download
    } catch (err) {
      setError('Error al procesar el archivo: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOutputFormat(event.target.value as OutputFormat);
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        ref={dropAreaRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isUploading ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept=".pdf"
          className="hidden"
          disabled={isProcessing}
        />
        
        {!file ? (
          <div>
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
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
            <p className="text-xs text-gray-500 dark:text-gray-400">PDF (Máx. 20MB)</p>
          </div>
        ) : (
          <div>
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="mt-2 text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {file && (
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
                onClick={handleSubmit}
                disabled={!file || isProcessing}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Procesando...' : 'Convertir'}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
