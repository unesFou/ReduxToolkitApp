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

export const fetchTimelineData = createAsyncThunk(
  'timeline/fetchData',
  async ({ bt_id, date_start, date_end }, { getState, rejectWithValue }) => {
    try {
      const state = getState().timeline;

      // Vérifier le cache
      const cachedData = state.cache?.find(
        (item) =>
          item.bt_id === bt_id &&
          item.date_start === date_start &&
          item.date_end === date_end
      );

      if (cachedData) {
        console.log('Data retrieved from cache:', cachedData.data);
        return cachedData.data; // Retourner les données mises en cache
      }

      // Appeler l'API si les données ne sont pas dans le cache
      const data = await fetchDataNotif(bt_id, date_start, date_end);

      // Vérifier si la réponse est valide
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      const data_n = data.result;
      const parsedData = JSON.parse(data_n.replace(/\\"/g, '"'));

      // Retourner les données et les paramètres pour les ajouter au cache
      return { bt_id, date_start, date_end, data: parsedData };
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to fetch timeline data using the fetchDataNotif service
// export const fetchTimelineData = createAsyncThunk(
//   'timeline/fetchData',
//   async ({ bt_id, date_start, date_end }, { rejectWithValue }) => {
//     try {
//       // Call fetchDataNotif service
//       const data = await fetchDataNotif(bt_id, date_start, date_end);
      
//       // Check for valid JSON response
//       if (!data || typeof data !== 'object') {
//         throw new Error('Invalid response format');
//       }
//       const data_n = data.result;
      
//       return JSON.parse(data_n.replace(/\\"/g, '"')) ;
//       //return JSON.parse(data.result.replace(/\\"/g, '"')) ;
//     } catch (error) {
//       console.error('Error fetching timeline data:', error);
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

const timelineSlice = createSlice({
  name: 'timeline',
  initialState: {
    data: [],
    cache: [],
    loading: false,
    error: null,
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

          // Ajouter les données récupérées au cache
          const { bt_id, date_start, date_end, data } = action.payload;
          state.cache?.push({ bt_id, date_start, date_end, data });

          // Mettre à jour `state.data` avec les nouvelles données
          state.data = data;
        })
        .addCase(fetchTimelineData.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });

        },
});

export default timelineSlice.reducer;
