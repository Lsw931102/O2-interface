import React, { useState, useEffect } from 'react'
import { useToggle } from 'react-use'
import { Flex, Image, Text } from '@chakra-ui/react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import px2vw from '@/utils/px2vw'
import { CHAINS, SUPPORTED_WALLETS, netconfigs } from '@/consts/network'
import { NetEnum } from '@/consts'
import checkedIc from '@/assets/images/svg/check.svg'
import { wallet, IWallet } from '@/utils/wallet'
import { WalletEnum } from '@/consts'
import { setSessionStorage, setStore, removeSessionStorage } from '@/utils/storage'
import globalStore from '@/stores/global'
import { changeUrl } from '@/utils/common'
import { isMobile } from 'react-device-detect'

interface IProps {
  onClose: () => void
}
function Index({ onClose }: IProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { connectNet } = globalStore()
  // 协议是否勾选
  const [isChecked, toogleCheck] = useToggle(false)
  // 选择的链
  const [curChain, setChain] = useState(0)

  useEffect(() => {
    if (connectNet) {
      const num = CHAINS.findIndex((it) => it?.key === connectNet)
      setChain(num)
    }
  }, [connectNet])

  const confirm = async (curWallet: WalletEnum) => {
    if (!isChecked) {
      toast.warn(t('Step1Tips'), {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        theme: 'colored',
      })
      return
    }
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
      w={{ base: 'full', xl: '375px' }}
      p={{ base: `${px2vw(25)} ${px2vw(30)} ${px2vw(40)}`, xl: '25px 30px 40px' }}
      bg="bg"
    >
      <Text textStyle="18" fontWeight="bold">
        {t('Connect Wallet')}
      </Text>
      {/* step1 */}
      <Flex alignItems="center" mt={{ base: px2vw(20), xl: '20px' }} fontWeight="bold">
        <Text>{t('Step1')}</Text>&nbsp;
        <Text
          color="white"
          textDecoration="underline"
          cursor="pointer"
          onClick={() =>
            window.open(
              router.locale === 'zh'
                ? 'https://fluxdoc.01.finance/v/cn/guan-yu-wo-men/flux-fu-wu-tiao-kuan'
                : 'https://fluxdoc.01.finance/about-us/terms-of-service'
            )
          }
        >
          {t('Step1tail')}
        </Text>
      </Flex>
      <Flex mt={{ base: px2vw(10), xl: '10px' }} alignItems="center">
        <Flex
          alignItems="center"
          justifyContent="center"
          w={{ base: px2vw(20), xl: '20px' }}
          h={{ base: px2vw(20), xl: '20px' }}
          mr={{ base: px2vw(5), xl: '5px' }}
          borderRadius="4px"
          border={isChecked ? 'none' : '2px solid'}
          borderColor="purple.300"
          bg={isChecked ? 'purple.300' : 'transparent'}
          cursor="pointer"
          onClick={toogleCheck}
        >
          {isChecked ? (
            <Image
              w={{ base: px2vw(18), xl: '18px' }}
              h={{ base: px2vw(14), xl: '14px' }}
              src={checkedIc}
            />
          ) : null}
        </Flex>
        <Text fontWeight="normal">{t('I have read and accept')}</Text>
      </Flex>
      {/* step2 */}
      <Text mt={{ base: px2vw(20), xl: '20px' }} fontWeight="bold">
        {t('Step2')}
      </Text>
      <Flex flexWrap="wrap">
        {CHAINS.map((item, index) => (
          <Flex
            key={item?.key}
            direction="column"
            alignItems="center"
            w="25%"
            mt={{ base: px2vw(13), xl: '13px' }}
            onClick={() => {
              setChain(index)
              globalStore.setState({
                chooseNet: item?.key,
              })
            }}
          >
            <Flex
              w={{ base: px2vw(54), xl: '54px' }}
              h={{ base: px2vw(54), xl: '54px' }}
              alignItems="center"
              justifyContent="center"
              bg={curChain === index ? 'gray.300' : 'transparent'}
              _hover={{
                bg: 'gray.50',
              }}
              borderRadius="round"
              border={curChain === index ? '2px solid' : 'none'}
              borderColor="purple.300"
              boxSizing="border-box"
            >
              <Image
                ignoreFallback
                src={item?.iconEntity}
                w={{ base: px2vw(40), xl: '40px' }}
                h={{ base: px2vw(40), xl: '40px' }}
                cursor="pointer"
              />
            </Flex>
            <Text
              mt={{ base: px2vw(10), xl: '10px' }}
              textStyle="12"
              fontWeight="normal"
              textAlign="center"
            >
              {item?.name}
            </Text>
          </Flex>
        ))}
      </Flex>
      {/* step3 */}
      <Text mt={{ base: px2vw(20), xl: '20px' }} fontWeight="bold">
        {t('Step3')}
      </Text>
      <Flex flexWrap="wrap">
        {CHAINS[curChain]?.wallet?.map((item) => {
          const walletItem = SUPPORTED_WALLETS[item]
          return (
            <Flex
              key={item}
              direction="column"
              alignItems="center"
              w="25%"
              mt={{ base: px2vw(13), xl: '13px' }}
              onClick={() => confirm(item)}
            >
              <Flex
                w={{ base: px2vw(54), xl: '54px' }}
                h={{ base: px2vw(54), xl: '54px' }}
                alignItems="center"
                justifyContent="center"
                // bg={curWallet === item ? 'gray.300' : 'transparent'}
                _hover={{
                  bg: 'gray.50',
                }}
                borderRadius="round"
                // border={curWallet === item ? '2px solid' : 'none'}
                borderColor="purple.300"
                boxSizing="border-box"
              >
                <Image
                  ignoreFallback
                  src={walletItem?.icon}
                  w={{ base: px2vw(40), xl: '40px' }}
                  h={{ base: px2vw(40), xl: '40px' }}
                  cursor="pointer"
                />
              </Flex>
              <Text
                mt={{ base: px2vw(10), xl: '10px' }}
                textStyle="12"
                fontWeight="normal"
                textAlign="center"
              >
                {walletItem?.name}
              </Text>
            </Flex>
          )
        })}
      </Flex>
    </Flex>
  )
}

export default React.memo(Index)
