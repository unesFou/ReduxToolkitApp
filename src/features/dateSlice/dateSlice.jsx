// src/features/dateSlice/dateSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  startDate: null,
  endDate: null,
};

const dateSlice = createSlice({
  name: 'date',
  initialState,
  reducers: {
    setDates: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.startDate = startDate;
      state.endDate = endDate;
    },
    // Tu peux ajouter ici `setDateRange` si nécessaire
    setDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.startDate = startDate;
      state.endDate = endDate;
    }
  }
});

export const { setDates, setDateRange } = dateSlice.actions; // Assurez-vous d'exporter `setDateRange`
export default dateSlice.reducer;
