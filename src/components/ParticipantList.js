import React, { useState, useEffect, useContext } from 'react';
import { css } from '@emotion/react';
import { finalDB, QuestionContext } from './QuestionContext';
import { TextField, List, ListItem, ListItemText, Avatar, CircularProgress, Card, CardContent, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ParticipantDetails from './ParticipantDetails';

const ParticipantList = ({ onNavigate }) => {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedParticipantId, setSelectedParticipantId] = useState(null); // Cambiado a participantId
  const { resetTrigger } = useContext(QuestionContext);

  const fetchParticipants = async () => {
    try {
      const allDocs = await finalDB.allDocs({ include_docs: true });
      const fetchedParticipants = allDocs.rows.reduce((acc, row) => {
        row.doc.responses.forEach(response => {
          const { CaseID, QuestionID, Response, Url } = response;
          if (!acc[CaseID]) acc[CaseID] = { CaseID };
          if (QuestionID === 'Q04') acc[CaseID].name = Response;
          if (QuestionID === 'Q12') acc[CaseID].documentNumber = Response;
          if (QuestionID === 'Q02') acc[CaseID].photo = Url;
        });
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
  }, [resetTrigger]); // Añadir resetTrigger como dependencia

  const filteredParticipants = participants.filter(participant =>
    (participant.name && participant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (participant.documentNumber && participant.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectParticipant = (participant) => {
    setSelectedParticipantId(participant.CaseID); // Guardar el ID del participante seleccionado
  };

  const handleBack = () => {
    setSelectedParticipantId(null);
  };

  const handleAddParticipant = () => {
    onNavigate('Formulario');
  };

  return (
    <div css={containerStyle}>
      {selectedParticipantId ? (
        <ParticipantDetails participantId={selectedParticipantId} onBack={handleBack} />
      ) : (
        <>
          <TextField
            label="Buscar Participante"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            css={searchStyle}
          />
          {loading ? (
            <CircularProgress css={loadingStyle} />
          ) : (
            <List>
              {filteredParticipants.map(participant => (
                <Card key={participant.CaseID} style={{ marginBottom: '10px' }}>
                  <CardContent>
                    <ListItem button onClick={() => handleSelectParticipant(participant)}>
                      <Avatar src={participant.photo} css={avatarStyle} />
                      <ListItemText 
                        primary={participant.name} 
                        secondary={participant.documentNumber} 
                      />
                    </ListItem>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
          <Fab color="primary" aria-label="add" onClick={handleAddParticipant} css={fabStyle}>
            <AddIcon />
          </Fab>
        </>
      )}
    </div>
  );
};

const containerStyle = css`
  padding: 16px;
  position: relative; /* Para posicionar el botón flotante */
`;

const searchStyle = css`
  margin-bottom: 16px;
`;

const loadingStyle = css`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const avatarStyle = css`
  margin-right: 16px;
`;

const fabStyle = css`
  position: absolute;
  bottom: 16px;
  right: 16px;
`;

export default ParticipantList;
