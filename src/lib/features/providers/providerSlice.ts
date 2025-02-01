import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../store'
import { ethers } from 'ethers'

// Define a type for the slice state
interface ProviderState {
  connection?: ethers.providers.Web3Provider
  chainId?: number
  account?: string
}

// Define the initial state using that type
const initialState: ProviderState = {
}

export const providerSlice = createSlice({
  name: 'provider',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    loadProvider: (state, { payload }: PayloadAction<ethers.providers.Web3Provider>) => {
      state.connection = payload
    },
    loadNetwork: (state, { payload }: PayloadAction<number>) => {
      state.chainId = payload
    },
    loadAccount: (state, { payload }: PayloadAction<string>) => {
      state.account = payload
    },
  },
})

export const { loadProvider, loadNetwork, loadAccount } = providerSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectConnection = (state: RootState) => state.provider.connection

export default providerSlice.reducer