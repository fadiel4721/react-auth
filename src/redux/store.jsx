import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './reducer';

const store = configureStore({
  reducer: {
    order: orderReducer, // Add the order slice reducer
  },
});

export default store;
