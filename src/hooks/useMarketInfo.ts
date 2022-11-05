// 用于封装markey返回的各种值
import { useMemo } from 'react'
import { utils } from 'ethers'
import fluxAppStore from '@/stores/contract/fluxApp'
import { useTranslation } from 'react-i18next'
import BigNumber from 'bignumber.js'
import { netconfigs } from '@/consts/network'
import globalStore from '@/stores/global'
import { NetEnum } from '@/consts'

type OType = 'deposit' | 'withdraw' | 'borrow' | 'repay'

const maxHealth = 99999.99
// 清算系数

BigNumber.config({ EXPONENTIAL_AT: 99 })

const useMarketInfo = (info: any = {}, inputValue: any = 0) => {
  const { t } = useTranslation(['dashboard'])
  const { supplyBalance, borrowBalance } = fluxAppStore()
  const { connectNet } = globalStore()
  if (!info) info = {}

  const {
    userUnderlyingAllowance,
    userDeposits,
    userBorrowings,
    underlyingPrice,
    maxinumLTVRatio,
    userUnderlyingBalance,
    mktSymbol,
    symbol,
    decimals,
    liquidity,
    userWithdrawLimit,
    userBorrowLimit,
    isCoinMarket,
  } = info

  // 是否授权达标
  const isApprovedMemo = useMemo(() => {
    if (!userUnderlyingAllowance) return true
    return (
      new BigNumber(utils.formatUnits(userUnderlyingAllowance?.toString(), decimals)).toNumber() >
      inputValue
    )
  }, [decimals, inputValue, userUnderlyingAllowance])

  // 获取健康指数基数
  const getHealthFactorBase = useMemo(() => {
    // 价格
    const underlyingPriceNumber =
      underlyingPrice &&
      new BigNumber(utils.formatUnits(underlyingPrice?.toString(), 18)).toNumber()
    // 存款
    const userDepositsNumber = supplyBalance

    // 借款
    const userBorrowingsNumber = borrowBalance
    // 变化的值
    const changeNumber = inputValue

    return {
      underlyingPriceNumber,
      userDepositsNumber,
      userBorrowingsNumber,
      changeNumber,
    }
  }, [borrowBalance, inputValue, supplyBalance, underlyingPrice])

  // 获取最大借款power
  const getBorrowPowerAdded = useMemo(() => {
    if (!inputValue || !underlyingPrice || !maxinumLTVRatio) return 0
    const number = inputValue
    const underlyingPriceNumber = new BigNumber(
      utils.formatUnits(underlyingPrice?.toString(), 18)
    ).toNumber()
    const maxinumLTVRatioNumber = new BigNumber(
      utils.formatUnits(maxinumLTVRatio?.toString(), 18)
    ).toNumber()
    return (number * underlyingPriceNumber) / maxinumLTVRatioNumber
  }, [inputValue, maxinumLTVRatio, underlyingPrice])

  // 错误信息处理(存)
  const errorInfoDesposit = useMemo(() => {
    if (
      userBorrowings &&
      new BigNumber(utils.formatUnits(userBorrowings?.toString(), decimals)).toNumber() > 0
    ) {
      return t('Repay outstanding', { symbol: symbol })
    }
    if (
      userUnderlyingBalance &&
      inputValue >
        new BigNumber(utils.formatUnits(userUnderlyingBalance?.toString(), decimals)).toNumber()
    ) {
      return t('Insufficient wallet balance')
    }
    if (isCoinMarket) {
      if (!inputValue) return ''
      const maxInput = new BigNumber(
        utils.formatUnits(userUnderlyingBalance?.toString(), decimals)
      ).gt(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)
        ? new BigNumber(utils.formatUnits(userUnderlyingBalance?.toString(), decimals))
            .minus(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)
            .toString()
        : 0
      const isGreater = new BigNumber(inputValue).gt(maxInput)

      if (isGreater) {
        return t('subsequent transaction fees', {
          symbol: netconfigs[connectNet as NetEnum]?.nativeCoin,
          count: netconfigs[connectNet as NetEnum]?.prePlatTotal,
        })
      } else {
        return ''
      }
    }
    if (!isApprovedMemo) {
      return t('Approve first', { mktSymbol: mktSymbol, symbol: symbol })
    }
  }, [
    connectNet,
    decimals,
    inputValue,
    isApprovedMemo,
    isCoinMarket,
    mktSymbol,
    symbol,
    t,
    userBorrowings,
    userUnderlyingBalance,
  ])
  // 错误信息处理（取）
  const errInfoWithDraw = useMemo(() => {
    if (
      userDeposits &&
      inputValue > new BigNumber(utils.formatUnits(userDeposits?.toString(), decimals)).toNumber()
    ) {
      return t('Insufficient deposit balance')
    }
    if (
      liquidity &&
      inputValue > new BigNumber(utils.formatUnits(liquidity?.toString(), decimals)).toNumber()
    ) {
      return t('Insufficient pool liquidity')
    }
    if (
      userWithdrawLimit &&
      inputValue >
        new BigNumber(utils.formatUnits(userWithdrawLimit?.toString(), decimals)).toNumber()
    ) {
      return t('Up to withdraw', {
        userWithdrawLimit: new BigNumber(
          utils.formatUnits(userWithdrawLimit?.toString(), decimals)
        ).toNumber(),
        symbol: symbol,
      })
    }
  }, [decimals, inputValue, liquidity, symbol, t, userDeposits, userWithdrawLimit])

  //  错误处理（借）
  const errorInfoBorrow = useMemo(() => {
    if (
      liquidity &&
      inputValue > new BigNumber(utils.formatUnits(liquidity?.toString(), decimals)).toNumber()
    ) {
      return t('Insufficient pool liquidity')
    }

    if (
      userBorrowLimit &&
      inputValue >
        new BigNumber(utils.formatUnits(userBorrowLimit?.toString(), decimals)).toNumber()
    ) {
      return t('Exceed the Borrow Power', { symbol: symbol })
    }

    if (
      userDeposits &&
      new BigNumber(utils.formatUnits(userDeposits?.toString(), decimals)).toNumber() > 0
    ) {
      return t('borrwing disabled due to existing', { symbol: symbol })
    }
  }, [decimals, inputValue, liquidity, symbol, t, userBorrowLimit, userDeposits])
  // 错误处理 还
  const errorInfoRepay = useMemo(() => {
    if (
      userUnderlyingBalance &&
      inputValue >
        new BigNumber(utils.formatUnits(userUnderlyingBalance?.toString(), decimals)).toNumber()
    ) {
      return t('Insufficient wallet balance')
    }
    if (
      userBorrowings &&
      inputValue > new BigNumber(utils.formatUnits(userBorrowings?.toString(), decimals)).toNumber()
    ) {
      return t(`Insufficient borrow balance`)
    }
    if (isCoinMarket) {
      if (!inputValue) return ''
      const maxInput = new BigNumber(
        utils.formatUnits(userUnderlyingBalance?.toString(), decimals)
      ).gt(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)
        ? new BigNumber(utils.formatUnits(userUnderlyingBalance?.toString(), decimals))
            .minus(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)
            .toString()
        : 0
      const isGreater = new BigNumber(inputValue).gt(maxInput)

      if (isGreater) {
        return t('subsequent transaction fees', {
          symbol: netconfigs[connectNet as NetEnum]?.nativeCoin,
          count: netconfigs[connectNet as NetEnum]?.prePlatTotal,
        })
      } else {
        return ''
      }
    }
    if (!isApprovedMemo) {
      return t('Approve first', { mktSymbol: mktSymbol, symbol: symbol })
    }
  }, [
    connectNet,
    decimals,
    inputValue,
    isApprovedMemo,
    isCoinMarket,
    mktSymbol,
    symbol,
    t,
    userBorrowings,
    userUnderlyingBalance,
  ])

  const getHealthFactor = (type: OType) => {
    let rowValue
    let finalValue: any = null
    let { userDepositsNumber, userBorrowingsNumber, changeNumber, underlyingPriceNumber } =
      getHealthFactorBase

    underlyingPriceNumber = underlyingPriceNumber || 0
    userDepositsNumber = userDepositsNumber || 0
    userBorrowingsNumber = userBorrowingsNumber || 0
    changeNumber = changeNumber || 0
    // 有存款无借款

    if (userDepositsNumber && !userBorrowingsNumber) {
      rowValue = maxHealth
      // 无存款无借款
    } else if (!userDepositsNumber && !userDepositsNumber) {
      rowValue = 0
    } else {
      // 无存款有借款
      rowValue = userDepositsNumber / userBorrowingsNumber
    }

    switch (type) {
      case 'deposit':
        finalValue =
          (userDepositsNumber + changeNumber * underlyingPriceNumber) / userBorrowingsNumber
        break
      case 'withdraw':
        finalValue =
          (userDepositsNumber - changeNumber * underlyingPriceNumber) / userBorrowingsNumber
        break
      case 'borrow':
        if (!userBorrowingsNumber && !changeNumber) {
          finalValue = maxHealth
        } else {
          finalValue =
            userDepositsNumber / (userBorrowingsNumber + changeNumber * underlyingPriceNumber)
        }

        break
      case 'repay':
        if (userBorrowingsNumber <= changeNumber * underlyingPriceNumber) {
          finalValue = maxHealth
        } else {
          finalValue =
            userDepositsNumber / (userBorrowingsNumber - changeNumber * underlyingPriceNumber)
        }

        break
      default:
        break
    }
    return {
      rowValue,
      finalValue,
    }
  }

  return {
    isApprovedMemo,
    getHealthFactorBase,
    // getHealthFactorWithDraw,
    getBorrowPowerAdded,
    errorInfoDesposit,
    errInfoWithDraw,
    errorInfoBorrow,
    errorInfoRepay,
    getHealthFactor,
  }
}
export default useMarketInfo
