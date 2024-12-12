import React, { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const DateRangePickerDate = () => {
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const handleSelect = (ranges) => {
    console.log(ranges);
    setState([ranges.selection]);
  };

  return (
    <DateRangePicker
      ranges={state}
      onChange={handleSelect}
    />
  );
};

export default DateRangePickerDate;
