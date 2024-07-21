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
import CheckboxGroup from './Controls/CheckboxGroup';
import SearchableDropdown from './Controls/SearchableDropdown';
import Dropdown from './Controls/Dropdown';
import DropdownMultiple from './Controls/DropdownMultiple';
import TextInput from './Controls/TextInput';
import CompressedImageInput from './Controls/CompressedImageInput';
import ProgressBar from './ProgressBar';
import PDFViewer from './PDFViewer';

const localResponsesDB = new PouchDB('responses');
const finalDB = new PouchDB('finalDB');

const SurveyForm = ({ onNavigate }) => {
  const { questions, setQuestions, choices, isLoading, isSyncing, responses, setResponses, currentQuestionIndex, setCurrentQuestionIndex, syncData, handleUpload } = useContext(QuestionContext);
  const { filters } = useContext(QuestionContext);
  const [answer, setAnswer] = useState('');
  const [caseID] = useState(uuidv4());
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentFile, setCurrentFile] = useState(null);

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
      await localResponsesDB.put(imageResponse);
      const doc = await localResponsesDB.get(responseId);
      await localResponsesDB.putAttachment(doc._id, 'image.jpg', doc._rev, imageFile, 'image/jpeg');
      setResponses([...responses, imageResponse]);
      console.log('Imagen guardada:', imageResponse);
    } catch (error) {
      console.error("Error al guardar la imagen en PouchDB:", error);
    }
  };

  const handleFileChange = async (file) => {
    console.log('File selected:', file);
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    console.log('Generated preview URL:', fileUrl);

    const responseId = uuidv4();
    const fileResponse = {
      _id: responseId,
      type: file.type.split('/')[0],
      CaseID: caseID,
      ParentCaseID: caseID,
      CaseDetails: '',
      QuestionID: questions[currentQuestionIndex].QuestionID,
      Index: currentQuestionIndex,
      ResponseID: responseId,
      Response: '',
      Url: fileUrl,
    };

    try {
      console.log('Saving file response to PouchDB...');
      await localResponsesDB.put(fileResponse);
      const doc = await localResponsesDB.get(responseId);
      console.log('File response saved:', fileResponse);

      console.log('Saving file attachment to PouchDB...');
      await localResponsesDB.putAttachment(doc._id, file.name, doc._rev, file, file.type);
      setResponses([...responses, fileResponse]);
      console.log('Archivo guardado:', fileResponse);
    } catch (error) {
      console.error("Error al guardar el archivo en PouchDB:", error);
    }
  };

  useEffect(() => {
    const fetchFilteredQuestions = async () => {
      const filteredQuestions = questions.filter(q => 
        (!filters.organization || q.Organization === filters.organization) &&
        (!filters.program || q.Program === filters.program) &&
        (!filters.formId || q.FormID === filters.formId) &&
        (!filters.location || q.Location === filters.location) &&
        (!filters.interviewer || q.Interviewer === filters.interviewer)
      );
      setQuestions(filteredQuestions);
    };
    fetchFilteredQuestions();
  }, [filters, questions, setQuestions]);
  

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [setCurrentQuestionIndex]);

  const handleResponseChange = (value) => {
    setAnswer(value);
  };

  const saveOrUpdateResponse = async (response, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const existingResponse = await localResponsesDB.get(response._id).catch(err => null);
        if (existingResponse) {
          response._rev = existingResponse._rev;
        }
        await localResponsesDB.put(response);
        setResponses(prevResponses => {
          const existingResponseIndex = prevResponses.findIndex(res => res._id === response._id);
          if (existingResponseIndex > -1) {
            return prevResponses.map((res, index) => index === existingResponseIndex ? response : res);
          } else {
            return [...prevResponses, response];
          }
        });
        console.log('Respuesta guardada:', response);
        return;
      } catch (error) {
        if (error.status === 409) {
          const existingResponse = await localResponsesDB.get(response._id);
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
      console.log("Respuesta guardada:", response);
    } catch (error) {
      console.error("Error final al guardar la respuesta en PouchDB:", error);
    }
  };

  const generateResponseId = (caseID, questionID) => `${caseID}-${questionID}-${uuidv4()}`;

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
      _id: generateResponseId(caseID, questions[currentQuestionIndex].QuestionID),
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
    setPreviewUrl('');
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
                  <>
                    <input
                      type="file"
                      accept={currentQuestion.ResponseType === 'Datos adjuntos' ? 'application/*' :
                              currentQuestion.ResponseType === 'Audio' ? 'audio/*' :
                              currentQuestion.ResponseType === 'Cámara' ? 'video/*' :
                              currentQuestion.ResponseType === 'Visor de PDF' ? 'application/pdf' : ''}
                      onChange={(e) => handleFileChange(e.target.files[0])}
                    />
                    {previewUrl && (
                      <div>
                        {currentQuestion.ResponseType === 'Audio' && (
                          <audio controls>
                            <source src={previewUrl} type="audio/*" />
                            Tu navegador no soporta el elemento de audio.
                          </audio>
                        )}
                        {currentQuestion.ResponseType === 'Cámara' && (
                          <video controls width="250">
                            <source src={previewUrl} type="video/*" />
                            Tu navegador no soporta el elemento de video.
                          </video>
                        )}
                        {currentQuestion.ResponseType === 'Datos adjuntos' && (
                          <a href={previewUrl} download="attachment">Descargar adjunto</a>
                        )}
                        {currentQuestion.ResponseType === 'Visor de PDF' && (
                          <div css={{ height: '500px', width: '100%' }}>
                            <PDFViewer fileUrl={previewUrl} />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
                {currentQuestion && currentQuestion.ResponseType === 'Cargar imagen' && (
                  <CompressedImageInput onImageUpload={handleImageUpload} />
                )}
              </>
            )}
          </div>

          <div css={savedResponsesStyle}>
            <h2>Respuestas guardadas</h2>
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
          Atrás
        </button>
        {currentQuestionIndex < questions.length - 1 ? (
          <button 
            onClick={handleNext} 
            disabled={currentQuestion && currentQuestion.Required === 'true' && typeof answer === 'string' && answer.trim() === ''}
            css={buttonStyle}
          >
            Siguiente
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            css={buttonStyle}
          >
            Enviar
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
  padding: 2rem;
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

const navigationContainerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  z-index: 1000;
`;

const navigationButtonStyle = css`
  padding: 10px 20px;
  color: #08c;
  background: none;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

export { localResponsesDB };
export default SurveyForm;