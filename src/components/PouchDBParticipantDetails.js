/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useMemo } from 'react';
import { AppBar, Tabs, Tab, Box, Grid, TextField, Avatar, Button, Typography, IconButton, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Tooltip, CircularProgress, Fab} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NoteIcon from '@mui/icons-material/Note';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Agregar esta importación
import { css } from '@emotion/react';
import { v4 as uuidv4 } from 'uuid';
import PouchDB from 'pouchdb';
import PDFViewer from './PDFViewer';
import GeoMap from './Controls/GeoMap';
import LoanSummary from './LoanSummary';

const PouchDBParticipantDetails = ({ participantId, onBack, onNavigate, Organization }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caseNotesHistory, setCaseNotesHistory] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [geometries, setGeometries] = useState([]);
  const [extraFields, setExtraFields] = useState([]);
  const [caseNotes, setCaseNotes] = useState('');

  const db = useMemo(() => new PouchDB('enketodb'), []);

  useEffect(() => {
    const fetchParticipantDetails = async () => {
      try {
        setLoading(true);
        const doc = await db.get(participantId);
        setParticipant(doc);

        if (doc && doc._attachments) {
          const attachmentNames = Object.keys(doc._attachments);
          const attachmentPromises = attachmentNames.map(async (name) => {
            const attachment = await db.getAttachment(participantId, name);
            const blobUrl = URL.createObjectURL(attachment);
            return { name, url: blobUrl };
          });
          setAttachments(await Promise.all(attachmentPromises));
        }

        if (doc.caseNotes) {
          setCaseNotesHistory(doc.caseNotes.reverse());
        }

        if (doc.location) {
          try {
            const parsedLocation = JSON.parse(doc.location);
            setGeometries([parsedLocation]);
          } catch (error) {
            console.error('Error parsing location:', error);
          }
        }

        if (doc.responses) {
          const extraFields = doc.responses.filter(response => response.QuestionID.startsWith('extra'));
          setExtraFields(extraFields);
        }

        setLoading(false);
      } catch (err) {
        setError(`Error fetching participant data from enketodb: ${err.message}`);
        setLoading(false);
      }
    };

    fetchParticipantDetails();
  }, [db, participantId]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSave = async () => {
    const newCaseNote = { text: caseNotes, date: new Date().toISOString(), id: Date.now() };
    const updatedData = {
      ...participant,
      caseNotes: caseNotes ? [newCaseNote, ...caseNotesHistory] : [...caseNotesHistory],
    };

    try {
      await db.put({
        ...participant,
        _id: participantId,
        _rev: participant._rev,
        ...updatedData
      });
      setCaseNotes('');
      setCaseNotesHistory([newCaseNote, ...caseNotesHistory]);
    } catch (error) {
      console.error('Error saving participant data:', error);
    }
  };

  const handleDelete = async (id) => {
    const updatedNotes = caseNotesHistory.filter(note => note.id !== id);
    setCaseNotesHistory(updatedNotes);

    try {
      await db.put({
        ...participant,
        _id: participantId,
        _rev: participant._rev,
        caseNotes: updatedNotes,
      });
    } catch (error) {
      console.error('Error deleting case note:', error);
    }
  };

  if (loading) {
    return <CircularProgress css={styles.loadingStyle} />;
  }

  if (error) {
    return <Typography>{error}</Typography>;
  }

return (
    <Box css={styles.container}>
      <Box css={styles.tabsContainer}>
        <AppBar position="static">
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tooltip title="Biographic Data">
              <Tab
                icon={<PersonIcon />}
                sx={{ 
                  minWidth: '0px', 
                  color: selectedTab === 0 ? 'grey' : 'white',
                  '&.Mui-selected': { color: 'grey' }, // Asegúrate de aplicar el color gris cuando está seleccionado
                }}
              />
            </Tooltip>
            <Tooltip title="Case Notes">
              <Tab
                icon={<NoteIcon />}
                sx={{ 
                  minWidth: '0px', 
                  color: selectedTab === 1 ? 'grey' : 'white',
                  '&.Mui-selected': { color: 'grey' }, // Asegúrate de aplicar el color gris cuando está seleccionado
                }}
              />
            </Tooltip>
            <Tooltip title="Checklist">
              <Tab
                icon={<CheckIcon />}
                sx={{ 
                  minWidth: '0px', 
                  color: selectedTab === 2 ? 'grey' : 'white',
                  '&.Mui-selected': { color: 'grey' }, // Asegúrate de aplicar el color gris cuando está seleccionado
                }}
              />
            </Tooltip>
            <Tooltip title="Attachments">
              <Tab
                icon={<AttachFileIcon />}
                sx={{ 
                  minWidth: '0px', 
                  color: selectedTab === 3 ? 'grey' : 'white',
                  '&.Mui-selected': { color: 'grey' }, // Asegúrate de aplicar el color gris cuando está seleccionado
                }}
              />
            </Tooltip>
            <Tooltip title="Location Data">
              <Tab
                icon={<LocationOnIcon />}
                sx={{ 
                  minWidth: '0px', 
                  color: selectedTab === 4 ? 'grey' : 'white',
                  '&.Mui-selected': { color: 'grey' }, // Asegúrate de aplicar el color gris cuando está seleccionado
                }}
              />
            </Tooltip>
            {Organization === 'Inversiones El Paisa' && (
            <Tooltip title="Loan Summary">
              <Tab
                icon={<NoteIcon />}
                sx={{
                  minWidth: '0px',
                  color: selectedTab === 5 ? 'grey' : 'white',
                  '&.Mui-selected': { color: 'grey' },
                }}
              />
            </Tooltip>
          )}
          </Tabs>
        </AppBar>
      </Box>
      <Box css={styles.content}>
        <TabPanel value={selectedTab} index={0}>
          <BiographicTab participant={participant} extraFields={extraFields} />
        </TabPanel>
        <TabPanel value={selectedTab} index={1}>
          <CaseNotesTab caseNotes={caseNotes} setCaseNotes={setCaseNotes} caseNotesHistory={caseNotesHistory} handleSave={handleSave} handleDelete={handleDelete} />
        </TabPanel>
        <TabPanel value={selectedTab} index={2}>
          {/* Puedes agregar una funcionalidad de checklist aquí */}
        </TabPanel>
        <TabPanel value={selectedTab} index={3}>
          <AttachmentsTab attachments={attachments} />
        </TabPanel>
        <TabPanel value={selectedTab} index={4}>
          <GeoMap geometries={geometries} onShapeComplete={(shape) => console.log(shape)} />
        </TabPanel>
        {Organization === 'Inversiones El Paisa' && (
          <TabPanel value={selectedTab} index={5}>
            <LoanSummary participantId={participantId} />
          </TabPanel>
        )}
      </Box>
      <Box css={styles.footer}>
        <Button variant="contained" color="primary" onClick={handleSave} style={{ marginRight: '8px' }}>
          Save Case Member
        </Button>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <IconButton onClick={() => console.log('Add extra field')} color="primary">
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box p={3}>{children}</Box>}
  </div>
);

