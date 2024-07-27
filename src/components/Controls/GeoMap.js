/** @jsxImportSource @emotion/react */
import React, { useState, useRef, useEffect } from 'react';
import Map, { Marker, GeolocateControl, Source, Layer } from 'react-map-gl';
import { css } from '@emotion/react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import OfflineLayer from './OfflineLayer'; // Importa la capa OfflineLayer

const GeoMap = ({ geometries = [], onShapeComplete }) => {
  const [viewport, setViewport] = useState({
    latitude: 4.66,
    longitude: -74.05,
    zoom: 13,
    width: '100%',
    height: '400px',
  });

  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mode, setMode] = useState('draw_point');
  const mapRef = useRef(null);
  const draw = useRef(
    new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_point',
    })
  );

  useEffect(() => {
    const map = mapRef.current && mapRef.current.getMap();
    if (map) {
      console.log('Adding draw control to map');
      map.addControl(draw.current);

      map.on('draw.create', updateArea);
      map.on('draw.delete', updateArea);
      map.on('draw.update', updateArea);

      return () => {
        console.log('Removing draw control from map');
        map.off('draw.create', updateArea);
        map.off('draw.delete', updateArea);
        map.off('draw.update', updateArea);
      };
    }
  }, [mapRef.current]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      console.log('Current position:', { latitude, longitude });
      setCurrentLocation({ latitude, longitude });
      setViewport((prev) => ({
        ...prev,
        latitude,
        longitude,
        zoom: 13,
      }));
    });
  }, []);

  const updateArea = (e) => {
    const data = draw.current.getAll();
    console.log('Draw event data:', data);
    if (data.features.length > 0) {
      const shape = data.features[0].geometry;
      console.log('Shape created/updated:', shape);
      onShapeComplete && onShapeComplete(shape);
    } else {
      onShapeComplete && onShapeComplete(null);
    }
  };

  const handleStyleChange = (event) => {
    setMapStyle(event.target.value);
  };

  const handleModeChange = (event) => {
    const newMode = event.target.value;
    setMode(newMode);
    draw.current.changeMode(newMode);
  };

  const startTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Tracking position:', { latitude, longitude });
          setCurrentLocation({ latitude, longitude });
          draw.current.add({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          });
          setViewport((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    if (mode === 'direct_select') {
      startTracking();
    }
  }, [mode]);

  console.log('Geometries:', geometries);

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
      <select onChange={handleModeChange} value={mode} css={modeSelectStyle}>
        <option value="draw_point">Geopoint</option>
        <option value="draw_polygon">Geoshape Manual</option>
        <option value="direct_select">Geoshape Automático</option>
      </select>
      <Map
        {...viewport}
        mapStyle={mapStyle}
        onViewportChange={(newViewport) => setViewport(newViewport)}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        ref={mapRef}
        dragPan={true}
        touchZoomRotate={true}
        onMove={(evt) => setViewport(evt.viewState)}
      >
        <GeolocateControl
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          showUserLocation={true}
        />
        {currentLocation && (
          <Marker
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
            offsetLeft={-20}
            offsetTop={-10}
          >
            <div
              style={{
                height: '10px',
                width: '10px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
          </Marker>
        )}
        {geometries.map((geometry, index) => {
          console.log('Rendering geometry:', geometry);
          return (
            <Source key={index} type="geojson" data={{ type: 'Feature', geometry }}>
              <Layer
                id={`layer-${index}`}
                type={geometry.type === 'Point' ? 'circle' : 'fill'}
                paint={
                  geometry.type === 'Point' 
                  ? { 
                      'circle-radius': 10, 
                      'circle-color': 'red', 
                      'circle-opacity': 0.5  // Añade esta línea para dar transparencia al color del círculo
                    } 
                  : { 'fill-color': '#007bff', 'fill-opacity': 0.1 }
                }
              />
            </Source>
          );
        })}
        <OfflineLayer />
      </Map>
    </div>
  );
};

const mapContainerStyle = css`
  position: relative;
  height: 400px;
  width: 100%;
  margin-bottom: 20px;
`;

const modeSelectStyle = css`
  position: absolute;
  right: 10px;
`;

export default GeoMap;
