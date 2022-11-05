import create from 'zustand'
import PubSub from 'pubsub-js'
import globalStore from '../global'
import { getReadContract } from '@/contracts/funcs'
import { ERC20Abi } from '@/contracts/abis'

type State = {
  /** flux 合约 */
  fluxContract: any
  /** 用户flux余额 */
  fluxBalance: number | null
  fluxSymbol: string
  /** 初始化 */
  init: () => void
  /** 获取用户flux余额 */
  getFluxBalance: () => void
  // 获取flux symbol
  getFluxSymbol: () => void
}
const fluxStore = create<State>((set, get) => ({
  fluxContract: null,
  fluxBalance: null,
  fluxSymbol: 'FLUX',
  init: () => {
    try {
      const { fluxJson, connectNet } = globalStore.getState()
      const contract =
        fluxJson?.[connectNet as string]?.contracts['ZO'] ||
        fluxJson?.[connectNet as string]?.contracts['FLUX']
      const fluxContract = getReadContract(contract, ERC20Abi)
      set(() => ({
        fluxContract,
      }))
      PubSub.publish('fluxReady')
    } catch (error) {
      console.log(error)
    }
  },
  getFluxBalance: async () => {
    try {
      const { userAddress } = globalStore.getState()
      const { fluxContract } = get()
      if (!userAddress || !fluxContract) return
      const res = await fluxContract?.balanceOf(userAddress)
      set(() => ({
        fluxBalance: res,
      }))
    } catch (e) {
      console.error(e)
    }
  },
  getFluxSymbol: async () => {
    try {
      const { fluxContract } = get()
      if (!fluxContract) return
      const res = await fluxContract?.symbol()
      set(() => ({
        fluxSymbol: res,
      }))
    } catch (e) {
      console.error(e)
    }
  },
}))

export default fluxStore
