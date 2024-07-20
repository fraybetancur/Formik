/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { css } from '@emotion/react';
import { Box } from '@mui/material';
import { finalDB, QuestionContext } from './QuestionContext';
import { TextField, List, ListItem, Avatar, CircularProgress, Card, CardContent, Fab, Grid, Typography, Divider, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ParticipantDetails from './ParticipantDetails';

const ParticipantList = ({ onNavigate }) => {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const { shouldReloadParticipants } = useContext(QuestionContext); // Usar shouldReloadParticipants del contexto

  const fetchParticipants = async () => {
    try {
      setLoading(true); // Añadido para mostrar el indicador de carga correctamente
      const allDocs = await finalDB.allDocs({ include_docs: true });
      const fetchedParticipants = allDocs.rows.reduce((acc, row) => {
        if (row.doc.responses) {
          row.doc.responses.forEach(response => {
            const { CaseID, QuestionID, Response, Url } = response;
            if (!acc[CaseID]) acc[CaseID] = { CaseID };
            if (QuestionID === 'Q04') acc[CaseID].name = Response;
            if (QuestionID === 'Q05') acc[CaseID].birthdate = Response;
            if (QuestionID === 'Q06') acc[CaseID].sex = Response;
            if (QuestionID === 'Q08') acc[CaseID].nationality = Response;
            if (QuestionID === 'Q11') acc[CaseID].documentType = Response;
            if (QuestionID === 'Q12') acc[CaseID].documentNumber = Response;
            if (QuestionID === 'Q15') acc[CaseID].residence = Response;
            if (QuestionID === 'Q02') acc[CaseID].photo = Url;
          });
        }
        return acc;
      }, {});
      setParticipants(Object.values(fetchedParticipants));
    } catch (err) {
      console.error('Error fetching participants from finalDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [shouldReloadParticipants]); // Dependencia en shouldReloadParticipants para forzar la recarga

  const filteredParticipants = participants.filter(participant =>
    (participant.name && participant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (participant.documentNumber && participant.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectParticipant = (participant) => {
    setSelectedParticipantId(participant.CaseID);
  };

  const handleBack = () => {
    setSelectedParticipantId(null);
  };

  const handleAddParticipant = () => {
    onNavigate('Formulario');
  };

  return (
    <Box css={participantListStyles.container}>
      {selectedParticipantId ? (
        <ParticipantDetails participantId={selectedParticipantId} onBack={handleBack} />
      ) : (
        <>
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
                <Fab color="primary" aria-label="add" onClick={handleAddParticipant} css={participantListStyles.fabStyle}>
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
                  <Card key={participant.CaseID} css={participantListStyles.cardStyle}>
                    <CardContent css={participantListStyles.cardContentStyle}>
                      <ListItem button onClick={() => handleSelectParticipant(participant)}>
                        <div css={participantListStyles.avatarContainerStyle}>
                          <Avatar src={participant.photo} css={participantListStyles.avatarStyle} />
                        </div>
                        <div css={participantListStyles.infoStyle}>
                          <Typography variant="h6">{participant.name}</Typography>
                          <Divider css={participantListStyles.dividerStyle} />
                          <Typography variant="body2">Documento: {participant.documentNumber}</Typography>
                          <Divider css={participantListStyles.dividerStyle} />
                          <Typography variant="body2">Fecha Nacimiento: {participant.birthdate}</Typography>
                          <Divider css={participantListStyles.dividerStyle} />
                          <Typography variant="body2">Sexo: {participant.sex}</Typography>
                        </div>
                      </ListItem>
                    </CardContent>
                  </Card>
                ))}
              </List>
            )}
          </Box>
          <Box css={participantListStyles.fixedBottom}>
            <Button variant="contained" color="primary">Button 1</Button>
            <Button variant="contained" color="primary">Button 2</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

const participantListStyles = {
  container: css`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden; /* Evita que todo el contenedor haga scroll */
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
    padding-bottom: 160px; /* Ajusta para el espacio de los botones fijos */
    padding-left: 2rem;
    padding-right: 2rem;
  `,
  fixedBottom: css`
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-around;
    padding: 16px;
    background-color: white;
    box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.1);
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
    padding: 0px !important;
  `,
  infoStyle: css`
    flex: 1;
  `,
  dividerStyle: css`
    margin: 4px 0;
    border-color: rgb(59 59 59);
  `,
};

export default ParticipantList;
