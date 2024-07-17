import React, { createContext, useState, useEffect, useCallback } from 'react';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);
const finalDB = new PouchDB('finalDB');

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

const localResponsesDB = new PouchDB('responses');
const remoteResponsesDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/responses`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_RESPONSES,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_RESPONSES,
  },
});

export const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState(null);

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const surveyResult = await localSurveyDB.allDocs({ include_docs: true });
      setQuestions(surveyResult.rows.map(row => row.doc));
      const choicesResult = await localChoicesDB.allDocs({ include_docs: true });
      setChoices(choicesResult.rows.map(row => row.doc));
      const responsesResult = await localResponsesDB.allDocs({ include_docs: true });
      setResponses(responsesResult.rows.map(row => row.doc));
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  const syncWithRetry = async (db, remoteDb, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      try {
        await db.sync(remoteDb, { live: false, retry: true });
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
      await syncWithRetry(localSurveyDB, remoteSurveyDB);
      await syncWithRetry(localChoicesDB, remoteChoicesDB);
      await syncWithRetry(localResponsesDB, remoteResponsesDB);
      await loadQuestions();
      setResponses([]); // Actualizar el estado responses a un array vacío
      setCurrentQuestionIndex(0); // Reiniciar el índice de la pregunta actual
      alert('Datos sincronizados exitosamente');
    } catch (err) {
      console.error("Error durante la sincronización:", err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const allDocs = await localResponsesDB.allDocs({ include_docs: true, attachments: true });
      for (const doc of allDocs.rows) {
        const { _id, _rev, ...docWithoutIdRev } = doc.doc;
        const docWithAttachments = { ...docWithoutIdRev, _attachments: doc.doc._attachments };
        await remoteResponsesDB.put({
          _id,
          ...docWithAttachments,
        });
      }
      setResponses([]); // Actualizar el estado responses a un array vacío
      setCurrentQuestionIndex(0); // Reiniciar el índice de la pregunta actual
      alert('Respuestas subidas con éxito a Cloudant');
    } catch (error) {
      console.error("Error subiendo las respuestas a Cloudant:", error);
      alert('Error subiendo las respuestas a Cloudant.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const allDocs = await localResponsesDB.allDocs();
      const deleteDocs = allDocs.rows.map(row => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true,
      }));
      await localResponsesDB.bulkDocs(deleteDocs);
      setResponses([]); // Actualizar el estado responses a un array vacío
      setCurrentQuestionIndex(0); // Reiniciar el índice de la pregunta actual
      alert('Base de datos restablecida con éxito.');
    } catch (error) {
      console.error('Error restableciendo la base de datos:', error);
      alert('Error restableciendo la base de datos.');
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return (
    <QuestionContext.Provider value={{ 
      questions, 
      choices, 
      responses, // Añadir responses al contexto
      setResponses, // Añadido para poder actualizar responses
      currentQuestionIndex, 
      setCurrentQuestionIndex,
      isLoading, 
      isSyncing, 
      isUploading,
      isResetting,
      syncData, 
      handleUpload,
      handleReset,
      error, 
    }}>
      {children}
    </QuestionContext.Provider>
  );
};

// Agrega esto al final del archivo QuestionContext.js para exportar la base de datos
export { localResponsesDB };
// Agrega esto al final del archivo QuestionContext.js para exportar la base de datos finalDB
export { finalDB };

