/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { css } from '@emotion/react';
import PouchDB from 'pouchdb-browser';
import { v4 as uuidv4 } from 'uuid';
import { useSwipeable } from 'react-swipeable';
import { QuestionContext, localResponsesDB } from './QuestionContext';
import TextArea from './Controls/TextArea';
import DateInput from './Controls/DateInput';
import RadioGroup from './Controls/RadioGroup';
import CheckboxGroup from './Controls/CheckboxGroup';
import SearchableDropdown from './Controls/SearchableDropdown';
import Dropdown from './Controls/Dropdown';
import DropdownMultiple from './Controls/DropdownMultiple';
import TextInput from './Controls/TextInput';
import CompressedImageInput from './Controls/CompressedImageInput';
import ProgressBar from './ProgressBar'; // Importar el componente de barra de progreso

const localDB = new PouchDB('responses');
const finalDB = new PouchDB('finalDB');

const SurveyForm = ({ onNavigate }) => {
  const { questions, choices, isLoading, isSyncing, responses, setResponses, currentQuestionIndex, setCurrentQuestionIndex, handleResetResponses, syncData, handleUpload } = useContext(QuestionContext);
  const [answer, setAnswer] = useState('');
  const [caseID] = useState(uuidv4());

  const handleImageUpload = async (imageFile, previewDataUrl) => {
    const responseId = uuidv4();
    const imageResponse = {
      _id: responseId,
      type: 'image',
      CaseID: caseID,
      ParentCaseID: caseID,
      CaseDetails: '',
      QuestionID: questions[currentQuestionIndex].QuestionID,
      Index: currentQuestionIndex,
      ResponseID: responseId,
      Response: '',
      Url: previewDataUrl,
    };

    try {
      await localDB.put(imageResponse);
      const doc = await localDB.get(responseId);
      await localDB.putAttachment(doc._id, 'image.jpg', doc._rev, imageFile, 'image/jpeg');
      setResponses([...responses, imageResponse]);
    } catch (error) {
      console.error("Error al guardar la imagen en PouchDB:", error);
    }
  };

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

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [setCurrentQuestionIndex]);

  const handleResponseChange = (value) => {
    setAnswer(value);
  };

  const saveOrUpdateResponse = async (response, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const existingResponse = await localDB.get(response._id).catch(err => null);
        if (existingResponse) {
          response._rev = existingResponse._rev;
        }
        await localDB.put(response);
        setResponses(prevResponses => {
          const existingResponseIndex = prevResponses.findIndex(res => res._id === response._id);
          if (existingResponseIndex > -1) {
            return prevResponses.map((res, index) => index === existingResponseIndex ? response : res);
          } else {
            return [...prevResponses, response];
          }
        });
        return;
      } catch (error) {
        if (error.status === 409) {
          const existingResponse = await localDB.get(response._id);
          response._rev = existingResponse._rev;
        } else {
          console.error("Error guardando la respuesta en PouchDB:", error);
          throw error;
        }
      }
    }
    throw new Error('No se pudo guardar la respuesta después de varios intentos.');
  };

  const saveResponse = async (response) => {
    try {
      await saveOrUpdateResponse(response);
    } catch (error) {
      console.error("Error final al guardar la respuesta en PouchDB:", error);
    }
  };

  const handleNext = async () => {
    if (questions[currentQuestionIndex].Required === 'true') {
      if (Array.isArray(answer) && answer.length === 0) {
        alert('Respuesta es requerida.');
        return;
      } else if (typeof answer === 'string' && answer.trim() === '') {
        alert('Respuesta es requerida.');
        return;
      }
    }

    if ((typeof answer === 'string' && answer.trim() === '') || (Array.isArray(answer) && answer.length === 0)) {
      console.log('No se guarda respuesta vacía.');
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
      return;
    }

    const response = {
      _id: `${caseID}-${questions[currentQuestionIndex].QuestionID}`,
      CaseID: caseID,
      ParentCaseID: caseID,
      CaseDetails: '',
      QuestionID: questions[currentQuestionIndex].QuestionID,
      Index: currentQuestionIndex,
      ResponseID: uuidv4(),
      Response: answer,
    };

    await saveResponse(response);
    setAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const previousResponse = responses.find(response => response.QuestionID === questions[currentQuestionIndex - 1].QuestionID);
      setAnswer(previousResponse ? previousResponse.Response : '');
    }
  };

  const saveSurveyToFinalDB = async (caseID) => {
    try {
      const allResponses = await localResponsesDB.find({
        selector: { CaseID: caseID }
      });

      const surveyData = {
        _id: caseID,
        responses: allResponses.docs,
        timestamp: new Date().toISOString(),
      };

      await finalDB.put(surveyData);
      console.log('Encuesta guardada en finalDB:', surveyData);
    } catch (error) {
      console.error('Error al guardar la encuesta en finalDB:', error);
    }
  };

  const handleSubmit = async () => {
    await handleNext();  // Asegura guardar la última respuesta
    await saveSurveyToFinalDB(caseID);  // Agrega esta línea
    await handleResetResponses();  // Llamar a handleResetResponses para reiniciar responses en PouchDB
    alert('Encuesta completada y guardada en la base de datos final.');
    onNavigate('ParticipantList');  // Navegar a ParticipantList
  };

  const getFilteredChoices = () => {
    if (!currentQuestion) return [];
    const parentQuestionID = questions[currentQuestionIndex - 1]?.QuestionID;
    const parentResponse = responses.find(response => response.QuestionID === parentQuestionID)?.Response;

    if (!parentResponse) return choices.filter(choice => choice.QuestionID === currentQuestion.QuestionID);

    return choices.filter(choice => 
      choice.QuestionID === currentQuestion.QuestionID && 
      (!choice.ParentOptionID || choice.ParentOptionID.split(', ').includes(parentResponse))
    );
  };

  const currentQuestion = questions && questions.length > 0 ? questions[currentQuestionIndex] : null;

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handleBack()
  });

  const progress = (currentQuestionIndex + 1) / questions.length * 100;

  return (
    <div {...swipeHandlers} css={containerStyle}>
      <div css={navigationContainerStyle}>
        <button 
          onClick={handleBack} 
          disabled={currentQuestionIndex === 0}
          css={navigationButtonStyle}
        >
          &lt;
        </button>
        <ProgressBar progress={progress} />
        {currentQuestionIndex < questions.length - 1 ? (
          <button 
            onClick={handleNext} 
            disabled={currentQuestion && currentQuestion.Required === 'true' && typeof answer === 'string' && answer.trim() === ''}
            css={navigationButtonStyle}
          >
            &gt;
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            css={navigationButtonStyle}
          >
            &gt;
          </button>
        )}
      </div>

      {isLoading || isSyncing ? (
        <p>{isLoading ? 'Cargando preguntas...' : 'Sincronizando datos...'}</p>
      ) : (
        <>
          {currentQuestion && (
            <div css={questionContainerStyle}>
              <h2>{currentQuestion.QuestionText}</h2>
            </div>
          )}

          <div css={responseContainerStyle}>
            {currentQuestion && (
              <>
                {currentQuestion.ResponseType === 'Texto' && (
                  <TextArea
                    value={answer || ''}
                    onChange={handleResponseChange}
                    label="*Ingrese su respuesta"
                  />
                )}
                {currentQuestion.ResponseType === 'Fecha' && (
                  <DateInput value={answer || ''} onChange={handleResponseChange} />
                )}
                {currentQuestion.ResponseType === 'Opción Única < 5' && (
                  <RadioGroup
                    options={getFilteredChoices().map(choice => ({
                      value: choice.OptionText,
                      label: choice.OptionText
                    }))}
                    value={answer}
                    onChange={(value) => handleResponseChange(value)}
                    name={currentQuestion.QuestionID}
                    hint="*Seleccione una opción de la lista"
                  />
                )}
                {currentQuestion.ResponseType === 'Opción Múltiple < 5' && (
                  <CheckboxGroup
                    options={getFilteredChoices().map(choice => ({
                      value: choice.OptionText,
                      label: choice.OptionText
                    }))}
                    value={answer}
                    onChange={(value) => handleResponseChange(value)}
                    name={currentQuestion.QuestionID}
                    hint="*Seleccione todas las opciones que apliquen"
                  />
                )}
                {currentQuestion.ResponseType === 'Opción Única > 5' && (
                  <Dropdown
                    options={getFilteredChoices().map(choice => ({
                      OptionID: choice.OptionID,
                      OptionText: choice.OptionText
                    }))}
                    value={answer}
                    onChange={(value) => handleResponseChange(value)}
                  />
                )}
                {currentQuestion.ResponseType === 'Opción Múltiple > 5' && (
                  <DropdownMultiple
                    options={getFilteredChoices().map(choice => ({
                      OptionID: choice.OptionID,
                      OptionText: choice.OptionText
                    }))}
                    value={answer}
                    onChange={(value) => handleResponseChange(value)}
                  />
                )}
                {currentQuestion.ResponseType === 'Cuadro de búsqueda' && (
                  <SearchableDropdown
                    options={getFilteredChoices().map(choice => ({
                      OptionID: choice.OptionID,
                      OptionText: choice.OptionText
                    }))}
                    value={answer}
                    onChange={(value) => handleResponseChange(value)}
                  />
                )}
                {currentQuestion.ResponseType === 'Mapa' && (
                  <TextInput value={answer} onChange={(e) => handleResponseChange(e.target.value)} />
                )}
                {currentQuestion.ResponseType === 'Entrada de lápiz' && (
                  <TextInput value={answer} onChange={(e) => handleResponseChange(e.target.value)} />
                )}
                {['Audio', 'Cámara', 'Datos adjuntos', 'Visor de PDF'].includes(currentQuestion.ResponseType) && (
                  <TextInput
                    type="file"
                    accept={currentQuestion.ResponseType === 'Cargar imagen' ? 'image/*' :
                            currentQuestion.ResponseType === 'Audio' ? 'audio/*' :
                            currentQuestion.ResponseType === 'Cámara' ? 'video/*' :
                            currentQuestion.ResponseType === 'Visor de PDF' ? 'application/pdf' : ''}
                    onChange={(e) => handleResponseChange(e.target.files[0])}
                  />
                )}
                {currentQuestion && currentQuestion.ResponseType === 'Cargar imagen' && (
                  <CompressedImageInput onImageUpload={handleImageUpload} />
                )}
              </>
            )}
          </div>

          <div css={savedResponsesStyle}>
            <h2>Saved Responses</h2>
            <pre css={responsePreStyle}>
              {JSON.stringify(responses, null, 2)}
            </pre>
          </div>
        </>
      )}

      <div css={buttonContainerStyle}>
        <button 
          onClick={handleBack} 
          disabled={currentQuestionIndex === 0}
          css={buttonStyle}
        >
          Back
        </button>
        {currentQuestionIndex < questions.length - 1 ? (
          <button 
            onClick={handleNext} 
            disabled={currentQuestion && currentQuestion.Required === 'true' && typeof answer === 'string' && answer.trim() === ''}
            css={buttonStyle}
          >
            Next
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            css={buttonStyle}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  height: 73vh; /* Ajuste para descontar la altura del header y footer */
  width: 100%;
  padding: 10px;
  font-family: Arial, sans-serif;
`;

const questionContainerStyle = css`
  flex: 0 0 auto;
  margin-bottom: 2px;
`;

const responseContainerStyle = css`
  flex: 1;
  overflow-y: auto;
`;

const savedResponsesStyle = css`
  flex: 0 0 auto;
  margin-top: 0px;
  height: 150px;
`;

const responsePreStyle = css`
  background: #f6f8fa;
  padding: 10px;
  font-size: 0.85rem;
  overflow-x: auto;
  overflow-y: auto;
  height: 700px;
`;

const buttonContainerStyle = css`
  display: flex;
  padding: 10px 0;
  justify-content: space-between;
`;

const buttonStyle = css`
  padding: 10px 20px;
  background-color: #007BFF !important;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #cccccc !important;
    cursor: not-allowed;
  }
`;

const navigationContainerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  //background-color: white;
  //box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const navigationButtonStyle = css`
  padding: 10px 20px;
  //background-color: #08c;
  color: #08c;
  background: none;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    //background-color: #08c;
    cursor: not-allowed;
  }
`;

export default SurveyForm;
