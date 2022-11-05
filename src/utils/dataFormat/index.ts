import BigNumber from 'bignumber.js'
import { numberFormat, safeAddress } from '../tools'

/**
 * 存款收益率
 * @param apy 收益率
 */
export function getTotalApy(apy: any, precision = 1e18) {
  let res: any = '0'
  if (apy) {
    res = new BigNumber(apy).div(precision).toString()
  }
  return res
}

export function getAccountInformationSupplyList(
  userMarketsData: any,
  markets: any,
  unclaimedFluxAtLoan?: any
) {
  if (!userMarketsData) return []

  let res = userMarketsData?.filter((v: { supply: BigNumber.Value }) => {
    return v?.supply ? new BigNumber(v?.supply).gt(0) : false
  })

  res = res?.map((v: any) => {
    const marketObj = markets.find((item: { address: string }) => {
      return safeAddress(item?.address) === safeAddress(v?.address)
    })

    // marketObj.supplyPrice=
    const unclaimedFluxAtLoanObj = unclaimedFluxAtLoan?.find((item: { address: string }) => {
      return safeAddress(item?.address) === safeAddress(v?.address)
    })
    // console.log('v', v)
    // console.log('unclaimedFluxAtLoan', unclaimedFluxAtLoan)
    // console.log('unclaimedFluxAtLoanObj', unclaimedFluxAtLoanObj)
    v.supplyPrice = new BigNumber(v.supply).times(marketObj?.tokenPrice).toNumber()

    return unclaimedFluxAtLoanObj
      ? { ...marketObj, ...unclaimedFluxAtLoanObj, ...v }
      : { ...marketObj, ...v }
  })

  return res
}

/**
 * 借款额度比：当前借款值/借款额度
 * @param balance 余额
 */
export function getBorrowRatio(borrowBalance: any, borrowingLimit: any) {
  let res: any = '0'
  if (borrowingLimit > 0 && borrowBalance > 0) {
    res = new BigNumber(borrowBalance).div(borrowingLimit).toString()
    res = numberFormat(res)
  }
  return res
}

/**
 * 首页用户信息借款列表
 * @param userMarketsData apy列表
 * @param fluxMarkets 市场列表
 * @param unclaimedFluxAtLoan 获得的flux
 */
export function getAccountInformationBorrowList(
  userMarketsData: any[],
  markets: any[],
  unclaimedFluxAtLoan: any[]
) {
  if (!userMarketsData) return []
  let res = userMarketsData?.filter((v: { borrow: BigNumber.Value }) => {
    return v?.borrow ? new BigNumber(v?.borrow).gt(0) : false
  })
  res = res?.map((v: any) => {
    const marketObj = markets.find((item: { address: string }) => {
      return safeAddress(item?.address) === safeAddress(v?.address)
    })
    const unclaimedFluxAtLoanObj = unclaimedFluxAtLoan.find((item: { address: string }) => {
      return safeAddress(item?.address) === safeAddress(v?.address)
    })
    v.borrowPrice = new BigNumber(v.borrow).times(marketObj?.tokenPrice).toNumber()
    return { ...marketObj, ...unclaimedFluxAtLoanObj, ...v }
  })
  return res
}

/**
 * 数字转换，除精度
 * @param value 值
 * @param precision 精度
 */
export function formatByPrecision(value: number, precision = 1e18) {
  let res: any = '0'
  if (value && !isNaN(value) && !isNaN(precision)) {
    res = new BigNumber(value / 1).div(precision)
    res = res.toString()
  }
  return res
}
/**
 * 用address取对象的值
 * @param obj {address:value}
 * @param address 地址
 * @returns 对应地址取对象值
 */
export function getValueByAddress(obj: { [x: string]: any }, address: string | number) {
  if (!obj) {
    return null
  }
  return obj[address]
}

// 将oec转换为okexchain
export const transHotpotOkex = (value: string) => {
  return value === 'oec' ? 'okexchain' : value
}
