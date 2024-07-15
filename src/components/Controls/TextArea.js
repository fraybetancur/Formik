import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';

const StyledTextAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 5px 0;
`;

const StyledTextAreaLabel = styled.label`
  font-size: 0.65rem;
  margin-bottom: 5px;
  font-style: italic;
`;

const StyledTextArea = styled.textarea`
  width: 93%;
  font-size: 0.8rem;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s, box-shadow 0.3s;
  cursor: pointer;
  resize: none;
  overflow: hidden;
  color: #727070;

  &:hover {
    border-color: ${lighten(0.2, '#ccc')};
  }

  &:focus {
    border-color: #0078d4;
    box-shadow: 0 0 5px rgba(0, 120, 212, 0.5);
    outline: none;
  }
`;

const TextArea = ({ value, onChange, label }) => {
  const textAreaRef = useRef(null);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = 'auto';
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  }, [value]);  // Se ejecuta cada vez que cambia el valor

  const handleTextChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <StyledTextAreaContainer>
      {label && <StyledTextAreaLabel>{label}</StyledTextAreaLabel>}
      <StyledTextArea
        ref={textAreaRef}
        value={value}
        onChange={handleTextChange}
        rows="1"
        autoFocus
      />
    </StyledTextAreaContainer>
  );
};

export default TextArea;
