import { configureStore } from '@reduxjs/toolkit';
import authentication from 'store/authentication';

const store = configureStore({
  reducer: {
    auth: authentication,
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

export default store;