const BiographicTab = ({ participant, extraFields }) => (
  <Box>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Avatar src={participant?.photo} style={{ width: '100px', height: '100px' }} />
        <Button variant="contained" component="label" style={{ marginTop: '8px' }}>
          Upload Photo
          <input type="file" hidden />
        </Button>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Case ID"
              name="caseID"
              value={participant?.caseID || ''}
              fullWidth
              margin="normal"
              disabled
            />
          </Grid>
          {Object.keys(participant).map((key) => (
            key !== 'caseID' && key !== 'photo' && (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <TextField
                  label={participant[key].QuestionText || key}
                  name={key}
                  value={participant[key].Response || ''}
                  fullWidth
                  margin="normal"
                />
              </Grid>
            )
          ))}
          {extraFields.map(({ QuestionID, QuestionText }) => (
            <Grid item xs={12} sm={6} md={4} key={QuestionID}>
              <TextField
                label={QuestionText}
                name={QuestionID}
                value={participant[QuestionID]?.Response || ''}
                fullWidth
                margin="normal"
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  </Box>
);

const CaseNotesTab = ({ caseNotes, setCaseNotes, caseNotesHistory, handleSave, handleDelete }) => (
    <Box>
      <TextField
        label="Add Case Note"
        multiline
        rows={4}
        value={caseNotes}
        onChange={(e) => setCaseNotes(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleSave} style={{ marginBottom: '16px' }}>
        Save Case Note
      </Button>
      <Typography variant="h6" style={{ marginTop: '16px' }}>
        Case Notes History
      </Typography>
      <Box>
        {caseNotesHistory.map((note, index) => (
          <Box key={note.id} style={{ marginBottom: '8px', position: 'relative' }}>
            <Typography variant="body2" color="textSecondary">
              {new Date(note.date).toLocaleString()}
            </Typography>
            <Typography variant="body1">{note.text}</Typography>
            <IconButton onClick={() => handleDelete(note.id)} color="#08c" style={{ position: 'absolute', right: 0, top: 0 }}>
              <DeleteIcon />
            </IconButton>
            <Divider style={{ marginTop: '8px' }} />
          </Box>
        ))}
      </Box>
    </Box>
  );

const AttachmentsTab = ({ attachments }) => {
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  return (
    <Box>
      <Typography variant="h6" style={{ marginTop: '16px' }}>
        Adjuntos
      </Typography>
      <List>
        {attachments.length > 0 ? (
          attachments.map((attachment, index) => (
            <ListItem key={index} onClick={() => setSelectedAttachment(attachment.url)}>
              <ListItemText primary={attachment.name} />
              <ListItemSecondaryAction>
                <Button variant="contained" onClick={() => setSelectedAttachment(attachment.url)}>
                  Ver
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        ) : (
          <Typography>No hay archivos adjuntos.</Typography>
        )}
      </List>
      {selectedAttachment && (
        <Box css={{ height: '500px', width: '100%', marginTop: '16px' }}>
          <PDFViewer fileUrl={selectedAttachment} />
        </Box>
      )}
    </Box>
  );
};

const styles = {
    appBar: css`
    && .MuiTab-root {
      min-width: 0px !important;
    }
  `,
  container: css`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden;
  `,
  tabsContainer: css`
    position: fixed;
    z-index: 1000;
    width: 100%;
    margin-top: 20px;
  `,
  content: css`
    flex: 1;
    overflow-y: auto;
    padding-top: 60px;
    padding-bottom: 90px;
  `,
  footer: css`
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: space-around;
    padding: 16px;
    background-color: white;
    border-top: 1px solid #e0e0e0;
  `,
};


export default PouchDBParticipantDetails;
