import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tasksReducer from './tasksSlice';
import templatesReducer from './templatesSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    templates: templatesReducer,
    user: userReducer,
  }
});

export default store;
