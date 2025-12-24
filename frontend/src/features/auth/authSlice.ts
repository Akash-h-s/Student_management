import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type Role = "admin" | "teacher" | "parent" | "student";

interface User {
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  role: Role | "";
  user: User | null;
}

const initialState: AuthState = {
  role: "",
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<Role>) {
      state.role = action.payload;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.role = action.payload.role;
    },
    logout(state) {
      state.role = "";
      state.user = null;
    },
  },
});

export const { setRole, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
