import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

const CompressedImageInput = ({ onImageUpload }) => {
  const [preview, setPreview] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected.");
      return;
    }

    try {
      const options = {
        maxSizeMB: 1, // Máximo tamaño en MB, ajustable según tus necesidades
        maxWidthOrHeight: 1920, // Ajustable según tus necesidades
        useWebWorker: true
      };

      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageUpload(compressedFile, reader.result); // Pasamos el archivo y la vista previa base64
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing the image: ", error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {preview && (
        <img src={preview} alt="Image preview" style={{ width: '250px', height: '250px', marginTop: '10px' }} />
      )}
    </div>
  );
};

export default CompressedImageInput;
