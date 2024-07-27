/** @jsxImportSource @emotion/react */
import React, { useState, useRef, useEffect } from 'react';
import Map, { Marker, GeolocateControl, Source, Layer } from 'react-map-gl';
import { css } from '@emotion/react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import OfflineLayer from './Controls/OfflineLayer';  // Asegúrate de que la ruta es correcta
import CachedTiles from './Controls/CachedTiles';  // Asegúrate de que la ruta es correcta

const CacheDownloader = ({ geometries = [], onShapeComplete }) => {
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
    const draw = useRef(new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            point: true,
            line_string: true,
            polygon: true,
            trash: true,
        },
        defaultMode: 'draw_point',
    }));

    useEffect(() => {
        const map = mapRef.current && mapRef.current.getMap();
        if (map) {
            map.addControl(draw.current);
            map.on('draw.create', updateArea);
            map.on('draw.delete', updateArea);
            map.on('draw.update', updateArea);

            return () => {
                map.off('draw.create', updateArea);
                map.off('draw.delete', updateArea);
                map.off('draw.update', updateArea);
            };
        }
    }, [mapRef.current]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
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
        if (data.features.length > 0) {
            const shape = data.features[0].geometry;
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

    return (
        <div css={mapContainerStyle}>
            <select onChange={handleStyleChange} value={mapStyle}>
                {/* Opciones del estilo del mapa */}
            </select>
            <select onChange={handleModeChange} value={mode} css={modeSelectStyle}>
                {/* Opciones del modo de dibujo */}
            </select>
            <Map
                {...viewport}
                mapStyle={mapStyle}
                onViewportChange={setViewport}
                mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                ref={mapRef}
                dragPan={true}
                touchZoomRotate={true}
                onMove={(evt) => setViewport(evt.viewState)}
            >
                <GeolocateControl positionOptions={{ enableHighAccuracy: true }} trackUserLocation={true} showUserLocation={true} />
                <OfflineLayer />
                {geometries.map((geometry, index) => (
                    <Source key={index} type="geojson" data={geometry}>
                        <Layer
                            id={`layer-${index}`}
                            type={geometry.type === 'Point' ? 'circle' : 'fill'}
                            paint={geometry.type === 'Point' ? { 'circle-radius': 5, 'circle-color': 'red' } : { 'fill-color': '#007bff', 'fill-opacity': 0.1 }}
                        />
                    </Source>
                ))}
            </Map>
            <CachedTiles />
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

export default CacheDownloader;
