import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Assuming fetchDataNotif is defined as part of your service
const fetchDataNotif = async (bt_id, date_start, date_end) => {
  try {
    const response = await axios.post(
      `/api/get_notifs`,
      {
        params: {
          unite_id: bt_id,
          date_start: date_start, //.toISOString().slice(0, 16),
          date_end: date_end //.toISOString().slice(0, 16),
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error; 
  }
};

// Thunk to fetch timeline data using the fetchDataNotif service
export const fetchTimelineData = createAsyncThunk(
  'timeline/fetchData',
  async ({ bt_id, date_start, date_end }, { rejectWithValue }) => {
    try {
      // Call fetchDataNotif service
      const data = await fetchDataNotif(bt_id, date_start, date_end);
      
      // Check for valid JSON response
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      const data_n = data.result;
      //console.log('data_n------get_notifs',JSON.parse(data_n.replace(/\\"/g, '"')))
      return JSON.parse(data_n.replace(/\\"/g, '"'));
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const timelineSlice = createSlice({
  name: 'timeline',
  initialState: {
    data: [],       // Holds the fetched data
    loading: false, // Loading state for UI
    error: null,    // Stores error message if the request fails
  },
  reducers: {
    // Add reducers if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimelineData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimelineData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // Store fetched notifications
      })
      .addCase(fetchTimelineData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Store error message
      });
  },
});

export default timelineSlice.reducer;
