import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../store'
import { ethers } from 'ethers'

// Define a type for the slice state
interface ProviderState {
  connection?: ethers.providers.Web3Provider
  chainId: string
  account?: string
  balance?: string
}

// Define the initial state using that type
const initialState: ProviderState = {
  chainId: "0"
}

export const providerSlice = createSlice({
  name: 'provider',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    loadProvider: (state, { payload }: PayloadAction<ethers.providers.Web3Provider>) => {
      state.connection = payload
    },
    loadNetwork: (state, { payload }: PayloadAction<string>) => {
      state.chainId = payload
    },
    loadAccount: (state, { payload }: PayloadAction<string>) => {
      state.account = payload
    },
    loadBalance: (state, { payload }: PayloadAction<string>) => {
      state.balance = payload
    },
  },
})

export const { loadProvider, loadNetwork, loadAccount, loadBalance } = providerSlice.actions

export const selectProvider = (state: RootState) => state.provider

export default providerSlice.reducer