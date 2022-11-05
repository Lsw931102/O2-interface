import React from 'react'
import { Box, Flex, Text, Image, Center } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'

import NumberTips from '../NumberTips'
import { completeUrl } from '@/utils/common'
import { useTranslation } from 'next-i18next'
import fluxReportStore from '@/stores/contract/fluxReport'
import BaseTooltip from '../BaseTooltip'
import globalStore from '@/stores/global'
import { netconfigs } from '@/consts/network'
import BigNumber from 'bignumber.js'

export interface IProps {
  activeToken: string
  activeUrl: string
}

function Index({ ...prop }: IProps) {
  const { connectNet } = globalStore()
  const { bankDetail, fluxPrice } = fluxReportStore()
  const { t } = useTranslation(['currencyDetails'])

  return (
    <Box px={{ base: px2vw(20), xl: '20px' }} py={{ base: px2vw(25), xl: '25px' }}>
      <Flex mb={{ base: px2vw(15), xl: '15px' }}>
        <Text textStyle="16" color="purple.300" mr={{ base: px2vw(3), xl: '3px' }}>
          {t('MarketConfig')}
        </Text>
        <Flex
          cursor="pointer"
          onClick={() => {
            netconfigs &&
              connectNet &&
              prop.activeUrl &&
              window.open(`${netconfigs[connectNet || '']?.addressScanUrl}/${prop.activeUrl}`)
          }}
        >
          <Flex flexDirection="column" justifyContent="flex-end">
            <Text
              textStyle="12"
              color="purple.300"
              fontWeight="400"
              mr={{ base: px2vw(3), xl: '3px' }}
            >
              {t('ViewOnBSCScan')}
            </Text>
          </Flex>
          <Image
            src={completeUrl('currency-details/shareMini.svg')}
            w={{ base: px2vw(8), xl: '8px' }}
            h={{ base: px2vw(8), xl: '8px' }}
            mt="auto"
            mb={{ base: px2vw(2), xl: '2px' }}
          />
        </Flex>
      </Flex>
      {/* price */}
      <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
        <Text textStyle="14" color="purple.300">
          {t('Price')}:
        </Text>
        <Text textStyle="14" color="purple.300">
          {bankDetail?.price ? (
            <NumberTips value={bankDetail?.price} symbol="$" shortNum={2} />
          ) : (
            '--'
          )}
        </Text>
      </Flex>
      {/* Price Oracle */}
      <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
        <Text textStyle="14" color="purple.300">
          {t('priceOracle')}:
        </Text>
        <Text textStyle="14" color="purple.300">
          {bankDetail?.priceOracle || '--'}
        </Text>
      </Flex>
      {/* Borrow Cap */}
      <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
        <Text textStyle="14" color="purple.300">
          {t('borrowCap')}:
        </Text>
        <Text textStyle="14" color="purple.300">
          {bankDetail?.borrowCap ? (
            bankDetail?.borrowCap === '0' ? (
              t('NoLimit')
            ) : (
              <NumberTips value={bankDetail?.borrowCap} isAbbr />
            )
          ) : (
            '--'
          )}
        </Text>
      </Flex>
      {/* Reserve Factor */}
      <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
        <BaseTooltip text={t('reserveFactor')} afterText={{ children: ':' }}>
          {t('ReserveFactorToolTips')}
        </BaseTooltip>
        <Text textStyle="14" color="purple.300">
          {bankDetail?.reserveFactor ? (
            <NumberTips value={bankDetail?.reserveFactor} isRatio />
          ) : (
            '--'
          )}
        </Text>
      </Flex>
      {/* MaximumLTV */}
      <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
        <BaseTooltip text={t('maximumLTV')} afterText={{ children: ':' }}>
          {t('MaximumLTVToolTips')}
        </BaseTooltip>
        <Text textStyle="14" color="purple.300">
          {bankDetail?.maximumLTV ? <NumberTips value={bankDetail?.maximumLTV} isRatio /> : '--'}
        </Text>
      </Flex>
      {/* Minted */}
      <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
        <Text textStyle="14" color="purple.300">
          {`${bankDetail?.mktSymbol || '--'} ${t('minted')}`}:
        </Text>
        <Text textStyle="14" color="purple.300">
          {bankDetail?.minted ? <NumberTips value={bankDetail?.minted} shortNum={4} /> : '--'}{' '}
        </Text>
      </Flex>
      {/* Exchange Rate */}
      <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
        <BaseTooltip text={t('exchangeRate')} afterText={{ children: ':' }}>
          <Box>{t('ExchangeRateToolTips1')}</Box>
          <Box>{t('ExchangeRateToolTips2')}</Box>
        </BaseTooltip>
        <Text textStyle="14" color="purple.300">
          1 {prop.activeToken} ={' '}
          {bankDetail?.exchangeRate ? (
            <NumberTips value={bankDetail?.exchangeRate} shortNum={4} />
          ) : (
            '--'
          )}{' '}
          f{prop.activeToken}
        </Text>
      </Flex>
      {/* Borrow APY */}
      <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
        <BaseTooltip text={t('borrowAPY')} afterText={{ children: ':' }}>
          <Box>{t('BorrowAPYToolTips1')}</Box>
          <Box>{t('BorrowAPYToolTips2')}</Box>
        </BaseTooltip>
        <Text textStyle="14" color="purple.300">
          {bankDetail?.borrowAPY ? <NumberTips value={bankDetail?.borrowAPY} isRatio /> : '--'}
        </Text>
      </Flex>
      {/* Deposit APY */}
      <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
        <BaseTooltip text={t('depositAPY')} afterText={{ children: ':' }}>
          <Box>{t('DepositAPYToolTips1')}</Box>
          <Box>{t('DepositAPYToolTips2')}</Box>
        </BaseTooltip>
        <Text textStyle="14" color="purple.300">
          {bankDetail?.depositAPY ? <NumberTips value={bankDetail?.depositAPY} isRatio /> : '--'}
        </Text>
      </Flex>
      <Flex flexDirection="column">
        <Flex flexDirection="column" mt={{ base: px2vw(15), xl: '15px' }}>
          <Text
            textStyle="14"
            color="purple.300"
            fontWeight="700"
            textAlign="center"
            mb={{ base: px2vw(5), xl: '5px' }}
          >
            {bankDetail?.borrowRewardFlux ? (
              <NumberTips value={bankDetail?.borrowRewardFlux} shortNum={4} />
            ) : (
              '--'
            )}{' '}
            FLUX / Day
          </Text>
          <Center>
            <BaseTooltip text={`${t('Borrow')} $ 10000 ${t('Reward')}`}>
              <Box mb="10px">{t('BorrowRewardToolTips1', { token: prop.activeToken })}</Box>
              <Box>
                {t('BorrowRewardToolTips2', {
                  value: bankDetail?.borrowDistributionFluxAPY
                    ? `${new BigNumber(bankDetail?.borrowDistributionFluxAPY)
                        .times(100)
                        .toFixed(2)}%`
                    : '--',
                  fluxPrice: !isNaN(fluxPrice as any)
                    ? new BigNumber(fluxPrice as number).toFixed(2)
                    : '--',
                })}
              </Box>
            </BaseTooltip>
          </Center>
        </Flex>
        <Flex flexDirection="column" mt={{ base: px2vw(15), xl: '15px' }}>
          <Text
            textStyle="14"
            color="purple.300"
            fontWeight="700"
            textAlign="center"
            mb={{ base: px2vw(5), xl: '5px' }}
          >
            {bankDetail?.depositRewardFlux ? (
              <NumberTips value={bankDetail?.depositRewardFlux} shortNum={4} />
            ) : (
              '--'
            )}{' '}
            FLUX / Day
          </Text>
          <Center>
            <BaseTooltip text={`${t('Deposit')} $ 10000 ${t('Reward')}`}>
              <Box mb="10px">{t('DepositRewardToolTips1', { token: prop.activeToken })}</Box>
              <Box>
                {t('DepositRewardToolTips2', {
                  value: bankDetail?.depositDistributionFluxAPY
                    ? `${new BigNumber(bankDetail?.depositDistributionFluxAPY)
                        .times(100)
                        .toFixed(2)}%`
                    : '--',
                  fluxPrice: !isNaN(fluxPrice as any)
                    ? new BigNumber(fluxPrice as number).toFixed(2)
                    : '--',
                })}
              </Box>
            </BaseTooltip>
          </Center>
        </Flex>
      </Flex>
    </Box>
  )
}

export default React.memo(Index)
