import axios from 'axios'
import create from 'zustand'
import globalStore from '@/stores/global'
import { CHAINS, netconfigs } from '@/consts/network'
import { transHotpotOkex } from '@/utils/dataFormat'
import { NetEnum } from '@/consts'

type CrossType = 'firstStep' | 'secondStep'

export type CrossTabType = 'refinance' | 'borrow'
interface ICrossStore {
  selectToken: any
  selectChain: any
  tokenList: any
  chainList: any
  currentTab: CrossTabType
  step: CrossType
  amount: number | string
  // 手续费类型
  feeType: number
  // 手续费
  exchangeFee: string
  // flux手续费
  exchangeFeeFlux: string
  // hotpot配置文件
  hotpotConfigJson: any
  setSelectToken: (newSelectToken: any) => void
  setSelectChain: (newSelectCross: any) => void
  setStep: (newStep: CrossType) => void
  setAmount: (newAmount: number) => void
  setCurrentTab: (newCurrentTab: CrossTabType) => void
  setChainList: (newValue: any) => void
  reset: () => void
  initHotpotConfigJson: () => void
}

const crossStore = create<ICrossStore>((set, get) => ({
  currentTab: 'refinance',
  step: 'firstStep',
  selectToken: null,
  selectChain: null,
  amount: '',
  tokenList: null,
  chainList: null,
  hotpotConfigJson: null,
  feeType: 1,
  exchangeFee: '',
  exchangeFeeFlux: '',
  setStep: (newStep) => set(() => ({ step: newStep })),
  setSelectToken: (newSelectToken) => {
    set(() => ({ selectToken: newSelectToken }))
  },
  setSelectChain: (newSelectCross) => set(() => ({ selectChain: newSelectCross })),
  setAmount: (newAmount) => set(() => ({ amount: newAmount })),
  setCurrentTab: (newCurrentTab) => set(() => ({ currentTab: newCurrentTab })),
  setChainList: (selectToken) => {
    const { connectNet } = globalStore.getState()
    const { hotpotConfigJson } = get()
    let newChainList: any = []
    if (!connectNet || !hotpotConfigJson) newChainList = []
    else if (!selectToken) newChainList = []
    else {
      const info = (
        hotpotConfigJson?.gateways?.[transHotpotOkex(connectNet as NetEnum)] || []
      ).find((item: any) => {
        return item?.tokenAddress.toLowerCase() === selectToken?.underlying.toLowerCase()
      })
      const gateways = (info?.gateways || []).map((item: any) => {
        const find: any = CHAINS.find((chainItem) => {
          return transHotpotOkex(chainItem.key) === item.chain
        })
        if (find) {
          if (
            !Object.prototype.hasOwnProperty.call(item, 'supportFluxV3') ||
            (Object.prototype.hasOwnProperty.call(item, 'supportFluxV3') &&
              item.supportFluxV3 === true)
          ) {
            find.disabled = false
          } else {
            find.disabled = true
          }
          return find
        }
      })

      newChainList = gateways
    }
    set(() => ({ chainList: newChainList }))
  },
  reset: () => set(() => ({ step: 'firstStep', selectToken: null, selectChain: null, amount: 0 })),
  initHotpotConfigJson: async () => {
    const { connectNet } = globalStore.getState()
    if (!netconfigs[connectNet as NetEnum]?.hotpotConfig) return
    const configJson = await axios.get(netconfigs[connectNet as NetEnum]?.hotpotConfig as any)
    const newHotpotConfigJson = configJson.data

    set(() => ({
      hotpotConfigJson: newHotpotConfigJson,
    }))
  },
}))
export default crossStore
