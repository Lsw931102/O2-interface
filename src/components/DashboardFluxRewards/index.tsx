import React, { useMemo, useState } from 'react'
import { Flex, VStack, Image, Text, HStack, useDisclosure, Box } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import BaseButton from '@/components/BaseButton'
import Table from '@/components/Table'
import Modal from '@/components/Modal'
import { ColumnItem } from '@/components/Table/type'
import fluxStore from '@/stores/contract/flux'
import NumberTips from '@/components/NumberTips'
import { formatByPrecision } from '@/utils/dataFormat'
import searchProviderStore from '@/stores/contract/searchProvider'
import fluxReportStore from '@/stores/contract/fluxReport'
import globalStore from '@/stores/global'
import { buttonHover } from '@/theme/utils'
import px2vw from '@/utils/px2vw'
import BigNumber from 'bignumber.js'
import { NetEnum, WalletEnum } from '@/consts'

import { getWalletContract } from '@/contracts/funcs'
import { FluxMintAbi } from '@/contracts/abis'
import useSendTransaction from '@/hooks/useSendTransaction'
import stakeStore from '@/stores/pages/stake'
import wallet from '@/assets/images/svg/wallet.svg'
import claim from '@/assets/images/svg/claim.svg'
import calculator from '@/assets/images/svg/calculator.svg'
import claimFlux from '@/assets/images/svg/claimFlux.svg'
import excavator from '@/assets/images/svg/excavator.svg'
import pathTo from '@/assets/images/svg/pathTo.svg'
import zoBlack from '@/assets/images/zoBlack.png'
import zoSwapStore from '@/stores/contract/zoSwap'
import { addZoToken } from '@/utils/tools'

