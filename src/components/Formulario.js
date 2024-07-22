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
  const { questions, choices, isLoading, isSyncing, responses, setResponses, currentQuestionIndex, setCurrentQuestionIndex, filters } = useContext(QuestionContext);
  const [answer, setAnswer] = useState('');
  const [caseID] = useState(uuidv4());
  const [previewUrl, setPreviewUrl] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  useEffect(() => {
    localResponsesDB.createIndex({ index: { fields: ['CaseID', 'QuestionID'] } });
    finalDB.createIndex({ index: { fields: ['CaseID', 'QuestionID'] } });
  }, []);

  const parseDependencies = (dependencies) => {
    return dependencies.split('AND').map(dep => {
      let operator;
      let value;
      let fact;

      dep = dep.trim();
      if (dep.includes(' OR ')) {
        const conditions = dep.split(' OR ').map(cond => parseDependencies(cond.trim())[0]);
        return { conditions, operator: 'OR' };
      } else if (dep.includes('=')) {
        [fact, value] = dep.split('=').map(s => s.trim().replace(/"/g, ''));
        operator = '==';
      } else if (dep.includes('<>')) {
        [fact, value] = dep.split('<>').map(s => s.trim().replace(/"/g, ''));
        operator = '!=';
      } else if (dep.includes('>=')) {
        [fact, value] = dep.split('>=').map(s => s.trim());
        operator = '>=';
      } else if (dep.includes('<=')) {
        [fact, value] = dep.split('<=').map(s => s.trim());
        operator = '<=';
      } else if (dep.includes('>')) {
        [fact, value] = dep.split('>').map(s => s.trim());
        operator = '>';
      } else if (dep.includes('<')) {
        [fact, value] = dep.split('<').map(s => s.trim());
        operator = '<';
      } else if (dep.includes('STARTS WITH')) {
        [fact, value] = dep.split('STARTS WITH').map(s => s.trim());
        operator = 'STARTS WITH';
      } else if (dep.includes('ENDS WITH')) {
        [fact, value] = dep.split('ENDS WITH').map(s => s.trim());
        operator = 'ENDS WITH';
      } else if (dep.includes('CONTAINS')) {
        [fact, value] = dep.split('CONTAINS').map(s => s.trim());
        operator = 'CONTAINS';
      } else if (dep.includes('BETWEEN')) {
        [fact, value] = dep.split('BETWEEN').map(s => s.trim());
        operator = 'BETWEEN';
      } else if (dep.includes('NOT BETWEEN')) {
        [fact, value] = dep.split('NOT BETWEEN').map(s => s.trim());
        operator = 'NOT BETWEEN';
      } else if (dep.includes('IN')) {
        [fact, value] = dep.split('IN').map(s => s.trim().replace(/[\[\]]/g, '').split(',').map(v => v.trim()));
        operator = 'IN';
      } else if (dep.includes('NOT IN')) {
        [fact, value] = dep.split('NOT IN').map(s => s.trim().replace(/[\[\]]/g, '').split(',').map(v => v.trim()));
        operator = 'NOT IN';
      }

      return { fact, operator, value };
    });
  };

  const evaluateDependency = (factValue, operator, value) => {
    console.log(`Evaluando dependencia: { factValue: ${factValue}, operator: ${operator}, value: ${value} }`);
    switch (operator) {
      case '==':
        return factValue == value; // Cambiado a ==
      case '!=':
        return factValue != value; // Cambiado a !=
      case '>':
        return Number(factValue) > Number(value);
      case '>=':
        return Number(factValue) >= Number(value);
      case '<':
        return Number(factValue) < Number(value);
      case '<=':
        return Number(factValue) <= Number(value);
      case 'STARTS WITH':
        return factValue.startsWith(value);
      case 'ENDS WITH':
        return factValue.endsWith(value);
      case 'CONTAINS':
        return factValue.includes(value);
      case 'BETWEEN':
        const [min, max] = value.split('AND').map(v => v.trim());
        return Number(factValue) >= Number(min) && Number(factValue) <= Number(max);
      case 'NOT BETWEEN':
        const [minNB, maxNB] = value.split('AND').map(v => v.trim());
        return Number(factValue) < Number(minNB) || Number(factValue) > Number(maxNB);
      case 'IN':
        return value.includes(factValue);
      case 'NOT IN':
        return !value.includes(factValue);
      default:
        return false;
    }
  };

  const evaluateConditions = (conditions, responseDict) => {
    return conditions.every(cond => {
      if (cond.operator === 'OR') {
        return cond.conditions.some(subCond => evaluateConditions([subCond], responseDict));
      }
      const response = responseDict[cond.fact];
      return response && evaluateDependency(response.Response, cond.operator, cond.value);
    });
  };

  const fetchFilteredQuestions = async (questions, filters, responses, caseID) => {
    console.log('Iniciando filtrado de preguntas...');

    // Pre-cargar todas las respuestas relevantes en un diccionario
    const responseDict = {};
    const allResponses = await localResponsesDB.find({ selector: { CaseID: caseID } });
    allResponses.docs.forEach(response => {
      responseDict[response.QuestionID] = response;
    });

    const newFilteredQuestions = questions.filter((q, index) => {
      console.log(`Evaluando pregunta: ${q.QuestionID} - ${q.QuestionText}`);

      // Filtrado basado en filtros de organización, programa, etc.
      if (
        (filters.organization && q.Organization !== filters.organization) ||
        (filters.program && q.Program !== filters.program) ||
        (filters.formId && q.FormID !== filters.formId) ||
        (filters.location && q.Location !== filters.location) ||
        (filters.interviewer && q.Interviewer !== filters.interviewer)
      ) {
        console.log(`Pregunta ${q.QuestionID} excluida por filtros de metadatos.`);
        return false;
      }

      // Filtrado basado en dependencias de respuestas
      if (q.ResponseDependencies) {
        const dependencies = parseDependencies(q.ResponseDependencies);
        if (!evaluateConditions(dependencies, responseDict)) {
          console.log(`Pregunta ${q.QuestionID} excluida por no cumplir las dependencias.`);
          return false;
        }
      }

      console.log(`Pregunta ${q.QuestionID} incluida.`);
      return true;
    });

    console.log('Preguntas filtradas:', newFilteredQuestions);
    return newFilteredQuestions;
  };

  useEffect(() => {
    const updateFilteredQuestions = async () => {
      const newFilteredQuestions = await fetchFilteredQuestions(questions, filters, responses, caseID);
      setFilteredQuestions(newFilteredQuestions);
    };

    updateFilteredQuestions();
  }, [filters, questions, responses, caseID]);

  const handleResponseChange = (value) => {
    console.log(`Cambiando respuesta: ${value}`);
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

        // Añadir log para verificar el estado actual de responses
        const updatedResponses = await localResponsesDB.find({ selector: { CaseID: response.CaseID } });
        console.log('Estado actual de responses después de guardar:', updatedResponses.docs);

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
      const newFilteredQuestions = await fetchFilteredQuestions(questions, filters, responses, caseID); // Recalcular preguntas filtradas después de guardar la respuesta
      setFilteredQuestions(newFilteredQuestions);
    } catch (error) {
      console.error("Error final al guardar la respuesta en PouchDB:", error);
    }
  };

  const generateResponseId = (caseID, questionID) => `${caseID}-${questionID}-${uuidv4()}`;


  const handleNext = async () => {
    if (filteredQuestions[currentQuestionIndex].Required === 'true') {
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
      if (currentQuestionIndex < filteredQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
      return;
    }

    const response = {
      _id: generateResponseId(caseID, filteredQuestions[currentQuestionIndex].QuestionID),
      CaseID: caseID,
      ParentCaseID: caseID,
      CaseDetails: '',
      QuestionID: filteredQuestions[currentQuestionIndex].QuestionID,
      Index: currentQuestionIndex,
      ResponseID: uuidv4(),
      Response: answer,
    };

    console.log('Guardando respuesta:', response);
    await saveResponse(response);
    setAnswer('');
    setPreviewUrl('');
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = async () => {
    if (currentQuestionIndex > 0) {
      const nextQuestionIndex = currentQuestionIndex - 1;
  
      // Encuentra la respuesta de la pregunta actual que deseas eliminar
      const responseToDelete = responses.find(
        response => response.QuestionID === filteredQuestions[currentQuestionIndex - 1].QuestionID
      );
  
      if (responseToDelete) {
        try {
          // Asegúrate de obtener la última revisión del documento
          const docToDelete = await localResponsesDB.get(responseToDelete._id);
          await localResponsesDB.remove(docToDelete);
          console.log(`Respuesta eliminada: ${docToDelete._id}`);
  
          // Actualiza el estado local de las respuestas
          setResponses(prevResponses =>
            prevResponses.filter(response => response._id !== docToDelete._id)
          );
        } catch (error) {
          console.error("Error eliminando la respuesta en PouchDB:", error);
        }
      } else {
        console.log('No se encontró respuesta para eliminar.');
      }
  
      // Retrocede a la pregunta anterior
      setCurrentQuestionIndex(nextQuestionIndex);
  
      // Establece la respuesta para la nueva pregunta actual si existe
      const previousResponse = responses.find(
        response => response.QuestionID === filteredQuestions[nextQuestionIndex].QuestionID
      );
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

  const handleFileChange = async (file) => {
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    const responseId = uuidv4();
    const fileResponse = {
      _id: responseId,
      type: file.type.split('/')[0],
      CaseID: caseID,
      ParentCaseID: caseID,
      CaseDetails: '',
      QuestionID: filteredQuestions[currentQuestionIndex].QuestionID,
      Index: currentQuestionIndex,
      ResponseID: responseId,
      Response: '',
      Url: fileUrl,
    };

    try {
      await localResponsesDB.put(fileResponse);
      const doc = await localResponsesDB.get(responseId);
      await localResponsesDB.putAttachment(doc._id, file.name, doc._rev, file, file.type);
      setResponses([...responses, fileResponse]);
      console.log('Archivo guardado:', fileResponse);
    } catch (error) {
      console.error("Error al guardar el archivo en PouchDB:", error);
    }
  };

  const handleImageUpload = async (imageFile, previewDataUrl) => {
    const responseId = uuidv4();
    const imageResponse = {
      _id: responseId,
      type: 'image',
      CaseID: caseID,
      ParentCaseID: caseID,
      CaseDetails: '',
      QuestionID: filteredQuestions[currentQuestionIndex].QuestionID,
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

  const getFilteredChoices = () => {
    if (!currentQuestion) return [];
    const parentQuestionID = filteredQuestions[currentQuestionIndex - 1]?.QuestionID;
    const parentResponse = responses.find(response => response.QuestionID === parentQuestionID)?.Response;

    if (!parentResponse) return choices.filter(choice => choice.QuestionID === currentQuestion.QuestionID);

    return choices.filter(choice => 
      choice.QuestionID === currentQuestion.QuestionID && 
      (!choice.ParentOptionID || choice.ParentOptionID.split(', ').includes(parentResponse))
    );
  };

  const currentQuestion = filteredQuestions && filteredQuestions.length > 0 ? filteredQuestions[currentQuestionIndex] : null;

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handleBack()
  });

  const progress = (currentQuestionIndex + 1) / filteredQuestions.length * 100;

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
        {currentQuestionIndex < filteredQuestions.length - 1 ? (
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
                          <div>
                            <a href={previewUrl} download="attachment">Descargar adjunto</a>
                            <div css={{ height: '500px', width: '100%' }}>
                              <PDFViewer fileUrl={previewUrl} />
                            </div>
                          </div>
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
        {currentQuestionIndex < filteredQuestions.length - 1 ? (
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
    position: fixed;
    bottom: 0;
    width: 90%;
    display: flex;
    justify-content: space-around;
    padding: 16px;
    background-color: white;
    border-top: 1px solid #e0e0e0;
`;

const buttonStyle = css`
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100px;
  height: 40px;

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
  z-index: 1000;
`;

const navigationButtonStyle = css`
  color: #08c;
  background: none;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: large;
  &:disabled {
    cursor: not-allowed;
  }
`;

export { localResponsesDB };
export default SurveyForm;