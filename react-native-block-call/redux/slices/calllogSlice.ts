import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CallLog } from '../interface';

interface CallLogState {
  lastUpdated: string;
  callLogs: CallLog[];
}

const initialState: CallLogState = {
  lastUpdated: "",
  callLogs: []
};

const calllogSlice = createSlice({
  name: 'callLog',
  initialState,
  reducers: {
    addCallLog: (state, action: PayloadAction<CallLog>) => {
      const newLog = {
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Check if the log already exists
      const exists = state.callLogs.some(log => log.number === newLog.number);

      if (!exists) {
        state.callLogs.push(newLog);
      }
    },
    addMultipleCallLogs: (state, action: PayloadAction<CallLog[]>) => {
      const newLogs = action.payload.map(log => ({
        ...log,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Filter out duplicates
      const filteredLogs = newLogs.filter(log => 
        !state.callLogs.some(existingLog => existingLog.number === log.number)
      );

      state.lastUpdated = new Date().toISOString();
      state.callLogs.push(...filteredLogs);
    },
    updateCallLog: (state, action: PayloadAction<{ number: string; updatedData: Partial<CallLog> }>) => {
      const { number, updatedData } = action.payload;
      const index = state.callLogs.findIndex(callLog => callLog.number === number);

      if (index !== -1) {
        state.callLogs[index] = {
          ...state.callLogs[index],
          ...updatedData,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    removeCallLog: (state, action: PayloadAction<string>) => {
      state.callLogs = state.callLogs.filter(log => log.number !== action.payload);
    },
    clearCallLogs: (state) => {
      state.lastUpdated = "";
      state.callLogs = [];
    }
  }
});

export const { addCallLog, addMultipleCallLogs, updateCallLog, removeCallLog, clearCallLogs } = calllogSlice.actions;

export default calllogSlice.reducer;