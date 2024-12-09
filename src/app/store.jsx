// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice/authSlice';
import dashboardReducer from '../features/dashboardSlice/dashboardSlice';
import searchReducer from '../features/searchSlice/searchSlice';
import timelineReducer from '../features/timelineSlice/timelineSlice';
import imagesReducer from '../features/imagesSlice/imagesSlice';

import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';

// Configuration pour redux-persist
const persistConfig = {
  key: 'root',
  storage,
};

// Combinaison de tous les reducers
const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  search: searchReducer,
  timeline: timelineReducer,
  images : imagesReducer
});

// Création d'un reducer persisté
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configuration du store Redux
export const store = configureStore({
  reducer: persistedReducer,
});

// Création du persistor pour garder le store en cache
export const persistor = persistStore(store);
