import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the structure of the data you want to save
interface AppState {
  sessionId: string;
  banks: any[];
  provinces: any[]; // Add provinces to the state
}

// Define the context value interface
interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  clearAll: () => void;
  loadingContext: boolean;
  updateSessionId: (newSessionId: string) => void;
  contextAddBanks: (newBanks: any[]) => void;
  contextAddProvinces: (newProvinces: any[]) => void; // Function to add provinces
}

// Default initial state
const initialState: AppState = {
  sessionId: '',
  banks: [],
  provinces: [], // Initialize provinces
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage key for AsyncStorage
const STORAGE_KEY = 'blockCall';

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [loadingContext, setLoadingContext] = useState(true);

  // Load data from AsyncStorage when the app starts
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          setState(JSON.parse(savedState));
        }
      } catch (error) {
        console.error('Failed to load state from AsyncStorage:', error);
      } finally {
        setLoadingContext(false);
      }
    };

    loadData();
  }, []);

  // Save data to AsyncStorage whenever the state changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save state to AsyncStorage:', error);
      }
    };

    if (!loadingContext) {
      saveData();
    }
  }, [state, loadingContext]);

  // Function to update sessionId
  const updateSessionId = (newSessionId: string) => {
    setState(prevState => ({
      ...prevState,
      sessionId: newSessionId,
    }));
  };

  // Function to add or update banks
  const contextAddBanks = (newBanks: any[]) => {
    setState(prevState => ({
      ...prevState,
      banks: [...prevState.banks, ...newBanks], // Merge old and new banks
    }));
  };

  // Function to add or update provinces
  const contextAddProvinces = (newProvinces: any[]) => {
    // setState(prevState => ({
    //   ...prevState,
    //   provinces: [...prevState.provinces, ...newProvinces], // Merge old and new provinces
    // }));

    setState(prevState => ({
      ...prevState,
      provinces: [...(prevState.provinces || []), ...newProvinces], // Ensure provinces is an array
    }));
  };

  // Function to clear the state and AsyncStorage
  const clearAll = async () => {
    try {
      setState(initialState); // Reset to the initial state
      await AsyncStorage.removeItem(STORAGE_KEY); // Clear storage
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, setState, clearAll, loadingContext, updateSessionId, contextAddBanks, contextAddProvinces }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use context in components
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
