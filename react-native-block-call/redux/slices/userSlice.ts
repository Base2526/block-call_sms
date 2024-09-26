import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserItem } from '../interface';

interface UserState {
  user: UserItem | null;
}

const initialState: UserState = {
  user: null,
};

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserItem>) {
      state.user = action.payload; // Directly sets the user object
    },
    updateUser(state, action: PayloadAction<Partial<UserItem>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }; // Updates specific fields of the user
      }
    },
    resetUser() {
      return initialState;
    },
  },
});

// Export the actions
export const { setUser, updateUser, resetUser } = userSlice.actions;

// Export the reducer
export default userSlice.reducer;