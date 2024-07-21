import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import { lighten } from 'polished';
import { parseISO, isValid, format } from 'date-fns';

const DatePickerWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 10px 0;
  width: 100%;
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;

  .react-datepicker {
    width: 100% !important;
    .react-datepicker__month-container {
      width: 100%;
      float: inherit !important;
      .react-datepicker__header {
        width: 100%;
        display: flex;
        justify-content: center;
        .react-datepicker__current-month,
        .react-datepicker__navigation {
          display: none;
        }
      }
      .react-datepicker__month {
        width: 100%;
        .react-datepicker__day {
          width: 14.28%;
          height: 3rem;
          line-height: 3rem;
          display: inline-flex;
          justify-content: center;
          align-items: center;
        }
        .react-datepicker__day-name {
          width: 14.28%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }

  padding: 10px;
  font-size: 18px;
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
  const [selectedDate, setSelectedDate] = useState(value ? parseISO(value) : null);

  useEffect(() => {
    setSelectedDate(value ? parseISO(value) : null);
  }, [value]);

  const handleDateChange = (date) => {
    if (isValid(date)) {
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
      setSelectedDate(date);
      onChange(formattedDate);
    } else {
      setSelectedDate(null);
      onChange('');
    }
  };

  const isValidDate = (date) => {
    return date && !isNaN(date);
  };

  return (
    <DatePickerWrapper>
      <StyledDatePicker
        selected={isValidDate(selectedDate) ? selectedDate : null}
        onChange={handleDateChange}
        inline
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
        }) => (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <select
              value={isValidDate(date) ? date.getFullYear() : ''}
              onChange={({ target: { value } }) => changeYear(parseInt(value))}
              style={{ marginRight: '10px' }}
            >
              {Array.from({ length: 70 }, (_, i) => i + 1970).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={isValidDate(date) ? date.getMonth() : ''}
              onChange={({ target: { value } }) => changeMonth(parseInt(value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {format(new Date(0, i), 'MMMM')}
                </option>
              ))}
            </select>
          </div>
        )}
      />
    </DatePickerWrapper>
  );
};

export default DateInput;
