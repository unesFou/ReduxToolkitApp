import React, { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import { useDispatch } from 'react-redux';
import { setDateRange } from './../../features/dateSlice/dateSlice';

import 'react-date-range/dist/styles.css'; // Styles pour le date picker
import 'react-date-range/dist/theme/default.css'; // Thème par défaut

const DateRangePickerComponent = () => {
  const dispatch = useDispatch();

  // Initialisez l'état local pour `ranges`
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection', // Clé obligatoire pour le composant
    },
  ]);

  // Gérer le changement de plage de dates
  const handleDateChange = (ranges) => {
    const { startDate, endDate } = ranges.selection; // Extraire les dates
    setState([ranges.selection]); // Mettre à jour l'état local
    dispatch(setDateRange({ startDate, endDate })); // Mettre à jour le store Redux
  };

  return (
    <div>
      <DateRangePicker
        ranges={state}
        onChange={handleDateChange} // Fonction appelée lors de chaque modification
      />
    </div>
  );
};

export default DateRangePickerComponent;
