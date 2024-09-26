import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // for React Native storage

import calllogReducer   from './slices/calllogSlice';
import smslogReducer    from './slices/smslogSlice';
import blockReducer     from './slices/blockSlice';
import userReducer      from "./slices/userSlice";

// Define persist configuration
const persistConfig = {
    key: 'root', // the key for storage
    storage: AsyncStorage, // use AsyncStorage for React Native
};

// Combine reducers into a single root reducer
const rootReducer = combineReducers({
    user: userReducer,
    callLog: calllogReducer,
    smsLog: smslogReducer,
    block: blockReducer
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with persisted reducer
export const store = configureStore({
    reducer: persistedReducer,
    // To ignore non-serializable checks for redux-persist
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
        serializableCheck: false,
        }),
});
  
// Export persistor to integrate with the app
export const persistor = persistStore(store);

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
