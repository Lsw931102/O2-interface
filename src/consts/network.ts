import { NetEnv, NetEnum, WalletEnum, ChainType } from './index'
import { completeUrl } from '@/utils/common'

export const netconfigs: { [key: string]: NetEnv | null } = {
  [NetEnum.trust]: null,
  [NetEnum.trustTest]: {
    chain: NetEnum.trustTest,
    key: NetEnum.trustTest,
    type: ChainType.evm,
    scanUrl: 'https://trustscan.one/',
    txScanUrl: 'https://trustscan.one/tx',
    addressScanUrl: 'https://trustscan.one/address',
    defaultRpcUrl: 'https://api.testnet-dev.trust.one',
    networkRpcUrl: 'https://api.testnet-dev.trust.one',
    apiUrl: '',
    swapUrl: '',
    swapText: '',
    swapLp: '',
    faucetUrl: '',
    ChainId: 15555,
    networkName: 'Trust Network Testnet Preview',
    portalList: [WalletEnum.metamask, WalletEnum.walletconnect],
    FLuxSymbol: 'FLUX',
    symbol: 'EVM',
    hotpotConfig: 'https://config.cdn.whoops.world/hotpot/config.mainnet.dev.json',
    nativeCoin: 'EVM',
    apiChainType: 6,
    prePlatTotal: 0.01,
    clearPercentage: 1.5,
    healthLimit: 1.55,
  },
  [NetEnum.polygon]: {
    chain: NetEnum.polygon,
    key: NetEnum.polygon,
    type: ChainType.evm,
    scanUrl: 'https://polygonscan.com',
    txScanUrl: 'https://polygonscan.com/tx',
    addressScanUrl: 'https://polygonscan.com/address',
    defaultRpcUrl: 'https://polygon-rpc.com/',
    networkRpcUrl: 'https://rpc-mainnet.maticvigil.com',
    apiUrl: '',
    swapUrl:
      'https://quickswap.exchange/#/swap?inputCurrency=MATIC&outputCurrency=0xd10852DF03Ea8b8Af0CC0B09cAc3f7dbB15e0433',
    swapText: 'QUICKSWAP',
    swapLp: 'FLUX-USDT',
    faucetUrl: '',
    ChainId: 137,
    networkName: 'Polygon',
    portalList: [WalletEnum.metamask, WalletEnum.walletconnect],
    FLuxSymbol: 'FLUX',
    symbol: 'MATIC',
    hotpotConfig: 'https://config.cdn.whoops.world/hotpot/config.mainnet.dev.json',
    nativeCoin: 'MATIC',
    gasHttpUrl: 'https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle',
    apiChainType: 4,
    prePlatTotal: 1,
    clearPercentage: 1.2,
    healthLimit: 1.15,
  },
}
export interface WalletInfo {
  name: string
  icon: string
  link: string
}

// 支持的钱包
export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  [WalletEnum.metamask]: {
    name: WalletEnum.metamask,
    icon: completeUrl('wallet/metamask.png'),
    link: 'https://metamask.io/',
  },
  [WalletEnum.walletconnect]: {
    name: WalletEnum.walletconnect,
    icon: completeUrl('wallet/walletconnect.png'),
    link: 'https://walletconnect.org/',
  },
}
export interface ChainInfo {
  key: NetEnum
  type: ChainType
  chainId: number
  name: string
  icon: string
  iconEntity: string
  wallet: WalletEnum[]
  defaultWallet: WalletEnum
}
// 支持的链
export const CHAINS: ChainInfo[] = [
  {
    key: NetEnum.trustTest,
    type: ChainType.evm,
    chainId: 1,
    name: 'Ethereum',
    icon: completeUrl('chain/ethereum.png'),
    iconEntity: completeUrl('chain-entity/ethereum.png'),
    wallet: [WalletEnum.metamask, WalletEnum.walletconnect],
    defaultWallet: WalletEnum.metamask,
  },
  {
    key: NetEnum.polygon,
    type: ChainType.evm,
    chainId: 137,
    name: 'Polygon',
    icon: completeUrl('chain/polygon.png'),
    iconEntity: completeUrl('chain-entity/polygon.png'),
    wallet: [WalletEnum.metamask, WalletEnum.walletconnect],
    defaultWallet: WalletEnum.metamask,
  },
]
