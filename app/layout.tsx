import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PDF a Texto - Extractor de texto de PDFs',
  description: 'Convierte fácilmente archivos PDF a TXT o DOCX manteniendo el formato original del texto',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
