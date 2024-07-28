import React, { useState, useEffect } from 'react';
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

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 16px;
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

const LoginForm = ({ onLogin }) => {
  const { setOrganizationId, setProgramId, setQuestions, setChoices, setResponses } = useQuestionContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState('user'); // Tipo de usuario

  const loadQuestions = async () => {
    try {
      console.log('Cargando preguntas...');
      const surveyResult = await localSurveyDB.allDocs({ include_docs: true });
      console.log('Preguntas cargadas:', surveyResult);
      setQuestions(surveyResult.rows.map(row => row.doc));
      const choicesResult = await localChoicesDB.allDocs({ include_docs: true });
      setChoices(choicesResult.rows.map(row => row.doc));
      const responsesResult = await localResponsesDB.allDocs({ include_docs: true });
      setResponses(responsesResult.rows.map(row => row.doc));
    } catch (err) {
      setError(err.message);
      console.error('Error cargando preguntas:', err);
    }
  };

  const syncWithFilter = async (localDB, remoteDB, organizationId, programId) => {
    await localDB.replicate.from(remoteDB, {
      filter: 'my_filter/by_organization_program',
      query_params: {
        Organization: organizationId,
        Program: programId
      }
    });
  };

  const syncDataWithParams = async (organizationId, programId) => {
    try {
      console.log("Starting synchronization...");
      setIsSyncing(true);
      await createIndexesAndFilters();

      await syncWithFilter(localSurveyDB, remoteSurveyDB, organizationId, programId);
      await syncWithFilter(localChoicesDB, remoteChoicesDB, organizationId, programId);
      await syncWithFilter(localResponsesDB, remoteResponsesDB, organizationId, programId);

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
      } catch (err) {
        console.error('Error during online synchronization:', err);
        toast.error('Error during online synchronization. Working offline with local data.');
      }
    } else {
      console.warn('No Internet connection. Working offline with local data.');
      toast.warning('No Internet connection. Working offline with local data.');
    }

    onLogin(organizationId, programId, userType);
    
  };

  const clearLocalDatabases = async () => {
    try {
      await localSurveyDB.destroy();
      await localChoicesDB.destroy();
      await localResponsesDB.destroy();
      toast.success('Local databases cleared successfully.');
      console.log('Local databases cleared.');
      window.location.reload(); // Recargar la página para re-crear las bases de datos
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
          <Input type="text" id="organization" name="organization" required />
        </FormField>
        <FormField>
          <Label htmlFor="program">Programa:</Label>
          <Input type="text" id="program" name="program" required />
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
        {isSyncing && <SyncMessage>Sincronizando datos...</SyncMessage>}
        {error && <ErrorMessage>Error: {error}</ErrorMessage>}
      </form>
      <Button onClick={clearLocalDatabases} style={{ marginTop: '20px', backgroundColor: '#dc3545' }}>
        Limpiar Bases de Datos Locales
      </Button>
    </LoginFormContainer>
  );
};

export default LoginForm;
