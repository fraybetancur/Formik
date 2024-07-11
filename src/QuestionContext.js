// QuestionContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import PouchDB from 'pouchdb';

const localDB = new PouchDB('survey');
const remoteDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/survey`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_SURVEY,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_SURVEY,
  },
});

export const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadQuestions = useCallback(() => {
    setIsLoading(true);
    localDB.allDocs({ include_docs: true })
      .then(result => {
        const loadedQuestions = result.rows.map(row => row.doc);
        setQuestions(loadedQuestions);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading questions from PouchDB:', err);
        setIsLoading(false);
      });
  }, []);

  const syncData = useCallback(async () => {
    setIsSyncing(true);
    try {
      await localDB.replicate.from(remoteDB);
      loadQuestions();
      setIsSyncing(false);
    } catch (error) {
      console.error('Failed to sync:', error);
      setIsSyncing(false);
    }
  }, [loadQuestions]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return (
    <QuestionContext.Provider value={{ questions, isLoading, isSyncing, syncData }}>
      {children}
    </QuestionContext.Provider>
  );
};
