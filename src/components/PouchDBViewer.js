/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import PouchDB from 'pouchdb';
import { Box, List, ListItem, Typography } from '@mui/material';

export const PouchDBViewer = () => {
  const [data, setData] = useState([]);
  const db = new PouchDB('enketo_pouchdb');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allDocs = await db.allDocs({ include_docs: true });
        console.log('Documentos recuperados:', allDocs); // Añade logs para confirmar la recuperación
        setData(allDocs.rows.map(row => row.doc)); // Almacena todos los documentos 1
      } catch (error) {
        console.error('Error al recuperar datos de PouchDB:', error);
      }
    };

    fetchData();
  }, [db]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Datos almacenados en enketo_pouchdb
      </Typography>
      <List>
        {data.length > 0 ? (
          data.map((doc, index) => (
            <ListItem key={index}>
              <pre>{JSON.stringify(doc, null, 2)}</pre> {/* Muestra los datos en bruto */}
            </ListItem>
          ))
        ) : (
          <Typography>No se encontraron datos.</Typography>
        )}
      </List>
    </Box>
  );
};

export default PouchDBViewer;
