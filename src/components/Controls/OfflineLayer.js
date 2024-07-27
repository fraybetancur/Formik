// src/OfflineLayer.js
import React from 'react';
import { Source, Layer } from 'react-map-gl';

const OfflineLayer = () => {
  const sourceData = {
    type: 'vector',
    url: 'mapbox://styles/frayb/clltfrube00v201ns9ukr0dlf', // Reemplaza con la URL de tu fuente offline
  };

  const layerStyle = {
    id: 'offline-layer',
    type: 'fill',
    source: 'offline-source',
    'source-layer': 'FBCompleto-G', // Reemplaza con el nombre de tu capa
    paint: {
      'fill-color': '#888888',
      'fill-opacity': 0.4,
    },
  };

  return (
    <Source id="offline-source" {...sourceData}>
      <Layer {...layerStyle} />
    </Source>
  );
};

export default OfflineLayer;
