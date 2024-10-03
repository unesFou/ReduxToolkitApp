import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch dashboard data, using cache to avoid redundant API calls
export const fetchDashboardData = createAsyncThunk(
  'dashboard/',
  async ({ startDate, endDate }, { getState }) => {
    const state = getState().dashboard;
    
    // Check if the data for this date range is already cached
    const cachedData = state.cache.find(
      (item) => item.startDate === startDate && item.endDate === endDate
    );

    if (cachedData) {
      // If cached, return the cached data
      return cachedData.data;
    }
    
    // Otherwise, make the API call
    const response = await axios.post('/api/dashboard', {
      params: { startDate, endDate },
    });
    const result = response.data.result;
    return { startDate, endDate, data: JSON.parse(result.replace(/\\"/g, '"')) };
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: [],       // Data for current view
    cache: [],      // Cache of previously fetched data
    loading: false, // Loading state
    error: null,    // Error state
  },
  reducers: {
    clearCache: (state) => {
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
        state.data = action.payload.data;

        // Add the response to the cache
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
