import WalletConnectProvider from '@walletconnect/web3-provider'
import { providers, utils } from 'ethers'
import { isMobile } from 'react-device-detect'
import { SUPPORTED_WALLETS } from '@/consts/network'
import { WalletEnum } from '@/consts'
import globalStore from '@/stores/global'

export interface IWallet {
  key: WalletEnum
  isMobile?: boolean // 是否只能在手机上用APP打开
  icon: string
  isHasWallet: any
  link: string
  provider: any
  walletProvider: any
  connect: any // 连接钱包
  getChainId: any
  listeningChange: (callback: any) => void
}

// 钱包的配置相关
export const walletConfig = {
  // walletconnect 用到的bridge
  bridge: 'https://bridge.walletconnect.org',
  infuraId: 'e758353f25c643579161588081317f0a',
  rpc: {
    15555: 'https://api.testnet-dev.trust.one',
  },
}

export const wallet: { [key: string]: IWallet } = {
  [WalletEnum.metamask]: {
    key: WalletEnum.metamask,
    icon: SUPPORTED_WALLETS[WalletEnum.metamask]?.icon,
    isHasWallet: () => {
      return isMobile ? window?.ethereum : window?.ethereum?.isMetaMask
    },
    link: SUPPORTED_WALLETS[WalletEnum.metamask]?.link,
    provider: () => {
      return window?.ethereum
    },
    walletProvider: () => {
      if (isMobile) {
        return window?.ethereum ? new providers.Web3Provider(window?.ethereum) : null
      } else {
        return window?.ethereum && window?.ethereum?.isMetaMask
          ? new providers.Web3Provider(window?.ethereum)
          : null
      }
    },
    connect: async () => {
      try {
        const accounts = await window?.ethereum.request({ method: 'eth_requestAccounts' })
        return utils.getAddress(accounts?.[0])
      } catch (err: any) {
        console.log(err)
      }
    },
    getChainId: async () => {
      if (!window?.ethereum) return null
      const network = await new providers.Web3Provider(window?.ethereum).getNetwork()
      return network.chainId
    },
    listeningChange: (callback: any) => {
      const ethereum = window.ethereum
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          callback && callback({ data: utils.getAddress(accounts?.[0]), type: 'accountsChanged' })
        } else {
          callback && callback(null)
        }
      })
      // 网络切换刷新页面
      ethereum.on('chainChanged', (chainId: string) => {
        callback?.({
          type: 'chainChanged',
          data: chainId,
        })
      })
      // 网络断开
      ethereum.on('disconnect', () => {
        callback && callback(null)
      })
    },
  },
  [WalletEnum.walletconnect]: {
    key: WalletEnum.walletconnect,
    icon: SUPPORTED_WALLETS[WalletEnum.walletconnect]?.icon,
    isHasWallet: () => {
      return true
    },
    link: SUPPORTED_WALLETS[WalletEnum.walletconnect]?.link,
    provider: () => {
      const web3Provider = new WalletConnectProvider({
        bridge: walletConfig.bridge,
        infuraId: walletConfig.infuraId,
        rpc: walletConfig.rpc,
        qrcode: true,
        pollingInterval: 15000,
      })
      globalStore.setState({
        walletProvider: web3Provider,
      })
      return web3Provider
    },
    connect: async () => {
      try {
        // const { walletProvider } = globalStore.getState()
        const walletProvider = new WalletConnectProvider({
          bridge: walletConfig.bridge,
          infuraId: walletConfig.infuraId,
          rpc: walletConfig.rpc,
          qrcode: true,
          pollingInterval: 15000,
        })
        const accounts = await walletProvider?.enable()
        return utils.getAddress(accounts?.[0])
      } catch (err: any) {
        console.log(err)
      }
    },
    walletProvider: () => {
      const { walletProvider } = globalStore.getState()
      console.log(walletProvider, 8888)
      return new providers.Web3Provider(walletProvider as WalletConnectProvider)
    },
    getChainId: async () => {
      const { walletProvider } = globalStore.getState()
      const network = await new providers.Web3Provider(walletProvider).getNetwork()
      return network.chainId
    },
    listeningChange: (callback: any) => {
      const { walletProvider } = globalStore.getState()
      walletProvider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          callback && callback({ data: utils.getAddress(accounts?.[0]), type: 'accountsChanged' })
        } else {
          callback && callback(null)
        }
      })

      // Subscribe to chainId change
      walletProvider.on('chainChanged', () => {
        window.location.reload()
      })

      // Subscribe to session disconnection
      walletProvider.on('disconnect', () => {
        callback && callback(null)
      })
    },
  },
}
