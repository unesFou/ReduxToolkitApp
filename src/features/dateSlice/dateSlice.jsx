import { createSlice } from '@reduxjs/toolkit';

const getDefaultDates = () => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setHours(8, 0, 0, 0); // Définit 08h00

  const endDate = new Date(today);
  endDate.setHours(23, 0, 0, 0); // Définit 23h00

  return { startDate, endDate };
};

const initialState = {
  ...getDefaultDates(), // Définit les dates par défaut
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
    setDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.startDate = startDate;
      state.endDate = endDate;
    }
  }
});

export const { setDates, setDateRange } = dateSlice.actions;
export default dateSlice.reducer;
