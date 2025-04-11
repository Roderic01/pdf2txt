'use client';

import React from 'react';
import FileUploader from './FileUploader';

export default function DashboardTabs() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-4">
          PDF a Texto
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Convierte fácilmente archivos PDF a texto en formato TXT o DOCX
        </p>
      </div>

      <div>
        <FileUploader />
      </div>
    </div>
  );
}
