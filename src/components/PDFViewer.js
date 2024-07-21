import React, { useEffect, useRef } from 'react';
import { getDocument, GlobalWorkerOptions, version as pdfjsVersion } from 'pdfjs-dist';

// Obtener la versión de pdfjs-dist instalada
const pdfjsVersionNumber = pdfjsVersion;

const PDFViewer = ({ fileUrl }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    // Establecer la ruta del trabajador (worker) de PDF.js
    GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersionNumber}/pdf.worker.min.js`;

    if (container && fileUrl) {
      // Limpiar el contenedor antes de renderizar el PDF
      container.innerHTML = '';

      const loadPDF = async () => {
        const loadingTask = getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          
          // Ajustar la escala para que cada página se ajuste al ancho del contenedor
          const containerWidth = container.clientWidth;
          const viewport = page.getViewport({ scale: containerWidth / page.getViewport({ scale: 1 }).width });

          const canvas = document.createElement('canvas');
          canvas.style.marginBottom = '16px'; // Añadir un margen entre las páginas
          container.appendChild(canvas);
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          page.render(renderContext);
        }
      };

      loadPDF();
    }
  }, [fileUrl]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px'
      }}
    />
  );
};

export default PDFViewer;
