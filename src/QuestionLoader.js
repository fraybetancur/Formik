/** @jsxImportSource @emotion/react */
import React, { useEffect } from 'react';
import PouchDB from 'pouchdb';
import { css } from '@emotion/react';

const localDB = new PouchDB('survey');
const remoteDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/survey`, {
  adapter: 'http',
  auth: {
    username: process.env.REACT_APP_CLOUDANT_APIKEY_SURVEY,
    password: process.env.REACT_APP_CLOUDANT_PASSWORD_SURVEY,
  },
});

const QuestionLoader = ({ setQuestions, setIsLoading, setIsSyncing }) => {
  const loadQuestions = () => {
    setIsLoading(true);
    localDB.allDocs({ include_docs: true })
      .then(result => {
        const loadedQuestions = result.rows.map(row => row.doc);
        console.log('Loaded Questions:', loadedQuestions);
        setQuestions(loadedQuestions);
        setIsLoading(false);
        setIsSyncing(false);
      })
      .catch(err => {
        console.error('Error loading questions from PouchDB:', err);
        setIsLoading(false);
        setIsSyncing(false);
      });
  };

  const syncData = async () => {
    setIsSyncing(true);
    try {
      await localDB.replicate.from(remoteDB);
      console.log('Synchronization complete');
      loadQuestions();
    } catch (error) {
      console.error('Failed to sync:', error);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  return (
    <div css={css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: Arial, sans-serif;
    `}>
      <button 
        onClick={syncData}
        css={css`
          padding: 10px 20px;
          background-color: #007BFF;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }
        `}
      >
        Sincronizar
      </button>
    </div>
  );
};

export default QuestionLoader;
