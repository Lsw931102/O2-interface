import axios from 'axios'
import { isMobile } from 'react-device-detect'
import PubSub from 'pubsub-js'
import { client as clientConfig } from 'config'
import { constants } from 'ethers'
import { wallet } from '@/utils/wallet'
import { netconfigs, CHAINS } from '@/consts/network'
import { setStore, getStore, getSessionStorage, setSessionStorage } from '@/utils/storage'
import { getQueryString } from '@/utils/common'
import { NetEnum, WalletEnum, ChainType } from '@/consts'
import { getProvider } from '@/contracts/funcs'
import globalStore from '@/stores/global'
import searchProviderStore from '@/stores/contract/searchProvider'
import stakePageStore from '@/stores/pages/stake'
import fluxReportStore from '@/stores/contract/fluxReport'
import marketsStore from '@/stores/contract/markets'
import fluxAppStore from '@/stores/contract/fluxApp'
import fluxStore from '@/stores/contract/flux'
import farmStore from '@/stores/contract/farm'
import zoSwapStore from '@/stores/contract/zoSwap'

/**
 * 通过参数和本地存储获取当前是什么网络和钱包
 */
export const initNetAndWallet = async () => {
  // 初始化链，url > 钱包连接的网络 > localstorage > 默认链
  // url链的参数
  const urlChain: any = getQueryString('chain')
  // metamask当前连接的网络
  const metamaskChainId = window?.ethereum ? window?.ethereum?.chainId / 1 : null
  // metamask连接的网络是否是我们支持的网络
  const metamaskChainInfo = CHAINS.filter((it) => it?.type === ChainType.evm).find(
    (it) => it?.chainId === metamaskChainId
  )
  const initialChain: NetEnum =
    urlChain && Object.values(NetEnum).find((it) => it === urlChain)
      ? urlChain
      : getStore('lastChain')
      ? getStore('lastChain')
      : metamaskChainInfo
      ? metamaskChainInfo.key
      : NetEnum.polygon

  console.log('initialChain:', initialChain)
  const chainInfo = CHAINS.find((it) => it?.key === initialChain)
  const provider = getProvider(initialChain)
  // 初始化钱包类型, metamaskChainInfo存在时直接为MetaMask,否则localstorage(满足当前网络钱包类型时) > default
  const storeWallet = getStore('walletType')
  let initWallt = chainInfo?.defaultWallet
  if (!metamaskChainInfo && storeWallet && chainInfo?.wallet.find((it) => it === storeWallet)) {
    initWallt = storeWallet
  }
  console.log('initWallt:', initWallt)
  // 钱包当前连接的网络的chainId
  const walletChainId = await wallet[initWallt as WalletEnum]?.getChainId()
  const netConfig = netconfigs[initialChain]
  setStore('lastChain', initialChain)
  setStore('walletType', initWallt)

  globalStore.setState({
    provider,
    chainId: netConfig?.ChainId as number,
    connectNet: initialChain,
    chainType: netConfig?.type as ChainType,
    walletType: initWallt as WalletEnum,
    walletProvider: wallet[initWallt as WalletEnum]?.walletProvider(),
    chooseNet:
      (Object.values(netconfigs).find(
        (it) => it?.ChainId === walletChainId && it?.type === chainInfo?.type
      )?.chain as NetEnum) || 'nonsupport',
  })
}

/** 获取配置文件 */
export const getConfig = async () => {
  try {
    const data = await axios.get(clientConfig.jsonConfig)
    globalStore.setState({
      fluxJson: data?.data || data,
    })
    PubSub.publish('configReady')
  } catch (err) {
    console.log(`getConfig:${err}`)
  }
}

/**
 * 初始化各个合约
 * @param isFirst  是否为首次初始化
 */
export const initContracts = async (isFirst = true) => {
  const { fluxJson, connectNet } = globalStore.getState()
  console.log(fluxJson, connectNet, 999)
  // 请求用户信息要用到的合约
  await searchProviderStore.getState().init()
  await fluxReportStore.getState().init()
  await fluxAppStore.getState().init()
  if (fluxJson?.[connectNet as string]?.contracts?.['ZO']) {
    await zoSwapStore.getState().init()
  }
  if (fluxJson?.[connectNet as string]?.contracts?.['FLUX'] !== constants.AddressZero) {
    await fluxStore.getState().init()
  }
  isFirst && PubSub.publish('loginReady')
  if (
    fluxJson?.[connectNet as string]?.stakePools &&
    Object.keys(fluxJson?.[connectNet as string]?.stakePools).length
  ) {
    await stakePageStore.getState().init()
  }

  await marketsStore.getState().init()
  if (fluxJson?.[connectNet as string]?.farm?.['LensTVL']) {
    await farmStore.getState().init()
  }
  isFirst && PubSub.publish('contractsReady')
}

