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

const ParticipantDetails = ({ participantId, onBack, onNavigate }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [extraFields, setExtraFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateParticipant } = useContext(QuestionContext);
  const [caseNotes, setCaseNotes] = useState('');
  const [caseNotesHistory, setCaseNotesHistory] = useState([]);
  const [formIds, setFormIds] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [geometries, setGeometries] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(''); // Estado para manejar el formulario seleccionado
  const [formQuestions, setFormQuestions] = useState([]);

  useEffect(() => {
    const fetchFormIds = async () => {
      try {
        const allForms = await localSurveyDB.allDocs({ include_docs: true });
        console.log('All forms:', allForms.rows);
        const uniqueFormIds = [...new Set(allForms.rows.map(row => row.doc.FormID).filter(formId => formId && formId !== 'Registro'))];
        console.log('Unique Form IDs:', uniqueFormIds);
        setFormIds(uniqueFormIds);
      } catch (error) {
        console.error('Error fetching form IDs:', error);
      }
    };

    fetchFormIds();
  }, []);

  useEffect(() => {
    const fetchParticipantData = async () => {
      try {
        setLoading(true);
        console.log('Fetching participant data for FormID:', selectedFormId || 'Registro');
        const generalResult = await finalDB.find({
          selector: {
            caseID: participantId,
            formID: selectedFormId || 'Registro'
          }
        });

        console.log('General Result:', generalResult);

        if (generalResult.docs.length > 0) {
          const participantData = {};
          const caseNotesList = [];
          let photoUrl = '';
          const geoData = [];

          generalResult.docs.forEach(doc => {
            console.log('Document:', doc);
            doc.responses.forEach(response => {
              participantData[response.QuestionID] = response.Response;
              if (response.QuestionID === 'Q05' && response.Url) {
                photoUrl = response.Url;
              }
              if (response.Response && response.Response.includes('coordinates')) {
                try {
                  const parsedResponse = JSON.parse(response.Response);
                  geoData.push(parsedResponse);
                  console.log('Parsed Coordinates:', parsedResponse);
                } catch (error) {
                  console.error('Error parsing coordinates:', error);
                }
              }
            });

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
          });

          participantData.photo = photoUrl || '';
          participantData.caseID = participantId;
          setFormData(participantData);
          setCaseNotesHistory(caseNotesList);
          setExtraFields(generalResult.docs.flatMap(doc => doc.responses.filter(response => response.QuestionID.startsWith('extra'))));
          setGeometries(geoData);
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
  }, [participantId, selectedFormId]);

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
    setCaseNotesHistory([newCaseNote, ...caseNotesHistory]);
  };

  const handleDelete = (id) => {
    const updatedNotes = caseNotesHistory.filter(note => note.id !== id);
    setCaseNotesHistory(updatedNotes);
    updateParticipant(participantId, { ...formData, caseNotes: updatedNotes });
  };

  const handleFormSelect = async (event) => {
    const selectedFormId = event.target.value;
    setSelectedFormId(selectedFormId);
    console.log('Selected FormID:', selectedFormId);

    try {
      const formResult = await localSurveyDB.find({
        selector: {
          FormID: selectedFormId
        }
      });
      console.log('Form Result:', formResult.docs);
      if (formResult.docs.length > 0) {
        setFormQuestions(formResult.docs);
      } else {
        setFormQuestions([]);
      }
    } catch (err) {
      console.error('Error fetching form questions:', err);
      setFormQuestions([]);
    }
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
                  '&.Mui-selected': { color: 'grey' },
                }}
              />
            </Tooltip>
            <Tooltip title="Case Notes">
              <Tab
                icon={<NoteIcon />}
                sx={{
                  minWidth: '0px',
                  color: selectedTab === 1 ? 'grey' : 'white',
                  '&.Mui-selected': { color: 'grey' },
                }}
              />
            </Tooltip>
            <Tooltip title="Checklist">
              <Tab
                icon={<CheckIcon />}
                sx={{
                  minWidth: '0px',
                  color: selectedTab === 2 ? 'grey' : 'white',
                  '&.Mui-selected': { color: 'grey' },
                }}
              />
            </Tooltip>
            <Tooltip title="Attachments">
              <Tab
                icon={<AttachFileIcon />}
                sx={{
                  minWidth: '0px',
                  color: selectedTab === 3 ? 'grey' : 'white',
                  '&.Mui-selected': { color: 'grey' },
                }}
              />
            </Tooltip>
            <Tooltip title="Location Data">
              <Tab
                icon={<LocationOnIcon />}
                sx={{
                  minWidth: '0px',
                  color: selectedTab === 4 ? 'grey' : 'white',
                  '&.Mui-selected': { color: 'grey' },
                }}
              />
            </Tooltip>
          </Tabs>
        </AppBar>
      </Box>
      <Box css={styles.content}>
        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                label="Seleccionar Formulario"
                value={selectedFormId}
                onChange={handleFormSelect}
                fullWidth
                margin="normal"
              >
                {formIds.map(formId => (
                  <MenuItem key={formId} value={formId}>
                    {formId}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <BiographicTab formData={formData} handleChange={handleChange} extraFields={extraFields} formQuestions={formQuestions} />
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

const BiographicTab = ({ formData, handleChange, extraFields, formQuestions }) => (
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
              disabled
            />
          </Grid>
          {formQuestions.map(({ QuestionID, QuestionText }) => (
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
        const uniqueFormIds = [...new Set(allForms.rows.map(row => row.doc.FormID).filter(formId => formId && formId !== 'Registro'))];
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
