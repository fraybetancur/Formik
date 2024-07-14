import React from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';

const StyledInput = styled.input`
  display: flex;
  align-items: center;
  width: 93%;
  height: 93%;
  margin: 5px 0;
  font-size: 1rem;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s, box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    border-color: ${lighten(0.2, '#ccc')};
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    border-color: #0078d4;
    box-shadow: 0 0 5px rgba(0, 120, 212, 0.5);
    outline: none;
  }
`;

const TextInput = ({ value = '', onChange }) => {
  return (
    <StyledInput
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
    />
  );
};

export default TextInput;
