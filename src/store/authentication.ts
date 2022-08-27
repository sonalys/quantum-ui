import { createSlice } from '@reduxjs/toolkit'

export class InitialState {
  logged: boolean
};

const store = createSlice({
  name: "authentication",
  initialState: new InitialState(),
  reducers: {
    login: state => { state.logged = true },
    logout: state => { state.logged = false },
  }
});

export const { login, logout } = store.actions
export default store.reducer