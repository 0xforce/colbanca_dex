"use client";

import { configureStore } from '@reduxjs/toolkit'
import connectionReducer from './features/connectionSlice'
import tokensReducer from './features/tokensSlice'

export const store = configureStore({
    reducer: {
        connectionReducer,
        tokensReducer
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch