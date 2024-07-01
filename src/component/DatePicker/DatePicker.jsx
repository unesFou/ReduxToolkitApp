import React from 'react';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const DatePicker = () => {
  const handleSelect = (date) => {
    console.log(date); // native Date object
  };

  return (
    <Calendar
      date={new Date()}
      onChange={handleSelect}
    />
  );
};

export default DatePicker;
