import getConfig from 'next/config'
import globalStore from '@/stores/global'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

const { publicRuntimeConfig } = getConfig()
/**
 * 网络是否正确
 * @returns
 */
export const isNetRight = () => {
  const { connectNet, chooseNet } = globalStore.getState()
  let flag = false
  if (chooseNet === null) {
    flag = true
  } else {
    if (chooseNet === connectNet) {
      flag = true
    }
  }
  return flag
}

/**
 * cdn interface下图片路径匹配
 * @param path 图片在interface下的路径（文件/名字.格式)
 * @returns
 */
export const completeUrl = (path: string) => {
  const { cdnUrl } = publicRuntimeConfig
  return `${cdnUrl}/interface/${path}`
}

/**
 *
 * @param str 要匹配的图标字符串
 * @param type 图标类型 coin badge chain
 * @returns
 */
export const findIcon = (str: string, type: 'coin' | 'badge' | 'chain' | 'wallet' = 'coin') => {
  if (!str) return ''
  return `${publicRuntimeConfig.cdnUrl}/icons/${type}/${str.toLowerCase()}.png`
}

/**
 * 获取url参数
 * @param name 参数名
 * @returns
 */
export function getQueryString(name: string) {
  if (!name) return null
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  const r = window.location.search.substr(1).match(reg)
  if (r != null) {
    return decodeURIComponent(r[2])
  }
  return null
}

export const funcUrlDel = (name: string) => {
  if (!window) return
  const loca = window.location
  const baseUrl = loca.origin + loca.pathname + '?'
  const query = loca.search.substr(1)
  if (query.indexOf(name) > -1) {
    const obj: any = {}
    const arr: any = query.split('&')
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].split('=')
      obj[arr[i][0]] = arr[i][1]
    }
    delete obj[name]
    const url =
      baseUrl + JSON.stringify(obj).replace(/["{}]/g, '').replace(/:/g, '=').replace(/,/g, '&')
    return url
  }
}

/**
 * 替换url参数
 * @param oldUrl 页面的router.query
 * @param changKey 需要替换的key值
 * @param changValue 需要替换的value值
 * @returns
 */
export const changeUrl = (oldUrl: Record<string, any>, changKey?: string, changValue?: string) => {
  let url = '?'
  // 当前url已经存在改参数则替换
  if (Object.keys(oldUrl).find((it) => it === changKey)) {
    Object.keys(oldUrl).map((item) => {
      item === changKey ? (url += `${item}=${changValue}&`) : (url += `${item}=${oldUrl[item]}&`)
    })
  } else {
    Object.keys(oldUrl).map((item) => {
      url += `${item}=${oldUrl[item]}&`
    })
    url += `${changKey}=${changValue}&`
  }
  return url.substring(0, url.length - 1)
}

/**
 * 拼接url参数部分
 * @param queryObj 需要拼接的参数，以对象形式传入
 * @returns
 */
export const spellQuery = (queryObj: Record<string, any>) => {
  let str = ''
  Object.keys(queryObj).map((item) => {
    str += `${item}=${queryObj[item]}&`
  })
  return str.substring(0, str.length - 1)
}

/**
 * 格式化用户地址
 * @param add 要格式化的地址
 * @returns
 */
export const formatAdd = (add: string) => {
  // 取前6后4
  return add.replace(add.slice(5, add.length - 4), '...')
}

/**
 * 格式化hash地址
 * @param add 要格式化的地址
 * @returns
 */
export const formatHash = (hash: string) => {
  try {
    return hash.substring(0, 5) + '...' + hash.substring(hash.length - 6, hash.length)
  } catch (err) {
    console.log(err)
  }
}

/**
 * conflux将地址格式处理为cfx格式
 * @param addr 需要格式化的地址
 * @returns
 */
export const safeAddress = (addr: string) => {
  if (!addr) {
    return ''
  }
  return addr
}

