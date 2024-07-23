/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { AppBar, Tabs, Tab, Box, Grid, TextField, Avatar, Button, MenuItem, Typography, IconButton, Divider, FormControl, InputLabel, Select, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material'; // Importa los componentes necesarios
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { finalDB, QuestionContext, localSurveyDB } from './QuestionContext'; // Importa la base de datos local de encuestas
import { css } from '@emotion/react';
import { v4 as uuidv4 } from 'uuid';

const ParticipantDetails = ({ participantId, onBack, onNavigate }) => {
  console.log('ParticipantDetails onNavigate:', onNavigate); // Verificación
  console.log('ParticipantDetails onBack:', onBack); // Verificación
  console.log('ParticipantDetails participantId:', participantId); // Log para depuración
  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [extraFields, setExtraFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateParticipant } = useContext(QuestionContext);

  const [caseNotes, setCaseNotes] = useState('');
  const [caseNotesHistory, setCaseNotesHistory] = useState([]);
  const [formIds, setFormIds] = useState([]);

  useEffect(() => {
    const fetchParticipantData = async () => {
      try {
        setLoading(true);
        console.log('Iniciando obtención de datos de participante para participantId:', participantId);

        // Consulta todos los documentos con el mismo caseID y formID = 'Registro'
        const result = await finalDB.find({
          selector: {
            caseID: participantId,
            formID: 'Registro'
          }
        });

        console.log('Resultado de búsqueda en finalDB:', result.docs);

        if (result.docs.length > 0) {
          const participantData = {};
          const caseNotesList = [];
          let photoUrl = '';

          result.docs.forEach(doc => {
            console.log('Documento del participante encontrado:', doc);

            doc.responses.forEach(response => {
              participantData[response.QuestionID] = response.Response;
              if (response.QuestionID === 'Q05' && response.Url) {
                photoUrl = response.Url; // Obtiene la URL de la foto
              }
            });

            if (doc.caseNotes) {
              caseNotesList.push(...doc.caseNotes.reverse());
            }
          });

          participantData.photo = photoUrl || ''; // Asigna la URL de la foto
          participantData.caseID = participantId; // Agregar el caseID al formData
          setFormData(participantData);
          setCaseNotesHistory(caseNotesList);
          setExtraFields(result.docs.flatMap(doc => doc.responses.filter(response => response.QuestionID.startsWith('extra'))));
        } else {
          throw new Error('No participant data found');
        }

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
  console.log('Datos del participante para mostrar:', formData);
  return (
    <Box css={styles.container}>
      <Box css={styles.tabsContainer}>
        <AppBar position="static">
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Biographic" css={selectedTab === 0 ? styles.selectedTab : styles.tab} />
            <Tab label="Case Notes" css={selectedTab === 1 ? styles.selectedTab : styles.tab} />
            <Tab label="Follow-up Forms" css={selectedTab === 2 ? styles.selectedTab : styles.tab} />
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
        <TabPanel value={selectedTab} index={2}>
          <FollowUpFormsTab participantId={participantId} onNavigate={onNavigate} />
        </TabPanel>
      </Box>
      <Box css={styles.footer}>
        <Button variant="contained" color="primary" onClick={handleSave} style={{ marginRight: '8px' }}>
          Save Case Member
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            console.log('Botón Back clickeado'); // Log para depuración
            if (onBack) {
              onBack();
            } else {
              console.error('onBack no está definido');
            }
          }}
        >
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
  console.log('ParticipantDetails onNavigate:', typeof onNavigate); // Log para depuración
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
          <Grid item xs={12}>
            <TextField
              label="Case ID"
              name="caseID"
              value={formData.caseID || ''}
              fullWidth
              margin="normal"
              disabled // Este campo no es editable
            />
          </Grid>
          {[
            { id: 'Q06', label: 'Apellidos' },
            { id: 'Q07', label: 'Nombres' },
            { id: 'Q08', label: 'Fecha Nacimiento' },
            { id: 'Q09', label: 'Sexo' },
            { id: 'Q10', label: 'Género' },
            { id: 'Q11', label: 'Nacionalidad' },
            { id: 'Q12', label: 'Estado Civil' },
            { id: 'Q14', label: 'Tipo Documento' },
            { id: 'Q15', label: 'Número de Documento' },
            { id: 'Q23', label: 'Departamento de residencia' },
            { id: 'Q24', label: 'Municipio de residencia' },
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

const FollowUpFormsTab = ({ participantId, onNavigate }) => {
  const { setFilters } = useContext(QuestionContext);
  const [followUpForms, setFollowUpForms] = useState([]);
  const [formIds, setFormIds] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [responses, setResponses] = useState([]); // Estado para almacenar las respuestas
  console.log('FollowUpFormsTab onNavigate:', typeof onNavigate); // Log para depuración
  console.log('FollowUpFormsTab participantId:', participantId); // Log para depuración

  // Fetch follow-up forms related to the participant
  useEffect(() => {
    const fetchFollowUpForms = async () => {
      try {
        const result = await finalDB.find({
          selector: {
            caseID: participantId,
          },
        });
        console.log('Follow-up forms fetched:', result.docs); // Log the fetched follow-up forms
        setFollowUpForms(result.docs);
      } catch (error) {
        console.error('Error fetching follow-up forms:', error);
      }
    };

    fetchFollowUpForms();
  }, [participantId]);

  // Fetch unique form IDs from the survey database
  useEffect(() => {
    const fetchFormIds = async () => {
      try {
        const allForms = await localSurveyDB.allDocs({ include_docs: true });
        const uniqueFormIds = [...new Set(allForms.rows.map(row => row.doc.FormID).filter(formId => formId && formId !== 'Registro'))];
        console.log('All Forms:', allForms.rows.map(row => row.doc)); // Log all forms
        console.log('Unique Form IDs:', uniqueFormIds); // Log the unique form IDs
        setFormIds(uniqueFormIds);
      } catch (error) {
        console.error('Error fetching form IDs:', error);
      }
    };

    fetchFormIds();
  }, []);

  // Fetch responses from the local survey database for debugging
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const allResponses = await localSurveyDB.allDocs({ include_docs: true });
        console.log('Responses fetched:', allResponses.rows.map(row => row.doc)); // Log the fetched responses
        setResponses(allResponses.rows.map(row => row.doc));
      } catch (error) {
        console.error('Error fetching responses:', error);
      }
    };

    fetchResponses();
  }, []);

  const handleAddFollowUpForm = async () => {
    const newForm = {
      _id: uuidv4(),
      type: 'followup',
      caseID: participantId,
      formID: selectedFormId,
      createdAt: new Date().toISOString(),
    };

    try {
      await finalDB.put(newForm);
      setFollowUpForms([...followUpForms, newForm]);
      console.log('New follow-up form added:', newForm); // Log the added follow-up form
    } catch (error) {
      console.error('Error adding follow-up form:', error);
    }
  };

  const handleNavigateToForm = (formId) => {
    setFilters({ formId: formId, participantId });
    if (typeof onNavigate === 'function') {
      console.log('Navigating to form with formId:', formId, 'and participantId:', participantId); // Log para verificar el formId y participantId
      onNavigate('Formulario', participantId); // Pasar participantId como caseID
    } else {
      console.error('onNavigate is not a function');
    }
  };

  // Definir la función isFormCompleted aquí
  const isFormCompleted = (formId) => {
    return followUpForms.some(form => form.formID === formId);
  };

  return (
    <Box>
      <Typography variant="h6" style={{ marginTop: '16px' }}>
        Follow-up Forms
      </Typography>
      <List>
        {formIds.map((formId) => (
          <Box key={formId}>
            <ListItem>
              <ListItemText primary={formId} />
              <ListItemSecondaryAction>
                {isFormCompleted(formId) ? (
                  <IconButton edge="end" disabled>
                    <CheckIcon color="action" />
                  </IconButton>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleNavigateToForm(formId)}
                  >
                    Diligenciar
                  </Button>
                )}
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>
    </Box>
  );
};

const savedResponsesStyle = css`
  margin-top: 2rem;
`;

const responsePreStyle = css`
  background: #f6f8fa;
  padding: 1rem;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
`;

const styles = {
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
    margin-top: 30px;
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
