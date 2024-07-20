/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { css } from '@emotion/react';
import { finalDB, QuestionContext } from './QuestionContext';
import { TextField, List, ListItem, Avatar, CircularProgress, Card, CardContent, Fab, Grid, Typography, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ParticipantDetails from './ParticipantDetails';

const ParticipantList = ({ onNavigate }) => {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const { resetTrigger } = useContext(QuestionContext);

  const fetchParticipants = async () => {
    try {
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
  }, [resetTrigger]);

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
    <div css={containerStyle}>
      {selectedParticipantId ? (
        <ParticipantDetails participantId={selectedParticipantId} onBack={handleBack} />
      ) : (
        <>
          <Grid container alignItems="center" spacing={2} css={gridStyle}>
            <Grid item xs>
              <TextField
                label="Buscar Participante"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                css={searchStyle}
              />
            </Grid>
            <Grid item>
              <Fab color="primary" aria-label="add" onClick={handleAddParticipant} css={fabStyle}>
                <AddIcon />
              </Fab>
            </Grid>
          </Grid>
          {loading ? (
            <CircularProgress css={loadingStyle} />
          ) : (
            <List>
              {filteredParticipants.map(participant => (
                <Card key={participant.CaseID} css={cardStyle}>
                  <CardContent>
                    <ListItem button onClick={() => handleSelectParticipant(participant)}>
                      <div css={avatarContainerStyle}>
                        <Avatar src={participant.photo} css={avatarStyle} />
                      </div>
                      <div css={infoStyle}>
                        <Typography variant="h6">{participant.name}</Typography>
                        <Divider css={dividerStyle} />
                        <Typography variant="body2">Documento: {participant.documentNumber}</Typography>
                        <Divider css={dividerStyle} />
                        <Typography variant="body2">Fecha Nacimiento: {participant.birthdate}</Typography>
                        <Divider css={dividerStyle} />
                        <Typography variant="body2">Sexo: {participant.sex}</Typography>
                        {/* <Divider css={dividerStyle} />
                        <Typography variant="body2">Nacionalidad: {participant.nationality}</Typography>
                        <Divider css={dividerStyle} />
                        <Typography variant="body2">Tipo Documento: {participant.documentType}</Typography>
                        <Divider css={dividerStyle} />
                        <Typography variant="body2">Municipio de residencia: {participant.residence}</Typography> */}
                      </div>
                    </ListItem>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </>
      )}
    </div>
  );
};

const containerStyle = css`
  padding: 16px;
  position: relative;
`;

const searchStyle = css`
  margin-bottom: 0px;
`;

const loadingStyle = css`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const gridStyle = css`
  .MuiGrid-item {
    padding-top: 18px !important;
    padding-bottom: 18px !important;
  }
`;

const avatarContainerStyle = css`
  margin-right: 16px;
`;

const avatarStyle = css`
  width: 90px !important;
  height: 90px !important;
`;

const fabStyle = css`
  position: relative;
`;

const cardStyle = css`
  margin-bottom: 16px;
  padding: 0px;
  border-radius: 12px;
  background-color: #f3f3f3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const infoStyle = css`
  flex: 1;
`;

const dividerStyle = css`
  margin: 4px 0;
  border-color: rgb(59 59 59);
`;

export default ParticipantList;
