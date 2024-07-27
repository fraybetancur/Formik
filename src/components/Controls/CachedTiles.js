// CachedTiles.js
import React, { useState, useEffect } from 'react';
import { css } from '@emotion/react';

const cachedTilesStyle = css`
  padding: 10px;
  margin-top: 10px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  overflow: auto;
  max-height: 200px;

  h4 {
    margin-bottom: 10px;
    color: #333;
  }

  a, button {
    display: block;
    margin: 5px 0;
    color: #0066cc;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const CachedTiles = () => {
    const [tiles, setTiles] = useState([]);

    useEffect(() => {
        const fetchTiles = async () => {
            const cache = await caches.open('mapbox-tiles');
            const keys = await cache.keys();
            const urls = keys.map(request => request.url);
            setTiles(urls);
        };

        fetchTiles();
    }, []);

    const downloadTile = async (url) => {
        const cache = await caches.open('mapbox-tiles');
        const response = await cache.match(url);
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectURL;
        link.download = url.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectURL);
    };

    const downloadAllTiles = async () => {
        for (const url of tiles) {
            await downloadTile(url);
        }
    };

    return (
        <div css={cachedTilesStyle}>
            <h4>Tiles en Caché</h4>
            <button onClick={downloadAllTiles}>Descargar Todos</button>
            {tiles.map((url, index) => (
                <a key={index} href="#!" onClick={() => downloadTile(url)}>
                    Descargar {url.split('/').pop()}
                </a>
            ))}
            {tiles.length === 0 && <p>No cached tiles available.</p>}
        </div>
    );
};

export default CachedTiles;
