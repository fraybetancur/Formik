/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { AppBar, Tabs, Tab, Box, Grid, TextField, Avatar, Button, MenuItem, Typography, IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { finalDB, QuestionContext } from './QuestionContext';
import { css } from '@emotion/react';

const ParticipantDetails = ({ participantId, onBack }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [extraFields, setExtraFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateParticipant } = useContext(QuestionContext);

  const [caseNotes, setCaseNotes] = useState('');
  const [caseNotesHistory, setCaseNotesHistory] = useState([]);

  useEffect(() => {
    const fetchParticipantData = async () => {
      try {
        setLoading(true);
        const doc = await finalDB.get(participantId);
        const participantData = doc.responses.reduce((acc, response) => {
          acc[response.QuestionID] = response.Response;
          return acc;
        }, {});
        participantData.photo = doc.responses.find(response => response.QuestionID === 'Q02')?.Url || ''; // Ajustar si la URL es correcta
        setFormData(participantData);
        setCaseNotesHistory(doc.caseNotes ? doc.caseNotes.reverse() : []);
        // Filtrar campos adicionales
        const extraFields = doc.responses.filter(response => response.QuestionID.startsWith('extra'));
        setExtraFields(extraFields);
        setLoading(false);
      } catch (err) {
        setError(`Error fetching participant data from finalDB: ${err.message}`);
        setLoading(false);
      }
    };

    if (participantId) {
      fetchParticipantData();
    } else {
      setLoading(false);
    }
  }, [participantId]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddField = () => {
    const newField = { QuestionID: `extra${extraFields.length + 1}`, QuestionText: `Extra Field ${extraFields.length + 1}` };
    setExtraFields([...extraFields, newField]);
  };

  const handleSave = () => {
    const newCaseNote = { text: caseNotes, date: new Date().toISOString(), id: Date.now() };
    const updatedData = {
      ...formData,
      caseNotes: caseNotes ? [newCaseNote, ...caseNotesHistory] : [...caseNotesHistory],
    };
    updateParticipant(participantId, updatedData);
    setCaseNotes('');
    setCaseNotesHistory([newCaseNote, ...caseNotesHistory]); // Actualizar el historial inmediatamente
  };

  const handleDelete = (id) => {
    const updatedNotes = caseNotesHistory.filter(note => note.id !== id);
    setCaseNotesHistory(updatedNotes);
    updateParticipant(participantId, { ...formData, caseNotes: updatedNotes });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Box css={styles.container}>
      <Box css={styles.tabsContainer}>
        <AppBar position="static">
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Biographic" css={selectedTab === 0 ? styles.selectedTab : styles.tab} />
            <Tab label="Case Notes" css={selectedTab === 1 ? styles.selectedTab : styles.tab} />
            {/* Add other tabs as needed */}
          </Tabs>
        </AppBar>
      </Box>
      <Box css={styles.content}>
        <TabPanel value={selectedTab} index={0}>
          <BiographicTab formData={formData} handleChange={handleChange} extraFields={extraFields} />
        </TabPanel>
        <TabPanel value={selectedTab} index={1}>
          <CaseNotesTab caseNotes={caseNotes} setCaseNotes={setCaseNotes} caseNotesHistory={caseNotesHistory} handleSave={handleSave} handleDelete={handleDelete} />
        </TabPanel>
      </Box>
      <Box css={styles.footer}>
        <Button variant="contained" color="primary" onClick={handleSave} style={{ marginRight: '8px' }}>
          Save Case Member
        </Button>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <IconButton onClick={handleAddField} color="primary">
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
};

const BiographicTab = ({ formData, handleChange, extraFields }) => (
  <Box>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Avatar src={formData.photo} style={{ width: '100px', height: '100px' }} />
        <Button variant="contained" component="label" style={{ marginTop: '8px' }}>
          Upload Photo
          <input type="file" hidden />
        </Button>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Grid container spacing={2}>
          {[
            { id: 'Q03', label: 'Apellidos' },
            { id: 'Q04', label: 'Nombres' },
            { id: 'Q05', label: 'Fecha Nacimiento' },
            { id: 'Q06', label: 'Sexo'},
            { id: 'Q07', label: 'Género' },
            { id: 'Q08', label: 'Nacionalidad' },
            { id: 'Q09', label: 'Estado Civil' },
            { id: 'Q11', label: 'Tipo Documento' },
            { id: 'Q12', label: 'Número de Documento' },
            { id: 'Q14', label: 'Departamento de residencia' },
            { id: 'Q15', label: 'Municipio de residencia' },
          ].map(({ id, label, type, options }) => (
            <Grid item xs={12} sm={6} md={4} key={id}>
              {type === 'select' ? (
                <TextField
                  select
                  label={label}
                  name={id}
                  value={formData[id] || ''}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                >
                  {options.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  label={label}
                  name={id}
                  value={formData[id] || ''}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              )}
            </Grid>
          ))}
          {extraFields.map(({ QuestionID, QuestionText }) => (
            <Grid item xs={12} sm={6} md={4} key={QuestionID}>
              <TextField
                label={QuestionText}
                name={QuestionID}
                value={formData[QuestionID] || ''}
                onChange={handleChange}
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

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;!important
    overflow: hidden;
    
  `,
  tabsContainer: css`
    position: fixed;
    z-index: 1000;
    width: 100%;
    margin-top: 30px;
  `,
  content: css`
    flex: 1;
    overflow-y: auto;
    padding-top: 60px;
    padding-bottom: 60px;
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
  tab: css`
    color: white;
    background-color: #1976d2;
    &:hover {
      background-color: #115293;
    }
  `,
  selectedTab: css`
    color: #1976d2;
    background-color: white;
  `,
};

export default ParticipantDetails;
