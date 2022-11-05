import create from 'zustand'
import Bignumber from 'bignumber.js'
import globalStore from '../global'
import marketsStore from './markets'
import { getReadContract } from '@/contracts/funcs'
import { FluxReportAbi } from '@/contracts/abis'

import { safeAddress } from '@/utils/tools'
import { ethers } from 'ethers'

type State = {
  /** fluxReport 合约 */
  fluxReportContract: any
  // flux价格
  fluxPrice: number | null
  // 所有借贷池列表
  allMarkets: any[]
  // 市场总借款
  totalBorrow: number | null
  // 市场总存款
  totalSupply: number | null
  // Bank页面Total Market Size
  totalMarketSize: number | string | null
  // Bank页面Total Borrowings
  totalBorrowings: number | string | null
  // Bank页面列表数据
  bankList: any[]
  // Bank详情页数据
  bankDetail: any
  /** 初始化 */
  init: () => void
  /** 获取flux价格 */
  getFluxPrice: () => void
  /** 查询借贷池列表 */
  getAllMarkets: () => void
  /** 查询bank页列表数据 */
  getLoanPoolReport: () => void
  /** 查询bank详情页数据 */
  getLoanPoolMeta: (mkt: string, use?: string) => void
}
const fluxReportStore = create<State>((set, get) => ({
  fluxReportContract: null,
  fluxPrice: null,
  allMarkets: [],
  totalBorrow: null,
  totalSupply: null,
  totalMarketSize: '--',
  totalBorrowings: '--',
  bankList: [],
  bankDetail: null,
  init: () => {
    try {
      const { fluxJson, connectNet } = globalStore.getState()
      const fluxReportContract = getReadContract(
        fluxJson?.[connectNet as string].contracts['FluxReport'],
        FluxReportAbi
      )
      set(() => ({
        fluxReportContract,
      }))
    } catch (err) {
      console.log(err)
    }
  },
  getFluxPrice: async () => {
    try {
      const { fluxReportContract } = get()
      const fluxPrice = (await fluxReportContract.getFluxPrice()) / 1e18
      set(() => ({
        fluxPrice,
      }))
    } catch (err) {
      console.log(err)
    }
  },
  getAllMarkets: async () => {
    try {
      const { marketList } = marketsStore.getState()
      const { allMarkets } = get()

      set(() => ({
        allMarkets: allMarkets?.length > 0 ? allMarkets : marketList,
      }))
      const { fluxReportContract } = get()

      const res: any[] = await fluxReportContract?.getLoanPoolReport()

      const list = await Promise.all(
        marketList.map(async (item) => {
          const resItem = res.find((it) => safeAddress(it?.pool) === safeAddress(item?.address))
          const unit = 10 ** item?.decimals
          return {
            ...item,
            tokenPrice: resItem?.priceUSD / 1e18, // 资产价格
            tvl: resItem?.tvl / 1e18,

            totalSupply: resItem?.totalSupply / unit, // 总存款数量
            totalBorrow: resItem?.totalBorrow / unit, // 总借款数量
            supplyApy: new Bignumber(resItem?.supplyInterestPreDay?.toString() / 1e18)
              .plus(1)
              .pow(365)
              .minus(1)
              .toString(),
            borrowFluxAPY: new Bignumber(
              ethers.utils.formatUnits(resItem?.borrowFluxAPY.toString(), 18)
            ).toString(),
            supplyFluxApy: resItem?.supplyFluxAPY?.toString() / 1e18,
            supplyFluxAPY: new Bignumber(
              ethers.utils.formatUnits(resItem?.supplyFluxAPY.toString(), 18)
            ).toString(),
            depositAPR: new Bignumber(
              ethers.utils.formatUnits(resItem?.supplyInterestPreDay?.toString(), 18)
            )
              .times(365)
              .plus(new Bignumber(ethers.utils.formatUnits(resItem?.supplyFluxAPY?.toString(), 18)))
              .toNumber(),
            borrowAPR: new Bignumber(
              ethers.utils.formatUnits(resItem?.borrowInterestPreDay?.toString(), 18)
            )
              .times(365)
              .minus(
                new Bignumber(ethers.utils.formatUnits(resItem?.borrowFluxAPY?.toString(), 18))
              )
              .toNumber(),
            supplyInterestPreDay: new Bignumber(
              ethers.utils.formatUnits(resItem?.supplyInterestPreDay.toString(), 18)
            ).toString(),
            borrowInterestPreDay: new Bignumber(
              ethers.utils.formatUnits(resItem?.borrowInterestPreDay.toString(), 18)
            ).toString(),
            borrowApy: new Bignumber(resItem?.borrowInterestPreDay.toString() / 1e18)
              .plus(1)
              .pow(365)
              .minus(1)
              .toString(),
            borrowFluxApy: resItem?.borrowFluxAPY?.toString() / 1e18,
            utilizationRate:
              resItem?.totalSupply && resItem?.totalBorrow
                ? resItem?.totalBorrow / resItem?.totalSupply
                : 0, // token资金利用率
          }
        })
      )

      const totalSupply = list.reduce((sum, current) => {
        return new Bignumber(current.totalSupply).times(current.tokenPrice).plus(sum).toNumber()
      }, 0)
      const totalBorrow = list.reduce((sum, current) => {
        return new Bignumber(current.totalBorrow).times(current.tokenPrice).plus(sum).toNumber()
      }, 0)
      set(() => ({
        totalBorrow,
        totalSupply,
        allMarkets: list,
      }))
    } catch (err) {
      console.log(err)
    }
  },
  // 查询Bank列表数据
  getLoanPoolReport: async () => {
    try {
      const { marketList } = marketsStore.getState()
      if (!marketList || !marketList.length) return
      const { fluxReportContract } = get()
      const result = await fluxReportContract?.getLoanPoolReport()

      const list = marketList.map((item) => {
        const resItem = result?.find(
          (ite: any) =>
            String(item?.underlying).toUpperCase() ===
            String(safeAddress(ite?.underlying)).toUpperCase()
        )
        return {
          ...item,
          ...resItem,
          category: item?.category,
          assets: item?.symbol,
          tokenPrice: new Bignumber(
            ethers.utils.formatUnits(resItem?.priceUSD.toString(), 18)
          ).toString(), // 资产价格
          marketSize: new Bignumber(
            ethers.utils.formatUnits(resItem?.totalSupply.toString(), item?.decimals)
          ).toNumber(),
          marketPrice: new Bignumber(
            ethers.utils.formatUnits(resItem?.totalSupply.toString(), item?.decimals)
          )
            .times(new Bignumber(ethers.utils.formatUnits(resItem?.priceUSD.toString(), 18)))
            .toNumber(),
          borrowingSize: new Bignumber(
            ethers.utils.formatUnits(resItem?.totalBorrow.toString(), item?.decimals)
          ).toNumber(),
          borrowingPrice: new Bignumber(
            ethers.utils.formatUnits(resItem?.totalBorrow.toString(), item?.decimals)
          )
            .times(new Bignumber(ethers.utils.formatUnits(resItem?.priceUSD.toString(), 18)))
            .toNumber(),
          liquidity: new Bignumber(
            ethers.utils.formatUnits(resItem?.totalSupply.toString(), item?.decimals)
          )
            .minus(
              new Bignumber(
                ethers.utils.formatUnits(resItem?.totalBorrow.toString(), item?.decimals)
              )
            )
            .toNumber(),
          liquidityPrice: new Bignumber(
            ethers.utils.formatUnits(resItem?.totalSupply.toString(), item?.decimals)
          )
            .minus(
              new Bignumber(
                ethers.utils.formatUnits(resItem?.totalBorrow.toString(), item?.decimals)
              )
            )
            .times(new Bignumber(ethers.utils.formatUnits(resItem?.priceUSD.toString(), 18)))
            .toNumber(),
          supplyInterestPreDay: new Bignumber(
            ethers.utils.formatUnits(resItem?.supplyInterestPreDay.toString(), 18)
          ).toString(),
          borrowInterestPreDay: new Bignumber(
            ethers.utils.formatUnits(resItem?.borrowInterestPreDay.toString(), 18)
          ).toString(),

          supplyFluxAPY: new Bignumber(
            ethers.utils.formatUnits(resItem?.supplyFluxAPY.toString(), 18)
          ).toString(),
          borrowFluxAPY: new Bignumber(
            ethers.utils.formatUnits(resItem?.borrowFluxAPY.toString(), 18)
          ).toString(),
          depositAPR: new Bignumber(
            ethers.utils.formatUnits(resItem?.supplyInterestPreDay.toString(), 18)
          )
            .times(365)
            .plus(new Bignumber(ethers.utils.formatUnits(resItem?.supplyFluxAPY.toString(), 18)))
            .toNumber(),
          borrowAPR: new Bignumber(
            ethers.utils.formatUnits(resItem?.borrowInterestPreDay.toString(), 18)
          )
            .times(365)
            .minus(new Bignumber(ethers.utils.formatUnits(resItem?.borrowFluxAPY.toString(), 18)))
            .toNumber(),
          utilization:
            resItem?.totalSupply && resItem?.totalBorrow
              ? new Bignumber(ethers.utils.formatUnits(resItem?.totalBorrow.toString(), 0))
                  .div(new Bignumber(ethers.utils.formatUnits(resItem?.totalSupply.toString(), 0)))
                  .toString()
              : 0,
        }
      })
      const totalSupply = list.reduce((sum, current) => {
        return new Bignumber(current.marketSize).times(current.tokenPrice).plus(sum).toString()
      }, 0)
      const totalBorrow = list.reduce((sum, current) => {
        return new Bignumber(current.borrowingSize).times(current.tokenPrice).plus(sum).toString()
      }, 0)

      set(() => ({
        bankList: list,
        totalMarketSize: totalSupply,
        totalBorrowings: totalBorrow,
      }))
    } catch (err) {
      console.log(err)
    }
  },
  // 查询bank详情页数据
  getLoanPoolMeta: async (mkt: string) => {
    try {
      const { marketList } = marketsStore.getState()
      const { fluxReportContract, fluxPrice } = get()
      const result = await fluxReportContract?.getLoanPoolMeta(mkt, ethers.constants.AddressZero)
      const tokenItem = marketList.find((item) => item?.underlying === result?.underlying)
      const bankDetail = {
        ...tokenItem,
        marketSize: new Bignumber(
          ethers.utils.formatUnits(result?.totalBorrows.toString(), tokenItem?.decimals)
        )
          .plus(
            new Bignumber(
              ethers.utils.formatUnits(result?.liquidity.toString(), tokenItem?.decimals)
            )
          )
          .times(
            new Bignumber(
              ethers.utils.formatUnits(result?.underlyingPrice.toString(), tokenItem?.decimals)
            )
          )
          .toNumber(),
        liquidity: new Bignumber(
          ethers.utils.formatUnits(result?.liquidity.toString(), tokenItem?.decimals)
        )
          .times(
            new Bignumber(
              ethers.utils.formatUnits(result?.underlyingPrice.toString(), tokenItem?.decimals)
            )
          )
          .toString(),
        totalBorrowingsPrice: new Bignumber(
          ethers.utils.formatUnits(result?.totalBorrows.toString(), tokenItem?.decimals)
        )
          .times(
            new Bignumber(
              ethers.utils.formatUnits(result?.underlyingPrice.toString(), tokenItem?.decimals)
            )
          )
          .toString(),
        walletBalance: new Bignumber(
          ethers.utils.formatUnits(result?.userUnderlyingBalance.toString(), tokenItem?.decimals)
        ).toString(),
        userDeposits: new Bignumber(
          ethers.utils.formatUnits(result?.userDeposits.toString(), tokenItem?.decimals)
        ).toString(),
        userBorrowings: new Bignumber(
          ethers.utils.formatUnits(result?.userBorrowings.toString())
        ).toString(),
        availableLiquidity: new Bignumber(
          ethers.utils.formatUnits(result?.liquidity.toString(), tokenItem?.decimals)
        ).toString(),
        totalBorrowingsNum: new Bignumber(
          ethers.utils.formatUnits(result?.totalBorrows.toString(), tokenItem?.decimals)
        ).toString(),
        price: new Bignumber(
          ethers.utils.formatUnits(result?.underlyingPrice.toString(), 18)
        ).toString(),
        priceOracle: tokenItem?.oracle,
        borrowCap: new Bignumber(
          ethers.utils.formatUnits(result?.borrowCap.toString(), tokenItem?.decimals)
        ).toString(),
        reserveFactor: new Bignumber(
          ethers.utils.formatUnits(result?.reserveFactor.toString(), 18)
        ).toString(),
        maximumLTV: new Bignumber(
          ethers.utils.formatUnits(result?.maxinumLTVRatio.toString(), 18)
        ).toString(),
        minted: new Bignumber(
          ethers.utils.formatUnits(result?.ftokenSupply.toString(), tokenItem?.decimals)
        ).toString(),
        exchangeRate: new Bignumber(
          ethers.utils.formatUnits(result?.exchangeRate.toString(), 18)
        ).toString(),
        borrowAPY: new Bignumber(
          ethers.utils.formatUnits(result?.borrowAPY.toString(), 18)
        ).toString(),
        depositAPY: new Bignumber(
          ethers.utils.formatUnits(result?.depositAPY.toString(), 18)
        ).toString(),
        utilization: new Bignumber(ethers.utils.formatUnits(result?.totalBorrows.toString(), 0))
          .div(
            new Bignumber(ethers.utils.formatUnits(result?.totalBorrows.toString(), 0)).plus(
              new Bignumber(ethers.utils.formatUnits(result?.liquidity.toString(), 0))
            )
          )
          .times(100)
          .toFixed(2),
        borrowRewardFlux: new Bignumber(
          ethers.utils.formatUnits(
            result?.borrowDistributionFluxAPY.toString(),
            tokenItem?.decimals
          )
        )
          .div(365)
          .div(fluxPrice as number)
          .times(10000)
          .toString(),
        borrowDistributionFluxAPY: new Bignumber(
          ethers.utils.formatUnits(
            result?.borrowDistributionFluxAPY.toString(),
            tokenItem?.decimals
          )
        ),
        depositRewardFlux: new Bignumber(
          ethers.utils.formatUnits(
            result?.depositDistributionFluxAPY.toString(),
            tokenItem?.decimals
          )
        )
          .div(365)
          .div(fluxPrice as number)
          .times(10000)
          .toString(),
        depositDistributionFluxAPY: new Bignumber(
          ethers.utils.formatUnits(
            result?.depositDistributionFluxAPY.toString(),
            tokenItem?.decimals
          )
        ),
      }
      set(() => ({ bankDetail }))
    } catch (err) {
      console.log(err)
    }
  },
}))

export default fluxReportStore
