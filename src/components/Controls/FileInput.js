import React, { useState } from 'react';

const FileInput = ({ accept, onChange }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onChange(file);

    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview({ type: 'image', src: reader.result });
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview({ type: 'pdf', src: reader.result });
        };
        reader.readAsArrayBuffer(file);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
      />
      {preview && preview.type === 'image' && (
        <img src={preview.src} alt="Preview" style={{ width: '100px', height: '100px', marginTop: '10px' }} />
      )}
      {preview && preview.type === 'pdf' && (
        <embed src={URL.createObjectURL(new Blob([preview.src], { type: 'application/pdf' }))} type="application/pdf" width="100" height="100" />
      )}
    </div>
  );
};

export default FileInput;