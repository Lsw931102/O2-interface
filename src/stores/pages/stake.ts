import create from 'zustand'
import BigNumber from 'bignumber.js'
import { utils, constants } from 'ethers'
import globalStore from '../global'
import fluxReportStore from '../contract/fluxReport'
import searchProviderStore from '../contract/searchProvider'
import { safeAddress } from '@/utils/common'
import { StakeType } from '@/components/StakePage'

type State = {
  stakeList: { [key: string]: any }[]
  // 所有池子总质押
  tvl: number | null
  /* 用户每个池子待领取的FLux数量 */
  unclaimedFluxAtStake: { [key: string]: any }[]
  init: () => void
  getStakePools: () => void
  getUnclaimedFluxAtStake: () => void
}

const stakeStore = create<State>((set, get) => ({
  stakeList: [],
  approveList: [],
  tvl: null,
  unclaimedFluxAtStake: [],
  init: () => {
    try {
      const { fluxJson, connectNet } = globalStore.getState()

      const list = fluxJson?.[connectNet as string]?.stakePools
      set(() => ({
        stakeList: Object.keys(list).map((it) => ({
          recipientAddress: it,
          type: list[it]?.swapdex
            ? StakeType.lp
            : list[it]?.token.toUpperCase() ===
              fluxJson?.[connectNet as string]?.contracts?.['ZO']?.toUpperCase()
            ? StakeType.zo
            : StakeType.flux,
          ...list[it],
        })),
      }))
    } catch (err) {
      console.log(err)
    }
  },
  // 查询每个池子基础数据
  getStakePools: async () => {
    try {
      const { stakeList } = get()
      if (!stakeList?.length) return
      const { userAddress } = globalStore.getState()
      const { fluxReportContract } = fluxReportStore.getState()
      const result = await fluxReportContract?.getAllStakeMeta(
        safeAddress(userAddress || constants.AddressZero)
      )
      if (result?.length) {
        let tvl = new BigNumber(0)
        const list = await Promise.all(
          stakeList.map(async (item) => {
            const resItem = result?.find(
              (it: any) =>
                safeAddress(it?.pool).toUpperCase() ===
                safeAddress(item.recipientAddress).toUpperCase()
            )
            tvl = new BigNumber(resItem?.poolMeta?.tvl / 1e18).plus(tvl)
            if (item?.swapdex) {
              // 二池数据处理
              const t0Decimals = item.swapdex.token0.decimals
              const t1Decimals = item.swapdex.token1.decimals
              item.token0Staked = utils.formatUnits(
                resItem?.poolMeta?.token0Staked.toString(),
                t0Decimals
              )
              item.token1Staked = utils.formatUnits(
                resItem?.poolMeta?.token1Staked.toString(),
                t1Decimals
              )
            } else {
              item.token0Staked = utils.formatUnits(
                resItem?.poolMeta?.token0Staked.toString(),
                item?.decimals
              )
            }
            return {
              ...item,
              myStaked: utils.formatUnits(resItem?.staked.toString(), resItem?.tokenDecimals), // 我的质押数量
              myWalletBalance: utils.formatUnits(
                resItem?.tokenBalance.toString(),
                resItem?.tokenDecimals
              ), // 我的钱包余额
              myAllownce: resItem?.tokenAllownce / 1e18, // 我的授权额度
              poolStaked: utils.formatUnits(
                resItem?.totalSupply.toString(),
                resItem?.tokenDecimals
              ), // 池子质押总理
              stakeTvl: resItem?.poolMeta?.tvl / 1e18,
              stakedAPY: resItem?.poolMeta?.apy / 1e18, // apy为0时表示池子已下线，允许赎回，不允许质押
            }
          })
        )
        set(() => ({
          tvl: tvl.toNumber(),
          stakeList: list,
        }))
        // 发布->list加载完成
        PubSub.publish('stakePoolReady')
      }
    } catch (err) {
      console.log(err)
    }
  },
  // 查询每个池子未领取的flux收益
  getUnclaimedFluxAtStake: async () => {
    try {
      const { userAddress } = globalStore.getState()
      const { searchProviderContract } = searchProviderStore.getState()
      if (userAddress) {
        const { stakePools, rewards } = await searchProviderContract.unclaimedFluxAtStake(
          userAddress
        )
        const unclaimedFluxAtStake = await stakePools.map((item: string, index: number) => {
          return {
            address: safeAddress(item),
            unclaimed: rewards[index] / 1e18,
          }
        })
        set(() => ({
          unclaimedFluxAtStake,
        }))
      }
    } catch (err) {
      console.log(err)
    }
  },
}))

export default stakeStore
