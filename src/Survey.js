/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { css } from '@emotion/react';
import PouchDB from 'pouchdb-browser';
import { v4 as uuidv4 } from 'uuid';
import { QuestionContext } from './QuestionContext';

const localDB = new PouchDB('responses');

// Componente SurveyForm
const SurveyForm = () => {
  const { questions, isLoading, isSyncing } = useContext(QuestionContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [responses, setResponses] = useState([]);
  const [caseID] = useState(uuidv4());

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const allDocs = await localDB.allDocs({ include_docs: true });
        setResponses(allDocs.rows.map(row => row.doc));
      } catch (error) {
        console.error("Error fetching responses from PouchDB:", error);
      }
    };

    fetchResponses();
  }, []);

  // Función para manejar el cambio de respuesta
  const handleChange = (e) => {
    setAnswer(e.target.value);
  };

  const saveResponse = async (response) => {
    try {
      await localDB.put(response);
      const existingResponseIndex = responses.findIndex(res => res.QuestionID === response.QuestionID);
      if (existingResponseIndex > -1) {
        setResponses(responses.map((res, index) => index === existingResponseIndex ? response : res));
      } else {
        setResponses([...responses, response]);
      }
    } catch (error) {
      console.error("Error guardando la respuesta en PouchDB:", error);
    }
  };

  // Función para manejar el almacenamiento y avanzar a la siguiente pregunta
  const handleNext = async () => {
    if (questions[currentQuestionIndex].Required === 'true' && answer.trim() === '') {
      alert('Respuesta es requerida.');
      return;
    }

    if (answer.trim() !== '') {
      const response = {
        _id: uuidv4(),
        CaseID: caseID,
        ParentCaseID: caseID,
        CaseDetails: '',
        QuestionID: questions[currentQuestionIndex].QuestionID,
        Index: currentQuestionIndex,
        ResponseID: uuidv4(),
        Response: answer,
      };
      await saveResponse(response);
    }

    setAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Función para retroceder a la pregunta anterior
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const previousResponse = responses.find(response => response.QuestionID === questions[currentQuestionIndex - 1].QuestionID);
      setAnswer(previousResponse ? previousResponse.Response : '');
    }
  };

  useEffect(() => {
    console.log('Current Question Index:', currentQuestionIndex);
    if (questions && questions.length > 0) {
      console.log('Current Question:', questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, questions]);

  const currentQuestion = questions && questions.length > 0 ? questions[currentQuestionIndex] : null;

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
              <input
                type="text"
                value={answer}
                onChange={handleChange}
                placeholder="Escribe tu respuesta aquí"
                css={css`
                  padding: 10px;
                  width: 100%;
                  max-width: 300px;
                  margin-bottom: 20px;
                `}
              />
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
                {currentQuestionIndex < questions.length - 1 ? (
                  <button 
                    onClick={handleNext} 
                    disabled={questions[currentQuestionIndex].Required === 'true' && answer.trim() === ''}
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
                ) : (
                  <button 
                    onClick={handleNext}
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
                    Submit
                  </button>
                )}
              </div>
            </>
          ) : (
            <p>Pregunta no disponible</p>
          )}

          {/* Sección para mostrar las respuestas guardadas */}
          <h2 css={css`margin-top: 40px;`}>Saved Responses</h2>
          <pre css={css`
            background: #f6f8fa;
            font-size: 0.85rem;
            padding: 10px;
            width: 100%;
            max-width: 500px;
            overflow-x: auto;
          `}>
            {JSON.stringify(responses, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};

export default SurveyForm;
