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
 // ...getDefaultDates(), 
  // Définit les dates par défaut
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
    },
    ressetDateRange : (state, action) => {
      const date_s = new Date();
      if (date_s.getHours() < 8) {
        date_s.setDate(date_s.getDate() - 2);
      } else {
        date_s.setDate(date_s.getDate() - 1);
      }
      date_s.setHours(8, 0, 0, 0);
      const date_e = new Date(date_s.getTime() +  (24 * 60 * 60 * 1000));
  
      // const dateStartRate = date_s.toISOString().slice(0, 16);
      // const dateEndRate = date_e.toISOString().slice(0, 16);
  
      state.startDate  = date_s;
      state.endDate= date_e;
      console.log('date_s',date_s,'date_e',date_e)
      
      
    }
  }
});

export const { setDates, setDateRange, ressetDateRange } = dateSlice.actions;
export default dateSlice.reducer;
