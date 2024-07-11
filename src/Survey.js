/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import classnames from 'classnames';

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
    firstName: Yup.string()
      .min(2, "C'mon, your name is longer than that")
      .required('First name is required.'),
  }),
  mapPropsToValues: ({ user }) => ({
    ...user,
  }),
  handleSubmit: (payload, { setSubmitting }) => {
    alert(payload.email);
    setSubmitting(false);
  },
  displayName: 'MyForm',
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

const Form = props => {
  const {
    values,
    touched,
    errors,
    dirty,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    isSubmitting,
  } = props;
  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        id="firstName"
        type="text"
        label="First Name"
        placeholder="John"
        error={touched.firstName && errors.firstName}
        value={values.firstName}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <button
        type="button"
        css={{
          maxWidth: '150px',
          margin: '20px 0',
          padding: '12px 20px',
          borderStyle: 'none',
          borderRadius: '5px',
          backgroundColor: '#08c',
          boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.15)',
          fontSize: '17px',
          fontWeight: '500',
          color: '#fff',
          cursor: 'pointer',
          outline: 'none',
          '-webkit-appearance': 'none',
          '&:disabled': {
            opacity: '.5',
            cursor: 'not-allowed !important',
          },
          '& + button': {
            marginLeft: '.5rem',
          }
        }}
        onClick={handleReset}
        disabled={!dirty || isSubmitting}
      >
        Reset
      </button>
      <button
        type="submit"
        css={{
          maxWidth: '150px',
          margin: '20px 0',
          padding: '12px 20px',
          borderStyle: 'none',
          borderRadius: '5px',
          backgroundColor: '#08c',
          boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.15)',
          fontSize: '17px',
          fontWeight: '500',
          color: '#fff',
          cursor: 'pointer',
          outline: 'none',
          '-webkit-appearance': 'none',
          '&:disabled': {
            opacity: '.5',
            cursor: 'not-allowed !important',
          },
          '& + button': {
            marginLeft: '.5rem',
          }
        }}
        disabled={isSubmitting}
      >
        Submit
      </button>
      <DisplayFormikState {...props} />
    </form>
  );
};

const SurveyForm = formikEnhancer(Form);

export default SurveyForm;
