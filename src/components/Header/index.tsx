import React, { useRef } from 'react'
import { Flex, Image, Text, Box, useOutsideClick, useToast } from '@chakra-ui/react'
import { toast } from 'react-toastify'
import { ChevronDownIcon, ArrowBackIcon } from '@chakra-ui/icons'
import { useToggle } from 'react-use'
import { useRouter } from 'next/router'
import { useTranslation, Trans } from 'next-i18next'
import { completeUrl, formatAdd, isNetRight, changeUrl } from '@/utils/common'
import globalStore from '@/stores/global'
import px2vw from '@/utils/px2vw'
import connectIc from '@/assets/images/connect.png'
import errorIc from '@/assets/images/error.png'
import settingsIc from '@/assets/images/settings.png'
import setInfoIc from '@/assets/images/setInfo.png'
import logoH5 from '@/assets/images/logoH5.png'
import headerBg from '@/assets/images/top-bg.png'
import SideBarPC from '@/components/SideBar'
import SideBar from '@/components/SideBar/mobile'
import SetInfo from '@/components/SetInfo'
import Settings from '@/components/Settings'
import ChangeChain from '@/components/ChangeChain'
import ChangeChainH5 from '@/components/ChangeChain/mobile'
import ConnectWallet from '@/components/ConnectWallet'
import ConnectWalletH5 from '@/components/ConnectWallet/mobile'
import Link from '@/components/Link'
import Modal from '@/components/Modal'
import { netconfigs, CHAINS, ChainInfo } from '@/consts/network'
import { ROUTES } from '@/consts/routes'
import { WalletEnum, NetEnum, crossNet } from '@/consts'
import { wallet, IWallet } from '@/utils/wallet'
import { setStore } from '@/utils/storage'
import { isMobile } from 'react-device-detect'

