# PDF a Texto

Una aplicación web construida con Next.js que permite extraer texto de archivos PDF y convertirlos a formato TXT o DOCX, manteniendo el formato original.

## Características

- Sube archivos PDF fácilmente mediante drag & drop o selector de archivos
- Extrae texto manteniendo formato de párrafos y espaciado
- Guarda el resultado en formato TXT o DOCX
- Soporta modo oscuro/claro
- Diseño responsive para todos los dispositivos
- Desplegable en Vercel

## Tecnologías utilizadas

- [Next.js](https://nextjs.org/) - Framework de React
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [PDF.js](https://mozilla.github.io/pdf.js/) - Biblioteca para procesar PDFs
- [docx](https://github.com/dolanmiu/docx) - Biblioteca para generar archivos DOCX
- [File Saver](https://github.com/eligrey/FileSaver.js) - Para guardar archivos en el navegador

## Requisitos previos

- Node.js 18.0.0 o superior
- npm o yarn

## Instalación

1. Clona este repositorio:
```bash
git clone https://github.com/Roderic01/pdf2txt.git
cd pdf2txt
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Cómo usar

1. Arrastra y suelta un archivo PDF en la zona de carga o haz clic para seleccionar un archivo
2. Selecciona el formato de salida (TXT o DOCX)
3. Haz clic en "Convertir"
4. El archivo procesado se descargará automáticamente

## Despliegue en Vercel

La forma más sencilla de desplegar esta aplicación es usar la [Plataforma Vercel](https://vercel.com/new) de los creadores de Next.js.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRoderic01%2Fpdf2txt)

## Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes, por favor abre un issue primero para discutir lo que te gustaría cambiar.

## Licencia

[MIT](https://choosealicense.com/licenses/mit/)
