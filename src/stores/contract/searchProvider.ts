import create from 'zustand'
import BigNumber from 'bignumber.js'
import globalStore from '../global'
import { getReadContract } from '@/contracts/funcs'
import { safeAddress } from '@/utils/tools'
import { SearchProvider } from '@/contracts/abis'

type State = {
  // 净年利率
  apy: any
  /** flux 合约 */
  searchProviderContract: any
  /** 用户待领取的flux余额 */
  unclaimedFlux: number | null
  /** 用户market信息 */
  userMarketsData: any
  // 借贷市场下用户待领取的Flux余额
  unclaimedFluxAtLoan: []
  // 借贷市场下用户待领取的Flux余额总额
  unclaimedFluxAtLoanTotal: any
  /** 初始化 */
  init: () => void
  /** 用户待领取的flux余额 */
  getUnclaimedFlux: () => void
  /** 获取用户market信息 */
  getUserMarketsData: () => void
  /** 获取借贷市场下用户待领取的Flux余额 */
  getUnclaimedFluxAtLoan: () => void
}
const searchProviderStore = create<State>((set, get) => ({
  apy: null,
  searchProviderContract: null,
  userMarketsData: null,
  unclaimedFluxAtLoan: [],
  unclaimedFluxAtLoanTotal: null,
  unclaimedFlux: null,
  init: () => {
    try {
      const { fluxJson, connectNet } = globalStore.getState()

      const searchProviderContract = getReadContract(
        fluxJson?.[connectNet as string]?.contracts['SearchProvider'],
        SearchProvider
      )
      set(() => ({
        searchProviderContract,
      }))
    } catch (error) {
      console.log(error)
    }
  },
  // 获取用户市场数据
  getUserMarketsData: async () => {
    try {
      const { userAddress, isLogin } = globalStore.getState()
      const { searchProviderContract } = get()
      if (isLogin) {
        const { apy, markets, supply, borrow } = await searchProviderContract.getProfitability(
          userAddress
        )

        const userMarketsData = {} as any
        markets.forEach((v: string, i: string | number) => {
          userMarketsData[safeAddress(v)] = {
            address: safeAddress(v),
            supply: new BigNumber(supply[i]?.toString()).toNumber(),
            // supplyPrice: new BigNumber(supply[i]?.toString())
            //   .times(supply[i]?.tokenPrice)
            //   .toNumber(),
            borrow: new BigNumber(borrow[i]?.toString()).toNumber(),
            // borrowPrice: new BigNumber(borrow[i]?.toString())
            //   .times(borrow[i]?.tokenPrice)
            //   .toNumber(),
          }
        })

        set(() => ({
          apy: new BigNumber(apy?.toString()).toNumber(),
          userMarketsData,
        }))
      }
    } catch (e) {
      console.log(e)
    }
  },
  getUnclaimedFluxAtLoan: async () => {
    try {
      const { isLogin, userAddress } = globalStore.getState()
      const { searchProviderContract } = get()
      if (isLogin) {
        const { total, markets, bySupply, byBorrow } =
          await searchProviderContract.unclaimedFluxAtLoan(userAddress)

        const unclaimedFluxAtLoan = markets.map((v: string, i: string | number) => {
          return {
            address: safeAddress(v),
            bySupply: new BigNumber(bySupply[i]?.toString()).toNumber(),
            byBorrow: new BigNumber(byBorrow[i]?.toString()).toNumber(),
          }
        })
        set(() => ({
          unclaimedFluxAtLoanTotal: new BigNumber(total?.toString()),
          unclaimedFluxAtLoan,
        }))
      }
    } catch (err) {
      console.log(err)
    }
  },
  getUnclaimedFlux: async () => {
    const { userAddress } = globalStore.getState()
    if (!userAddress) return
    const { searchProviderContract } = get()
    try {
      const res = await searchProviderContract.unclaimedFlux(userAddress)
      set(() => ({
        unclaimedFlux: res?.toString(),
      }))
    } catch (e) {
      console.log(e)
    }
  },
}))

export default searchProviderStore
