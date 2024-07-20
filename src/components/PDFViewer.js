import React from 'react';

const PDFViewer = ({ fileUrl }) => {
  return (
    <iframe
      src={fileUrl}
      type="application/pdf"
      width="100%"
      height="600px"
      title="PDF Viewer"
    >
      <p>Este navegador no soporta la visualización de PDF.</p>
    </iframe>
  );
};

export default PDFViewer;
