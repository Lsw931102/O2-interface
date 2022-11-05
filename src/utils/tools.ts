import { cloneDeep } from 'lodash'
import BigNumber from 'bignumber.js'
import globalStore from '@/stores/global'
import { NetEnum } from '@/consts'
import { Status, TxMark, TxType } from '@/consts/status'
import { getLocalStorage, setLocalStorage } from './storage'
import { findIcon } from './common'

export interface IHistoryItem {
  date: number // 时间戳
  type: TxType
  mark: TxMark
  num?: string
  symbol: string
  from?: NetEnum
  to?: NetEnum
  hash: string // 源链hash
  toHash?: string // 目标链hash(跨链时需要)
  status: Status
}

// conflux将hex格式地址转为cfx地址
export const safeAddress = (addr: string) => {
  if (!addr) {
    return ''
  }
  return addr
}
/**
 *
 * @param n 需要格式化的数字
 * @param short 是否需要仅保留3位小数
 * @param cutZero 是否需要去除末尾多余的0
 * @returns
 */
export const numberFormat = (n: any, short = false, cutZero = false): string => {
  if (new BigNumber(n).eq(0)) {
    return `0`
  }
  let str = new BigNumber(n).toFormat(short ? 3 : 18, 1)
  if (cutZero) {
    while (str[str.length - 1] === '0') {
      str = str.substring(0, str.length - 1)
    }
    if (str[str.length - 1] === '.') {
      str = str.substring(0, str.length - 1)
    }
  }
  return str
}

// 存储历史记录
export const addHistory = (item: IHistoryItem) => {
  try {
    const { userAddress, connectNet } = globalStore.getState()
    const key = `${connectNet}${userAddress.toLocaleLowerCase()}`
    const list = getLocalStorage(key) && JSON.parse(getLocalStorage(key) as string)
    setLocalStorage(key, JSON.stringify(list?.length ? [item, ...list] : [item]))
  } catch (err) {
    console.log(err)
  }
}

/**
 * 更新历史记录状态
 * @param hash 源链hash
 * @param toHash 目标链hash
 * @param status 状态 1为成功 0为失败
 */
export const updateHistory = (hash: string, toHash = '', status = 1) => {
  try {
    const { userAddress, connectNet } = globalStore.getState()
    const key = `${connectNet}${userAddress.toLocaleLowerCase()}`
    const list: any[] = getLocalStorage(key) && JSON.parse(getLocalStorage(key) as any)
    const item = list?.find((it) => it?.hash?.toLocaleLowerCase() === hash?.toLocaleLowerCase())
    const itemIndex = list?.findIndex(
      (it) => it?.hash?.toLocaleLowerCase() === hash?.toLocaleLowerCase()
    )
    const newItem = {
      ...item,
      toHash,
      status: status ? Status.success : Status.failed,
    }
    list[itemIndex] = newItem
    setLocalStorage(key, JSON.stringify(list))
  } catch (err) {
    console.log(err)
  }
}

// replace方法，替换数组对象中的对象
export const replaceCollection = (array: any[], record: Record<any, any>, key: string) => {
  const supplyListCloneDeep = cloneDeep(array)
  const findIndex = supplyListCloneDeep.findIndex((item) => item?.[key] === record?.[key])
  supplyListCloneDeep.splice(findIndex, 1, record)
  return supplyListCloneDeep
}

// 添加zo token
export const addZoToken = () => {
  const { fluxJson, connectNet } = globalStore.getState()
  const zo = fluxJson?.[connectNet as string]?.contracts['ZO']
  if (!zo) return
  console.log('findIcon', findIcon('zo'))
  window.ethereum
    .request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: zo,
          symbol: 'ZO',
          decimals: 18,
          image: findIcon('zo'),
        },
      },
    })
    .then((success: any) => {
      if (success) {
        console.log('success')
      } else {
        throw new Error('Something went wrong.')
      }
    })
    .catch(console.error)
}