function Index() {
  const { t } = useTranslation(['dashboard'])
  const router = useRouter()

  const { fluxBalance, getFluxBalance } = fluxStore()
  const { allMarkets, fluxPrice } = fluxReportStore()
  const { connectNet, fluxJson, walletType } = globalStore()
  const { unclaimedFluxAtStake } = stakeStore()
  const { zoTokenAddress } = zoSwapStore()
  const { unclaimedFluxAtLoan, unclaimedFlux, getUnclaimedFluxAtLoan, getUnclaimedFlux } =
    searchProviderStore()
  console.log(zoTokenAddress)
  const {
    isOpen: calculatorModalIsOpen,
    onClose: calculatorModalOnClose,
    onOpen: calculatorModalOnOpen,
  } = useDisclosure()

  const { sendTransaction } = useSendTransaction()

  const [isLoading, setIsLoading] = useState(false)
  const [isZoLoading, setIsZoLoading] = useState(false)
  const hasClaimDatas = useMemo(
    () =>
      (unclaimedFluxAtLoan || []).filter((item: any) => {
        return item?.bySupply > 0 || item?.byBorrow > 0
      }),
    [unclaimedFluxAtLoan]
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

  const hasClaimDatasMap = useMemo(() => {
    return (hasClaimDatas || []).map((item: any) => {
      const find = allMarkets.find((marketItem) => marketItem?.address === item?.address)

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
    })
  }, [allMarkets, hasClaimDatas])

  const totalAmout = useMemo(() => {
    const total = ([...hasClaimDatasMap, ...unclaimedFluxAtStakeDatas] || []).reduce((pre, cur) => {
      return new BigNumber(pre).plus(cur?.amount)
    }, 0)
    return total.toString()
  }, [hasClaimDatasMap, unclaimedFluxAtStakeDatas])

  // 提取flux
  const claimFluxClick = () => {
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
        (res) => {
          // 执行完成
          if (res?.err) {
            setIsLoading(false)
            return
          }
          setIsLoading(false)
          // 更新相关数据
          getFluxBalance()
          getUnclaimedFluxAtLoan()
          getUnclaimedFlux()
        }
      )
    } catch (err) {
      setIsLoading(false)
      console.log(err)
    }
  }
  // 提取zo
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
          // setIsLoading(false)
          // 更新相关数据
          getFluxBalance()
          getUnclaimedFluxAtLoan()
          getUnclaimedFlux()
        }
      )
    } catch (err) {
      setIsZoLoading(false)
      console.log(err)
    }
  }
  const calculatorColumns: ColumnItem[] = useMemo(
    () => [
      {
        title: t('rewardsFrom'),
        dataIndex: 'symbol',
        sort: true,
        render: (_, record) => {
          return (
            <Text textStyle="14" color="yellow.100" fontWeight="500">
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

  // useEffect(() => {
  //   console.log(window.ethereum.wallet_watchAsset)
  // }, [])

  return (
    <>
      <Box display={zoTokenAddress ? 'none' : 'inherit'}>
        <Text
          textStyle="24"
          color="purple.400"
          textAlign="center"
          marginTop={{ md: '45px' }}
          marginBottom={{ md: '20px' }}
        >
          {t('fluxRewardsFromBankAndStake')}
        </Text>
        <Flex
          width="700px"
          margin="0 auto"
          alignItems="center"
          justifyContent="space-between"
          padding="28px 60px 30px 50px"
          backgroundColor="gray.200"
          boxShadow="inset 0px 0px 4px rgba(0, 0, 0, 0.25)"
          borderRadius="xl"
        >
          <VStack spacing="20px" alignItems="start">
            {/* 余额 */}
            <HStack spacing="5px">
              <Image ignoreFallback src={wallet} />
              <Text textStyle="16" fontWeight="500" color="yellow.100">
                {t('walletFLUXBalance')}
              </Text>
              <Text textStyle="16" fontWeight="500" color="white">
                {fluxBalance ? (
                  <NumberTips
                    toolTipProps={{ isDisabled: false }}
                    value={formatByPrecision(fluxBalance)}
                  />
                ) : (
                  '--'
                )}{' '}
                FLUX
              </Text>
            </HStack>
            {/* claim */}
            <HStack spacing="5px">
              <Image ignoreFallback src={claim} />
              <Text textStyle="16" fontWeight="500" color="yellow.100">
                {t('claimable')} :
              </Text>
              <Text textStyle="24" color="white">
                {unclaimedFlux ? (
                  <NumberTips
                    toolTipProps={{ isDisabled: false }}
                    value={formatByPrecision(unclaimedFlux)}
                  />
                ) : (
                  '--'
                )}{' '}
                FLUX
              </Text>
              <Image
                ignoreFallback
                src={calculator}
                _hover={buttonHover}
                onClick={calculatorModalOnOpen}
              />
            </HStack>
          </VStack>
          {/* 提取按钮 */}
          <BaseButton
            onClick={() => {
              claimFluxClick()
            }}
            isDisabled={isLoading}
            isLoading={isLoading}
            specialIcon={<Image ignoreFallback src={claimFlux} />}
            specialIconIsLeft
            bgColor="yellow.100"
            w="132px"
            h="40px"
            padding="0"
            ml="10px"
            borderRadius="llg"
            text={t('claim')}
            textStyle={{ textStyle: '24', marginLeft: '10px' }}
          />
          {/* 计算器弹窗 */}
          <Modal
            isOpen={calculatorModalIsOpen}
            hasCloseButton={true}
            onClose={calculatorModalOnClose}
          >
            <Table
              rowKey="address"
              columns={calculatorColumns}
              dataSource={[...hasClaimDatasMap, ...unclaimedFluxAtStakeDatas]}
            ></Table>
            <HStack
              padding={{ base: `0 ${px2vw(15)} `, xl: '0 15px' }}
              marginBottom="10px"
              color="yellow.100"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text textStyle="14">{`${t('settled')} ${
                fluxJson?.[connectNet as string]?.contracts['ZO'] ? 'ZO' : 'FLUX'
              }`}</Text>
              <Text>
                {unclaimedFlux && fluxPrice ? (
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
              <Text textStyle="14">{t('Total Value')}</Text>
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
          </Modal>
        </Flex>
        {/* go to stake */}
        <HStack spacing="10px" margin="20px auto 0" justifyContent="center">
          <Image src={excavator} ignoreFallback />
          <Text textStyle="24" color="purple.400">
            {t('goToStakeEarnMoreFLUX')}
          </Text>
          <Image
            onClick={() => router.push('/stake')}
            src={pathTo}
            ignoreFallback
            _hover={buttonHover}
          />
        </HStack>
      </Box>
      <Box display={zoTokenAddress ? 'inherit' : 'none'}>
        {/* 下方信息 */}
        <HStack
          spacing="20px"
          marginTop={{ md: '45px' }}
          marginBottom={{ md: '20px' }}
          justifyContent="center"
        >
          <Text textStyle="24" color="purple.400" textAlign="center">
            {t('zoRewardsFromBankAndStake')}
          </Text>
          <BaseButton
            onClick={() => {
              claimFluxClick()
            }}
            isDisabled={isLoading}
            isLoading={isLoading}
            bgColor="purple.300"
            w="132px"
            h="24px"
            borderRadius="sxl"
            text={t('claimFlux')}
          />
        </HStack>

        <Flex
          width="700px"
          margin="0 auto"
          alignItems="center"
          justifyContent="space-between"
          padding="28px 60px 30px 50px"
          backgroundColor="gray.200"
          boxShadow="inset 0px 0px 4px rgba(0, 0, 0, 0.25)"
          borderRadius="xl"
        >
          <VStack spacing="20px" alignItems="start">
            {/* 余额 */}
            <HStack spacing="5px">
              <Image ignoreFallback src={wallet} />
              <Text textStyle="16" fontWeight="500" color="yellow.100">
                {t('walletZOBalance')}
              </Text>
              <Text textStyle="16" fontWeight="500" color="white">
                {fluxBalance ? (
                  <NumberTips
                    toolTipProps={{ isDisabled: false }}
                    value={formatByPrecision(fluxBalance)}
                  />
                ) : (
                  '--'
                )}{' '}
                ZO
              </Text>
            </HStack>
            {/* claim */}
            <HStack spacing="5px">
              <Image ignoreFallback src={claim} />
              <Text textStyle="16" fontWeight="500" color="yellow.100">
                {t('claimable')} :
              </Text>
              <Text textStyle="24" color="white">
                {unclaimedFlux ? (
                  <NumberTips
                    toolTipProps={{ isDisabled: false }}
                    value={formatByPrecision(unclaimedFlux)}
                  />
                ) : (
                  '--'
                )}{' '}
                ZO
              </Text>
              <Image
                ignoreFallback
                src={calculator}
                _hover={buttonHover}
                onClick={calculatorModalOnOpen}
              />
            </HStack>
          </VStack>
          {/* 提取按钮 */}
          <VStack spacing="16px" justifyContent="center" alignItems="center">
            <BaseButton
              onClick={() => {
                claimZOClick()
              }}
              isDisabled={isZoLoading}
              isLoading={isZoLoading}
              specialIcon={<Image ignoreFallback src={zoBlack} />}
              specialIconIsLeft
              bgColor="yellow.100"
              w="175px"
              h="40px"
              padding="0"
              borderRadius="llg"
              text={t('claimZO')}
              textStyle={{ textStyle: '24', marginLeft: '10px' }}
            />
            <BaseButton
              display={walletType === WalletEnum.metamask ? 'initial' : 'none'}
              w="175px"
              h="24px"
              textStyle={{ color: 'purple.300', textStyle: '12' }}
              border="1px solid"
              borderColor="purple.300"
              bgColor="initial"
              text={`+ ${t('Add ZO To')} ${walletType}`}
              onClick={() => {
                addZoToken()
              }}
            />
          </VStack>

          {/* 计算器弹窗 */}
          <Modal
            isOpen={calculatorModalIsOpen}
            hasCloseButton={true}
            onClose={calculatorModalOnClose}
          >
            <Table
              rowKey="address"
              columns={calculatorColumns}
              dataSource={[...hasClaimDatasMap, ...unclaimedFluxAtStakeDatas]}
            ></Table>
            <HStack
              padding={{ base: `0 ${px2vw(15)} `, xl: '0 15px' }}
              marginBottom="10px"
              color="yellow.100"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text textStyle="14">{`${t('settled')} ${
                fluxJson?.[connectNet as string]?.contracts['ZO'] ? 'ZO' : 'FLUX'
              }`}</Text>
              <Text>
                {unclaimedFlux && fluxPrice ? (
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
                ZO
              </Text>
            </HStack>
            <HStack
              padding={{ base: `0 ${px2vw(15)} `, xl: '0 15px' }}
              color="yellow.100"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text textStyle="14">{t('Total Value')}</Text>
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
          </Modal>
        </Flex>
        <Flex
          display={zoTokenAddress ? 'none' : 'flex'}
          width="700px"
          margin="0 auto"
          alignItems="center"
          justifyContent="space-between"
          padding="28px 60px 30px 50px"
          backgroundColor="gray.200"
          boxShadow="inset 0px 0px 4px rgba(0, 0, 0, 0.25)"
          borderRadius="xl"
        >
          <VStack spacing="20px" alignItems="start">
            {/* 余额 */}
            <HStack spacing="5px">
              <Image ignoreFallback src={wallet} />
              <Text textStyle="16" fontWeight="500" color="yellow.100">
                {t('walletFLUXBalance')}
              </Text>
              <Text textStyle="16" fontWeight="500" color="white">
                {fluxBalance ? (
                  <NumberTips
                    toolTipProps={{ isDisabled: false }}
                    value={formatByPrecision(fluxBalance)}
                  />
                ) : (
                  '--'
                )}{' '}
                FLUX
              </Text>
            </HStack>
            {/* claim */}
            <HStack spacing="5px">
              <Image ignoreFallback src={claim} />
              <Text textStyle="16" fontWeight="500" color="yellow.100">
                {t('claimable')} :
              </Text>
              <Text textStyle="24" color="white">
                {unclaimedFlux ? (
                  <NumberTips
                    toolTipProps={{ isDisabled: false }}
                    value={formatByPrecision(unclaimedFlux)}
                  />
                ) : (
                  '--'
                )}{' '}
                FLUX
              </Text>
              <Image
                ignoreFallback
                src={calculator}
                _hover={buttonHover}
                onClick={calculatorModalOnOpen}
              />
            </HStack>
          </VStack>
          {/* 提取按钮 */}
          <BaseButton
            onClick={() => {
              claimFluxClick()
            }}
            isDisabled={isLoading}
            isLoading={isLoading}
            specialIcon={<Image ignoreFallback src={claimFlux} />}
            specialIconIsLeft
            bgColor="yellow.100"
            w="132px"
            h="40px"
            padding="0"
            ml="10px"
            borderRadius="llg"
            text={t('claim')}
            textStyle={{ textStyle: '24', marginLeft: '10px' }}
          />
          {/* 计算器弹窗 */}
          <Modal
            isOpen={calculatorModalIsOpen}
            hasCloseButton={true}
            onClose={calculatorModalOnClose}
          >
            <Table
              rowKey="address"
              columns={calculatorColumns}
              dataSource={[...hasClaimDatasMap, ...unclaimedFluxAtStakeDatas]}
            ></Table>
            <HStack
              padding={{ base: `0 ${px2vw(15)} `, xl: '0 15px' }}
              marginBottom="10px"
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
                    value={new BigNumber(new BigNumber(unclaimedFlux).div(10 ** 18).toString())
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
                {fluxJson?.[connectNet as string]?.contracts['ZO'] ? 'ZO' : 'FLUX'}{' '}
                {t('Total Value')}
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
          </Modal>
        </Flex>
        {/* go to stake */}
        <HStack spacing="10px" margin="20px auto 0" justifyContent="center">
          <Image src={excavator} ignoreFallback />
          <Text textStyle="24" color="purple.400">
            {t('goToStakeEarnMoreZO')}
          </Text>
          <Image
            onClick={() => router.push('/stake')}
            src={pathTo}
            ignoreFallback
            _hover={buttonHover}
          />
        </HStack>
      </Box>
    </>
  )
}
export default Index
