import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { VStack, Text, Box, Center, HStack, useDisclosure } from '@chakra-ui/react'
import { utils } from 'ethers'
import { useTranslation } from 'next-i18next'
import { BigNumber } from 'bignumber.js'

import { netconfigs } from '@/consts/network'
import { maxUint256, NetEnum } from '@/consts'

import ChooseRefinance from '@/components/ChooseRefinance'
import CrossDeposit from '@/components/CrossDeposit'
import DetailInfo from '@/components/DetailInfo'
import BaseButton from '@/components/BaseButton'
import CrossFromTo from '@/components/CrossFromTo'
import CrossExchangeFee from '@/components/CrossExchangeFee'
import ShowMoreButton from '@/components/ShowMoreButton'
import NumberTips from '@/components/NumberTips'
import HealthFactorCmp from '@/components/HealthFactorCmp'
import Modal from '@/components/Modal'

import globalStore from '@/stores/global'
import crossStore from '@/stores/pages/cross'
import fluxAppStore from '@/stores/contract/fluxApp'

import useGetLoanPoolMeta from '@/hooks/useGetLoanPoolMeta'
import useMarketInfo from '@/hooks/useMarketInfo'
import useSendTransaction from '@/hooks/useSendTransaction'

import { getReadContract, getWalletContract } from '@/contracts/funcs'
import { ERC20Abi, HotpotLensAbi } from '@/contracts/abis'

import { transHotpotOkex } from '@/utils/dataFormat'
import px2vw from '@/utils/px2vw'

import rightArrow from '@/assets/images/svg/rightArrow.svg'
import { buttonHover } from '@/theme/utils'

export interface TextMemoProps {
  color?: string
  tokenText?: string
  buttonText?: string
  inputText?: string
}