/**
 * 去除末尾多余的0
 * @param old
 * @returns
 */
export function cutZero(old: string) {
  const regexp = /(?:\.0*|(\.\d+?)0+)$/
  return old.replace(regexp, '$1')
}

/**
 * 检测替换为符合标准的数字
 * @param num
 * @param length 保留的最长小数位
 * @returns
 */
export const NumberCheck = (num: any, length = 6) => {
  if (typeof num === 'undefined' || num === '') {
    return ''
  }
  let str: string = typeof num === 'string' ? num : num.toString()
  const len1 = str.substr(0, 1)
  const len2 = str.substr(1, 1)
  //如果第一位是0，第二位不是点，就用数字把点替换掉
  if (str.length > 1 && len1 === '0' && len2 !== '.') {
    str = str.substr(1, 1)
  }
  //第一位不能是.
  if (len1 === '.') {
    str = ''
  }
  //限制只能输入一个小数点
  if (str.indexOf('.') !== -1) {
    const str_ = str.substr(str.indexOf('.') + 1)
    if (str_.indexOf('.') !== -1) {
      str = str.substr(0, str.indexOf('.') + str_.indexOf('.') + 1)
    }
  }
  //正则替换，保留数字和小数点
  str = str.replace(/[^\d^.]+/g, '')
  //如果需要保留小数点后6位
  str = str.replace(/\.\d\d$/, '')
  const dotNum = str.split('.').length > 1 ? str.split('.')[1].length : 0
  if (dotNum > length) {
    str = new BigNumber(str).toFixed(length, 1).toString()
  }
  return str.toString()
}

/**
 *
 * @param text 需要检查的值
 * @param decimals 需要保留的最大精度
 * @returns
 */
export const checkText = (text: string | number, decimals = 18) => {
  text = text.toString()
  const numArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
  const lastLen = text.charAt(text.length - 1)
  if (numArr.indexOf(lastLen) === -1) {
    return text.slice(0, text.length - 1)
  }
  if (text.length > 1 && Number(text[0]) === 0 && text[1] !== '.') {
    return Number(text)
  }
  // 小数位长度不能超过精度
  const dotLength = text.split('.')[1]?.length
  return isNaN(Number(text))
    ? NumberCheck(text, decimals)
    : dotLength > decimals
    ? cutZero(new BigNumber(text).toFixed(decimals, 1).toString())
    : text
}

/**
 * 获取存款综合年化
 * @param depositInterestPreYear 存款年利率
 * @param depositFluxAPY 存款Flux年收益率
 * @returns
 */
export const getDepositCombinedAPY = (depositInterestPreYear: string, depositFluxAPY: string) => {
  const res = new BigNumber(depositInterestPreYear)
    .div(365)
    .plus(1)
    .pow(365)
    .minus(1)
    .plus(new BigNumber(depositFluxAPY).div(365).plus(1).pow(365))
    .minus(1)
  return res.gte(100000000) ? 'big' : res.lte(-100000000) ? 'small' : res.toString()
}

/**
 * 获取借款综合年化
 * @param borrowInterestPreYear 借款年利率
 * @param borrowFluxAPY 借款Flux年收益率
 * @returns
 */
export const getBorrowCombinedAPY = (borrowInterestPreYear: string, borrowFluxAPY: string) => {
  const res = new BigNumber(borrowInterestPreYear)
    .div(365)
    .plus(1)
    .pow(365)
    .minus(1)
    .minus(new BigNumber(borrowFluxAPY).div(365).plus(1).pow(365).minus(1))
  return res.gte(100000000) ? 'big' : res.lte(-100000000) ? 'small' : res.toString()
}

/**
 * APY计算器
 * @param data 基础数据，数据必要格式见my-farm页的数据处理
 * @returns
 */
