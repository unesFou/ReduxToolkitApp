import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


// Define the async thunk
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    const d_s = new Date();
    d_s.setDate(d_s.getDate() - 10);
    const d_e = new Date();
    try {
      const response = await axios.post(`/api/dashboard`, {
        params: {
          // date_start: startDate.toISOString().slice(0, 16),
          // date_end: endDate.toISOString().slice(0, 16),
          date_start: d_s.toISOString().slice(0, 16),
          date_end: d_e.toISOString().slice(0, 16),
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${setUser.session_id}`, // Assuming the sessionID is a JWT token
        },
        body: JSON.stringify({}),
        credentials: 'include',
      });

      if (response.status !== 200) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const data = response.data.result;
        return JSON.parse(data.replace(/\\"/g, '"'));
      } else {
        throw new Error('Response is not in JSON format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create the slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: null,
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
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
