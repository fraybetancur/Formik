/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useMemo } from 'react';
import { css } from '@emotion/react';
import {
  Box,
  TextField,
  List,
  ListItem,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  Fab,
  Grid,
  Typography,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PouchDB from 'pouchdb';

const PouchDBParticipantList = ({ onNavigate }) => {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Crear la instancia de PouchDB solo una vez
  const db = useMemo(() => new PouchDB('enketodb'), []);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const allDocs = await db.allDocs({ include_docs: true });
        const participantData = allDocs.rows.map(row => {
          const doc = row.doc;
          const jsonDataKey = Object.keys(doc.jsonData)[0]; 
          const jsonData = doc.jsonData[jsonDataKey];

          // Extraer el nombre del archivo de imagen (avatar)
          const avatarFileName = jsonData?.image?.['#text'];
          let avatarUrl = null;

          if (avatarFileName && Array.isArray(doc.files)) {
            const avatarBlob = doc.files.find(file => file.name === avatarFileName);
            if (avatarBlob instanceof Blob) {
              avatarUrl = URL.createObjectURL(avatarBlob);
            }
          }

          return { ...doc, jsonData, avatarUrl }; 
        });
        setParticipants(participantData);
      } catch (err) {
        console.error('Error al obtener participantes de PouchDB:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [db]);

  // Filtrar participantes según el término de búsqueda
  const filteredParticipants = participants.filter(participant =>
    participant.name &&
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar la selección de un participante
  const handleSelectParticipant = (participant) => {
    onNavigate('PouchDBParticipantDetails', participant._id);
  };

  // Manejar la navegación al formulario de agregar participante
  const handleAddParticipant = () => {
    onNavigate('Formulario');
  };

  /**
   * Función que extrae los campos de jsonData que contienen la clave "@_hxl".
   * La función es recursiva para asegurar que se capturen los campos dentro de
   * cualquier estructura anidada.
   */
  const getFieldsWithHXL = (data, fields = []) => {
    for (let key in data) {
      if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
        // Verificar si el objeto contiene las claves "@_hxl" y "#text"
        if ('@_hxl' in data[key] && '#text' in data[key]) {
          fields.push({ label: key, value: data[key]['#text'], hxl: data[key]['@_hxl'] });
        } else {
          // Llamada recursiva si el campo es un objeto pero no tiene "@_hxl"
          getFieldsWithHXL(data[key], fields);
        }
      }
    }
    return fields;
  };

  /**
   * Función para renderizar los campos del participante.
   * Se limitan los campos a los primeros 4 con base en la numeración de "@_hxl".
   */
  const renderParticipantFields = (participant) => {
    let fields = getFieldsWithHXL(participant.jsonData);
    // Ordenar los campos según el valor de hxl (sin el carácter #)
    fields = fields
      .filter(field => !isNaN(field.hxl)) // Asegurar que hxl sea un número
      .sort((a, b) => parseInt(a.hxl) - parseInt(b.hxl))
      .slice(0, 6); // Limitar a los primeros 4 campos

    return (
      <div>
        {fields.map((field, index) => (
          <div key={index}>
            {index === 0 ? (
              // El primer campo se muestra en negrita y más grande
              <Typography variant="h6" css={participantListStyles.firstFieldText}>
                {field.value || 'No disponible'}
              </Typography>
            ) : (
              // Los demás campos se muestran en tamaño más pequeño
              <Typography variant="body2" css={participantListStyles.fieldText}>
                <strong>{field.label}:</strong> {field.value || 'No disponible'}
              </Typography>
            )}
            {index < fields.length - 1 && <Divider css={participantListStyles.dividerStyle} />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Box css={participantListStyles.container}>
      <Box css={participantListStyles.fixedTop}>
        <Grid container alignItems="center" spacing={2} css={participantListStyles.gridStyle}>
          <Grid item xs>
            <TextField
              label="Buscar Participante"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              css={participantListStyles.searchStyle}
            />
          </Grid>
          <Grid item>
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleAddParticipant}
              css={participantListStyles.fabStyle}
            >
              <AddIcon />
            </Fab>
          </Grid>
        </Grid>
      </Box>
      <Box css={participantListStyles.content}>
        {loading ? (
          <CircularProgress css={participantListStyles.loadingStyle} />
        ) : (
          <List>
            {filteredParticipants.map(participant => (
              <React.Fragment key={participant._id}>
                <Card css={participantListStyles.cardStyle}>
                  <CardContent css={participantListStyles.cardContentStyle}>
                    <ListItem button onClick={() => handleSelectParticipant(participant)}>
                      <div css={participantListStyles.avatarContainerStyle}>
                        <Avatar css={participantListStyles.avatarStyle} src={participant.avatarUrl} />
                      </div>
                      <div css={participantListStyles.infoStyle}>
                        {renderParticipantFields(participant)}
                      </div>
                    </ListItem>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

const participantListStyles = {
  container: css`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    position: fixed;
  `,
  fixedTop: css`
    width: 100%;
    margin-top: 15px;
    z-index: 100;
    background-color: white;
    padding: 1rem;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  `,
  content: css`
    flex: 1;
    overflow-y: auto;
    padding-bottom: 160px;
    padding-left: 2rem;
    padding-right: 2rem;
  `,
  gridStyle: css`
    .MuiGrid-item {
      padding-top: 38px !important;
      padding-bottom: 18px !important;
    }
  `,
  searchStyle: css`
    margin-bottom: 0px;
  `,
  loadingStyle: css`
    display: flex;
    justify-content: center;
    margin-top: 20px;
  `,
  avatarContainerStyle: css`
    margin-right: 16px;
  `,
  avatarStyle: css`
    width: 90px !important;
    height: 90px !important;
  `,
  fabStyle: css`
    position: relative;
  `,
  cardStyle: css`
    margin-bottom: 16px;
    border-radius: 12px;
    background-color: #f3f3f3;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  `,
  cardContentStyle: css`
    margin-top: 0px;
    display: flex;
    align-items: center;
    padding: 0px;
    &:last-child {
      padding-bottom: 0px;
    }
  `,
  infoStyle: css`
    display: flex;
    flex-direction: column;
    justify-content: center;
  `,
  dividerStyle: css`
    margin: 2px 0;
    border-color: rgb(59 59 59);
  `,
  fieldText: css`
    margin-bottom: 0px;
    font-size: 0.7rem !important;
  `,
  firstFieldText: css`
    font-weight: bold;
    font-size: 1.2em;
    color: #333;
    margin-bottom: 2px;
  `,
};

export default PouchDBParticipantList;
