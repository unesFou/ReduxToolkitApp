// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice/authSlice';
import dashboardReducer from '../features/dashboardSlice/dashboardSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
  },
});

export default store;
