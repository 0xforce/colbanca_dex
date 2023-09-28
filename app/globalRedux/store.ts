"use client";

import { configureStore } from '@reduxjs/toolkit'
import connectionReducer from './features/connectionSlice'
import tokensReducer from './features/tokensSlice'
import exchangeReducer from './features/exchangeSlice'

export const store = configureStore({
    reducer: {
        connectionReducer,
        tokensReducer,
        exchangeReducer,
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch