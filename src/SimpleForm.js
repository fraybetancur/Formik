import React, { useState, useEffect, useContext } from 'react';
import PouchDB from 'pouchdb-browser';
import { v4 as uuidv4 } from 'uuid';
import { QuestionContext } from './QuestionContext';

// Inicializa la base de datos local
const localDB = new PouchDB('responses');

const SimpleForm = () => {
  const { questions, isLoading } = useContext(QuestionContext); // Obtener preguntas del contexto
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers({ ...answers, [name]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex <= questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = {
      _id: uuidv4(),
      answers,
    };

    try {
      await localDB.put(response);
      setResponses([...responses, response]);
      setAnswers({});
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Error saving response to PouchDB:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (isLoading) return <p>Loading questions...</p>;

  return (
    <div>
      <h1>Simple Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>{currentQuestion.questionText}:</label>
          <input
            type="text"
            name={currentQuestion._id}
            value={answers[currentQuestion._id] || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          {currentQuestionIndex > 0 && (
            <button type="button" onClick={handleBack} disabled={loading}>
              Back
            </button>
          )}
          {currentQuestionIndex < questions.length - 1 ? (
            <button type="button" onClick={handleNext} disabled={loading}>
              Next
            </button>
          ) : (
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
      <h2>Saved Responses</h2>
      <pre>{JSON.stringify(responses, null, 2)}</pre>
    </div>
  );
};

export default SimpleForm;
