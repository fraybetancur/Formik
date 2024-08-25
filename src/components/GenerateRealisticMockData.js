
/** @jsxImportSource @emotion/react */
import React, { useEffect } from 'react';
import PouchDB from 'pouchdb';
import { v4 as uuidv4 } from 'uuid';

const GenerateRealisticMockData = () => {
  useEffect(() => {
    const db = new PouchDB('enketodb'); // Nombre de la base de datos

    const generateData = async () => {
      const mockData = {
        _id: `uuid:${uuidv4()}`,
        instanceId: `uuid:${uuidv4()}`,
        enketoId: 'o9nTkASd',
        name: 'Registro - 4',
        files: [{}, {}], // Dos objetos vacíos como en el ejemplo
        created: Date.now(),
        updated: Date.now(),
        draft: false,
        jsonData: {
          a8UsHWgv8pBrGHV8DsoatA: {
            formhub: {
              uuid: '54facbea05be45cdabc7ccfe895cc84f',
            },
            start: new Date().toISOString(),
            end: new Date(new Date().getTime() + 5 * 60 * 1000).toISOString(), // Simulando 5 minutos después
            today: '2024-08-23',
            municipality: 47001,
            municipality_L: {
              '#text': 'Santa Marta - Magdalena',
              '@_hxl': '5',
            },
            point: {
              '#text': '4.667345 -74.054515 0 0',
              '@_hxl': 'location',
            },
            image: {
              '#text': 'fotos carnet-21_56_38.jpg',
              '@_hxl': 'avatar',
              '@_type': 'file',
            },
            Demographic: {
              Apellidos: {
                '#text': 'Betancur Duque',
                '@_hxl': '1',
              },
              Nombres: {
                '#text': 'Fray Alonso',
                '@_hxl': '2',
              },
            },
            age: '1980-10-24',
            V_age: 43.83407713649472,
            sex: 2,
            nationality: {
              '#text': 1,
              '@_hxl': '5',
            },
            doctype: 4,
            id: {
              '#text': 71224017,
              '@_hxl': '3',
            },
            tel: {
              '#text': 3223114250,
              '@_hxl': '4',
            },
            CV: {
              '#text': 'Americares-FY2022-Annual-Report-21_57_28.pdf',
              '@_hxl': 'Attachment',
              '@_type': 'file',
            },
            mail: 'fraybetancur@gmail.com',
            '__version__': 'vgeHrnFCxA9kG7Esicpp2g',
            meta: {
              audit: '',
              instanceID: `uuid:${uuidv4()}`,
            },
            '@_xmlns:jr': 'http://openrosa.org/javarosa',
            '@_xmlns:orx': 'http://openrosa.org/xforms',
            '@_id': 'a8UsHWgv8pBrGHV8DsoatA',
            '@_version': '6 (2024-08-25 02:55:24)',
          },
        },
      };

      try {
        const result = await db.put(mockData);
        console.log('Datos simulados realistas insertados en PouchDB', result);
      } catch (err) {
        console.error('Error al insertar datos simulados en PouchDB', err);
      }
    };

    generateData();
  }, []);

  return null;
};

export default GenerateRealisticMockData;
