import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice/authSlice';
import dashboardReducer from '../features/dashboardSlice/dashboardSlice';
import searchReducer from '../features/searchSlice/searchSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    search: searchReducer,
  },
});

export default store;