export const getAPY = (data: any) => {
  interface valueItem {
    apr: string // apr的百分比
    total: string // 总价值
  }
  interface tokenItem {
    num: string // 币种数量
    tokenName: string // 币种名称
  }
  interface collateral {
    total: string
    list: tokenItem[]
  }
  interface income {
    fluxReward: valueItem[]
    lp: valueItem
  }
  interface cost {
    list: valueItem[]
  }
  const collateralVal: collateral = {
    total: (data?.addValues
      ? new BigNumber(data?.addValues?.tokenNum ? data?.addValues?.tokenNum : 0).plus(
          data?.stake0 ? new BigNumber(data?.stake0) : 0
        )
      : new BigNumber(data?.stake0 || 0)
    )
      .times(
        new BigNumber(
          data?.token0Price
            ? data?.token0Price
            : ethers.utils.formatUnits(data?.tokenInfos?.[0]?.price, 18)
        )
      )
      .plus(
        (data?.addValues
          ? new BigNumber(data?.addValues?.tokenNum1 ? data?.addValues?.tokenNum1 : 0).plus(
              data?.stake1 ? new BigNumber(data?.stake1) : 0
            )
          : new BigNumber(data?.stake1 || 0)
        ).times(
          new BigNumber(
            data?.token1Price || ethers.utils.formatUnits(data?.tokenInfos?.[1]?.price, 18)
          )
        )
      )
      .toString(),
    list: [
      {
        num: data?.addValues
          ? new BigNumber(data?.addValues?.tokenNum ? data?.addValues?.tokenNum : 0)
              .plus(data?.stake0 ? new BigNumber(data?.stake0) : 0)
              .toString()
          : data?.stake0 || 0,
        tokenName: data?.token,
      },
      {
        num: data?.addValues
          ? new BigNumber(data?.addValues?.tokenNum1 ? data?.addValues?.tokenNum1 : 0)
              .plus(data?.stake1 ? new BigNumber(data?.stake1) : 0)
              .toString()
          : data?.stake1 || 0,
        tokenName: data?.token1,
      },
    ],
  }
  const incomeVal: income = {
    fluxReward: [
      {
        apr: data?.bankTokenInfo0 ? data?.bankTokenInfo0?.borrowFluxAPY : '0',
        total: data?.bankTokenInfo0
          ? new BigNumber(data?.bankTokenInfo0?.borrowFluxAPY)
              .div(365)
              .times(
                (data?.oldData
                  ? new BigNumber(
                      ethers.utils.formatUnits(
                        data?.debt0.add(data?.oldData?.debt0),
                        data?.bankTokenInfo0?.decimals
                      )
                    )
                  : new BigNumber(
                      ethers.utils.formatUnits(data?.debt0, data?.bankTokenInfo0?.decimals)
                    )
                ).times(
                  new BigNumber(
                    data?.token0Price || ethers.utils.formatUnits(data?.tokenInfos?.[0]?.price, 18)
                  )
                )
              )
              .toString()
          : '0',
      },
      {
        apr: data?.bankTokenInfo1 ? data?.bankTokenInfo1?.borrowFluxAPY : '0',
        total: data?.bankTokenInfo1
          ? new BigNumber(data?.bankTokenInfo1?.borrowFluxAPY)
              .div(365)
              .times(
                (data?.oldData
                  ? new BigNumber(
                      ethers.utils.formatUnits(
                        data?.debt1.add(data?.oldData?.debt1),
                        data?.bankTokenInfo1?.decimals
                      )
                    )
                  : new BigNumber(
                      ethers.utils.formatUnits(data?.debt1, data?.bankTokenInfo1?.decimals)
                    )
                ).times(
                  new BigNumber(
                    data?.token1Price || ethers.utils.formatUnits(data?.tokenInfos?.[1]?.price, 18)
                  )
                )
              )
              .toString()
          : '0',
      },
    ],
    lp: {
      apr: new BigNumber(data?.apr || data?.apr === 0 ? String(data?.apr) : data?.orderInfo?.apr)
        .plus(
          new BigNumber(
            data?.feeAPR || data?.feeAPR === 0 ? String(data?.feeAPR) : data?.orderInfo?.feeAPR
          )
        )
        .toString(),
      total: new BigNumber(data?.apr || data?.apr === 0 ? String(data?.apr) : data?.orderInfo?.apr)
        .plus(
          new BigNumber(
            data?.feeAPR || data?.feeAPR === 0 ? String(data?.feeAPR) : data?.orderInfo?.feeAPR
          )
        )
        .div(365)
        .times(
          new BigNumber(
            ethers.utils.formatUnits(data?.pos0 || data?.amount0, data?.bankTokenInfo0?.decimals)
          )
            .times(
              new BigNumber(
                data?.token0Price || ethers.utils.formatUnits(data?.tokenInfos?.[0]?.price, 18)
              )
            )
            .plus(
              new BigNumber(
                ethers.utils.formatUnits(
                  data?.pos1 || data?.amount1,
                  data?.bankTokenInfo1?.decimals
                )
              ).times(
                new BigNumber(
                  data?.token1Price || ethers.utils.formatUnits(data?.tokenInfos?.[1]?.price, 18)
                )
              )
            )
        )
        .toString(),
    },
  }
  const costVal: cost = {
    list: [
      {
        apr: data?.bankTokenInfo0
          ? new BigNumber(data?.bankTokenInfo0?.borrowInterestPreDay).times(365).toString()
          : '0',
        total: data?.bankTokenInfo0
          ? new BigNumber(data?.bankTokenInfo0?.borrowInterestPreDay)
              .times(
                (data?.oldData
                  ? new BigNumber(
                      ethers.utils.formatUnits(
                        data?.debt0.add(data?.oldData?.debt0),
                        data?.bankTokenInfo0?.decimals
                      )
                    )
                  : new BigNumber(
                      ethers.utils.formatUnits(data?.debt0, data?.bankTokenInfo0?.decimals)
                    )
                ).times(
                  new BigNumber(
                    data?.token0Price || ethers.utils.formatUnits(data?.tokenInfos?.[0]?.price, 18)
                  )
                )
              )
              .toString()
          : '0',
      },
      {
        apr: data?.bankTokenInfo1
          ? new BigNumber(data?.bankTokenInfo1?.borrowInterestPreDay).times(365).toString()
          : '0',
        total: data?.bankTokenInfo1
          ? new BigNumber(data?.bankTokenInfo1?.borrowInterestPreDay)
              .times(
                (data?.oldData
                  ? new BigNumber(
                      ethers.utils.formatUnits(
                        data?.debt1.add(data?.oldData?.debt1),
                        data?.bankTokenInfo1?.decimals
                      )
                    )
                  : new BigNumber(
                      ethers.utils.formatUnits(data?.debt1, data?.bankTokenInfo1?.decimals)
                    )
                ).times(
                  new BigNumber(
                    data?.token1Price || ethers.utils.formatUnits(data?.tokenInfos?.[1]?.price, 18)
                  )
                )
              )
              .toString()
          : '0',
      },
    ],
  }
  const dailyIncome = new BigNumber(incomeVal.lp.total)
    .plus(new BigNumber(incomeVal.fluxReward[0].total))
    .plus(new BigNumber(incomeVal.fluxReward[1].total))
    .toString()
  const dailyCost = new BigNumber(costVal.list[0].total)
    .plus(new BigNumber(costVal.list[1].total))
    .toString()
  const positionApr = new BigNumber(dailyIncome)
    .minus(new BigNumber(dailyCost))
    .div(new BigNumber(collateralVal?.total))
    .times(365)
    .toString()
  const APY = new BigNumber(positionApr).div(365).plus(1).pow(365).minus(1).toString()
  return {
    APY,
    positionApr,
    dailyCost,
    dailyIncome,
    costVal,
    incomeVal,
    collateralVal,
  }
}
