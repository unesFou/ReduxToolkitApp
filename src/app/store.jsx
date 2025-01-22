// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice/authSlice';
import dashboardReducer from '../features/dashboardSlice/dashboardSlice';
import searchReducer from '../features/searchSlice/searchSlice';
import timelineReducer from '../features/timelineSlice/timelineSlice';
import photosReducer from '../features/photosSlice/photosSlice';
import dateReducer from '../features/dateSlice/dateSlice';

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
  photosSlice: photosReducer,
  dates: dateReducer,
});

// Création d'un reducer persisté
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configuration du store Redux
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
      //serializableCheck: false,
    }),
});

// Création du persistor pour garder le store en cache
export const persistor = persistStore(store);
