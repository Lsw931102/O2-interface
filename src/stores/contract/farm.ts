import create from 'zustand'
import { getReadContract } from '@/contracts/funcs'
import { LensV2, Orderbook } from '@/contracts/abis'
import globalStore from '../global'

type State = {
  /** farm orderBook 合约 */
  farmContractOrder: any
  /** farm LensV2 合约 */
  farmContractLensV2: any
  /** pool池子信息 */
  poolList: any[]
  /** pool池子单条信息 */
  poolInfo: any
  /** 模拟开仓数据 */
  simulatedOpening: any
  /** 持仓列表数据 */
  orderInfoList: any
  /** 持仓列表数据 */
  lpInfo: any
  /** workerList */
  workerList: any
  /** workerInfos */
  workerInfos: any
  /** 记录的债务数量 */
  tokenNumInfo: any
  /** 移动端加仓、减仓、平仓弹窗的数据 */
  mobileData: any
  /** 初始化 */
  init: () => void
  /** 获取持仓列表 */
  getOrderInfos: (orderList: any[], arr: any[]) => void
}
const farmStore = create<State>((set, get) => ({
  farmContractOrder: null,
  farmContractLensV2: null,
  poolList: [],
  poolInfo: null,
  orderInfoList: null,
  lpInfo: null,
  workerList: {},
  tokenNumInfo: null,
  workerInfos: null,
  simulatedOpening: null,
  mobileData: null,
  init: () => {
    try {
      const { fluxJson, connectNet } = globalStore.getState()
      const farmContractOrder = getReadContract(
        fluxJson?.[connectNet as string]?.farm?.LensTVL,
        Orderbook
      )
      const farmContractLensV2 = getReadContract(
        fluxJson?.[connectNet as string]?.farm?.LensTVL,
        LensV2
      )
      set(() => ({
        farmContractOrder,
        farmContractLensV2,
      }))
    } catch (err) {
      console.log(err)
    }
  },
  getOrderInfos: async (orderList: any[], arr: any[]) => {
    const { farmContractLensV2, poolList } = get()
    const { userAddress } = globalStore.getState()
    try {
      const res = await farmContractLensV2.getOrderByWorkers(arr, userAddress)
      const poolFarmList = poolList
        .map((item: any) => {
          return item?.farms
        })
        .flat()
      const list = res.orderInfos
        ?.map((item: any, index: number) => {
          const lpInfo = {
            lpTotalSupply: res?.workerInfos[index].lpTotalSupply,
            r0: res?.workerInfos[index].r0,
            r1: res?.workerInfos[index].r1,
          }
          if (!item?.orderId.eq(0)) {
            const orders = orderList.filter((ite: any) => ite?.orderId === Number(item?.orderId))
            return {
              ...item,
              lpInfo,
              killFactor: res?.workerInfos[index].killFactor,
              farmInfo: poolFarmList.filter((ite: any) => ite?.address === item?.worker)[0],
              currency: poolList[index]?.currency,
              defi: orders[0]?.defi,
              apr: orders[orders.length - 1]?.apr,
              feeAPR: orders[orders.length - 1]?.feeAPR,
              stake0: orders[0]?.stake0,
              stake1: orders[0]?.stake1,
            }
          }
        })
        .filter((item: any) => item !== undefined)
      // console.log(list, '合约获取')
      set(() => ({
        orderInfoList: list,
        workerInfos: res,
      }))
    } catch (err) {
      console.log(err)
    }
  },
}))

export default farmStore
