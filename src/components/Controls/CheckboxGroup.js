import React from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';

const CheckboxGroupWrapper = styled.div`
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

const CheckboxWrapper = styled.label`
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
    border-color: ${lighten(0.2, '#ccc')};
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  }

  input {
    margin-right: 10px;
    accent-color: #0078d4; /* Color del checkbox */
    transform: scale(1.5); /* Aumentar el tamaño del checkbox */
  }
`;

const CheckboxGroup = ({ options, value, onChange, name, hint }) => {
  const hintId = `${name}-hint`;

  return (
    <CheckboxGroupWrapper>
      {hint && <Hint id={hintId}>{hint}</Hint>}
      {options.map((option) => (
        <CheckboxWrapper key={option.value}>
          <input
            type="checkbox"
            value={option.value}
            checked={value.includes(option.value)}
            onChange={() => {
              const updatedValue = value.includes(option.value)
                ? value.filter(item => item !== option.value)
                : [...value, option.value];
              onChange(updatedValue);
            }}
            aria-describedby={hint ? hintId : undefined}
          />
          {option.label}
        </CheckboxWrapper>
      ))}
    </CheckboxGroupWrapper>
  );
};

export default CheckboxGroup;
