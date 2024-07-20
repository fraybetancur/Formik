import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFUploader = () => {
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    } else {
      alert('Por favor, selecciona un archivo PDF.');
    }
  };

  return (
    <div>
      <h2>Cargar y Previsualizar PDF</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {previewUrl && (
        <div style={{ marginTop: '20px', height: '600px' }}>
          <Worker workerUrl={`blob:http://localhost:3000/f2dc5201-6549-4d7b-99dd-282a44ee3c08`}>
            <Viewer fileUrl={previewUrl} />
          </Worker>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
