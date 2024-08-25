/** @jsxImportSource @emotion/react */
import React, { useEffect } from 'react';
import PouchDB from 'pouchdb';

const GenerateRealisticMockData = () => {
  useEffect(() => {
    const db = new PouchDB('enketodb'); // Nombre de la base de datos actualizado a "enketodb"

    const generateData = async () => {
      const mockData = {
        _id: `uuid:${Math.random().toString(36).substring(2, 15)}`,
        instanceId: `uuid:${Math.random().toString(36).substring(2, 15)}`,
        enketoId: 'o9nTkASd',
        name: 'Registro - 2',
        files: [
          {
            name: '1-18_24_48.png',
            size: 253480,
            type: 'image/png'
          }
        ],
        jsonData: {
          "@_id": "a8UsHWgv8pBrGHV8DsoatA",
          "@_version": "1 (2024-08-24 23:24:27)",
          "@_xmlns:jr": "http://openrosa.org/javarosa",
          "@_xmlns:orx": "http://openrosa.org/xforms",
          "Demographic": {
            "Apellidos": "Betancur",
            "Nombres": "Fray"
          },
          "V_age": 0.043806811959259666,
          "age": "2024-08-08",
          "doctype": 4,
          "end": "2024-08-24T18:25:45.405-05:00",
          "formhub": {
            "uuid": "54facbea05be45cdabc7ccfe895cc84f"
          },
          "id": 71224017,
          "image": {
            "@_type": "file",
            "#text": "1-18_24_48.png"
          },
          "mail": "fraybetancur@gmail.com",
          "meta": {
            "audit": "",
            "instanceID": `uuid:${Math.random().toString(36).substring(2, 15)}`
          },
          "municipality": 5001,
          "municipality_L": "Medellín - Antioquia",
          "nationality": 1,
          "sex": 2,
          "start": new Date().toISOString(),
          "tel": 3223114250,
          "today": "2024-08-23",
          "__version__": "vCdxPHjL67cSSYRFub2gtS"
        },
        created: Date.now(),
        updated: Date.now(),
        draft: false
      };

      try {
        await db.put(mockData);
        console.log('Datos simulados realistas insertados en PouchDB', mockData);
      } catch (err) {
        console.error('Error al insertar datos simulados en PouchDB', err);
      }
    };

    generateData();
  }, []);

  
};

export default GenerateRealisticMockData;
