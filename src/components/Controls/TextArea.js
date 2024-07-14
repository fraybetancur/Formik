import React, { useState, useRef, useEffect } from 'react';
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
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    border-color: #0078d4;
    box-shadow: 0 0 5px rgba(0, 120, 212, 0.5);
    outline: none;
  }
`;

const TextArea = ({ value, onChange, label }) => {
  const [textValue, setTextValue] = useState(value);
  const textAreaRef = useRef(null);

  useEffect(() => {
    autoResize();
  }, [textValue]);

  const handleTextChange = (e) => {
    const { value } = e.target;
    setTextValue(value);
    onChange(value);
  };

  const autoResize = () => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = 'auto';
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  };

  return (
    <StyledTextAreaContainer>
      {label && <StyledTextAreaLabel>{label}</StyledTextAreaLabel>}
      <StyledTextArea
        ref={textAreaRef}
        value={textValue}
        onChange={handleTextChange}
        rows="1"
        autoFocus
      />
    </StyledTextAreaContainer>
  );
};

export default TextArea;
