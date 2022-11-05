import create from 'zustand'
import { WalletEnum, NetEnum, ChainType } from '@/consts'

type State = {
  // 是否为PC端
  isPC: boolean
  /**是否登陆 */
  isLogin: boolean
  /**用户登录地址 */
  userAddress: string
  // 当前网络
  connectNet: NetEnum | null
  // 当前网络的类型
  chainType: ChainType | null
  // 选择的需要连接的网络/钱包当前选择的网络, 'nonsupport'为当前不支持的网络
  chooseNet: NetEnum | null | 'nonsupport'
  /**当前net对应钱包的chainId */
  chainId: number | null
  /**当前链接钱包的类型 */
  walletType: WalletEnum | null
  // 当前链的provider
  provider: any
  // 当前钱包的provider
  walletProvider: any
  // 公告信息
  noticeData: any
  /**json文件信息 */
  fluxJson: { [key: string]: any } | null
  // initHotpotConfigJson: () => void
}

const globalStore = create<State>(() => ({
  isPC: false,
  isLogin: false,
  userAddress: '',
  connectNet: NetEnum.polygon,
  chainType: null,
  chooseNet: null,
  chainId: null,
  walletType: null,
  tokenInfoReady: false,
  provider: null,
  walletProvider: null,
  fluxJson: null,
  noticeData: null,
  tokenList: null,
}))

export default globalStore
