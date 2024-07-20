import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import { lighten } from 'polished';
import moment from 'moment';

const DatePickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  width: 100%;
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;

  .react-datepicker {
    width: 100% !important; /* Aseguramos que el calendario ocupe todo el ancho */
    .react-datepicker__month-container {
      width: 100%;
      float: float: inherit; !important; /* Anulamos el float: left */
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
          width: 14.28%; /* Cada día ocupa 1/7 del ancho */
          height: 3rem; /* Ajusta la altura según sea necesario */
          line-height: 3rem;
          display: inline-flex;
          justify-content: center;
          align-items: center;
        }
        .react-datepicker__day-name {
          width: 14.28%; /* Cada nombre de día ocupa 1/7 del ancho */
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
  const [selectedDate, setSelectedDate] = useState(value ? moment(value).toDate() : null);

  useEffect(() => {
    setSelectedDate(value ? moment(value).toDate() : null);
  }, [value]);

  const handleDateChange = (date) => {
    const formattedDate = date ? moment(date).format('YYYY-MM-DD') : '';
    setSelectedDate(date);
    onChange(formattedDate);
  };

  return (
    <DatePickerWrapper>
      <StyledDatePicker
        selected={selectedDate}
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
              value={moment(date).year()}
              onChange={({ target: { value } }) => changeYear(value)}
              style={{ marginRight: '10px' }}
            >
              {Array.from({ length: 70 }, (_, i) => i + 1970).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={moment(date).month()}
              onChange={({ target: { value } }) => changeMonth(value)}
            >
              {moment.months().map((month, index) => (
                <option key={month} value={index}>
                  {month}
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
