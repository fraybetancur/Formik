import React, { useState } from 'react';

const MapInput = ({ value, onChange }) => {
  const [coordinates, setCoordinates] = useState(value);

  const handleMapClick = (event) => {
    const newCoordinates = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setCoordinates(newCoordinates);
    onChange(newCoordinates);
  };

  return (
    <div>
      <input
        type="text"
        value={`Lat: ${coordinates.lat}, Lng: ${coordinates.lng}`}
        readOnly
      />
      {/* Aquí iría el componente de mapa, como Google Maps */}
      {/* Este es un placeholder para el manejo del click en el mapa */}
      <div onClick={handleMapClick} style={{ width: '300px', height: '200px', backgroundColor: '#ccc' }}>
        Click en el mapa para seleccionar coordenadas
      </div>
    </div>
  );
};

export default MapInput;
