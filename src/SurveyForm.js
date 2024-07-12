/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
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

const SurveyForm = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadQuestions = () => {
    localDB.allDocs({ include_docs: true })
      .then(result => {
        const loadedQuestions = result.rows.map(row => row.doc);
        console.log('Loaded Questions:', loadedQuestions);  // Depuración
        setQuestions(loadedQuestions);
        setCurrentQuestionIndex(0); // Resetea el índice de pregunta al cargar
        setIsLoading(false);
        setIsSyncing(false); // Asegúrate de actualizar isSyncing a false después de cargar las preguntas
      })
      .catch(err => {
        console.error('Error loading questions from PouchDB:', err);
        setIsLoading(false);
        setIsSyncing(false); // Asegúrate de actualizar isSyncing a false en caso de error
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
      setIsSyncing(false); // Asegúrate de actualizar isSyncing a false en caso de error
    }
  };

  useEffect(() => {
    syncData(); // Sincroniza y carga preguntas al montar el componente
  }, []);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  useEffect(() => {
    console.log('Current Question Index:', currentQuestionIndex);
    console.log('Current Question:', questions[currentQuestionIndex]);
  }, [currentQuestionIndex, questions]);

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div css={css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: Arial, sans-serif;
    `}>
      {isLoading || isSyncing ? (
        <p>{isLoading ? 'Cargando preguntas...' : 'Sincronizando datos...'}</p>
      ) : (
        <>
          {currentQuestion ? (
            <>
              <h2 css={css`margin-bottom: 20px;`}>{currentQuestion.QuestionText}</h2>
              <div css={css`
                display: flex;
                justify-content: space-between;
                width: 100%;
                max-width: 300px;
              `}>
                <button 
                  onClick={handleBack} 
                  disabled={currentQuestionIndex === 0}
                  css={css`
                    padding: 10px 20px;
                    margin-right: 10px;
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
                  Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={currentQuestionIndex >= questions.length - 1}
                  css={css`
                    padding: 10px 20px;
                    margin-left: 10px;
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
                  Next
                </button>
              </div>
            </>
          ) : (
            <p>Pregunta no disponible</p>
          )}
        </>
      )}
    </div>
  );
};

export default SurveyForm;
