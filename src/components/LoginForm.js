//LoginForm.js FUNCIONANDO
import React, { useState } from 'react';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import { useQuestionContext } from './QuestionContext';
import { toast } from 'react-toastify';
import styled from '@emotion/styled';

PouchDB.plugin(PouchDBFind);

// Inicializar bases de datos locales y remotas
const localSurveyDB = new PouchDB('survey');
const localChoicesDB = new PouchDB('choices');
const localResponsesDB = new PouchDB('responses');
const remoteSurveyDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/survey`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_SURVEY,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_SURVEY,
  },
});
const remoteChoicesDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/choices`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_CHOICES,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_CHOICES,
  },
});
const remoteResponsesDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/responses`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_RESPONSES,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_RESPONSES,
  },
});

const createIndexesAndFilters = async () => {
  try {
    console.log("Creando índices y filtros en Cloudant...");
    const designDoc = {
      _id: '_design/my_filter',
      filters: {
        by_organization_program: function (doc, req) {
          if (req.query.Organization && req.query.Program) {
            return doc.Organization === req.query.Organization && doc.Program === req.query.Program;
          }
          if (req.query.Organization) {
            return doc.Organization === req.query.Organization;
          }
          return true;
        }.toString(),
      },
    };

    const putDesignDoc = async (db) => {
      try {
        await db.put(designDoc);
      } catch (err) {
        if (err.status !== 409) {
          throw err;
        } else {
          console.log(`Documento de diseño ya existe en ${db.name}`);
        }
      }
    };

    await putDesignDoc(remoteSurveyDB);
    await putDesignDoc(remoteChoicesDB);
    await putDesignDoc(remoteResponsesDB);

    console.log('Índices y filtros creados en Cloudant.');

    console.log("Creando índices en PouchDB...");
    await localSurveyDB.createIndex({
      index: {
        fields: ['Organization', 'Program']
      }
    });

    await localChoicesDB.createIndex({
      index: {
        fields: ['QuestionID']
      }
    });

    await localResponsesDB.createIndex({
      index: {
        fields: ['Organization', 'Program']
      }
    });

    console.log('Índices creados en PouchDB.');
  } catch (err) {
    console.error('Error creando índices y filtros:', err);
  }
};

const LoginForm = ({ onLogin }) => {
  const { setOrganizationId, setProgramId, setQuestions, setChoices, setResponses } = useQuestionContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState({ choices: false, survey: false, responses: false });
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState('user'); 
  const [progress, setProgress] = useState({ choices: 0, survey: 0, responses: 0 });

  const loadQuestions = async () => {
    try {
      console.log('Cargando preguntas...');
      const surveyResult = await localSurveyDB.allDocs({ include_docs: true });
      console.log('Preguntas cargadas:', surveyResult);
      setQuestions(surveyResult.rows.map(row => row.doc));
      const choicesResult = await localChoicesDB.allDocs({ include_docs: true });
      console.log('Opciones cargadas:', choicesResult);
      setChoices(choicesResult.rows.map(row => row.doc));
      const responsesResult = await localResponsesDB.allDocs({ include_docs: true });
      console.log('Respuestas cargadas:', responsesResult);
      setResponses(responsesResult.rows.map(row => row.doc));
    } catch (err) {
      setError(err.message);
      console.error('Error cargando preguntas:', err);
    }
  };

  const syncWithFilter = async (localDB, remoteDB, organizationId, programId, dbName) => {
    return new Promise((resolve, reject) => {
      let docs_written = 0;
      let total_docs = 0;
  
      remoteDB.info().then(info => {
        total_docs = info.update_seq;
      });
  
      const retrySync = (retryCount) => {
        if (retryCount > 0) {
          setTimeout(() => {
            syncWithFilter(localDB, remoteDB, organizationId, programId, dbName)
              .then(resolve)
              .catch(() => retrySync(retryCount - 1));
          }, 2000);
        } else {
          reject(new Error(`Failed to replicate ${dbName} after multiple attempts`));
        }
      };
  
      localDB.replicate.from(remoteDB, {
        filter: 'my_filter/by_organization_program',
        query_params: {
          Organization: organizationId,
          Program: programId
        },
        live: false,
        retry: false,
        batch_size: 10, // Ajusta el tamaño de los lotes
        batches_limit: 2, // Ajusta el límite de lotes
      }).on('change', info => {
        console.log(`Change detected in ${dbName}:`, info);
        docs_written = info.last_seq || docs_written;
        const progressPercentage = total_docs > 0 ? (docs_written / total_docs) * 100 : 0;
        setProgress(prev => ({
          ...prev,
          [dbName]: progressPercentage
        }));
      }).on('complete', info => {
        console.log(`Replication complete for ${dbName}:`, info);
        setProgress(prev => ({
          ...prev,
          [dbName]: 100
        }));
        setSyncCompleted(prev => ({
          ...prev,
          [dbName]: true
        }));
        resolve(info);
      }).on('error', err => {
        console.error(`Error replicating ${dbName}:`, err);
        setError(`Error replicating ${dbName}: ${err.message}`);
        retrySync(3); // Añade lógica de reintento
      });
    });
  };
  
  

  const syncDataWithParams = async (organizationId, programId) => {
    try {
      console.log("Starting synchronization...");
      setIsSyncing(true);
      setSyncCompleted({ choices: false, survey: false, responses: false });
      await createIndexesAndFilters();
  
      const syncPromises = [
        syncWithFilter(localSurveyDB, remoteSurveyDB, organizationId, programId, 'survey'),
        syncWithFilter(localChoicesDB, remoteChoicesDB, organizationId, programId, 'choices'),
        syncWithFilter(localResponsesDB, remoteResponsesDB, organizationId, programId, 'responses')
      ];
  
      await Promise.all(syncPromises);
  
      await loadQuestions();
  
      console.log("Synchronization completed.");
      toast.success('Data successfully synchronized');
    } catch (err) {
      console.error("Error during synchronization:", err);
      setError(err.message);
      toast.error('Error during synchronization.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const organizationId = e.target.organization.value;
    const programId = e.target.program.value;
    setOrganizationId(organizationId);
    setProgramId(programId);
  
    if (navigator.onLine) {
      try {
        await syncDataWithParams(organizationId, programId);
  
        const checkSyncCompletion = () => {
          if (syncCompleted.choices && syncCompleted.survey && syncCompleted.responses) {
            onLogin(organizationId, programId, userType);
          } else {
            toast.info('Initial synchronization in progress. Please wait...');
            setTimeout(checkSyncCompletion, 1000);
          }
        };
  
        checkSyncCompletion();
      } catch (err) {
        console.error('Error durante la sincronización en línea:', err);
        toast.error('Error durante la sincronización en línea. Trabajando sin conexión con datos locales.');
      }
    } else {
      console.warn('No hay conexión a Internet. Trabajando sin conexión con datos locales.');
      toast.warning('No hay conexión a Internet. Trabajando sin conexión con datos locales.');
      onLogin(organizationId, programId, userType);
    }
  };

  const clearLocalDatabases = async () => {
    try {
      await localSurveyDB.destroy();
      await localChoicesDB.destroy();
      await localResponsesDB.destroy();
      toast.success('Local databases cleared successfully.');
      console.log('Local databases cleared.');
      window.location.reload();
    } catch (err) {
      console.error('Error clearing local databases:', err);
      toast.error('Error clearing local databases.');
    }
  };
  return (
    <LoginFormContainer>
      <FormTitle>Iniciar Sesión</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormField>
          <Label htmlFor="organization">Organización:</Label>
          <Select id="organization" name="organization" required>
            <option value="Mercy">Mercy</option>
            <option value="Inversiones El Paisa">Inversiones El Paisa</option>
          </Select>
        </FormField>
        <FormField>
          <Label htmlFor="program">Programa:</Label>
          <Select id="program" name="program" required>
            <option value="PT">PT</option>
            <option value="Préstamo">Préstamo</option>
          </Select>
        </FormField>
        <FormField>
          <Label htmlFor="userType">Tipo de Usuario:</Label>
          <Select id="userType" name="userType" value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="user">Usuario Regular</option>
            <option value="admin">Administrador de Organización</option>
            <option value="superuser">Superusuario</option>
          </Select>
        </FormField>
        <Button type="submit" disabled={isSyncing}>Ingresar</Button>
        <ProgressContainer>
        <ProgressBar width={progress.choices}>Choices: {progress.choices}%</ProgressBar>
        <ProgressBar width={progress.survey}>Survey: {progress.survey}%</ProgressBar>
        <ProgressBar width={progress.responses}>Responses: {progress.responses}%</ProgressBar>
        </ProgressContainer>
        {isSyncing && (
          <ProgressContainer>
            <SyncMessage>Sincronizando datos...</SyncMessage>
          </ProgressContainer>
        )}
        {error && <ErrorMessage>Error: {error}</ErrorMessage>}
      </form>
      <Button onClick={clearLocalDatabases} style={{ marginTop: '20px', backgroundColor: '#dc3545' }}>
        Limpiar Bases de Datos Locales
      </Button>
    </LoginFormContainer>
  );
};
const LoginFormContainer = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: #f7f7f7;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
  text-align: center;
`;

const FormField = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 3px;
  font-size: 16px;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
`;

const SyncMessage = styled.p`
  text-align: center;
`;

const ProgressContainer = styled.div`
  margin: 20px 0;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
`;

const ProgressBar = styled.div`
  height: 20px;
  background-color: #007bff;
  border-radius: 5px;
  width: ${props => props.width}%;
  transition: width 0.5s ease;
  color: #fff;
  text-align: center;
`;
export default LoginForm;
