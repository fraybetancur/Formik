/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useContext, useState, useEffect } from 'react';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import classnames from 'classnames';
import { QuestionContext } from './QuestionContext';
import PouchDB from 'pouchdb-browser';
import { v4 as uuidv4 } from 'uuid';

// Inicializa la base de datos local
const localDB = new PouchDB('responses');

// Componente para mostrar el estado de Formik
export const DisplayFormikState = props => (
  <div css={{ margin: '2rem 0' }}>
    <h3 css={{ fontFamily: 'monospace' }} />
    <pre
      css={{
        background: '#f6f8fa',
        fontSize: '.65rem',
        padding: '.5rem',
      }}
    >
      <strong>props</strong> = {JSON.stringify(props, null, 2)}
    </pre>
  </div>
);

const formikEnhancer = withFormik({
  validationSchema: Yup.object().shape({
    answer: Yup.string().required('Respuesta es requerida.'),
  }),
  mapPropsToValues: () => ({
    answer: '',
  }),
  handleSubmit: async (values, { setSubmitting, resetForm, props }) => {
    const { currentQuestionIndex, questions, saveResponse } = props;
    const currentQuestion = questions[currentQuestionIndex];

    const response = {
      _id: uuidv4(),
      CaseID: uuidv4(),
      ParentCaseID: null,
      CaseDetails: {},
      QuestionID: currentQuestion.id,
      Index: currentQuestionIndex,
      ResponseID: uuidv4(),
      Response: values.answer,
    };

    try {
      await localDB.put(response);
      saveResponse(response);
      resetForm();
      setSubmitting(false);
    } catch (error) {
      console.error("Error guardando la respuesta en PouchDB:", error);
      setSubmitting(false);
    }
  },
  displayName: 'FormularioDinamico',
});

const InputFeedback = ({ error }) =>
  error ? <div css={{ color: '#999', marginTop: '.25rem', ...(error && { color: 'red' }) }}>{error}</div> : null;

const Label = ({ error, className, children, ...props }) => {
  return (
    <label css={{ fontWeight: 'bold', display: 'block', marginBottom: '.5rem', ...(error && { color: 'red' }) }} {...props}>
      {children}
    </label>
  );
};

const TextInput = ({ type, id, label, error, value, onChange, className, ...props }) => {
  const classes = classnames(
    {
      'animated shake error': !!error,
    },
    className
  );
  return (
    <div className={classes} css={{ marginBottom: '1rem' }}>
      <Label htmlFor={id} error={error}>
        {label}
      </Label>
      <input
        id={id}
        css={{
          padding: '.5rem',
          fontSize: '16px',
          width: '100%',
          display: 'block',
          borderRadius: '4px',
          border: '1px solid #ccc',
          '&:focus': {
            borderColor: '#007eff',
            boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 0 3px rgba(0, 126, 255, 0.1)',
            outline: 'none',
          },
          ...(error && { borderColor: 'red' })
        }}
        type={type}
        value={value}
        onChange={onChange}
        {...props}
      />
      <InputFeedback error={error} />
    </div>
  );
};

const MyForm = props => {
  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setValues,
  } = props;

  const { questions, isLoading } = useContext(QuestionContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    // Resetea el campo de entrada cuando se cambia la pregunta
    setValues({ answer: '' });
  }, [currentQuestionIndex, setValues]);

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

  const saveResponse = response => {
    setResponses(prevResponses => ({
      ...prevResponses,
      [currentQuestionIndex]: response,
    }));
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (isLoading) return <p>Cargando preguntas...</p>;

  return (
    <form onSubmit={handleSubmit}>
      {currentQuestion ? (
        <>
          <TextInput
            id="answer"
            type="text"
            label={currentQuestion.questionText}
            placeholder="Respuesta"
            error={touched.answer && errors.answer}
            value={values.answer}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <div css={{ display: 'flex', justifyContent: 'space-between' }}>
            {currentQuestionIndex > 0 && (
              <button
                type="button"
                css={buttonStyles}
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </button>
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                css={buttonStyles}
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                css={buttonStyles}
                disabled={isSubmitting}
              >
                Submit
              </button>
            )}
          </div>
        </>
      ) : (
        <p>No hay más preguntas disponibles.</p>
      )}
      <DisplayFormikState {...props} />
    </form>
  );
};

const buttonStyles = css`
  max-width: 150px;
  margin: 20px 0;
  padding: 12px 20px;
  border-style: none;
  border-radius: 5px;
  background-color: #08c;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
  font-size: 17px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
  }
  & + button {
    margin-left: 0.5rem;
  }
`;

const FormularioDinamico = formikEnhancer(MyForm);

export default FormularioDinamico;
