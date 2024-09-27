import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { BlockItem } from "../interface"

// Define the initial state interface
interface BlockListState {
  blockList: BlockItem[];
}

// Initial state
const initialState: BlockListState = {
  blockList: [],
};

// Create the slice
const blockListSlice = createSlice({
  name: 'blockList',
  initialState,
  reducers: {
    // Add a single block item with duplicate check
    addBlock: (state, action: PayloadAction<BlockItem>) => {
      const exists = state.blockList.some(item => item.ID === action.payload.ID);
      if (!exists) {
        state.blockList.push(action.payload);
      }
    },
    
    // Add multiple block items with duplicate check
    addBlocks: (state, action: PayloadAction<BlockItem[]>) => {
      const newBlocks = action.payload.filter(
        newItem => !state.blockList.some(item => item.ID === newItem.ID)
      );
      state.blockList.push(...newBlocks);
    },

    // Update a block item by ID
    updateBlock: (state, action: PayloadAction<BlockItem>) => {
      const index = state.blockList.findIndex(item => item.ID === action.payload.ID);
      if (index !== -1) {
        state.blockList[index] = { ...state.blockList[index], ...action.payload, UPDATE_AT: new Date().toISOString() };
      }
    },

    // Remove a block item by ID
    removeBlock: (state, action: PayloadAction<string>) => {
      state.blockList = state.blockList.filter(item => item.PHONE_NUMBER !== action.payload);
    },

    // Clear all block items
    clearBlockList: (state) => {
      state.blockList = [];
    },
  },
});

// Export actions and reducer
export const { addBlock, addBlocks, updateBlock, removeBlock, clearBlockList } = blockListSlice.actions;
export default blockListSlice.reducer;