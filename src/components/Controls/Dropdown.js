/** @jsxImportSource @emotion/react */
import React from 'react';
import Select from 'react-select';
import { css } from '@emotion/react';

const customStyles = {
  control: (provided) => ({
    ...provided,
    padding: 10,
    border: '1px solid #ccc',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      borderColor: '#0078d4'
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'lightblue' : state.isSelected ? 'lightgray' : null,
    color: 'black',
    cursor: 'pointer'
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'lightgray'
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'black'
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'black',
    ':hover': {
      backgroundColor: 'red',
      color: 'white'
    }
  })
};

const Dropdown = ({ options, value, onChange, placeholder }) => {
  const handleChange = selectedOptions => {
    onChange(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const formattedOptions = options.map(option => ({ value: option.OptionText, label: option.OptionText }));

  return (
    <div css={css`width: 100%;`}>
      <Select
        styles={customStyles}
        options={formattedOptions}
        isMulti
        onChange={handleChange}
        value={formattedOptions.filter(option => value.includes(option.value))}
        placeholder={placeholder}
        noOptionsMessage={() => 'No hay opciones'}
      />
    </div>
  );
};

export default Dropdown;
