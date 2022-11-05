import create from 'zustand'
import PubSub from 'pubsub-js'
import globalStore from '../global'
import { getReadContract } from '@/contracts/funcs'
import { ERC20Abi } from '@/contracts/abis'

type State = {
  /** flux 合约 */
  contract: any
  /** 用户flux余额 */
  balance: number | null
  symbol: string
  /** 初始化 */
  init: () => void
  /** 获取用户flux余额 */
  getBalance: () => void
  // 获取flux symbol
  getSymbol: () => void
}
const zoStore = create<State>((set, get) => ({
  contract: null,
  balance: null,
  symbol: 'ZO',
  init: () => {
    const { fluxJson, connectNet } = globalStore.getState()
    const contract = getReadContract(fluxJson?.[connectNet as string]?.contracts['ZO'], ERC20Abi)
    set(() => ({
      contract,
    }))
    PubSub.publish('fluxReady')
  },
  getBalance: async () => {
    try {
      const { userAddress } = globalStore.getState()
      const { contract } = get()
      if (!userAddress || !contract) return
      const res = await contract?.balanceOf(userAddress)
      set(() => ({
        balance: res,
      }))
    } catch (e) {
      console.error(e)
    }
  },
  getSymbol: async () => {
    try {
      const { contract } = get()
      if (!contract) return
      const res = await contract?.symbol()
      set(() => ({
        symbol: res,
      }))
    } catch (e) {
      console.error(e)
    }
  },
}))

export default zoStore
