//  cambiar para enketo db
/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { AppBar, Tabs, Tab, Box, Grid, TextField, Avatar, Button, MenuItem, Typography, IconButton, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NoteIcon from '@mui/icons-material/Note';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PersonIcon from '@mui/icons-material/Person';
import { finalDB, QuestionContext, localSurveyDB } from './QuestionContext';
import { css } from '@emotion/react';
import { v4 as uuidv4 } from 'uuid';
import PDFViewer from './PDFViewer';
import GeoMap from './Controls/GeoMap'; 
import LoanSummary from './LoanSummary';

const ParticipantDetails = ({ participantId, onBack, onNavigate, Organization }) => {

  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [extraFields, setExtraFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateParticipant, organizationId, programId } = useContext(QuestionContext);
  const [caseNotes, setCaseNotes] = useState('');
  const [caseNotesHistory, setCaseNotesHistory] = useState([]);
  const [formIds, setFormIds] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [geometries, setGeometries] = useState([]); // Estado para almacenar las geometrías

  useEffect(() => {
    const fetchParticipantData = async () => {
      try {
        setLoading(true);
        const generalResult = await finalDB.find({
          selector: {
            caseID: participantId,
            formID: 'Registro'
          }
        });
  
        if (generalResult.docs.length > 0) {
          const participantData = {};
          const caseNotesList = [];
          const geoData = [];
  
          // Obtener QuestionText y ParticipantList desde localSurveyDB
          const fetchQuestionDetails = async (questionID) => {
            try {
              const result = await localSurveyDB.find({
                selector: { QuestionID: questionID }
              });
              if (result.docs.length > 0) {
                const doc = result.docs[0];
                return {
                  QuestionText: doc.QuestionText,
                  ParticipantList: doc.ParticipantList
                };
              } else {
                return {
                  QuestionText: questionID,
                  ParticipantList: null
                };
              }
            } catch (error) {
              console.error('Error fetching question details:', error);
              return {
                QuestionText: questionID,
                ParticipantList: null
              };
            }
          };
  
          // Ajustar el mapeo para incluir QuestionText y aplicar la lógica de la foto
          await Promise.all(generalResult.docs.map(async (doc) => {
            console.log('Document:', doc);
  
            await Promise.all(doc.responses.map(async (response) => {
              const { QuestionText, ParticipantList } = await fetchQuestionDetails(response.QuestionID);
  
              // Verifica si el campo Url está presente para imágenes y si ParticipantList es 1
              if (response.Url) {
                if (ParticipantList === 1) {
                  participantData.photo = response.Url;
                } else {
                  if (!participantData.fields) {
                    participantData.fields = [];
                  }
                  participantData.fields.push({
                    QuestionID: response.QuestionID,
                    Response: response.Response,
                    ParticipantList: ParticipantList,
                    QuestionText: QuestionText // Añadir QuestionText aquí
                  });
                }
              }
  
              // Añadir QuestionText a participantData
              participantData[response.QuestionID] = {
                QuestionText: QuestionText,
                Response: response.Response,
                ParticipantList: ParticipantList
              };
  
              // Verifica si la respuesta contiene coordenadas
              if (response.Response && response.Response.includes('coordinates')) {
                try {
                  const parsedResponse = JSON.parse(response.Response);
                  geoData.push(parsedResponse);
                  console.log('Parsed Coordinates:', parsedResponse);
                } catch (error) {
                  console.error('Error parsing coordinates:', error);
                }
              }
            }));
  
            // Extraer coordenadas del campo 'location'
            if (doc.location) {
              try {
                const parsedLocation = JSON.parse(doc.location);
                geoData.push(parsedLocation);
                console.log('Location Data:', parsedLocation);
              } catch (error) {
                console.error('Error parsing location:', error);
              }
            }
  
            if (doc.caseNotes) {
              caseNotesList.push(...doc.caseNotes.reverse());
            }
          }));
  
          participantData.caseID = participantId;
          setFormData(participantData);
          setCaseNotesHistory(caseNotesList);
          setExtraFields(generalResult.docs.flatMap(doc => doc.responses.filter(response => response.QuestionID.startsWith('extra'))));
          setGeometries(geoData); // Asigna las geometrías
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
  
  
  
  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const attachmentsResult = await finalDB.find({
          selector: {
            CaseID: participantId,
            _attachments: { $exists: true }
          }
        });

        if (attachmentsResult.docs.length > 0) {
          const attachments = await Promise.all(attachmentsResult.docs.map(async (doc) => {
            const attachmentNames = Object.keys(doc._attachments);
            const attachmentPromises = attachmentNames.map(async (name) => {
              const attachment = await finalDB.getAttachment(doc._id, name);
              const blobUrl = URL.createObjectURL(attachment);
              return { name, url: blobUrl };
            });
            return Promise.all(attachmentPromises);
          }));

          const flatAttachments = attachments.flat();
          setAttachments(flatAttachments);
        }
      } catch (err) {
        setError(`Error fetching attachments: ${err.message}`);
      }
    };

    if (participantId) {
      fetchAttachments();
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
            {organizationId === 'Inversiones El Paisa' && (
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
          <BiographicTab formData={formData} handleChange={handleChange} extraFields={extraFields} />
        </TabPanel>
        <TabPanel value={selectedTab} index={1}>
          <CaseNotesTab caseNotes={caseNotes} setCaseNotes={setCaseNotes} caseNotesHistory={caseNotesHistory} handleSave={handleSave} handleDelete={handleDelete} />
        </TabPanel>
        <TabPanel value={selectedTab} index={2}>
          <FollowUpFormsTab participantId={participantId} onNavigate={onNavigate} />
        </TabPanel>
        <TabPanel value={selectedTab} index={3}>
          <AttachmentsTab attachments={attachments} />
        </TabPanel>
        <TabPanel value={selectedTab} index={4}>
          <GeoMap geometries={geometries} onShapeComplete={(shape) => console.log(shape)} />
        </TabPanel>
        <TabPanel value={selectedTab} index={5}>
          <LoanSummary participantId={participantId} />
        </TabPanel>
      </Box>
      <Box css={styles.footer}>
        <Button variant="contained" color="primary" onClick={handleSave} style={{ marginRight: '8px' }}>
          Save Case Member
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            if (onBack) {
              onBack();
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
          {Object.keys(formData).map((key) => (
            key !== 'caseID' && key !== 'photo' && (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <TextField
                  label={formData[key].QuestionText || key}
                  name={key}
                  value={formData[key].Response || ''}
                  onChange={handleChange}
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

  useEffect(() => {
    const fetchFollowUpForms = async () => {
      try {
        const result = await finalDB.find({
          selector: {
            caseID: participantId,
          },
        });
        setFollowUpForms(result.docs);
      } catch (error) {
        console.error('Error fetching follow-up forms:', error);
      }
    };

    fetchFollowUpForms();
  }, [participantId]);

  useEffect(() => {
    const fetchFormIds = async () => {
      try {
        const allForms = await localSurveyDB.allDocs({ include_docs: true });
        const uniqueFormIds = allForms.rows
          .map(row => ({ formId: row.doc.FormID, multiple: row.doc.Multiple === 'true' }))
          .filter((form, index, self) => form.formId && form.formId !== 'Registro' && self.findIndex(f => f.formId === form.formId) === index);

        setFormIds(uniqueFormIds);
      } catch (error) {
        console.error('Error fetching form IDs:', error);
      }
    };

    fetchFormIds();
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
    } catch (error) {
      console.error('Error adding follow-up form:', error);
    }
  };

  const handleNavigateToForm = (formId) => {
    setFilters({ formId: formId, participantId });
    if (typeof onNavigate === 'function') {
      onNavigate('Formulario', participantId);
    } else {
      console.error('onNavigate is not a function');
    }
  };

  const getFormInstanceCount = (formId) => {
    return followUpForms.filter(form => form.formID === formId).length;
  };

  const isFormCompleted = (formId) => {
    return followUpForms.some(form => form.formID === formId);
  };

  return (
    <Box>
      <Typography variant="h6" style={{ marginTop: '16px' }}>
        Follow-up Forms
      </Typography>
      <List>
        {formIds.map(({ formId, multiple }, index) => {
          const formCount = getFormInstanceCount(formId); // Llamar a la función para obtener el conteo

          return (
            <Box key={`${formId}-${index}`}>
              <ListItem>
                <ListItemText primary={`${formId}${multiple ? ` (${formCount})` : ''}`} /> {/* Mostrar el conteo si es múltiple */}
                <ListItemSecondaryAction>
                  {multiple ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => handleNavigateToForm(formId)}
                    >
                      Diligenciar
                    </Button>
                  ) : (
                    isFormCompleted(formId) ? (
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
                    )
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </Box>
          );
        })}
      </List>
    </Box>
  );
};



const AttachmentsTab = ({ attachments }) => {
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  return (
    <Box>
      <Typography variant="h6" style={{ marginTop: '16px' }}>
        Attachments
      </Typography>
      <List>
        {attachments && attachments.length > 0 ? (
          attachments.map((attachment, index) => (
            <ListItem key={index} onClick={() => setSelectedAttachment(attachment.url)}>
              <ListItemText primary={attachment.name || 'Unnamed Attachment'} />
              <ListItemSecondaryAction>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setSelectedAttachment(attachment.url)}
                >
                  View
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No attachments available.
          </Typography>
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

export { ParticipantDetails, AttachmentsTab };
