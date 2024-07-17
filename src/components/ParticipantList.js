import React, { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import { finalDB } from './QuestionContext'; // Importa finalDB
import { TextField, List, ListItem, ListItemText, Avatar, CircularProgress } from '@mui/material';

const ParticipantList = ({ onSelectParticipant }) => {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const allDocs = await finalDB.allDocs({ include_docs: true });
        const fetchedParticipants = allDocs.rows
          .reduce((acc, row) => {
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

    fetchParticipants();
  }, []);

  const filteredParticipants = participants.filter(participant => 
    (participant.name && participant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (participant.documentNumber && participant.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div css={containerStyle}>
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
            <ListItem key={participant.CaseID} button onClick={() => onSelectParticipant(participant)}>
              <Avatar src={participant.photo} css={avatarStyle} />
              <ListItemText 
                primary={participant.name} 
                secondary={participant.documentNumber} 
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

const containerStyle = css`
  padding: 16px;
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

export default ParticipantList;
