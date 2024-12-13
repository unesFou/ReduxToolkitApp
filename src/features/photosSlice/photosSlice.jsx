// photosSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchTimelineImages = createAsyncThunk(
  'timeline/fetchTimelineImages',
  async ({ bt_id }, { rejectWithValue }) => {
    try {
      const start = new Date();
      start.setHours(7, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 0, 0);

      // Récupérer les données de timeline
      const timelineResponse = await axios.post(
        `http://localhost:8069/api/timeline`,
        { bt_id, date_start: start.toISOString(), date_end: end.toISOString() },
        { withCredentials: true }
      );
      const timelineData = timelineResponse.data.notifs.flatMap((notif) => notif || []);

      // Récupérer les images
      const images = await Promise.all(
        timelineData.map((notif) =>
          axios
            .post(`http://localhost:8069/api/img_notif/${notif.id}`, {}, { withCredentials: true })
            .then((res) => {
              const base64String = res.data.result.replace(/^'|'$/g, '');
              const decodedImage = JSON.parse(base64String).map((e) => e.img);
              return `data:image/png;base64,${atob(decodedImage)}`;
            })
        )
      );

      return images;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Une erreur est survenue');
    }
  }
);

const photosSlice = createSlice({
  name: 'timeline',
  initialState: { images: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimelineImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimelineImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
      })
      .addCase(fetchTimelineImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default photosSlice.reducer;
