import React, { useState, useEffect } from 'react'
import { Flex, Image, Text, Box } from '@chakra-ui/react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

import px2vw from '@/utils/px2vw'
import { CHAINS, SUPPORTED_WALLETS, netconfigs } from '@/consts/network'
import { NetEnum } from '@/consts'
import { wallet, IWallet } from '@/utils/wallet'
import { WalletEnum } from '@/consts'
import { setSessionStorage, setStore, removeSessionStorage } from '@/utils/storage'
import globalStore from '@/stores/global'
import { changeUrl } from '@/utils/common'
import logo from '@/assets/images/logo.png'
import goNext from '@/assets/images/goNext.png'
import checkedIc from '@/assets/images/checked.png'
import trustLight from '@/assets/images/trustLight.png'
import trustDark from '@/assets/images/trustDark.png'

interface IProps {
  onClose: () => void
}
function Index({ onClose }: IProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { connectNet } = globalStore()
  // 选择的链
  const [curChain, setChain] = useState(0)

  useEffect(() => {
    if (connectNet) {
      const num = CHAINS.findIndex((it) => it?.key === connectNet)
      setChain(num)
    }
  }, [connectNet])

  const confirm = async (curWallet: WalletEnum) => {
    try {
      const chooseWallet = wallet[curWallet]
      connectWallet(chooseWallet)
    } catch (err) {
      console.log(err)
    }
  }

  // 连接钱包
  const connectWallet = async (chooseWallet: IWallet) => {
    try {
      // 1.是否安装当前选择的钱包
      if (chooseWallet?.isHasWallet()) {
        await globalStore.setState({
          walletProvider: chooseWallet?.walletProvider(),
        })
        // 2.连接钱包
        const account = await chooseWallet?.connect()
        onClose()
        if (account?.length) {
          // 更新登陆数据
          setSessionStorage('userAddress', account)
          setStore('walletType', chooseWallet.key)
          setStore('lastChain', netconfigs[CHAINS[curChain].key]?.chain as NetEnum)
          globalStore.setState({
            userAddress: account,
            isLogin: true,
            walletType: chooseWallet.key,
            walletProvider: chooseWallet?.walletProvider(),
            chooseNet: netconfigs[CHAINS[curChain].key]?.chain as NetEnum,
          })
          PubSub.publish('login')
          // 3.检查网络是否正确
          checkNet(chooseWallet?.key)
        } else {
          // 清空登陆信息
          removeSessionStorage('userAddress')
          setStore('walletType')
          setStore('lastChain')
          globalStore.setState({
            userAddress: '',
            isLogin: false,
            walletType: null,
            walletProvider: null,
            chooseNet: null,
          })
        }
      } else {
        if (chooseWallet?.link) {
          window.open(chooseWallet?.link, '_blank')
        } else {
          toast({
            status: 'warning',
            title: t('Install Wallet'),
            position: 'top',
            duration: 3000,
            isClosable: false,
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  // 检查网络是否正确
  const checkNet = async (curWallet: WalletEnum) => {
    try {
      if (curWallet !== WalletEnum.metamask) return
      // 获取选择钱包当前连接的网络
      const chooseWallet = wallet[curWallet]
      const curChainId = await chooseWallet?.getChainId()
      const curConfig = netconfigs[CHAINS[curChain].key]
      // 如果当前连接的网络不是选择的网络请求切换网络
      if (curChainId !== curConfig?.ChainId && window?.ethereum) {
        if (isMobile) {
          addFun(chooseWallet)
        } else {
          try {
            await chooseWallet?.provider()?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${curConfig?.ChainId.toString(16)}` }],
            })
            changeFun(curConfig?.chain as NetEnum)
          } catch (switchError: any) {
            if (switchError?.code === 4902) {
              // 已存在该网络
              addFun(chooseWallet)
            }
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const changeFun = (chain: NetEnum) => {
    setStore('lastChain', chain)
    const newUrl = `${window?.location?.origin}${window?.location?.pathname}${changeUrl(
      router.query,
      'chain',
      chain
    )}`
    window.open(newUrl, '_self')
  }

  const addFun = async (chooseWallet: IWallet) => {
    try {
      const curConfig = netconfigs[CHAINS[curChain].key]
      await chooseWallet?.provider()?.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${curConfig?.ChainId.toString(16)}`,
            chainName: curConfig?.networkName,
            rpcUrls: [curConfig?.networkRpcUrl || curConfig?.defaultRpcUrl],
            blockExplorerUrls: [curConfig?.scanUrl],
            nativeCurrency: {
              name: curConfig?.symbol,
              symbol: curConfig?.nativeCoin,
              decimals: 18,
            },
          },
        ],
      })
      changeFun(curConfig?.chain as NetEnum)
    } catch (addError: any) {
      console.log('addEthereumChain Error:' + addError?.message)
    }
  }

  return (
    <Flex
      direction="column"
      alignItems="center"
      w={{ base: 'full', xl: '375px' }}
      p={{ base: `${px2vw(30)} ${px2vw(42)}`, xl: '30px 42px' }}
      bg="grey.600"
      borderRadius="xxl"
    >
      <Image w={{ base: px2vw(43), xl: '43px' }} h={{ base: px2vw(43), xl: '43px' }} src={logo} />
      <Text
        mt={{ base: px2vw(10), xl: '10px' }}
        mb={{ base: px2vw(20), xl: '20px' }}
        textStyle="18"
        fontWeight="bold"
      >
        {t('Connect Wallet')}
      </Text>
      {/* choose wallet */}
      <Flex direction="column" w="100%">
        {CHAINS[curChain]?.wallet?.map((item) => {
          const walletItem = SUPPORTED_WALLETS[item]
          return (
            <Flex
              key={item}
              alignItems="center"
              justifyContent="space-between"
              bg="gray.200"
              borderRadius="llg"
              _hover={{
                bg: 'grey.400',
              }}
              w="100%"
              h={{ base: px2vw(50), xl: '50px' }}
              mt={{ base: px2vw(20), xl: '20px' }}
              pl={{ base: px2vw(20), xl: '20px' }}
              pr={{ base: px2vw(10), xl: '10px' }}
              cursor="pointer"
              onClick={() => confirm(item)}
            >
              <Flex alignItems="center">
                <Image
                  ignoreFallback
                  src={walletItem?.icon}
                  w={{ base: px2vw(40), xl: '40px' }}
                  h={{ base: px2vw(40), xl: '40px' }}
                  cursor="pointer"
                />
                <Text
                  ml={{ base: px2vw(15), xl: '15px' }}
                  textStyle="18"
                  fontWeight="500"
                  textAlign="center"
                >
                  {walletItem?.name}
                </Text>
              </Flex>
              <Image
                ignoreFallback
                src={goNext}
                w={{ base: px2vw(30), xl: '30px' }}
                h={{ base: px2vw(30), xl: '30px' }}
              />
            </Flex>
          )
        })}
      </Flex>
      {/* choose chain */}
      <Flex direction="column" w="100%" mt={{ base: px2vw(10), xl: '10px' }}>
        {CHAINS.map((item, index) => (
          <Flex
            key={item?.key}
            alignItems="center"
            w="100%"
            mt={{ base: px2vw(20), xl: '20px' }}
            onClick={() => {
              setChain(index)
              globalStore.setState({
                chooseNet: item?.key,
              })
            }}
          >
            {curChain === index ? (
              <Image
                ignoreFallback
                src={checkedIc}
                w={{ base: px2vw(16), xl: '16px' }}
                h={{ base: px2vw(16), xl: '16px' }}
                cursor="pointer"
              />
            ) : (
              <Box
                w={{ base: px2vw(16), xl: '16px' }}
                h={{ base: px2vw(16), xl: '16px' }}
                border="1.4px solid"
                borderColor="gray.500"
                borderRadius="round"
              />
            )}
            <Image
              ignoreFallback
              src={curChain === index ? trustLight : trustDark}
              w={{ base: px2vw(20), xl: '20px' }}
              h={{ base: px2vw(20), xl: '20px' }}
              ml={{ base: px2vw(15), xl: '15px' }}
              mr={{ base: px2vw(10), xl: '10px' }}
              cursor="pointer"
            />
            <Text
              color={curChain === index ? 'grey.100' : 'black'}
              textStyle="16"
              fontWeight="normal"
              textAlign="center"
            >
              {item?.name}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

export default React.memo(Index)
