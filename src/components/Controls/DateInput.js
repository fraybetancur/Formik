import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import { lighten } from 'polished';

const DatePickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:hover {
    border-color: ${lighten(0.1, '#0078d4')};
    box-shadow: 0 0 5px ${lighten(0.3, '#0078d4')};
  }

  &:focus {
    outline: none;
    border-color: #0078d4;
    box-shadow: 0 0 5px ${lighten(0.3, '#0078d4')};
  }
`;

const DateInput = ({ value, onChange }) => {
  const handleDateChange = (date) => {
    onChange(date ? date.toISOString().split('T')[0] : '');
  };

  return (
    <DatePickerWrapper>
      <StyledDatePicker
        selected={value ? new Date(value) : null}
        onChange={handleDateChange}
        inline
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
    </DatePickerWrapper>
  );
};

export default DateInput;
