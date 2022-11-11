import React, { useState } from 'react'
import { Flex, Image, Text, Box, RadioGroup, Radio, Input } from '@chakra-ui/react'
import { toast } from 'react-toastify'
import { useToggle } from 'react-use'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'
import px2vw from '@/utils/px2vw'
import { NetEnum, WalletEnum, crossNet } from '@/consts'
import { CHAINS, netconfigs } from '@/consts/network'
import globalStore from '@/stores/global'
import { wallet, IWallet } from '@/utils/wallet'
import BaseButton from '@/components/BaseButton'
import { setStore } from '@/utils/storage'
import { changeUrl } from '@/utils/common'

interface IProps {
  onClose: () => void
}

function Index({ onClose }: IProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { connectNet, walletType } = globalStore()
  const [curChain, setChain] = useState(connectNet)
  const [customNode, setCustom] = useState('')
  const [isOpen] = useToggle(false)
  const changeChain = async (chain: NetEnum) => {
    try {
      const curConfig = netconfigs[chain]
      const chainInfo = CHAINS.find((it) => it?.key === chain)
      if (chainInfo?.defaultWallet !== walletType) {
        await setStore('walletType', chainInfo?.defaultWallet)
        changeFun(chain)
        return
      }
      const chooseWallet = wallet[walletType as WalletEnum]
      if (chooseWallet?.isHasWallet()) {
        if (isMobile) {
          await onClose()
          await setStore('lastChain', chain)
          addFun(chooseWallet, chain)
        } else {
          try {
            await chooseWallet?.provider()?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${curConfig?.ChainId.toString(16)}` }],
            })
            changeFun(chain)
          } catch (switchError: any) {
            if (switchError?.code === 4902) {
              // 不存在该网络
              addFun(chooseWallet, chain)
            }
          }
        }
      } else {
        if (chooseWallet?.link) {
          window.open(chooseWallet?.link, '_blank')
        } else {
          toast.warn(t('Install Wallet'), {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: true,
            theme: 'colored',
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const changeFun = async (chain: NetEnum) => {
    await setChain(chain)
    await setStore('lastChain', chain)
    let newUrl = `${window?.location?.origin}${window?.location?.pathname}${changeUrl(
      router.query,
      'chain',
      chain
    )}`
    if (router.pathname === '/cross' && !crossNet.includes(chain)) {
      // 如果当前为跨链页面且切换过去的链不支持跨链则跳转到首页
      newUrl = `${window?.location?.origin}/markets?chain=${chain}`
    }
    // window.open(newUrl, '_self')
    window.location.href = newUrl
  }

  const addFun = async (chooseWallet: IWallet, chain: NetEnum) => {
    try {
      const curConfig = netconfigs[chain]
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
      changeFun(chain)
    } catch (addError: any) {
      console.log('addEthereumChain Error:' + addError?.message)
    }
  }
  return (
    <Flex
      direction="column"
      alignItems="center"
      w={{ base: 'full', xl: '375px' }}
      p={{ base: `${px2vw(15)} 0 ${px2vw(27)}`, xl: '15px 0 27px' }}
      bg="bg"
      borderRadius={{ base: 0, xl: 'xl' }}
    >
      {CHAINS.map((item) => (
        <Flex
          key={item?.name}
          direction="column"
          w="full"
          onClick={() => changeChain(item?.key)}
          pos="relative"
          cursor="pointer"
          pl={{ base: px2vw(123), xl: '123px' }}
          py={{ base: px2vw(10), xl: '10px' }}
          bg={curChain === item?.key && isOpen ? 'gray.200' : 'transparent'}
        >
          <Flex alignItems="center" opcity={curChain === item?.key ? 1 : 0.3}>
            {curChain === item?.key && (
              <Box
                pos="absolute"
                left={{ base: px2vw(103), xl: '103px' }}
                w={{ base: px2vw(6), xl: '6px' }}
                h={{ base: px2vw(6), xl: '6px' }}
                borderRadius="round"
                bg="green.500"
              />
            )}
            <Image
              ignoreFallback
              src={item?.iconEntity}
              w={{ base: px2vw(30), xl: '30px' }}
              h={{ base: px2vw(30), xl: '30px' }}
              mr={{ base: px2vw(10), xl: '10px' }}
            />
            <Text fontSize={{ base: px2vw(18), xl: '18px' }}>{item?.name}</Text>
            {/* {curChain === item?.key && (
              <Flex
                pos="absolute"
                right={{ base: px2vw(77), xl: '77px' }}
                textStyle="12"
                fontWeight="bold"
              >
                • Global-28&nbsp;<Text fontWeight="normal">4.1ms</Text>
              </Flex>
            )} */}
            {/* {curChain === item?.key &&
              (isOpen ? (
                <ChevronDownIcon
                  pos="absolute"
                  right={{ base: px2vw(20), xl: '20px' }}
                  w={{ base: px2vw(20), xl: '20px' }}
                  h={{ base: px2vw(20), xl: '20px' }}
                  onClick={setOpen}
                />
              ) : (
                <ChevronRightIcon
                  pos="absolute"
                  right={{ base: px2vw(20), xl: '20px' }}
                  w={{ base: px2vw(20), xl: '20px' }}
                  h={{ base: px2vw(20), xl: '20px' }}
                  onClick={setOpen}
                />
              ))} */}
          </Flex>
          {curChain === item?.key && isOpen && (
            <Flex direction="column">
              <RadioGroup
                defaultValue="1"
                p={{ base: `${px2vw(5)} ${px2vw(10)}`, xl: '5px 10px' }}
                outline="none"
              >
                <Radio
                  value="1"
                  w="50%"
                  mt={{ base: px2vw(15), xl: '15px' }}
                  colorScheme="purple.300"
                  borderColor="purple.300"
                  _focus={{
                    boxShadow: 'none',
                  }}
                >
                  <Flex textStyle="12" fontWeight="bold">
                    Global&nbsp;<Text fontWeight="normal">4.1ms</Text>
                  </Flex>
                </Radio>
                <Radio
                  value="2"
                  w="50%"
                  mt={{ base: px2vw(15), xl: '15px' }}
                  colorScheme="purple.300"
                  borderColor="purple.300"
                  _focus={{
                    boxShadow: 'none',
                  }}
                >
                  <Flex textStyle="12" fontWeight="bold">
                    Global-2&nbsp;<Text fontWeight="normal">2.2ms</Text>
                  </Flex>
                </Radio>
                <Radio
                  value="3"
                  w="50%"
                  mt={{ base: px2vw(15), xl: '15px' }}
                  colorScheme="purple.300"
                  borderColor="purple.300"
                  _focus={{
                    boxShadow: 'none',
                  }}
                >
                  <Flex textStyle="12" fontWeight="bold">
                    APAC&nbsp;<Text fontWeight="normal">4.1ms</Text>
                  </Flex>
                </Radio>
                <Radio
                  value="0"
                  w="50%"
                  mt={{ base: px2vw(15), xl: '15px' }}
                  color="purple.300"
                  colorScheme="purple.300"
                  borderColor="purple.300"
                  _focus={{ boxShadow: 'none' }}
                >
                  <Flex textStyle="12" fontWeight="bold">
                    Global-28&nbsp;<Text fontWeight="normal">4.1ms</Text>
                  </Flex>
                </Radio>
              </RadioGroup>
              {/* custom */}
              <Flex
                alignItems="center"
                justifyContent="space-between"
                w={{ base: px2vw(305), xl: 'full' }}
                mt={{ base: px2vw(26), xl: '10px' }}
              >
                <Radio
                  value="0"
                  outline="none"
                  colorScheme="purple.300"
                  borderColor="purple.300"
                  _focus={{
                    boxShadow: 'none',
                  }}
                >
                  Custom:
                </Radio>
                <Input
                  value={customNode}
                  onChange={(e) => setCustom(e.target.value)}
                  ml={{ base: px2vw(5), xl: '5px' }}
                  w={{ base: px2vw(264), xl: '264px' }}
                  h={{ base: px2vw(20), xl: '20px' }}
                  py={{ base: px2vw(4), xl: '4px' }}
                  px={{ base: px2vw(5), xl: '5px' }}
                  color="rgba(255, 255, 255, 0.5)"
                  textStyle="14"
                  fontWeight="normal"
                  bg="gray.400"
                  borderRadius="input"
                  placeholder="Input URL ...            Tap here to patse"
                  _placeholder={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    textStyle: '12',
                  }}
                />
              </Flex>
            </Flex>
          )}
        </Flex>
      ))}
      <BaseButton
        needVerify={false}
        isCircular={true}
        buttonType="close"
        minW="inherit"
        w={{ base: px2vw(46), xl: '46px' }}
        h={{ base: px2vw(46), xl: '46px' }}
        mt={{ base: px2vw(10), xl: '10px' }}
        bgColor="purple.700"
        iconStyle={{
          w: { base: px2vw(17), xl: '17px' },
          h: { base: px2vw(17), xl: '17px' },
        }}
        buttonClick={onClose}
      />
    </Flex>
  )
}

export default React.memo(Index)
