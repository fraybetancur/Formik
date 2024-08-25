/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import PouchDB from 'pouchdb';
import { Box, List, ListItem, Typography } from '@mui/material';

export const PouchDBViewer = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const db = new PouchDB('enketodb'); // Mover la creación de la instancia db dentro del useEffect

    const fetchResponses = async () => {
      try {
        const result = await db.allDocs({ include_docs: true });
        setData(result.rows.map(row => row.doc));
      } catch (err) {
        setError('Error cargando los datos desde PouchDB');
        console.error(err);
      }
    };

    fetchResponses();
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Datos almacenados en enketo_pouchdb
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
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
