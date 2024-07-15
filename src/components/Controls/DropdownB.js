import React, { useState } from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledInput = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s, box-shadow 0.3s;

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

const StyledSelect = styled.select`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s, box-shadow 0.3s;

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

const DropdownB = ({ options, value, onChange, showSearch = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.OptionText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    onChange(selectedOptions);
  };

  return (
    <Container>
      {showSearch && (
        <StyledInput
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
      )}
      <StyledSelect value={value} onChange={handleSelectChange} multiple>
        <option value="" disabled>Seleccione una opción</option>
        {filteredOptions.map(option => (
          <option key={option.OptionID} value={option.OptionText}>
            {option.OptionText}
          </option>
        ))}
      </StyledSelect>
    </Container>
  );
};

export default DropdownB;
