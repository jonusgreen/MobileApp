import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true
      state.error = null
    },
    signInSuccess: (state, action) => {
      console.log("Redux: Storing user data:", action.payload)
      state.currentUser = action.payload
      state.loading = false
      state.error = null
    },
    signInFailure: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    updateUserStart: (state) => {
      state.loading = true
    },
    updateUserSuccess: (state, action) => {
      console.log("Redux: Updating user data:", action.payload)
      state.currentUser = action.payload
      state.loading = false
      state.error = null
    },
    updateUserFailure: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    deleteUserStart: (state) => {
      state.loading = true
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null
      state.loading = false
      state.error = null
    },
    deleteUserFailure: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    signOutUserStart: (state) => {
      state.loading = true
    },
    signOutUserSuccess: (state) => {
      state.currentUser = null
      state.loading = false
      state.error = null
    },
    signOutUserFailure: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} = userSlice.actions

export default userSlice.reducer
