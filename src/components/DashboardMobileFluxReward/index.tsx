import { Box, HStack, Text, Image, useDisclosure, VStack } from '@chakra-ui/react'
import React, { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import px2vw from '@/utils/px2vw'
import { buttonHover } from '@/theme/utils'
import BigNumber from 'bignumber.js'
import { NetEnum, WalletEnum } from '@/consts'
import useSendTransaction from '@/hooks/useSendTransaction'

import InfoList, { CosInfoItemProps } from '@/components/InfoList'
import BaseButton from '@/components/BaseButton'
import { formatByPrecision } from '@/utils/dataFormat'
import NumberTips from '@/components/NumberTips'
import Modal from '@/components/Modal'
import Table from '@/components/Table'
import { ColumnItem } from '@/components/Table/type'

import fluxReportStore from '@/stores/contract/fluxReport'
import searchProviderStore from '@/stores/contract/searchProvider'
import fluxStore from '@/stores/contract/flux'
import globalStore from '@/stores/global'
import stakeStore from '@/stores/pages/stake'

import { FluxMintAbi } from '@/contracts/abis'
import { getWalletContract } from '@/contracts/funcs'

import wallet from '@/assets/images/svg/wallet.svg'
import claim from '@/assets/images/svg/claim.svg'
import calculator from '@/assets/images/svg/calculator.svg'
import pickaxe from '@/assets/images/pickaxe.png'
import stakeZo from '@/assets/images/stakeZo.png'
import gotoEarnFlux from '@/assets/images/gotoEarnFlux.png'
import pathTo from '@/assets/images/svg/pathTo.svg'
import claimFlux from '@/assets/images/svg/claimFlux.svg'
import zoBlack from '@/assets/images/zoBlack.png'
import { addZoToken } from '@/utils/tools'

function Index() {
  const router = useRouter()
  const { t } = useTranslation(['dashboard'])

  const {
    isOpen: calculatorModalIsOpen,
    onClose: calculatorModalOnClose,
    onOpen: calculatorModalOnOpen,
  } = useDisclosure()
  const { unclaimedFluxAtStake } = stakeStore()
  const { fluxBalance } = fluxStore()
  const { allMarkets, fluxPrice } = fluxReportStore()
  const { connectNet, fluxJson, walletType } = globalStore()
  const { unclaimedFluxAtLoan, unclaimedFlux } = searchProviderStore()

  const { sendTransaction } = useSendTransaction()

  // const [loading, setLoading] = useState(false)
  const [isZoLoading, setIsZoLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // 提取flux
  const claimFluxClick = useCallback(() => {
    setIsLoading(true)
    try {
      const contract = getWalletContract(
        fluxJson?.[connectNet as string]?.contracts['FluxMint'],
        FluxMintAbi
      )
      sendTransaction(
        {
          contract: contract,
          method: 'claimFlux()',
          action: 'claim',
        },
        (res: any) => {
          // 执行完成
          setIsLoading(false)
          if (res?.err) return

          PubSub.publish('claimFluxComplete')
          // 更新历史记录
        },
        () => {
          // const item = {
          //   date: Date.now(),
          //   type: TxType.claim,
          //   mark: TxMark.earned,
          //   symbol: 'FLUX',
          //   num: formatByPrecision(unclaimedFlux as any),
          //   hash,
          //   status: Status.loading,
          // }
          // addHistory(item)
        }
      )
    } catch (err) {
      setIsLoading(false)
    }
  }, [connectNet, fluxJson, sendTransaction])

  // 提取zo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const claimZOClick = () => {
    setIsZoLoading(true)
    try {
      const contract = getWalletContract(
        fluxJson?.[connectNet as string]?.contracts['FluxMintZO'],
        FluxMintAbi
      )
      sendTransaction(
        {
          contract: contract,
          method: 'claimFlux()',
          action: 'claim',
        },
        (res) => {
          // 执行完成
          setIsZoLoading(false)
          if (res?.err) {
            return
          }
        }
      )
    } catch (err) {
      setIsZoLoading(false)
      console.log(err)
    }
  }

  const claimData: CosInfoItemProps[] = useMemo(
    () => [
      {
        labelRender: () => {
          return (
            <HStack spacing={{ base: px2vw(4) }}>
              <Image ignoreFallback src={wallet} />
              <Text textStyle="12" fontWeight="500" color="yellow.100">
                {t('walletFLUXBalance')}:
              </Text>
            </HStack>
          )
        },
        valueRender: () => {
          return (
            <Text textStyle="12" fontWeight="500" color="white">
              {fluxBalance ? <NumberTips value={formatByPrecision(fluxBalance)} /> : '--'} FLUX
            </Text>
          )
        },
      },
      {
        labelRender: () => {
          return (
            <HStack spacing={{ base: px2vw(4) }}>
              <Image ignoreFallback src={claim} />
              <Text textStyle="12" fontWeight="500" color="yellow.100">
                {t('claimable')} :
              </Text>
            </HStack>
          )
        },
        valueRender: () => {
          return (
            <HStack spacing={{ base: px2vw(5) }}>
              <Text textStyle="12" fontWeight="500" color="white">
                {unclaimedFlux ? <NumberTips value={formatByPrecision(unclaimedFlux)} /> : '-'} FLUX
              </Text>
              <Image
                onClick={calculatorModalOnOpen}
                src={calculator}
                _hover={buttonHover}
                width={{ base: px2vw(14) }}
                height={{ base: px2vw(14) }}
                ignoreFallback
              />
            </HStack>
          )
        },
      },
      {
        labelRender: () => {
          return (
            <Box position="relative" paddingTop={px2vw(10)}>
              <Image src={gotoEarnFlux} width={px2vw(116)} height={px2vw(28)} />
              <Image
                onClick={() => router.push('/stake')}
                position="absolute"
                right={`-${px2vw(18)}`}
                bottom="0"
                src={pathTo}
                ignoreFallback
                _hover={buttonHover}
                width={px2vw(13)}
                height={px2vw(13)}
              />
              <Image
                position="absolute"
                right={px2vw(8)}
                top={`${px2vw(4)}`}
                src={pickaxe}
                width={{ base: px2vw(18) }}
                height={{ base: px2vw(18) }}
                ignoreFallback
              />
            </Box>
          )
        },
        valueRender: () => {
          return (
            <BaseButton
              onClick={() => {
                claimFluxClick()
              }}
              specialIcon={
                <Image height={px2vw(18)} width={px2vw(18)} ignoreFallback src={claimFlux} />
              }
              isDisabled={isLoading}
              isLoading={isLoading}
              specialIconIsLeft
              bgColor="yellow.100"
              w={px2vw(104)}
              h={px2vw(30)}
              p="0"
              ml={{ base: px2vw(10), xl: '10px' }}
              borderRadius="llg"
              text={t('claim')}
              textStyle={{
                textStyle: '18',
                marginLeft: { base: px2vw(8), xl: '8px' },
                fontWeight: 'bold',
              }}
            />
          )
        },
      },
    ],
    [calculatorModalOnOpen, claimFluxClick, fluxBalance, isLoading, router, t, unclaimedFlux]
  )

  const claimZOData: CosInfoItemProps[] = useMemo(
    () => [
      {
        labelRender: () => {
          return (
            <HStack spacing={{ base: px2vw(4) }}>
              <Image ignoreFallback src={wallet} />
              <Text textStyle="12" fontWeight="500" color="yellow.100">
                {t('walletZOBalance')}:
              </Text>
            </HStack>
          )
        },
        valueRender: () => {
          return (
            <Text textStyle="12" fontWeight="500" color="white">
              {fluxBalance ? <NumberTips value={formatByPrecision(fluxBalance)} /> : '--'} ZO
            </Text>
          )
        },
      },
      {
        labelRender: () => {
          return (
            <HStack spacing={{ base: px2vw(4) }}>
              <Image ignoreFallback src={claim} />
              <Text textStyle="12" fontWeight="500" color="yellow.100">
                {t('claimable')} :
              </Text>
            </HStack>
          )
        },
        valueRender: () => {
          return (
            <HStack spacing={{ base: px2vw(5) }}>
              <Text textStyle="12" fontWeight="500" color="white">
                {unclaimedFlux ? <NumberTips value={formatByPrecision(unclaimedFlux)} /> : '-'} ZO
              </Text>
              <Image
                onClick={calculatorModalOnOpen}
                src={calculator}
                _hover={buttonHover}
                width={{ base: px2vw(14) }}
                height={{ base: px2vw(14) }}
                ignoreFallback
              />
            </HStack>
          )
        },
      },
      {
        labelRender: () => {
          return (
            <Box position="relative" paddingTop={px2vw(10)}>
              <Image src={stakeZo} width={px2vw(116)} height={px2vw(28)} />
              <Image
                onClick={() => router.push('/stake')}
                position="absolute"
                right={`-${px2vw(18)}`}
                bottom="0"
                src={pathTo}
                ignoreFallback
                _hover={buttonHover}
                width={px2vw(13)}
                height={px2vw(13)}
              />
              <Image
                position="absolute"
                right={px2vw(-5)}
                top={`${px2vw(4)}`}
                src={pickaxe}
                width={{ base: px2vw(18) }}
                height={{ base: px2vw(18) }}
                ignoreFallback
              />
            </Box>
          )
        },
        valueRender: () => {
          return (
            <VStack spacing={px2vw(20)}>
              <BaseButton
                onClick={() => {
                  claimZOClick()
                }}
                isDisabled={isZoLoading}
                isLoading={isZoLoading}
                specialIcon={<Image width={px2vw(20)} ignoreFallback src={zoBlack} />}
                specialIconIsLeft
                bgColor="yellow.100"
                w={px2vw(135)}
                h={px2vw(30)}
                padding="0"
                // ml="10px"
                borderRadius="llg"
                text={t('claimZO')}
                textStyle={{ textStyle: '18', marginLeft: px2vw(10) }}
              />
              <BaseButton
                display={walletType === WalletEnum.metamask ? 'none' : 'inital'}
                onClick={() => {
                  claimFluxClick()
                }}
                isDisabled={isLoading}
                isLoading={isLoading}
                bgColor="purple.300"
                w={px2vw(135)}
                h={px2vw(24)}
                borderRadius="sxl"
                text={t('claimFlux')}
              />
            </VStack>
          )
        },
      },
      {
        labelRender: () => {
          return (
            <HStack
              display={walletType === WalletEnum.metamask ? 'flex' : 'none'}
              w="100%"
              justifyContent="space-between"
            >
              <BaseButton
                onClick={() => {
                  claimFluxClick()
                }}
                isDisabled={isLoading}
                isLoading={isLoading}
                bgColor="purple.300"
                w={px2vw(135)}
                h={px2vw(24)}
                borderRadius="sxl"
                text={t('claimFlux')}
              />

              <BaseButton
                w={px2vw(165)}
                h={px2vw(24)}
                textStyle={{ color: 'purple.300', textStyle: '12' }}
                border="1px solid"
                borderColor="purple.300"
                bgColor="initial"
                text={`+ ${t('Add ZO To')} ${walletType}`}
                onClick={() => {
                  addZoToken()
                }}
              />
            </HStack>
          )
        },
      },
    ],
    [
      calculatorModalOnOpen,
      claimFluxClick,
      claimZOClick,
      fluxBalance,
      isLoading,
      isZoLoading,
      router,
      t,
      unclaimedFlux,
      walletType,
    ]
  )

  const calculatorColumns: ColumnItem[] = useMemo(
    () => [
      {
        title: t('rewardsFrom'),
        dataIndex: 'symbol',
        sort: true,
        render: (_, record) => {
          return (
            <Text maxWidth={{ base: px2vw(78) }} textStyle="14" color="yellow.100" fontWeight="500">
              {record?.symbol}
            </Text>
          )
        },
      },
      {
        title: t('amount'),
        dataIndex: 'amount',
        align: 'right',
        sort: true,
        render: (_, record: any) => {
          return (
            <VStack color="yellow.100" alignItems="flex-end">
              <Text textStyle="14">
                {record?.amount ? (
                  <NumberTips
                    toolTipProps={{ isDisabled: false }}
                    value={record?.amount}
                    showFull
                  />
                ) : (
                  '--'
                )}{' '}
                {fluxJson?.[connectNet as string]?.contracts['ZO'] ? 'ZO' : 'FLUX'}
              </Text>
            </VStack>
          )
        },
      },
    ],
    [connectNet, fluxJson, t]
  )

  const unclaimedFluxAtStakeDatas = useMemo(() => {
    if (!fluxJson) return []
    const map = (unclaimedFluxAtStake || [])
      .map((item: any) => {
        if (
          Object.keys((fluxJson?.[connectNet as NetEnum] as any)?.stakePools).find(
            (findItem) => findItem == item.address
          )
        ) {
          const detail = (fluxJson?.[connectNet as NetEnum] as any)?.stakePools[item.address]
          if (item.unclaimed !== 0) {
            return {
              address: item.address,
              symbol: detail.swapdex
                ? detail.symbol
                : fluxJson?.[connectNet as string].contracts['ZO']
                ? 'Stake ZO'
                : 'FLUX' + detail.symbol,
              amount: item.unclaimed,
            }
          }
        }
      })
      .filter((filterItem) => filterItem)
    return map
  }, [connectNet, fluxJson, unclaimedFluxAtStake])

  const hasClaimDatas = (unclaimedFluxAtLoan || []).filter((item: any) => {
    return item?.bySupply > 0 || item?.byBorrow > 0
  })

  const hasClaimDatasMap = hasClaimDatas.map((item: any) => {
    const find = allMarkets.find((marketItem) => marketItem?.address === item?.address)
    if (find) {
      if (find) {
        return {
          symbol: find?.symbol,
          decimals: find?.decimals,
          amount: new BigNumber(item?.bySupply)
            .div(10 ** 18)
            .plus(new BigNumber(item?.byBorrow).div(10 ** 18))
            .toString(),
          ...item,
        }
      }
    }
  })

  const totalAmout = useMemo(() => {
    const total = ([...hasClaimDatasMap, ...unclaimedFluxAtStakeDatas] || []).reduce((pre, cur) => {
      return new BigNumber(pre).plus(cur.amount)
    }, 0)
    return total.toString()
  }, [hasClaimDatasMap, unclaimedFluxAtStakeDatas])

  return (
    <>
      <InfoList
        padding={{ base: px2vw(20) }}
        data={fluxJson?.[connectNet as string]?.contracts['ZO'] ? claimZOData : claimData}
        width="100%"
        borderRadius="xl"
        backgroundColor="gray.100"
      />
      <Modal isOpen={calculatorModalIsOpen} hasCloseButton={true} onClose={calculatorModalOnClose}>
        <Box maxHeight={px2vw(310)} overflow="auto">
          <Table
            rowKey="address"
            columns={calculatorColumns}
            dataSource={[...hasClaimDatasMap, ...unclaimedFluxAtStakeDatas]}
          ></Table>
          <HStack
            padding={{ base: `0 ${px2vw(15)} `, xl: '0 15px' }}
            marginBottom={px2vw(10)}
            color="yellow.100"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text textStyle="14">{`${t('settled')} ${
              fluxJson?.[connectNet as string]?.contracts['ZO'] ? 'ZO' : 'FLUX'
            }`}</Text>
            <Text>
              {unclaimedFlux ? (
                <NumberTips
                  shortNum={2}
                  toolTipProps={{ isDisabled: false }}
                  value={new BigNumber(formatByPrecision(unclaimedFlux))
                    .minus(totalAmout)
                    .toString()}
                />
              ) : (
                '--'
              )}{' '}
              {fluxJson?.[connectNet as string]?.contracts['ZO'] ? 'ZO' : 'FLUX'}
            </Text>
          </HStack>
          <HStack
            padding={{ base: `0 ${px2vw(15)} `, xl: '0 15px' }}
            color="yellow.100"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text textStyle="14">
              {' '}
              {fluxJson?.[connectNet as string]?.contracts['ZO'] ? 'ZO' : 'FLUX'} {t('Total Value')}
            </Text>
            <Text>
              $
              {unclaimedFlux && fluxPrice ? (
                <NumberTips
                  shortNum={2}
                  toolTipProps={{ isDisabled: false }}
                  value={formatByPrecision(unclaimedFlux) * fluxPrice}
                />
              ) : (
                '--'
              )}
            </Text>
          </HStack>
        </Box>
      </Modal>
    </>
  )
}
export default Index
