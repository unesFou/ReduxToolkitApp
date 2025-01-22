import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async ({ date_start, date_end }) => {
    try {
      const response = await axios.post('/api/dashboard1', {
        params: { date_start, date_end },
      });
      console.log("API Dashboard response:", response.data);

      const result = response.data.result;
      return { date_start, date_end, data: JSON.parse(result.replace(/\\"/g, '"')) };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          state.data = action.payload.data;
        } else {
          console.warn("No data received from API");
        }
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default dashboardSlice.reducer;
