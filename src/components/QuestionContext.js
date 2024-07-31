import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { localResponsesDB } from './Formulario';

PouchDB.plugin(PouchDBFind);

const localSurveyDB = new PouchDB('survey');
const remoteSurveyDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/survey`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_SURVEY,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_SURVEY,
  },
});

const localChoicesDB = new PouchDB('choices');
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

const remoteBackupDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/backup`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_BACKUP,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_BACKUP,
  },
});

const finalDB = new PouchDB('finalDB');

export const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
  const [currentComponent, setCurrentComponent] = useState('ParticipantList');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState(null);
  const [organizationId, setOrganizationId] = useState(null); // Estado para la organización
  const [programId, setProgramId] = useState(null); // Estado para el programa

  const [shouldReloadParticipants, setShouldReloadParticipants] = useState(false);

  // Definir el estado y la función setFilters
  const [filters, setFilters] = useState({
    formId: '',
    organization: organizationId, // Inicializar con organizationId
    program: programId // Inicializar con programId
  });
  

  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      organization: organizationId,
      program: programId
    }));
  }, [organizationId, programId]);

  // Asegurarse de que login se llama correctamente desde el formulario de login
  

  const loadQuestions = useCallback(async () => {
    try {
      console.log('Cargando preguntas...');
      setIsLoading(true);
      const surveyResult = await localSurveyDB.allDocs({ include_docs: true });
      console.log('Preguntas cargadas:', surveyResult);
      setQuestions(surveyResult.rows.map(row => row.doc));
      const choicesResult = await localChoicesDB.allDocs({ include_docs: true });
      setChoices(choicesResult.rows.map(row => row.doc));
      const responsesResult = await localResponsesDB.allDocs({ include_docs: true });
      setResponses(responsesResult.rows.map(row => row.doc));
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando preguntas:', err);
      setIsLoading(false);
    }
  }, []);

  const syncWithRetry = async (db, remoteDb, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      try {
        await db.replicate.from(remoteDb, {
          filter: 'my_filter/by_organization_program',
          query_params: { organizationId, programId },
          live: false,
          retry: true,
        });
        console.log("Sincronización completada.");
        return;
      } catch (err) {
        console.error(`Error en el intento ${i + 1}:`, err);
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
      }
    }
  };

  const syncData = async () => {
    try {
      console.log("Iniciando sincronización...");
      setIsSyncing(true);
      await syncWithRetry(localSurveyDB, remoteSurveyDB, organizationId, programId);
      await syncWithRetry(localChoicesDB, remoteChoicesDB, organizationId, programId);
      await syncWithRetry(finalDB, remoteResponsesDB, organizationId, programId); // Sincroniza finalDB con remoteResponsesDB
      await syncWithRetry(localResponsesDB, remoteBackupDB, organizationId, programId);
      await loadQuestions();
      setResponses([]);
      setCurrentQuestionIndex(0);
      setShouldReloadParticipants(prev => !prev); // Alterna el valor de shouldReloadParticipants para forzar el re-renderizado
      toast.success('Datos sincronizados exitosamente');
    } catch (err) {
      console.error("Error durante la sincronización:", err);
      setError(err.message);
      toast.error('Error durante la sincronización.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackupSync = async () => {
    try {
      console.log("Iniciando sincronización con backup...");
      setIsSyncing(true);
      await syncWithRetry(finalDB, remoteResponsesDB);
      await loadQuestions();
      toast.success('Datos sincronizados con el backup exitosamente');
    } catch (err) {
      console.error("Error durante la sincronización con el backup:", err);
      setError(err.message);
      toast.error('Error durante la sincronización con el backup.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const allDocs = await finalDB.allDocs({ include_docs: true, attachments: true });
      console.log('Documentos para subir:', allDocs);
      const batch = allDocs.rows.map(doc => {
        const { _id, _rev, ...docWithoutIdRev } = doc.doc;
        return {
          ...docWithoutIdRev,
          _attachments: doc.doc._attachments
        };
      });

      const response = await remoteResponsesDB.bulkDocs(batch);
      const hasErrors = response.some(res => res.error);
      if (hasErrors) {
        console.error("Error subiendo algunas respuestas a Cloudant:", response);
        toast.error('Error subiendo algunas respuestas a Cloudant.');
      } else {
        toast.success('Respuestas subidas con éxito a Cloudant');
      }
    } catch (error) {
      console.error("Error subiendo las respuestas a Cloudant:", error);
      toast.error('Error subiendo las respuestas a Cloudant.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const allDocs = await finalDB.allDocs();
      console.log('Documentos para restablecer:', allDocs);
      const deleteDocs = allDocs.rows.map(row => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true,
      }));
      await finalDB.bulkDocs(deleteDocs);
      toast.success('Base de datos restablecida con éxito.');
    } catch (error) {
      console.error('Error restableciendo la base de datos:', error);
      toast.error('Error restableciendo la base de datos.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetResponses = async () => {
    try {
      console.log('Iniciando reseteo de respuestas en localResponsesDB');
      const allDocs = await localResponsesDB.allDocs();
      console.log('Documentos para resetear:', allDocs.rows);
  
      const deleteDocs = allDocs.rows.map(row => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true,
      }));
  
      await localResponsesDB.bulkDocs(deleteDocs);
      setResponses([]);  // Asegúrate de que el estado responses también se reinicie
      console.log('Respuestas reseteadas en localResponsesDB');
    } catch (error) {
      console.error('Error restableciendo las respuestas:', error);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const updateParticipant = async (participantId, updatedData) => {
    try {
      const participantDoc = await finalDB.get(participantId);
      const updatedDoc = {
        ...participantDoc,
        responses: participantDoc.responses.map(response => ({
          ...response,
          Response: updatedData[response.QuestionID] || response.Response,
        })),
        caseNotes: updatedData.caseNotes || participantDoc.caseNotes || [],
      };
      await finalDB.put(updatedDoc);
      toast.success('Datos del participante actualizados correctamente.');
    } catch (error) {
      console.error('Error actualizando los datos del participante:', error);
      toast.error('Error actualizando los datos del participante.');
    }
  };

  return (
    <QuestionContext.Provider value={{ 
      questions,
      setQuestions,
      choices,
      setChoices,
      responses, 
      setResponses, 
      currentQuestionIndex, 
      setCurrentQuestionIndex,
      isLoading, 
      isSyncing, 
      isUploading,
      isResetting,
      syncData, 
      handleUpload,
      handleReset,
      handleResetResponses,
      handleBackupSync,
      updateParticipant,
      error,
      currentComponent, 
      setCurrentComponent,
      shouldReloadParticipants,
      filters, // Incluye el estado 'filters'
      setFilters, // Incluye la función 'setFilters'
      organizationId, // Incluye el estado organizationId
      setOrganizationId, // Incluye la función setOrganizationId
      programId, // Incluye el estado programId
      setProgramId, // Incluye la función setProgramId
    }}>
      {children}
    </QuestionContext.Provider>
  );
};

// Definir y exportar el hook useQuestionContext
export const useQuestionContext = () => useContext(QuestionContext);

export { localSurveyDB, localResponsesDB, finalDB };
