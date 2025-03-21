'use client';

import React, { useState } from 'react';
import FileUploader from './FileUploader';
import TextCleaner from './TextCleaner';

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState('pdf');

  return (
    <div className="w-full">
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`py-4 px-1 w-1/2 text-center border-b-2 font-medium text-sm ${
              activeTab === 'pdf'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            PDF a Texto
          </button>
          <button
            onClick={() => setActiveTab('cleaner')}
            className={`py-4 px-1 w-1/2 text-center border-b-2 font-medium text-sm ${
              activeTab === 'cleaner'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Limpiador de Texto
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'pdf' ? (
          <FileUploader />
        ) : (
          <TextCleaner />
        )}
      </div>
    </div>
  );
}
