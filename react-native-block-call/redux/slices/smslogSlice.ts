import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SmsLog } from '../interface';

// Define the SmsLogState interface
interface SmsLogState {
  lastUpdated: string;
  smsLogs: SmsLog[];
}

// Initial state
const initialState: SmsLogState = {
  lastUpdated: "",
  smsLogs: []
};

// Create the smslogSlice
const smslogSlice = createSlice({
  name: 'smsLog',
  initialState,
  reducers: {
    addSmsLog: (state, action: PayloadAction<SmsLog>) => {
      const newLog = {
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Check if the log already exists
      const exists = state.smsLogs.some(log => log.address === newLog.address);

      if (!exists) {
        state.smsLogs.push(newLog);
      }
    },
    addMultipleSmsLogs: (state, action: PayloadAction<SmsLog[]>) => {
      const newLogs = action.payload.map(log => ({
        ...log,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Filter out duplicates
      const filteredLogs = newLogs.filter(log =>
        !state.smsLogs.some(existingLog => existingLog.address === log.address)
      );

      state.lastUpdated = new Date().toISOString();
      state.smsLogs.push(...filteredLogs);
    },
    updateSmsLog: (state, action: PayloadAction<{ address: string; updatedData: Partial<SmsLog> }>) => {
      const { address, updatedData } = action.payload;
      const index = state.smsLogs.findIndex(smsLog => smsLog.address === address);

      if (index !== -1) {
        state.smsLogs[index] = {
          ...state.smsLogs[index],
          ...updatedData,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    removeSmsLog: (state, action: PayloadAction<string>) => {
      state.smsLogs = state.smsLogs.filter(log => log.address !== action.payload);
    },
    clearSmsLogs: (state) => {
      state.lastUpdated = "";
      state.smsLogs = [];
    }
  }
});

// Export the actions
export const { addSmsLog, addMultipleSmsLogs, updateSmsLog, removeSmsLog, clearSmsLogs } = smslogSlice.actions;

// Export the reducer
export default smslogSlice.reducer;
