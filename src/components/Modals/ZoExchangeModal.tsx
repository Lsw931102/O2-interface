import { Box, Center, Flex, HStack, Image, Stack, Text, VStack } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { BigNumber } from 'bignumber.js'

import Modal, { IModalProps } from '@/components/Modal'
import NumberTips from '@/components/NumberTips'
import BaseButton from '@/components/BaseButton'

import zoSwapStore from '@/stores/contract/zoSwap'
import px2vw from '@/utils/px2vw'

import { ERC20Abi, zoSwapAbi } from '@/contracts/abis'

import zoLogo from '@/assets/images/zoLogo.png'
import maskZo from '@/assets/images/maskZo.png'
import fluxGray from '@/assets/images/fluxGray.png'
import zoGray from '@/assets/images/zoGray.png'
import zoToken from '@/assets/images/zoToken.png'
import fluxToken from '@/assets/images/fluxToken.png'
import onlyArrow from '@/assets/images/svg/onlyArrow.svg'
import buttonCancel from '@/assets/images/svg/buttonCancel.svg'
import useSendTransaction from '@/hooks/useSendTransaction'
import { getWalletContract } from '@/contracts'
import { maxUint256 } from '@/consts'
import globalStore from '@/stores/global'
import { buttonHover } from '@/theme/utils'

const detailLink =
  'https://snapshot.org/#/flux-bsc.eth/proposal/0x49704d4493dfbc605e36536e4dcac617f04a25a560716882ba6166447cae0fc6'

