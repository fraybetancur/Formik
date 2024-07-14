/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { css } from '@emotion/react';
import PouchDB from 'pouchdb-browser';
import { v4 as uuidv4 } from 'uuid';
import { useSwipeable } from 'react-swipeable';
import { QuestionContext } from './QuestionContext';
import TextArea from './Controls/TextArea'; 
import DateInput from './Controls/DateInput';
import RadioGroup from './Controls/RadioGroup';
import CheckboxGroup from './Controls/Checkbox';
import SearchableDropdown from './Controls/SearchableDropdown';
import TextInput from './Controls/TextInput';
import CompressedImageInput from './Controls/CompressedImageInput';

const localDB = new PouchDB('responses');

// Componente SurveyForm
const SurveyForm = () => {
  const { questions, choices, isLoading, isSyncing } = useContext(QuestionContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [responses, setResponses] = useState([]); // Cambiado de {} a []
  const [caseID] = useState(uuidv4());

  const handleImageUpload = async (imageFile, previewDataUrl) => {
    const responseId = uuidv4();
    const imageResponse = {
      _id: responseId,
      type: 'image',
      image: previewDataUrl, // Esto es opcional, depende de si quieres almacenar la vista previa en la DB
      questionId: questions[currentQuestionIndex].QuestionID
    };

    try {
      await localDB.put(imageResponse);
      const doc = await localDB.get(responseId);
      await localDB.putAttachment(doc._id, 'image.jpg', doc._rev, imageFile, 'image/jpeg');
      console.log("Imagen guardada correctamente en PouchDB");
      setResponses([...responses, imageResponse]); // Actualizamos el estado con la nueva respuesta
    } catch (error) {
      console.error("Error al guardar la imagen en PouchDB:", error);
    }
  };

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const allDocs = await localDB.allDocs({ include_docs: true });
        setResponses(allDocs.rows.map(row => row.doc)); // Cambiado el setResponses para ajustar el formato
      } catch (error) {
        console.error("Error fetching responses from PouchDB:", error);
      }
    };

    fetchResponses();
  }, []);

  const handleResponseChange = (value) => {
    setAnswer(value);
  };

  const saveResponse = async (response) => {
    try {
      await localDB.put(response);
      setResponses(prevResponses => {
        const existingResponseIndex = prevResponses.findIndex(res => res.QuestionID === response.QuestionID);
        if (existingResponseIndex > -1) {
          return prevResponses.map((res, index) => index === existingResponseIndex ? response : res);
        } else {
          return [...prevResponses, response];
        }
      }); // Cambiado el setResponses para ajustar el formato
    } catch (error) {
      console.error("Error guardando la respuesta en PouchDB:", error);
    }
  };

  const handleNext = async () => {
    if (questions[currentQuestionIndex].Required === 'true' && typeof answer === 'string' && answer.trim() === '') {
      alert('Respuesta es requerida.');
      return;
    }

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

    setAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const previousResponse = responses.find(response => response.QuestionID === questions[currentQuestionIndex - 1].QuestionID); // Cambiado para buscar en el array
      setAnswer(previousResponse ? previousResponse.Response : '');
    }
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

  return (
    <div {...swipeHandlers} css={containerStyle}>
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
                {currentQuestion.ResponseType === 'Opción Única' && (
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
                {currentQuestion.ResponseType === 'Opción Múltiple' && (
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
                {/* {['Cargar imagen', 'Cámara'].includes(currentQuestion.ResponseType) && (
                  <CompressedImageInput
                    type="file"
                    accept={currentQuestion.ResponseType === 'Cargar imagen' ? 'image/*' :
                            currentQuestion.ResponseType === 'Audio' ? 'audio/*' :
                            currentQuestion.ResponseType === 'Cámara' ? 'video/*' :
                            currentQuestion.ResponseType === 'Visor de PDF' ? 'application/pdf' : ''}
                    onChange={(e) => handleResponseChange(e.target.files[0])}
                  />
                )} */}
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
            onClick={handleNext}
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
  height: 70px;
`;

const buttonContainerStyle = css`
  display: flex;
  padding: 10px 0;
  justify-content: space-between;

  // position: absolute;
  // bottom: 50px; /* Espacio desde el fondo */
  // width: 100%;
  // display: flex;
  // justify-content: space-between;
  // padding: 0 20px;

`;

const buttonStyle = css`
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
`;

export default SurveyForm;
