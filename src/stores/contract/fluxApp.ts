import create from 'zustand'
import globalStore from '@/stores/global'
import { getReadContract } from '@/contracts/funcs'
import BigNumber from 'bignumber.js'
import { utils } from 'ethers'
import { FluxApp } from '@/contracts/abis'

type State = {
  /** fluxApp 合约 */
  fluxAppContract: any
  // 总存款额
  supplyBalance: number | null
  // 总借款额
  borrowBalance: number | null
  // 借款能力
  borrowLimit: number | string | null
  // 总抵押率
  colRatio: number | null
  /** 初始化 */
  init: () => void
  /**查询用户总资产数据 */
  getUserAssets: () => void
}
const fluxAppStore = create<State>((set, get) => ({
  fluxAppContract: null,
  supplyBalance: null,
  borrowBalance: null,
  borrowLimit: null,
  colRatio: null,
  init: () => {
    const { fluxJson, connectNet } = globalStore.getState()
    const fluxAppContract = getReadContract(
      fluxJson?.[connectNet as string].contracts['FluxApp'],
      FluxApp
    )
    set(() => ({
      fluxAppContract,
    }))
  },
  getUserAssets: async () => {
    try {
      const { isLogin, userAddress } = globalStore.getState()
      const { fluxAppContract } = get()

      if (isLogin) {
        const res = await fluxAppContract.getAcctSnapshot(userAddress)
        let colRatioValue = 0
        const supplyBalance = new BigNumber(
          utils.formatUnits(res.supplyValueMan.toString(), 18).toString()
        )
        const borrowBalance = new BigNumber(
          utils.formatUnits(res.borrowValueMan.toString(), 18).toString()
        )
        if (!supplyBalance.eq(0) && !borrowBalance.eq(0)) {
          colRatioValue = supplyBalance.div(borrowBalance).toNumber()
        }

        set(() => ({
          supplyBalance: supplyBalance.toNumber(),
          borrowBalance: borrowBalance.toNumber(),
          borrowLimit: utils.formatUnits(res.borrowLimitMan.toString(), 18).toString(),
          colRatio: colRatioValue,
        }))
      }
    } catch (err) {
      console.log(err)
    }
  },
}))

export default fluxAppStore
