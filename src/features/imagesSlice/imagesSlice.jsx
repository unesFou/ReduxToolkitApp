import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// AsyncThunk pour récupérer les images
export const fetchImages = createAsyncThunk(
  'images/fetchImages',
  async (id, { getState }) => {
    const { images } = getState();
    // Vérifier si les images sont déjà en cache
    if (images.cache[id]) {
      return images.cache[id]; // Retourner les données mises en cache
    }
    // Si non en cache, effectuer la requête API
    const response = await axios.get(`/api/img_notif/${id}`);
    return { id, images: response.data };
  }
);

const imagesSlice = createSlice({
  name: 'images',
  initialState: {
    cache: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        const { id, images } = action.payload;
        state.cache[id] = images;
        state.loading = false;
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default imagesSlice.reducer;