export const appInit = async () => {
  console.log('appInit')
  await initNetAndWallet()
  await getConfig()
  initContracts()
}

/**
 * 初始化用户信息
 * 未登陆且之前登陆过自动连接钱包
 */
export const getAccount = async () => {
  const { walletType, connectNet } = globalStore.getState()
  const chainInfo = CHAINS.find((it) => it?.key === connectNet)
  if (getSessionStorage('userAddress')) {
    // 说明之前登陆过, 发起登陆请求
    const accout = await wallet[walletType as WalletEnum]?.connect()
    const chainId = await wallet[walletType as WalletEnum]?.getChainId()
    if (accout) {
      globalStore.setState({
        userAddress: accout,
        isLogin: true,
        chooseNet:
          (Object.values(netconfigs).find(
            (it) => it?.ChainId === chainId && it?.type === chainInfo?.type
          )?.chain as NetEnum) || 'nonsupport',
      })
      listeningAccount()
      PubSub.publish('login')
    } else {
      globalStore.setState({
        userAddress: '',
        isLogin: false,
        chooseNet: null,
      })
    }
  } else {
    if (isMobile) {
      handleTP()
    }
  }
}

/**
 * 监听网络变化等
 */
export const listeningAccount = () => {
  const { isLogin, walletType } = globalStore.getState()
  // 监听用户，或者网络变化
  if (isLogin) {
    wallet[walletType as WalletEnum]?.listeningChange((res: { type: string; data: any }) => {
      if (!res) {
        // 清空所有登陆信息
        // clearSessionStorage()
        globalStore.setState({
          isLogin: false,
          userAddress: '',
        })
        // toast({
        //   position: 'top',
        //   description: ' 钱包已被锁定或未授权',
        //   status: 'warning',
        //   duration: 3000,
        // })
        setTimeout(() => window.location.reload(), 1000)
      } else {
        if (res?.type === 'chainChanged') {
          getAccount()
        } else if (res?.type === 'accountsChanged') {
          // 修改登录信息
          globalStore.setState({
            isLogin: true,
            userAddress: res?.data,
          })
          setSessionStorage('userAddress', res?.data)
          PubSub.publish('login')
        }
      }
    })
  }
}

/**
 * 移动钱包,就是移动端登录
 * 如果用户是通过TP钱包内置浏览器访问Flux，则无需用户手工点击 connect，而是自动 connect 链接到移动钱包。
 */
export const handleTP = async () => {
  if (window?.ethereum) {
    const accounts = await window?.ethereum?.enable()
    if (accounts?.length > 0) {
      setSessionStorage('userAddress', accounts[0])
      setSessionStorage('walletType', WalletEnum.metamask)
      globalStore.setState({
        isLogin: true,
        walletType: WalletEnum.metamask,
      })
      getAccount()
    }
  }
}
// 移动端有sdk加载不出来的情况所以写个轮询查询window下的sdk是否加载好
export const waitWindowJs = (times: number, hasJs: any, callback: () => void) => {
  if (times <= 0) {
    return false
  }
  setTimeout(() => {
    if (hasJs?.()) {
      callback()
    } else {
      waitWindowJs(times - 1, hasJs, callback)
    }
  }, 500)
}

export const userInit = () => {
  const { walletType } = globalStore.getState()
  waitWindowJs(
    10,
    () => {
      return wallet[walletType as WalletEnum]?.isHasWallet()
    },
    () => {
      getAccount()
    }
  )
}

/**
 * 全局需要的监听
 */

// 确保加载用户数据的时候相关合约初始化了，所以在loginReady过后初始化用户
PubSub.subscribe('loginReady', () => {
  userInit()
})

// 登录
PubSub.subscribe('login', () => {
  console.log('login')
  initContracts(false)
})

// 借存贷还后，更新数据
PubSub.subscribe('transactionComplete', () => {
  console.log('transactionComplete')
  getUserInfo()
})

// 更新用户数据
export const getUserInfo = () => {
  // 用户market信息
  searchProviderStore.getState().getUserMarketsData()
  // 用户总资产信息
  fluxAppStore.getState().getUserAssets()
}
