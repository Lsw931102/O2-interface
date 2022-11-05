import { providers, Contract } from 'ethers'
import globalStore from '@/stores/global'
import { NetEnum, WalletEnum } from '@/consts'
import { netconfigs } from '@/consts/network'
import { wallet } from '@/utils/wallet'

/**
 * 获取对应链的provider
 * @param net 对应的链
 */
const getProvider = (net: NetEnum) => {
  if (!net) return
  const { connectNet, chooseNet } = globalStore.getState()
  const curNet = netconfigs[net]
  const { isLogin, walletType } = globalStore.getState()
  let isNetCorrect = false
  if (chooseNet) {
    isNetCorrect = chooseNet === connectNet && connectNet === net
  } else {
    isNetCorrect = connectNet === net
  }
  return isLogin && walletType === WalletEnum.metamask && isNetCorrect
    ? new providers.Web3Provider(window?.ethereum)
    : new providers.JsonRpcProvider(
        isLogin ? curNet?.networkRpcUrl || curNet?.defaultRpcUrl : curNet?.defaultRpcUrl,
        curNet?.ChainId
      )
}

/**
 * 初始化sdk合约
 * @param address 合约地址
 * @param abi 合约abi
 */
const getReadContract = (address: string, abi: any[], net?: NetEnum | null) => {
  const { connectNet } = globalStore.getState()
  const netInitial = net || connectNet
  if (!netInitial) return
  const provider = getProvider(netInitial)
  return new Contract(address, abi, provider)
}

/**
 * 初始化wallet合约
 * @param address 合约地址
 * @param abi 合约abi
 */
const getWalletContract = (address: string, abi: any[]) => {
  const { walletType } = globalStore.getState()
  const walletProvider = wallet[walletType as WalletEnum]['walletProvider']()
  const signer = walletProvider?.getSigner()
  return new Contract(address, abi, signer)
}

export { getProvider, getReadContract, getWalletContract }