function Index() {
  const router = useRouter()
  const toast1 = useToast()
  const { t } = useTranslation()
  const { isLogin, userAddress, connectNet, walletType } = globalStore()
  const [isOpen, setOpen] = useToggle(false)
  const [isSettings, setSettings] = useToggle(false)
  const [chainVisible, setChainVisible] = useToggle(false)
  const [connectVisible, setConnectVisible] = useToggle(false)
  const [chainVisibleH5, setChainVisibleH5] = useToggle(false)
  const [connectVisibleH5, setConnectVisibleH5] = useToggle(false)
  const [settingsVisible, setSettingsVisible] = useToggle(false)

  const ref: any = useRef()
  useOutsideClick({
    ref: ref,
    handler: () => setSettingsVisible(false),
  })

  const changeChain = async () => {
    try {
      if (walletType !== WalletEnum.metamask) {
        toast.warn(t('Change Chain Tips'), {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
          theme: 'colored',
        })
        return false
      }
      const chooseWallet = wallet[walletType]
      const curConfig = netconfigs[connectNet as NetEnum]
      if (chooseWallet?.isHasWallet()) {
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
              // 不存在该网络
              addFun(chooseWallet)
            }
          }
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

  const changeFun = (chain: NetEnum) => {
    setStore('lastChain', chain)
    let newUrl = `${window?.location?.origin}${window?.location?.pathname}${changeUrl(
      router.query,
      'chain',
      chain
    )}`
    if (router.pathname === '/cross' && !crossNet.includes(chain)) {
      // 如果当前为跨链页面且切换过去的链不支持跨链则跳转到首页
      newUrl = `${window?.location?.origin}/markets?chain=${chain}`
    }
    window.open(newUrl, '_self')
  }

  const addFun = async (chooseWallet: IWallet) => {
    try {
      const curConfig = netconfigs[connectNet as NetEnum]
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
      toast1({
        status: 'error',
        title: t('Wallet Unsupprted'),
        position: 'top',
        duration: 5000,
        isClosable: false,
      })
    }
  }
  return (
    <>
      {/* pc端 */}
      <Flex
        as="header"
        display={{ base: 'none', xl: 'flex' }}
        justifyContent="space-between"
        pos="relative"
        zIndex="99"
        h="20px"
        w="full"
        p="50px 0"
        alignItems="center"
      >
        {/* menu */}
        <SideBarPC />
        <Flex>
          {/* change chain */}
          <Flex alignItems="center" h="100%" p="0 30px" cursor="pointer" onClick={setChainVisible}>
            {connectNet && (
              <Image
                ignoreFallback
                w="20px"
                h="20px"
                mr="3px"
                src={CHAINS.find((it: ChainInfo) => it.key === connectNet)?.iconEntity}
              />
            )}
            <Text fontWeight="500">{netconfigs[connectNet as NetEnum]?.networkName}</Text>
            <Modal
              isOpen={chainVisible}
              hasBg={false}
              width={375}
              padding={0}
              onClose={() => setChainVisible(false)}
            >
              <ChangeChain onClose={() => setChainVisible(false)} />
            </Modal>
          </Flex>
          {/* connect */}
          <Flex
            alignItems="center"
            h="100%"
            p="0 30px"
            borderLeft="1px solid"
            borderColor="gray.70"
            cursor="pointer"
          >
            {isLogin ? (
              isNetRight() ? (
                <Text>{formatAdd(userAddress)}</Text>
              ) : (
                <Flex direction="column" alignItems="center" cursor="pointer" onClick={changeChain}>
                  <Flex alignItems="center">
                    <Image ignoreFallback src={errorIc} w="14px" h="14px" mr="5px" />
                    <Text color="red.200" textStyle="14">
                      {t('Wallet Network')}
                    </Text>
                  </Flex>
                  <Text color="red.200" textStyle="14">
                    {t('Configuration Error')}
                  </Text>
                </Flex>
              )
            ) : (
              <Flex alignItems="baseline" onClick={setConnectVisible}>
                <Image ignoreFallback src={connectIc} w="14px" h="14px" mr="5px" />
                <Text color="red.200" textStyle="14">
                  {t('Connect Wallet')}
                </Text>
              </Flex>
            )}
            <Modal
              isOpen={connectVisible}
              hasBg={false}
              width={375}
              padding={0}
              hasCloseButton={true}
              onClose={() => setConnectVisible(false)}
            >
              <ConnectWallet onClose={() => setConnectVisible(false)} />
            </Modal>
          </Flex>
          {/* settins */}
          <Flex
            pos="relative"
            alignItems="center"
            h="100%"
            p="0 25px"
            borderLeft="1px solid"
            borderColor="gray.70"
            cursor="pointer"
          >
            <Image ignoreFallback src={settingsIc} w="16px" h="16px" onClick={setSettingsVisible} />
            {settingsVisible && (
              <Box ref={ref}>
                <Settings pos="absolute" top="50px" right="0" />
              </Box>
            )}
          </Flex>
        </Flex>
      </Flex>
      {/* 移动端 */}
      <Box
        as="header"
        display={{ base: 'initial', xl: 'none' }}
        position="fixed"
        top="0"
        zIndex="1401"
        w="full"
        h={px2vw(70)}
        bg={`url(${headerBg}) no-repeat bottom center`}
        backgroundSize={`100vw ${px2vw(70)}`}
      >
        <Flex
          w="full"
          h={px2vw(46)}
          p={`0 ${px2vw(15)}`}
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex h="100%" alignItems="center">
            <Link href="/">
              <Image src={logoH5} w={px2vw(46)} h={px2vw(41)} mr={px2vw(10)} />
            </Link>
            {/* 页面切换 */}
            {router.pathname === '/marketinfo' ? (
              <Flex
                alignItems="center"
                h="100%"
                p={`0 ${px2vw(7)} 0 ${px2vw(5)}`}
                borderRadius=" 0 0 15px 15px "
                bgColor="gray.300"
                onClick={() => router.back()}
              >
                <ArrowBackIcon w={px2vw(20)} h={px2vw(20)} mr={px2vw(5)} />
                <Text fontWeight="bold">{t('Return')}</Text>
              </Flex>
            ) : ROUTES.find((it) => router.pathname.includes(it?.path)) ? (
              <Flex
                alignItems="center"
                h="100%"
                p={`0 0 0 ${px2vw(7)}`}
                borderRadius=" 0 0 15px 15px "
                bgColor="gray.300"
                onClick={setOpen}
              >
                <Trans>{ROUTES.find((it) => router.pathname.includes(it?.path))?.name}</Trans>
                <ChevronDownIcon w={px2vw(24)} h={px2vw(24)} />
              </Flex>
            ) : null}
          </Flex>
          {/* 网络切换、钱包链接 */}
          <Flex>
            {isLogin ? (
              isNetRight() ? (
                <Flex onClick={setChainVisibleH5}>
                  <Image
                    ignoreFallback
                    w={px2vw(20)}
                    h={px2vw(20)}
                    mr={px2vw(3)}
                    src={completeUrl(`chain-entity/${connectNet}.png`)}
                  />
                  <Text>{formatAdd(userAddress)}</Text>
                </Flex>
              ) : (
                <Flex direction="column" alignItems="center" onClick={changeChain}>
                  <Flex>
                    <Image
                      ignoreFallback
                      src={completeUrl(`chain-red/${connectNet}.png`)}
                      w={px2vw(14)}
                      h={px2vw(14)}
                      mr={px2vw(5)}
                    />
                    <Text color="red.200" textStyle="14">
                      {t('Wallet Network')}
                    </Text>
                  </Flex>
                  <Text color="red.200" textStyle="14">
                    {t('Configuration Error')}
                  </Text>
                </Flex>
              )
            ) : (
              <Flex alignItems="center" onClick={setConnectVisibleH5}>
                <Image ignoreFallback src={connectIc} w={px2vw(14)} h={px2vw(14)} mr={px2vw(5)} />
                <Text color="red.200" textStyle="14">
                  {t('Connect Wallet')}
                </Text>
              </Flex>
            )}
          </Flex>
          {/* 设置 */}
          <Image src={setInfoIc} w={px2vw(16)} h={px2vw(16)} ml={px2vw(15)} onClick={setSettings} />
          {/* 页面菜单 */}
          <SideBar isOpen={isOpen} onClose={() => setOpen(false)} />
          {/* 切换网络 */}
          <ChangeChainH5 isOpen={chainVisibleH5} onClose={() => setChainVisibleH5(false)} />
          {/* 链接钱包 */}
          <ConnectWalletH5 isOpen={connectVisibleH5} onClose={() => setConnectVisibleH5(false)} />
          {/* 设置和公共信息 */}
          <SetInfo isOpen={isSettings} onClose={() => setSettings(false)} />
        </Flex>
      </Box>
    </>
  )
}

export default React.memo(Index)
