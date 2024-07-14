import React from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';

const RadioGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%; /* Ajustar al 100% del contenedor padre */
`;

const Hint = styled.div`
  margin-bottom: 10px;
  font-size: 0.65rem;
  color: #6c757d;
  font-style: italic;
`;

const RadioWrapper = styled.label`
  display: flex;
  align-items: center;
  width: 93%;
  margin: 5px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s, box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    border-color: ${lighten(0.1, '#0078d4')};
    box-shadow: 0 0 5px ${lighten(0.3, '#0078d4')};
  }

  input {
    margin-right: 10px;
    accent-color: #0078d4; /* Color del radio button */
    transform: scale(1.5); /* Aumentar el tamaño del radio button */
  }
`;

const RadioGroup = ({ options, value, onChange, name, hint }) => {
  const hintId = `${name}-hint`;

  return (
    <RadioGroupWrapper>
      {hint && <Hint id={hintId}>{hint}</Hint>}
      {options.map((option) => (
        <RadioWrapper key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            aria-describedby={hint ? hintId : undefined}
          />
          {option.label}
        </RadioWrapper>
      ))}
    </RadioGroupWrapper>
  );
};

export default RadioGroup;