function Index(props: Omit<IModalProps, 'children'>) {
  const { t } = useTranslation('common')
  const { isPC, isLogin } = globalStore()
  const { info, getInfo, zoSwapAddress, fluxTokenAddress } = zoSwapStore()
  const [isLoading, setIsLoading] = useState(false)
  const { sendTransaction } = useSendTransaction()
  useEffect(() => {
    if (props.isOpen) {
      getInfo()
    }
  }, [getInfo, props.isOpen])

  const zoAmout = useMemo(() => {
    return new BigNumber(info?.swapInfo?.zoPerFlux10K.toString())
      .times(new BigNumber(info?.userInfo?.fluxBalance.toString()))
      .div(10 ** 18)
      .div(10 ** 4)
      .toString()
  }, [info?.swapInfo?.zoPerFlux10K, info?.userInfo?.fluxBalance])

  // 0未加载数据，1流动性大于兑换的zo,2小于
  const isBiggerZoBalance = useMemo(() => {
    if (!info) return 0
    const isGreater = new BigNumber(
      new BigNumber(info?.swapInfo?.zoBalance.toString()).div(10 ** 18).toString()
    ).gte(new BigNumber(zoAmout).toString())
    return isGreater ? 1 : 2
  }, [info, zoAmout])

  // 按钮disabled
  const conformDisabled = useMemo(() => {
    // 超过流动性
    if (isBiggerZoBalance !== 1) return true
    // 流动性余额为0
    if (
      new BigNumber(
        new BigNumber(info?.swapInfo?.zoBalance.toString()).div(10 ** 18).toString()
      ).eq(0)
    ) {
      return true
    }
    //flux余额为0
    if (
      new BigNumber(
        new BigNumber(info?.userInfo?.fluxBalance.toString()).div(10 ** 18).toString()
      ).eq(0)
    ) {
      return true
    }
    return false
  }, [info?.swapInfo?.zoBalance, info?.userInfo?.fluxBalance, isBiggerZoBalance])

  // 是否授权
  const isApproved = useMemo(() => {
    if (!info) return true
    if (!isLogin) return true
    //FLUX钱包余额小于 FLUX账户授权额
    const isGreater = new BigNumber(
      new BigNumber(info?.userInfo.fluxBalance.toString()).toString()
    ).lt(new BigNumber(info?.userInfo.fluxAllownace.toString()).toString())
    return isGreater
  }, [info, isLogin])

  const handleApproved = () => {
    setIsLoading(true)
    // TODO:切换成配置中的flux地址

    const underlyingContract = getWalletContract(fluxTokenAddress as string, ERC20Abi)

    sendTransaction(
      {
        contract: underlyingContract,
        method: 'approve',
        args: [zoSwapAddress, maxUint256],
        action: 'approve',
      },
      (res) => {
        setIsLoading(false)
        if (!res?.err) {
          getInfo()
          // completeCallBack && completeCallBack()
        }
      },
      () => {
        // TODO:
        return ''
      }
    )
  }

  const handleSwap = () => {
    setIsLoading(true)
    const market = getWalletContract(zoSwapAddress as string, zoSwapAbi)
    sendTransaction(
      { contract: market, method: 'swap', action: 'swap' },
      (res) => {
        setIsLoading(false)
        if (!res?.err) {
          // 交易完成
          getInfo()
          props.onClose()
          // onConfirm ? onConfirm() : onClose && onClose()
          // PubSub.publish('transactionComplete')
          // setInputValue(0)
          // useDashboardModalContext?.getLoanPoolMeta && useDashboardModalContext?.getLoanPoolMeta()
        }
      },
      () => {
        // const item: any = {
        //   date: Date.now(),
        //   type: TxType.supply,
        //   mark: TxMark.lending,
        //   symbol: record?.symbol,
        //   num: inputValue,
        //   hash,
        //   status: Status.loading,
        // }
        // addHistory(item)
      }
    )
  }

  return (
    <Modal
      // isOpen={true}
      // onClose={() => {
      //   console.log(1)
      // }}
      width={isPC ? 600 : 355}
      padding={0}
      {...props}
    >
      <Center
        position="relative"
        flexDirection="column"
        paddingTop={{ base: px2vw(83), xl: '146px' }}
      >
        <Image
          zIndex={1}
          position="absolute"
          src={zoLogo}
          width={{ base: px2vw(80), xl: '148px' }}
          top={{ base: px2vw(-15), xl: '-40px' }}
          left={{ base: `calc(50% - ${px2vw(40)})`, xl: `calc(50% - 74px)` }}
        />
        <Image
          position="absolute"
          src={maskZo}
          width={{ base: '100%', xl: '600px' }}
          top={{ base: px2vw(1), xl: '0px' }}
          left={{ base: '-2px', xl: '-2px' }}
        />
        <Center flexDirection="column" padding={{ base: `0 ${px2vw(29)}`, xl: '0 50px' }}>
          <HStack spacing={{ base: px2vw(10), xl: '10px' }} color="purple.300">
            <Text textStyle="18">{t('Exchange')}</Text>
            <Image width={{ base: px2vw(24), xl: '24px' }} src={fluxGray} ignoreFallback />
            <Text textStyle="24" fontWeight="bold">
              FLUX
            </Text>
            <Text>{t('for')}</Text>
            <Image src={zoGray} ignoreFallback width={{ base: px2vw(24), xl: '24px' }} />
            <Text textStyle="24" fontWeight="bold">
              ZO
            </Text>
          </HStack>
          <HStack
            textStyle="18"
            color={isBiggerZoBalance === 2 ? 'red.200' : 'silver.200'}
            marginTop={{ base: px2vw(5), xl: '15px' }}
            marginBottom={{ base: px2vw(20), xl: '40px' }}
          >
            <Text>{t('ZO Liquidity')}: </Text>
            <Text textStyle="18">
              {info?.swapInfo?.zoBalance ? (
                <NumberTips
                  toolTipProps={{
                    isDisabled: true,
                  }}
                  value={new BigNumber(info?.swapInfo?.zoBalance.toString())
                    .div(10 ** 18)
                    .toString()}
                />
              ) : (
                '--'
              )}
            </Text>
          </HStack>

          <Stack
            display={{ base: 'none', xl: 'inherit' }}
            direction={{ base: 'column', xl: 'row' }}
            spacing={{ base: '15px', xl: '15px' }}
            alignItems="center"
          >
            <Center flexDirection="column">
              <Text textStyle="12" marginBottom={{ base: '11px', xl: '11px' }}>
                {t('Your Wallet FLUX Balance')}
              </Text>
              <HStack
                width={{ base: px2vw(220), xl: '220px' }}
                padding={{ base: '10px', xl: '10px' }}
                bgColor="black.500"
                borderRadius="xl"
              >
                <Image width={{ base: '40px', xl: '40px' }} src={fluxToken} ignoreFallback></Image>
                <Text flex={1} textAlign="center" textStyle="18">
                  {info?.userInfo?.fluxBalance ? (
                    <NumberTips
                      toolTipProps={{
                        isDisabled: false,
                      }}
                      value={new BigNumber(info?.userInfo?.fluxBalance.toString())
                        .div(10 ** 18)
                        .toString()}
                    />
                  ) : (
                    '--'
                  )}
                </Text>
              </HStack>
            </Center>
            {/* 中间箭头 */}
            <Flex
              marginTop={{ xl: '25px !important' }}
              borderRadius="round"
              height={{ base: px2vw(30), xl: '30px' }}
              width={{ base: px2vw(30), xl: '30px' }}
              backgroundColor="green.100"
            >
              <Image
                display="block"
                src={onlyArrow}
                ignoreFallback
                transform={{ base: 'rotate(90deg)', xl: 'inherit' }}
              />
            </Flex>
            <Center flexDirection="column">
              <Text textStyle="12" marginBottom={{ base: '11px', xl: '11px' }}>
                {t('ZO Amount You Can Exchange')}
              </Text>
              <HStack
                width={{ base: px2vw(220), xl: '220px' }}
                padding={{ base: '10px', xl: '10px' }}
                bgColor="black.500"
                borderRadius="xl"
              >
                <Image width={{ base: '40px', xl: '40px' }} src={zoToken} ignoreFallback></Image>
                <Text flex={1} textAlign="center" textStyle="18">
                  {isBiggerZoBalance !== 0 ? (
                    isBiggerZoBalance === 1 ? (
                      <NumberTips
                        toolTipProps={{
                          isDisabled: false,
                        }}
                        value={zoAmout}
                      />
                    ) : (
                      <Text textStyle="12" textAlign="start" color="red.200">
                        {t('Insufficient ZO liquidity')}
                      </Text>
                    )
                  ) : (
                    '--'
                  )}
                </Text>
              </HStack>
            </Center>
          </Stack>

          <Stack
            display={{ base: 'inherit', xl: 'none' }}
            direction={{ base: 'column', xl: 'row' }}
            spacing={{ base: px2vw(10), xl: '15px' }}
            padding={{ base: px2vw(10) }}
            backgroundColor="black.500"
            alignItems="center"
            borderRadius="xl"
          >
            <Center flexDirection="column">
              <HStack
                width={{ base: px2vw(220), xl: '220px' }}
                padding={{ base: '0', xl: '10px' }}
                borderRadius="xl"
              >
                <Image width={{ base: '40px', xl: '40px' }} src={fluxToken} ignoreFallback></Image>
                <VStack spacing={px2vw(5)} width="100%">
                  <Text textStyle="12" fontSize="12px">
                    {t('Your Wallet FLUX Balance')}
                  </Text>
                  <Text flex={1} textAlign="center" textStyle="18">
                    {info?.userInfo?.fluxBalance ? (
                      <NumberTips
                        toolTipProps={{
                          isDisabled: false,
                        }}
                        value={new BigNumber(info?.userInfo?.fluxBalance.toString())
                          .div(10 ** 18)
                          .toString()}
                      />
                    ) : (
                      '--'
                    )}
                  </Text>
                </VStack>
              </HStack>
            </Center>
            {/* 中间箭头 */}
            <Flex
              marginTop={{ xl: '25px !important' }}
              borderRadius="round"
              justifyContent="center"
              alignItems="center"
              height={{ base: px2vw(30), xl: '30px' }}
              width={{ base: px2vw(30), xl: '30px' }}
              backgroundColor="green.100"
            >
              <Image
                display="block"
                src={onlyArrow}
                ignoreFallback
                transform={{ base: 'rotate(90deg)', xl: 'inherit' }}
              />
            </Flex>
            <Center flexDirection="column">
              <HStack
                width={{ base: px2vw(220), xl: '220px' }}
                padding={{ base: '0', xl: '10px' }}
                borderRadius="xl"
              >
                <Image width={{ base: '40px', xl: '40px' }} src={zoToken} ignoreFallback></Image>
                <VStack spacing={px2vw(5)} width="100%">
                  {isBiggerZoBalance !== 2 && (
                    <Text textStyle="12" fontSize="12px">
                      {t('ZO Amount You Can Exchange')}
                    </Text>
                  )}
                  <Text flex={1} textAlign="center" textStyle="18">
                    {isBiggerZoBalance !== 0 ? (
                      isBiggerZoBalance === 1 ? (
                        <NumberTips
                          toolTipProps={{
                            isDisabled: false,
                          }}
                          value={zoAmout}
                        />
                      ) : (
                        <Text textStyle="12" textAlign="start" color="red.200">
                          {t('Insufficient ZO liquidity')}
                        </Text>
                      )
                    ) : (
                      '--'
                    )}
                  </Text>
                </VStack>
              </HStack>
            </Center>
          </Stack>
          <Text
            width={{ base: px2vw(240), xl: '100%' }}
            height={{ base: px2vw(32), xl: '32px' }}
            lineHeight={{ base: px2vw(32), xl: '32px' }}
            marginTop={{ base: px2vw(10), xl: '20px' }}
            marginBottom={{ base: px2vw(20), xl: '40px' }}
            textStyle="14"
            borderRadius="xl"
            textAlign="center"
            bgColor="black.600"
            color="white"
          >
            1 FLUX ={' '}
            {info?.swapInfo?.zoPerFlux10K ? (
              <NumberTips
                toolTipProps={{
                  isDisabled: false,
                }}
                value={new BigNumber(info?.swapInfo?.zoPerFlux10K.toString())
                  .div(10 ** 4)
                  .toString()}
              />
            ) : (
              '--'
            )}{' '}
            ZO
          </Text>
          <Box
            width={{ base: px2vw(275), xl: '466px' }}
            textStyle={{ base: '12', xl: '14' }}
            fontWeight="normal"
            lineHeight={{ base: px2vw(16), xl: '20px' }}
          >
            <Text display="inline-block" color="purple.300">
              {t('zo Description')}{' '}
              <Text
                display="inline-block"
                color="white"
                textDecoration="underline"
                _hover={buttonHover}
                onClick={() => {
                  window.open(detailLink)
                }}
              >
                {t('View Details')}
              </Text>
            </Text>
          </Box>
          <Flex
            marginTop={{ base: px2vw(20), xl: '40px' }}
            marginBottom={{ base: px2vw(20), xl: '40px' }}
            padding={{ base: `0`, xl: '0 15px' }}
            width="100%"
            justifyContent="space-between"
          >
            <BaseButton
              needVerify={false}
              // buttonClick={onClose}
              h={{ base: px2vw(40), xl: '40px' }}
              w={{ base: px2vw(100), xl: '100px' }}
              minW="initial"
              opacity={0.5}
              specialIcon={
                <Image
                  height={{ base: px2vw(24), xl: '24px' }}
                  width={{ base: px2vw(24), xl: '24px' }}
                  maxWidth="inherit"
                  src={buttonCancel}
                  ignoreFallback
                />
              }
              onClick={() => {
                props.onClose()
              }}
            />

            <BaseButton
              needVerify
              disabled={isLogin && conformDisabled}
              isLoading={isLoading}
              // buttonClick={onClose}
              h={{ base: px2vw(40), xl: '40px' }}
              w={{ base: px2vw(165), xl: '290px' }}
              minW="initial"
              bgColor="green.100"
              buttonClick={() => {
                // 未授权
                if (!isApproved) {
                  handleApproved()
                }
                // 已经授权
                else {
                  handleSwap()
                }
              }}
              text={
                !isApproved
                  ? t('Approved first')
                  : isPC
                  ? t('Confirm to Exchange')
                  : t('ExchangeButton')
              }
            />
          </Flex>
        </Center>
        {/* 按钮组 */}
      </Center>
    </Modal>
  )
}
export default Index