function CrossRefinanceForm() {
  const {
    feeType,
    exchangeFee,
    exchangeFeeFlux,
    currentTab,
    amount,
    selectToken,
    selectChain,
    hotpotConfigJson,
    setAmount,
  } = crossStore()
  const { connectNet, userAddress, fluxJson } = globalStore()

  const { borrowBalance } = fluxAppStore()
  const { t } = useTranslation(['cross'])
  const {
    isOpen: warnModalIsOpen,
    onClose: warnModalOnClose,
    onOpen: warnModalOnOpen,
  } = useDisclosure()
  const { sendTransaction: refinanceTrans } = useSendTransaction()
  const { sendTransaction: borrowTrans } = useSendTransaction()
  const { sendTransaction: fluxApprove } = useSendTransaction()
  const { info, getLoanPoolMeta, setInfo } = useGetLoanPoolMeta(selectToken, false)
  const { getHealthFactor } = useMarketInfo(info || {}, amount)
  //   const [feeType, setFeeType] = useState(1) // 手续费类型，默认0为flux
  const [loading, setLoading] = useState(false)
  const [fluxError, setFluxError] = useState('') //判断手续费是不是不够
  const [liquidity, setLiquidity] = useState<any>(null)

  const modalType = useMemo(() => {
    return {
      forbid: t('Health factor is less than 115% after withdraw'),
      warn: t('Health factor is less than 120%, are you sure to continue?'),
    }
  }, [t])

  const healthFactor = useMemo(() => {
    return getHealthFactor('withdraw')
  }, [getHealthFactor])

  const healthFactorBorrow = useMemo(() => {
    return getHealthFactor('borrow')
  }, [getHealthFactor])

  const errorInfo = useMemo(() => {
    if (amount === '' || !connectNet) {
      return ''
    }

    if (
      info?.userWithdrawLimit &&
      amount >
        new BigNumber(
          utils.formatUnits(info?.userWithdrawLimit.toString(), info?.decimals)
        ).toNumber()
    ) {
      return t('Insufficient deposit balance')
    }

    if (feeType === 1 && new BigNumber(exchangeFee).toNumber() > amount) {
      return t('input amount too small')
    }
    if (liquidity && new BigNumber(amount).gt(liquidity)) {
      return t('Insufficient  pool liquidity')
    }
    if (healthFactor?.finalValue < (netconfigs[connectNet as NetEnum] as any)?.healthLimit) {
      return modalType.forbid
    }

    if (
      healthFactor?.finalValue < 1.2 &&
      healthFactor?.finalValue > (netconfigs[connectNet as NetEnum] as any)?.healthLimit
    ) {
      return modalType.warn
    }
    if (fluxError && feeType === 0) {
      return (
        <Text
          width="100%"
          textStyle="14"
          textAlign="center"
          color="red.200"
          marginTop={{ base: px2vw(15), xl: '15px' }}
        >
          {fluxError}{' '}
          <Text
            display="inline"
            width="100%"
            textStyle="14"
            textAlign="center"
            color="white"
            marginTop={{ base: px2vw(15), xl: '15px' }}
            _hover={buttonHover}
            onClick={() => {
              window.open(netconfigs?.[connectNet as NetEnum]?.swapUrl as any)
            }}
          >
            {t('exchange')}
          </Text>{' '}
          Flux
        </Text>
      )
    }
  }, [
    amount,
    connectNet,
    exchangeFee,
    feeType,
    fluxError,
    healthFactor?.finalValue,
    info?.decimals,
    info?.userWithdrawLimit,
    liquidity,
    modalType.forbid,
    modalType.warn,
    t,
  ])

  const errorInfoBorrow = useMemo(() => {
    if (amount === '') {
      return ''
    }

    if (
      info?.userBorrowLimit &&
      amount >
        Number(utils.formatUnits(info?.userBorrowLimit.toString(), info?.decimals).toString())
    ) {
      return t('Insufficient borrow balance')
    }
    if (feeType === 1 && Number(exchangeFee) > amount) {
      return t('input amount too small')
    }
    if (liquidity && new BigNumber(amount).gt(liquidity)) {
      return t('Insufficient  pool liquidity')
    }
    if (fluxError && feeType === 0) {
      return (
        <Text
          width="100%"
          textStyle="14"
          textAlign="center"
          color="red.200"
          marginTop={{ base: px2vw(15), xl: '15px' }}
        >
          {fluxError}{' '}
          <Text
            display="inline"
            width="100%"
            textStyle="14"
            textAlign="center"
            color="white"
            marginTop={{ base: px2vw(15), xl: '15px' }}
            _hover={buttonHover}
            onClick={() => {
              window.open(netconfigs?.[connectNet as NetEnum]?.swapUrl as any)
            }}
          >
            {t('exchange')}
          </Text>{' '}
          Flux
        </Text>
      )
    }
  }, [
    amount,
    connectNet,
    exchangeFee,
    feeType,
    fluxError,
    info?.decimals,
    info?.userBorrowLimit,
    liquidity,
    t,
  ])

  const crossLimit = useMemo(() => {
    if (!info || !exchangeFee || !liquidity || !selectChain) {
      return {
        fee: 0,
        minLimit: 0,
        maxLimit: 0,
        timeAmount: 0,
      }
    }
    const fee = new BigNumber(exchangeFee).toString()
    const minLimit = new BigNumber(exchangeFee).toString()
    const maxLimit = new BigNumber(Number(liquidity)).toString()
    const timeAmount = new BigNumber(
      1000000 / Number(utils.formatUnits(info?.underlyingPrice.toString(), 18).toString())
    ).toString()
    return {
      fee: fee || 0,
      minLimit: minLimit || 0,
      maxLimit: maxLimit || 0,
      timeAmount: timeAmount || 0,
    }
  }, [exchangeFee, info, liquidity, selectChain])

  const warnInfos = useMemo(() => {
    return [
      <Text key="1">
        1.{t('the cross-chain handling fee')}{' '}
        {crossLimit?.fee ? (
          <NumberTips toolTipProps={{ isDisabled: false }} value={crossLimit?.fee} />
        ) : (
          '--'
        )}{' '}
        {info?.symbol || ''}
      </Text>,
      <Text key="2">
        2.{t('The minimum cross-chain')}{' '}
        {crossLimit?.minLimit ? (
          <NumberTips toolTipProps={{ isDisabled: false }} value={crossLimit?.minLimit} />
        ) : (
          '--'
        )}{' '}
        {info?.symbol || ''},{t('while the maximum cross-chain is')}{' '}
        {crossLimit?.maxLimit ? (
          <NumberTips toolTipProps={{ isDisabled: false }} value={crossLimit?.maxLimit} />
        ) : (
          '--'
        )}{' '}
        {info?.symbol || ''}
      </Text>,
      <Text key="3">
        3.{t('The arrival time of small cross-chain account')}{' '}
        {crossLimit.timeAmount ? (
          <NumberTips toolTipProps={{ isDisabled: false }} value={crossLimit.timeAmount} />
        ) : (
          '--'
        )}{' '}
        {info?.symbol || ''} {t('is 12 hours')}
      </Text>,
      // `1.${t('the cross-chain handling fee', {
      //   fee: crossLimit?.fee,
      //   symbol: info?.symbol || '',
      // })}`,
      // `2.${t('The minimum cross-chain', {
      //   minLimit: crossLimit?.minLimit,
      //   maxLimit: crossLimit?.maxLimit,
      //   symbol: info?.symbol || '',
      // })}`,
      // `3.${t('The arrival time of small cross-chain account', {
      //   amount: crossLimit.timeAmount,
      //   symbol: info?.symbol || '',
      // })}`,
    ]
  }, [crossLimit?.fee, crossLimit?.maxLimit, crossLimit?.minLimit, crossLimit.timeAmount, info, t])

  const fluxCheck = async () => {
    // 若交易手续费为flux检查flux授权额度以及flux额度是否足够
    if (!feeType) {
      try {
        const fluxContract = getReadContract(
          fluxJson?.[connectNet as string]?.contracts['FLUX'],
          ERC20Abi
        )

        const fluxAllowance = await fluxContract?.allowance(
          userAddress,
          fluxJson?.[connectNet as string]?.contracts['FluxCrossHandler']
        )
        const fluxBalance = await fluxContract?.balanceOf(userAddress)

        if (
          new BigNumber(utils.formatUnits(fluxBalance.toString(), 18).toString()).lt(
            new BigNumber(exchangeFeeFlux)
          )
        ) {
          setFluxError(t('The flux balance is less than the handling fee'))
          return
        }
        if (
          new BigNumber(utils.formatUnits(fluxAllowance.toString(), 18).toString()).lt(
            new BigNumber(exchangeFeeFlux)
          )
        ) {
          try {
            const contract = getWalletContract(
              fluxJson?.[connectNet as string]?.contracts['FLUX'],
              ERC20Abi
            )
            // flux授权额度不足
            fluxApprove(
              {
                contract: contract,
                method: 'approve',
                args: [fluxJson?.[connectNet as string]?.contracts?.FluxCrossHandler, maxUint256],
                action: 'approve',
              },
              (res) => {
                setLoading(false)
                if (!res?.err) {
                  // 授权完成
                  setFluxError('')
                  return true
                } else {
                  setFluxError('TODO')

                  return false
                }
              },
              () => {
                // const item = {
                //   date: Date.now(),
                //   type: TxType.approve,
                //   mark: TxMark.lending,
                //   symbol: 'FLUX',
                //   hash,
                //   status: Status.success,
                // }
                // addHistory(item)
              }
            )
          } catch (err) {
            setFluxError('TODO')
            console.log(err)
            setLoading(false)
          }
        } else {
          setFluxError('')
          return true
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      setFluxError('')
      return true
    }
  }

  // 获取跨链手续费
  const getCrossFee = async () => {
    const netTokens = hotpotConfigJson?.gateways?.[transHotpotOkex(connectNet as NetEnum)]

    if (
      netTokens?.length &&
      netTokens.find(
        (it: any) => it?.tokenAddress?.toUpperCase() === info?.underlying?.toUpperCase()
      )
    ) {
      try {
        const curToken = hotpotConfigJson?.gateways?.[
          transHotpotOkex(connectNet as NetEnum)?.replace('Test', '')
        ]?.find((it: any) => it?.tokenAddress?.toUpperCase() === info?.underlying?.toUpperCase())
        const contract = getReadContract(
          hotpotConfigJson?.networks?.[transHotpotOkex(connectNet as NetEnum)?.replace('Test', '')]
            ?.hotpotLens,
          HotpotLensAbi
        )

        const res = await contract?.getGatewayMeta(
          curToken?.gateways?.find(
            (it: any) => it?.chain === transHotpotOkex(selectChain?.key).replace('Test', '')
          )?.gateway,
          userAddress
        )

        crossStore.setState({
          exchangeFee: utils.formatUnits(res?.feeToken?.toString(), info?.decimals).toString(),
          exchangeFeeFlux: utils.formatUnits(res?.feeFlux?.toString(), 18).toString(),
        })
      } catch (err) {
        console.log(err)
      }
    }
  }

  // 跨链借款
  const borrow = useCallback(() => {
    setLoading(true)
    try {
      // 调用跨链调仓方法
      const contract = getWalletContract(selectToken?.address, [
        'function crossBorrow(uint64 tragetChainId,uint256 amount,uint256 maxFluxFee) external payable',
      ])

      borrowTrans(
        {
          contract: contract,
          method: 'crossBorrow',
          args: [
            netconfigs[selectChain?.key]?.ChainId,
            new BigNumber(amount).times(10 ** selectToken?.decimals).toString(),
            feeType ? 0 : new BigNumber(exchangeFeeFlux).times(1e18).toString(),
          ],
          // value: new BigNumber(crossChainFee).times(1e18).times(1.05).toFixed(0).toString(),
          action: 'crossBorrow',
        },
        (res) => {
          setLoading(false)
          if (!res?.err) {
            // PubSub.publish('transactionComplete')
            getLoanPoolMeta()
            setInfo(null)
            crossStore.setState({
              currentTab: 'borrow',
              selectToken: null,
              selectChain: null,
              amount: '',
              chainList: null,
              feeType: 0,
              exchangeFee: '',
              exchangeFeeFlux: '',
            })
          }
        },
        () => {
          // addHistory(item as any)
        }
      )
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    amount,
    borrowTrans,
    exchangeFeeFlux,
    feeType,
    getLoanPoolMeta,
    selectChain?.key,
    selectToken?.address,
    selectToken?.decimals,
  ])

  // 跨链借款
  const reFinance = useCallback(() => {
    try {
      // 调用跨链调仓方法

      setLoading(true)
      const contract = getWalletContract(info?.address, [
        'function crossRefinance(uint64 tragetChainId,uint256 amount,uint256 maxFluxFee) external payable',
      ])
      refinanceTrans(
        {
          contract: contract,
          method: 'crossRefinance',
          args: [
            netconfigs[selectChain?.key]?.ChainId,
            new BigNumber(
              utils.formatUnits(info?.userWithdrawLimit?.toString(), info?.decimals).toString()
            )
              .decimalPlaces(info?.decimals, 1)
              .eq(amount)
              ? '0'
              : new BigNumber(amount).times(10 ** info?.decimals).toString(),
            feeType ? 0 : new BigNumber(exchangeFeeFlux).times(1e18).toString(),
          ],
          // value: new BigNumber(crossChainFee).times(1e18).times(1.05).toFixed(0).toString(),
          action: 'refinance',
        },
        (res) => {
          setLoading(false)
          if (!res?.err) {
            getLoanPoolMeta()
            setInfo(null)
            crossStore.setState({
              currentTab: 'refinance',
              selectToken: null,
              selectChain: null,
              amount: '',
              chainList: null,
              feeType: 0,
              exchangeFee: '',
              exchangeFeeFlux: '',
            })
          }
        },
        () => {
          // const item = {
          //   date: Date.now(),
          //   type: TxType.refinance,
          //   mark: TxMark.lending,
          //   symbol: selectToken?.symbol,
          //   num: amount,
          //   hash,
          //   from: connectNet as NetEnum,
          //   to: selectChain?.key as NetEnum,
          //   status: Status.loading,
          // }
          // addHistory(item as any)
        }
      )
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    amount,
    exchangeFeeFlux,
    feeType,
    getLoanPoolMeta,
    refinanceTrans,
    selectChain?.key,
    selectToken?.address,
    selectToken?.decimals,
    selectToken?.userWithdrawLimit,
  ])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const depHandleClick = async () => {
    if (!feeType) {
      const res: any = await fluxCheck()
      if (res) {
        if (errorInfo) {
          if (errorInfo === modalType.warn) {
            warnModalOnOpen()
          } else {
            //   TODO
            return
          }
        }
        reFinance && reFinance()
      }
    } else {
      if (errorInfo) {
        if (errorInfo === modalType.warn) {
          warnModalOnOpen()
        } else {
          //   TODO
          return
        }
      }
      reFinance && reFinance()
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const borrowHandleClick = async () => {
    if (!feeType) {
      const res: any = await fluxCheck()
      if (res) {
        if (errorInfoBorrow) {
          return
        }
        borrow && borrow()
      }
    } else {
      if (errorInfoBorrow) {
        return
      }
      borrow && borrow()
    }
  }

  const getLiquilidy = async () => {
    // 当前链支持跨链的币种

    const netTokens = hotpotConfigJson?.gateways?.[transHotpotOkex(connectNet as any)]

    if (
      netTokens?.length &&
      netTokens.find(
        (it: any) => it?.tokenAddress?.toUpperCase() === selectToken?.underlying?.toUpperCase()
      )
    ) {
      // 选择的资产是hotpot支持的资产：获取目标链流动性
      try {
        const contract: any = getReadContract(
          hotpotConfigJson?.networks?.[transHotpotOkex(selectChain?.key)]?.hotpotLens,
          HotpotLensAbi,
          selectChain?.key as NetEnum
        )

        const curToken: any = hotpotConfigJson?.gateways?.[
          transHotpotOkex(connectNet as any)?.replace('Test', '')
        ]?.find(
          (it: any) => it?.tokenAddress?.toUpperCase() === selectToken?.underlying?.toUpperCase()
        )
        const desToken = hotpotConfigJson?.gateways?.[
          transHotpotOkex(selectChain?.key)?.replace('Test', '')
        ]?.find(
          (it: any) => it?.orginSymbol?.toUpperCase() === curToken?.orginSymbol?.toUpperCase()
        )

        const res = await contract.getVaultMeta(desToken?.vaultAddress, userAddress)

        const desTokenContract = getReadContract(
          desToken?.tokenAddress,
          ['function decimals() public view returns (uint8)'],
          selectChain?.key as NetEnum
        )

        const desDecimal = await desTokenContract?.decimals()

        setLiquidity(
          new BigNumber(utils.formatUnits(res?.cash, desDecimal))
            .plus(utils.formatUnits(res?.borrowLimit, desDecimal))
            .toString()
        )
      } catch (err) {
        setLiquidity(null)
        console.log(err)
      }
    } else {
      setLiquidity(null)
    }
  }

  useEffect(() => {
    if (!selectToken) return
    getLoanPoolMeta()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectToken])

  useEffect(() => {
    if (!selectChain) {
      setLiquidity(0)
      return
    }
    getLiquilidy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectChain])

  useEffect(() => {
    // 获取跨链费用
    if (!selectChain || !info) {
      crossStore.setState({
        exchangeFee: '',
        exchangeFeeFlux: '',
      })
      return
    }
    getCrossFee()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectChain, info])

  useEffect(() => {
    setLoading(false)
    setFluxError('')
  }, [currentTab])

  const bowDsiabled = useMemo(() => {
    if (!selectToken || !selectChain || !amount) return true
    if (errorInfoBorrow) {
      return errorInfoBorrow
    }
  }, [amount, errorInfoBorrow, selectChain, selectToken])

  const refIsDisabld = useMemo(() => {
    if (!selectToken || !selectChain || !amount) return true
    if (errorInfo) {
      if (errorInfo !== modalType.warn) {
        return errorInfo
      } else {
        return ''
      }
    } else {
      return ''
    }
  }, [amount, errorInfo, modalType.warn, selectChain, selectToken])

  const textMemo = useMemo(() => {
    switch (currentTab) {
      case 'refinance':
        return {
          color: 'green.100',
          tokenText: t('Choose a token to refinance'),
          buttonText: t('Refinance'),
          inputText: `${t('Your Withdraw Limit')}: `,
          isDisabled: refIsDisabld,
          buttonClick: depHandleClick,
          healthFactor: healthFactor,
          errorInfo: errorInfo && errorInfo !== modalType.warn ? errorInfo : '',
          limit:
            info?.userWithdrawLimit &&
            utils.formatUnits(info?.userWithdrawLimit?.toString(), info?.decimals).toString(),
        }
      case 'borrow':
        return {
          color: 'purple.100',
          tokenText: t('Choose a token to borrow'),
          buttonText: t('Borrow'),
          inputText: `${t('Available to borrow')}:`,
          isDisabled: bowDsiabled,
          buttonClick: borrowHandleClick,
          healthFactor: healthFactorBorrow,
          errorInfo: errorInfoBorrow,
          limit:
            info?.userWithdrawLimit &&
            utils.formatUnits(info?.userBorrowLimit?.toString(), info?.decimals).toString(),
        }
      default:
        return {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    borrowHandleClick,
    bowDsiabled,
    currentTab,
    depHandleClick,
    errorInfo,
    errorInfoBorrow,
    healthFactor,
    info?.decimals,
    info?.userBorrowLimit,
    info?.userWithdrawLimit,
    modalType.warn,
    refIsDisabld,
    t,
  ])

  return (
    <>
      <VStack
        height="max-content"
        spacing={{ base: px2vw(20), xl: '40px' }}
        width={{ base: '100%', xl: '600px' }}
        padding={{ base: px2vw(20), xl: '40px' }}
        background="gray.200"
        borderRadius="xl"
        borderTopLeftRadius={{ xl: currentTab === 'refinance' ? 'inherit' : 'xl' }}
        borderTopRightRadius={{ xl: currentTab === 'borrow' ? 'inherit' : 'xl' }}
      >
        <ChooseRefinance textMemo={textMemo} />
        {/* From-to */}
        <CrossFromTo textMemo={textMemo} />
        {/* Your Deposit */}
        <VStack alignItems="start" width="100%" spacing={{ base: px2vw(10), xl: '10px' }}>
          <Box textStyle="14" paddingLeft={{ base: px2vw(10), xl: '10px' }}>
            {info?.userWithdrawLimit ? (
              <HStack>
                <Text> {textMemo.inputText} </Text>
                <NumberTips toolTipProps={{ isDisabled: false }} value={textMemo?.limit} />
                <Text>{info?.symbol}</Text>
              </HStack>
            ) : (
              '--'
            )}
          </Box>
          <CrossDeposit
            errorInfo={textMemo?.errorInfo}
            maxButtonProps={{
              disabled: !textMemo?.limit,
              onClick: () => {
                textMemo?.limit && setAmount(textMemo?.limit)
              },
            }}
            value={amount}
            valChange={(e: any) => {
              setAmount(e)
            }}
          />
        </VStack>
        {/* Exchange Fee */}
        <CrossExchangeFee
          feeType={feeType}
          fluxFee={exchangeFeeFlux}
          normalFee={exchangeFee}
          symbol={info?.symbol}
          onClick={(feeType: number) => {
            crossStore.setState({
              feeType: feeType,
            })
          }}
        />
        {healthFactor && (
          <HealthFactorCmp
            healthFactor={textMemo?.healthFactor}
            hasBorrow={Boolean(currentTab === 'refinance' ? borrowBalance : true)}
          />
        )}

        <ShowMoreButton
          text="Reminder"
          visible={true}
          display={{ base: 'inherit', xl: 'none' }}
          width="100%"
          color="purple.300"
          arrowStyle={{
            src: rightArrow,
          }}
        />
        <DetailInfo width="100%" textAlign="left" data={warnInfos} alignItems="left" />

        {/* Refinance button */}
        <BaseButton
          onClick={async () => {
            textMemo?.buttonClick && textMemo?.buttonClick()
          }}
          h={{ base: px2vw(40), xl: '40px' }}
          w="100%"
          isLoading={loading}
          isDisabled={textMemo?.isDisabled as any}
          bgColor={textMemo.color}
          text={textMemo.buttonText}
          textStyle={{
            textStyle: '18',
            color: 'gray.700',
          }}
        />
      </VStack>
      <Modal hasTopRightCloseButton isOpen={warnModalIsOpen} onClose={warnModalOnClose}>
        <Box>
          <Text textStyle="18" color="purple.300">
            {t('CONTINUE')}?
          </Text>
          <Center
            width="100%"
            marginTop={{ base: px2vw(28), xl: '28px' }}
            marginBottom={{ base: px2vw(30), xl: '30px' }}
          >
            <Text width={{ base: px2vw(203), xl: '203px' }} textStyle="14" color="red.200">
              {t('Health factor is less than 120%, are you sure to continue')}?
            </Text>
          </Center>
          <HStack spacing={{ base: px2vw(35), xl: '35px' }} justifyContent="center">
            <BaseButton text="NO" opacity="0.5" onClick={warnModalOnClose}></BaseButton>
            <BaseButton text="YES" onClick={textMemo.buttonClick}></BaseButton>
          </HStack>
        </Box>
      </Modal>
    </>
  )
}

export default CrossRefinanceForm
