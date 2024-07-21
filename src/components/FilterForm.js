/** @jsxImportSource @emotion/react */
import React, { useState, useContext } from 'react';
import { css } from '@emotion/react';
import { QuestionContext } from './QuestionContext';

const FilterForm = ({ onNavigate }) => {
  const { filters, setFilters } = useContext(QuestionContext);

  const [organization, setOrganization] = useState(filters.organization);
  const [program, setProgram] = useState(filters.program);
  const [formId, setFormId] = useState(filters.formId);
  const [location, setLocation] = useState(filters.location);
  const [interviewer, setInterviewer] = useState(filters.interviewer);

  const handleApplyFilters = () => {
    setFilters({
      organization,
      program,
      formId,
      location,
      interviewer,
    });
    onNavigate('Formulario');
  };

  return (
    <div css={containerStyle}>
      <h2>Seleccionar Criterios de Filtrado</h2>
      <label css={labelStyle}>
        Organización:
        <select value={organization} onChange={(e) => setOrganization(e.target.value)} css={selectStyle}>
          <option value="">Seleccionar</option>
          <option value="Mercy">Mercy</option>
          <option value="POA">POA</option>
        </select>
      </label>
      <label css={labelStyle}>
        Programa:
        <select value={program} onChange={(e) => setProgram(e.target.value)} css={selectStyle}>
          <option value="">Seleccionar</option>
          <option value="PT">PT</option>
          <option value="VE">VE</option>
          <option value="JA">JA</option>
          <option value="FO">FO</option>
        </select>
      </label>
      <label css={labelStyle}>
        Formulario:
        <select value={formId} onChange={(e) => setFormId(e.target.value)} css={selectStyle}>
          <option value="">Seleccionar</option>
          <option value="Registro">Registro</option>
          <option value="SA">SA</option>
          <option value="ET">ET</option>
          <option value="SE">SE</option>
        </select>
      </label>
      <label css={labelStyle}>
        Ubicación:
        <select value={location} onChange={(e) => setLocation(e.target.value)} css={selectStyle}>
          <option value="">Seleccionar</option>
          <option value="Barranquilla">Barranquilla</option>
          <option value="Cartagena">Cartagena</option>
        </select>
      </label>
      <label css={labelStyle}>
        Tipo de Encuestador:
        <select value={interviewer} onChange={(e) => setInterviewer(e.target.value)} css={selectStyle}>
          <option value="">Seleccionar</option>
          <option value="Especialista">Especialista</option>
          <option value="Generalista">Generalista</option>
        </select>
      </label>
      <button onClick={handleApplyFilters} css={buttonStyle}>APLICAR FILTROS Y CONTINUAR</button>
    </div>
  );
};

const containerStyle = css`
  padding: 2rem;
  padding-top: 6rem; /* Ajuste para descontar la altura del header */
  font-family: Arial, sans-serif;
`;

const labelStyle = css`
  display: block;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const selectStyle = css`
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
`;

const buttonStyle = css`
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export default FilterForm;
