import React, { createContext, useState, useEffect, useCallback } from 'react';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

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

export const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const surveyResult = await localSurveyDB.allDocs({ include_docs: true });
      setQuestions(surveyResult.rows.map(row => row.doc));
      const choicesResult = await localChoicesDB.allDocs({ include_docs: true });
      setChoices(choicesResult.rows.map(row => row.doc));
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
      await loadQuestions();
      console.log("Sincronización completada.");
      alert('Datos sincronizados exitosamente');
    } catch (err) {
      console.error("Error durante la sincronización:", err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return (
    <QuestionContext.Provider value={{ questions, choices, isLoading, isSyncing, syncData, error }}>
      {children}
    </QuestionContext.Provider>
  );
};
