/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import Map from 'react-map-gl';
import { css } from '@emotion/react';
import 'mapbox-gl/dist/mapbox-gl.css';

const GeoMap = () => {
  const [viewport, setViewport] = useState({
    latitude: 51.505,
    longitude: -0.09,
    zoom: 13,
    width: '100%',
    height: '400px',
  });

  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');

  const handleStyleChange = (event) => {
    setMapStyle(event.target.value);
  };

  return (
    <div css={mapContainerStyle}>
      <select onChange={handleStyleChange} value={mapStyle}>
        <option value="mapbox://styles/mapbox/streets-v11">Streets</option>
        <option value="mapbox://styles/mapbox/outdoors-v11">Outdoors</option>
        <option value="mapbox://styles/mapbox/light-v10">Light</option>
        <option value="mapbox://styles/mapbox/dark-v10">Dark</option>
        <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
        <option value="mapbox://styles/mapbox/satellite-streets-v11">Satellite Streets</option>
        <option value="mapbox://styles/mapbox/navigation-day-v1">Navigation Day</option>
        <option value="mapbox://styles/mapbox/navigation-night-v1">Navigation Night</option>
      </select>
      <Map
        {...viewport}
        mapStyle={mapStyle}
        onViewportChange={setViewport}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      />
    </div>
  );
};

const mapContainerStyle = css`
  position: relative;
  height: 400px;
  width: 100%;
  margin-bottom: 20px;
`;

export default GeoMap;
