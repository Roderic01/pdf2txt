'use client';

import { Suspense } from "react";
import DashboardTabs from "./components/DashboardTabs";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">PDF a Texto</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Extrae texto de archivos PDF y conviértelos a TXT o DOCX manteniendo el formato original
        </p>
      </header>
      
      <main className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <Suspense fallback={<p>Cargando...</p>}>
          <DashboardTabs />
        </Suspense>
      </main>
      
      <footer className="mt-12 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p> {new Date().getFullYear()} PDF a Texto - Construido con Next.js</p>
      </footer>
    </div>
  );
}
