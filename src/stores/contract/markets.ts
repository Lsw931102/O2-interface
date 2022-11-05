import { getReadContract } from '@/contracts/funcs'
import { CoinMarket, ERC20Abi, ERC20Market } from '@/contracts/abis'
import { findIcon } from '@/utils/common'
import create from 'zustand'
import globalStore from '../global'

type State = {
  marketList: any[]
  /**市场授权信息 */
  marketAllowance: any
  /**用户市场余额 */
  allBalance: any
  /**市场抵押率 */
  marketsCollateralFactor: any
  /**用户市场可提现额度 */
  marketsWithdrawLimit: any
  init: () => void
}

const marketsStore = create<State>((set) => ({
  marketList: [],
  marketAllowance: null,
  allBalance: null,
  marketsWithdrawLimit: null,
  marketsCollateralFactor: null,
  init: () => {
    try {
      const { fluxJson, connectNet } = globalStore.getState()

      const marketList = Object.keys(fluxJson?.[connectNet as string]?.markets).map((key) => {
        const isCoinMarket =
          fluxJson?.[connectNet as string]?.markets[key].symbol === 'CFX' ||
          fluxJson?.[connectNet as string]?.markets[key].kind === 'coin'
        return {
          tokenIcon: findIcon(fluxJson?.[connectNet as string]?.markets[key].symbol),
          precision: Number('1e' + fluxJson?.[connectNet as string]?.markets[key].decimals),
          market: getReadContract(
            fluxJson?.[connectNet as string].markets[key]?.address,
            isCoinMarket ? CoinMarket : ERC20Market
          ),
          mktSymbol: key,
          underlyingToken: getReadContract(
            fluxJson?.[connectNet as string].markets[key]?.underlying,
            ERC20Abi
          ),
          isCoinMarket,
          ...fluxJson?.[connectNet as string].markets[key],
        }
      })
      set(() => ({
        marketList,
      }))
    } catch (error) {
      console.log(error)
    }
  },
}))

export default marketsStore
