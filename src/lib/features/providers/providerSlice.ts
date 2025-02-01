import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../store'
import { ethers } from 'ethers'

// Define a type for the slice state
interface ProviderState {
  connection: ethers.providers.Web3Provider | undefined
}

// Define the initial state using that type
const initialState: ProviderState = {
  connection: undefined
}

export const providerSlice = createSlice({
  name: 'provider',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    loadProvider: (state, action: PayloadAction<ethers.providers.Web3Provider | undefined>) => {
      state.connection = action.payload
    },
  },
})

export const { loadProvider } = providerSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectConnection = (state: RootState) => state.provider.connection

export default providerSlice.reducer