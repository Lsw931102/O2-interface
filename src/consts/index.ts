/** 项目通用静态数据 */
import * as ethers from 'ethers'

// 最大数
export const maxUint256 = ethers.BigNumber.from(2).pow(256).sub(1).toString()

/** 钱包相关常量 */
export enum WalletEnum {
  metamask = 'MetaMask',
  walletconnect = 'Wallet Connect',
}

// 支持的网络
export enum NetEnum {
  trust = 'trust',
  trustTest = 'trustTest',
  polygon = 'polygon',
}

// 网络分类
export enum ChainType {
  evm = 'evm',
}

// hotpot支持的跨链
export const crossNet: NetEnum[] = []
export const crossNetDev: NetEnum[] = []

export interface NetEnv {
  // 当前链
  chain: NetEnum
  // 在配置文件中的匹配关键字
  key: NetEnum
  // 链类型
  type: ChainType
  // scan地址
  scanUrl: string
  // scan交易地址
  txScanUrl: string
  // scan币种地址
  addressScanUrl: string
  // 默认的rpc地址，本该使用json配置里面的
  defaultRpcUrl: string
  // 添加网络节点是使用
  networkRpcUrl?: string
  // 后端请求路径
  apiUrl: string
  // 水龙头地址 测试才有
  faucetUrl?: string
  // swap 的url
  swapUrl?: string
  // swap name
  swapText?: string
  // swap交易对
  swapLp?: string
  // 当前应该的网络id
  ChainId: number
  // 当前网络名，用于提示用户切换到那个网
  networkName: string
  // 支持的钱包list
  portalList: string[]
  // FLUX符号
  FLuxSymbol: string
  // Symbol符号
  symbol?: string
  // hotpot配置文件地址
  hotpotConfig: string
  // 平台币符号
  nativeCoin: string
  // 查询网络gas费地址
  gasHttpUrl?: string
  // 对应后端api的chainType
  apiChainType?: number
  // 平台预留的币数量
  prePlatTotal?: number
  // 清算系数
  clearPercentage: number
  // 健康系数下限
  healthLimit: number
}
