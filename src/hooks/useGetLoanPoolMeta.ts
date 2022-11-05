import { useCallback, useEffect, useState } from 'react'
import isequal from 'lodash.isequal'
import { cloneDeep } from 'lodash'
import fluxReportStore from '@/stores/contract/fluxReport'
import globalStore from '@/stores/global'

/**
 *
 * @param record 单个币种详情
 * @param isFetch 是否自动请求
 * @param isRefresh 是否强制刷新
 * @returns
 */
function useGetLoanPoolMeta(record: any, isFetch = true, isRefresh = false) {
  const { fluxReportContract } = fluxReportStore()

  const { userAddress } = globalStore()
  const [info, setInfo] = useState<any>(null)

  const getLoanPoolMeta = useCallback(
    async (isRefresh = true) => {
      try {
        if (!isRefresh) {
          return
        }
        if (!record) {
          setInfo(null)
          return
        }

        const res = await fluxReportContract?.getLoanPoolMeta(record?.address, userAddress)

        const resCloneDeep = {
          ...res,
          userBorrowings: res?.userBorrowings,
          userDeposits: res?.userDeposits,
          userUnderlyingAllowance: res?.userUnderlyingAllowance,
          userUnderlyingBalance: res?.userUnderlyingBalance,
          userBorrowLimit: res?.userBorrowLimit,
          userWithdrawLimit: res?.userWithdrawLimit,
          underlying: res?.underlying,
          underlyingPrice: res?.underlyingPrice,
          borrowCap: res?.borrowCap,
          reserveFactor: res?.reserveFactor,
          maxinumLTVRatio: res?.maxinumLTVRatio,
          liquidationFactor: res?.liquidationFactor,
          ftokenSupply: res?.ftokenSupply,
          totalBorrows: res?.totalBorrows,
          liquidity: res?.liquidity,
          exchangeRate: res?.exchangeRate,
          borrowAPY: res?.borrowAPY,
          depositAPY: res?.depositAPY,
          depositDistributionFluxAPY: res?.depositDistributionFluxAPY,
          borrowDistributionFluxAPY: res?.borrowDistributionFluxAPY,
          decimals: res?.decimals,
        }

        const newRes = cloneDeep({ ...record, ...resCloneDeep, decimals: record?.decimals })

        setInfo(newRes)
        return newRes
      } catch (error) {
        console.log(error)
      }
    },
    [fluxReportContract, record, userAddress]
  )

  useEffect(() => {
    if (!userAddress && !record) return
    if (!isFetch) return
    if (!isRefresh) {
      if (isequal(info, record)) return
    }

    getLoanPoolMeta()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, userAddress])

  return {
    info,
    setInfo,
    getLoanPoolMeta,
  }
}
export default useGetLoanPoolMeta
