import create from 'zustand'
import globalStore from '../global'
import { getReadContract } from '@/contracts/funcs'
import { zoSwapAbi } from '@/contracts/abis'
import { constants } from 'ethers'
type State = {
  /** flux 合约 */
  zoContract: any
  info: any
  fluxTokenAddress: string | null
  zoTokenAddress: string | null
  zoSwapAddress: string | null
  /** 初始化 */
  init: () => void
  /** 获取用户flux余额 */
  getInfo: () => void
}
const zoSwapStore = create<State>((set, get) => ({
  zoContract: null,
  info: null,
  fluxTokenAddress: null,
  zoTokenAddress: null,
  zoSwapAddress: null,
  init: () => {
    try {
      const { fluxJson, connectNet } = globalStore.getState()
      const fluxTokenAddress = fluxJson?.[connectNet as string].contracts['FLUX']
      const zoSwapAddress = fluxJson?.[connectNet as string].contracts['ZOSwap']
      const zoTokenAddress = fluxJson?.[connectNet as string].contracts['ZO']
      // const { fluxJson, connectNet } = globalStore.getState()
      const zoContract = getReadContract(zoSwapAddress, zoSwapAbi)
      set(() => ({
        zoContract,
        zoSwapAddress,
        fluxTokenAddress,
        zoTokenAddress,
      }))
    } catch (error) {
      console.log(error)
    }

    // PubSub.publish('fluxReady')
  },
  getInfo: async () => {
    try {
      const { userAddress } = globalStore.getState()
      const { zoContract } = get()

      if (!zoContract) return
      const res = await zoContract?.getInfo(userAddress || constants.AddressZero)
      const { swapInfo, userInfo } = res
      console.log(res)
      set(() => ({
        info: {
          swapInfo: {
            dead: swapInfo[0],
            zo: swapInfo[1],
            flux: swapInfo[2],
            zoPerFlux10K: swapInfo[3],
            zoBalance: swapInfo[4],
            fluxBalance: swapInfo[5],
          },
          userInfo: {
            zoBalance: userInfo[0],
            fluxBalance: userInfo[1],
            fluxAllownace: userInfo[2],
          },
        },
      }))
    } catch (e) {
      console.error(e)
    }
  },
}))

export default zoSwapStore
