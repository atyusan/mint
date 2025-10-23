import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import merchantReducer from './slices/merchantSlice';
import invoiceReducer from './slices/invoiceSlice';
import terminalReducer from './slices/terminalSlice';
import payoutReducer from './slices/payoutSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    merchant: merchantReducer,
    invoice: invoiceReducer,
    terminal: terminalReducer,
    payout: payoutReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
