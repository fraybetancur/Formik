/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { css } from '@emotion/react';
import { Box, TextField, List, ListItem, Avatar, CircularProgress, Card, CardContent, Fab, Grid, Typography, Divider, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { finalDB, QuestionContext } from './QuestionContext';
import { ParticipantDetails } from './ParticipantDetails';

const ParticipantList = ({ onNavigate, Organization }) => {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const { setFilters, shouldReloadParticipants, questions, organizationId } = useContext(QuestionContext);
  const { filters } = useContext(QuestionContext);

  useEffect(() => {
    setFilters({ formId: '', participantId: '' });
    console.log("Organization in ParticipantList useEffect:", organizationId);
  }, [setFilters, organizationId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const allDocs = await finalDB.allDocs({ include_docs: true });
      const fetchedParticipants = allDocs.rows.reduce((acc, row) => {
        if (row.doc.responses) {
          row.doc.responses.forEach(response => {
            const { CaseID, QuestionID, Response, Url, ParticipantList } = response;
            if (!acc[CaseID]) acc[CaseID] = { CaseID, fields: [], photo: null };

            if (ParticipantList) {
              if (ParticipantList === 1) {
                acc[CaseID].photo = Url;
              } else {
                acc[CaseID].fields.push({ QuestionID, Response, ParticipantList });
              }
            }
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
  }, [shouldReloadParticipants, filters]);

  const filteredParticipants = participants.filter(participant =>
    participant.fields.some(field =>
      field.Response && field.Response.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelectParticipant = (participant) => {
    setSelectedParticipantId(participant.CaseID);
    onNavigate('ParticipantDetails', participant.CaseID);
  };

  const handleBack = () => {
    setSelectedParticipantId(null);
  };

  

  const handleAddParticipant = () => {
    setFilters(prevFilters => ({ ...prevFilters, formId: 'Registro' }));
    onNavigate('Formulario');
  };

  const getFieldName = (questionID) => {
    const question = questions.find(q => q.QuestionID === questionID);
    return question ? question.QuestionText : '';
  };

  const renderParticipantFields = (participant) => {
    if (participant.fields && participant.fields.length > 0) {
      return participant.fields
        .sort((a, b) => a.ParticipantList - b.ParticipantList)
        .map((item, index) => (
          <React.Fragment key={index}>
            {index === 0 ? (
              <Typography variant="h6" css={participantListStyles.firstFieldText}>
                {item.Response}
              </Typography>
            ) : (
              <Typography variant="body2" css={participantListStyles.fieldText}>
                {getFieldName(item.QuestionID)}: {item.Response}
              </Typography>
            )}
            {index < participant.fields.length - 1 && (
              <Divider css={participantListStyles.dividerStyle} />
            )}
          </React.Fragment>
        ));
        
    }
    return null;
  };

  return (
    <Box css={participantListStyles.container}>
      {selectedParticipantId ? (
        <ParticipantDetails participantId={selectedParticipantId} onBack={handleBack} onNavigate={onNavigate} Organization={Organization}/>
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
                          {renderParticipantFields(participant)}
                        </div>
                      </ListItem>
                    </CardContent>
                  </Card>
                ))}
              </List>
            )}
          </Box>
          <Box css={participantListStyles.fixedBottom}>
          <Button variant="contained" color="primary" onClick={() => onNavigate('IframeComponent')}> Button ja</Button>
          <Button variant="contained" color="primary" onClick={() => onNavigate('PouchDBViewer')}>Ver Datos en PouchDB</Button>
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

export default ParticipantList;
