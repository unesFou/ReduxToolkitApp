import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async ({ date_start, date_end }, { getState }) => {
    const state = getState().dashboard;
    const cachedData = state.cache.find(
      (item) => item.date_start === date_start && item.date_end === date_end
    );

    if (cachedData) {
      console.log("Data retrieved from cache", cachedData.data);
      return cachedData.data;
    }
    // if(response.data.error.code == 200){
    //   console.log('Erreur en odoo',response.data.error.message);
    //   return;
    // }
    
    const response = await axios.post('/api/dashboard', {
      params: { date_start , date_end },
    });
    console.log("API Dashboard response:", response.data);

    const result = response.data.result;
    return { date_start, date_end, data: JSON.parse(result.replace(/\\"/g, '"')) };
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: [],
    cache: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCache: (state) => {
      console.log("Clearing cache");
      state.cache = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        //state.data = action.payload.data;
        state.data = action.payload;
       // console.log("Data fetched and stored in state", action.payload);

        state.cache.push({
          startDate: action.payload.startDate,
          endDate: action.payload.endDate,
          data: action.payload.data,
        });
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCache } = dashboardSlice.actions;
export default dashboardSlice.reducer;
