import { Box, VStack, HStack, Text } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
// import {useHi} from 'react-router-dom'
import dynamic from 'next/dynamic'

import InfoList from '@/components/InfoList'
import Health from '@/components/Health'
import NumberTips from '@/components/NumberTips'
import BaseTooltip from '@/components/BaseTooltip'
// import Select from '@/components/Select'

import searchProviderStore from '@/stores/contract/searchProvider'
import fluxAppStore from '@/stores/contract/fluxApp'
import { getBorrowRatio, getTotalApy } from '@/utils/dataFormat'
import px2vw from '@/utils/px2vw'
import useMarketInfo from '@/hooks/useMarketInfo'
import Select from '../Select'

export type TabType = 'deposit' | 'borrow'

const DashboardMobileList = dynamic(() => import('@/components/DashboardMobileList'), {
  ssr: false,
})

// const DashboardMobileFluxReward = dynamic(() => import('@/components/DashboardMobileFluxReward'), {
//   ssr: false,
// })

export const dashboardSubMenu = [
  {
    label: 'My Bank',
    value: '/dashboard',
  },
  {
    label: 'My Farm',
    value: '/dashboard/my-farm',
  },
]
function Index() {
  const { t } = useTranslation(['dashboard'])
  const router = useRouter()
  const { apy } = searchProviderStore()
  const { supplyBalance, borrowBalance, borrowLimit } = fluxAppStore()
  const { getHealthFactor } = useMarketInfo()

  const borrowRatio = useMemo(
    () => getBorrowRatio(borrowBalance, borrowLimit),
    [borrowBalance, borrowLimit]
  )

  const healthFactor = useMemo(() => getHealthFactor('deposit'), [getHealthFactor])

  const topData = useMemo(
    () => [
      {
        labelRender: () => {
          return (
            <BaseTooltip
              text={`${t('totalDeposits')}`}
              afterText={{
                children: ' :',
              }}
              textStyles={{
                color: 'green.300',
              }}
            >
              <Text
                textAlign="center"
                textStyle="14"
                lineHeight={{ xl: '18px' }}
                whiteSpace="break-spaces"
              >
                {t('totalDepositsToolTip')}
              </Text>
            </BaseTooltip>
          )
        },

        valueRender: () => {
          return (
            <Text textStyle="20">
              {supplyBalance ? <NumberTips value={supplyBalance} shortNum={2} symbol="$" /> : '--'}
            </Text>
          )
        },
      },
      {
        labelRender: () => {
          return (
            <BaseTooltip
              text={`${t('NetAPR')}`}
              afterText={{
                children: ' :',
              }}
              textStyles={{
                textAlign: 'center',
                textStyle: '14',
                color: 'green.300',
              }}
            >
              <VStack alignItems="start">
                <Text>{t('NetAPRToolTipFirst')}</Text>
                <Text>{t('NetAPRToolTipSecond')}</Text>
              </VStack>
            </BaseTooltip>
          )
        },
        valueRender: () => {
          return (
            <Text textStyle="20">
              {apy ? <NumberTips value={getTotalApy(apy)} isRatio={true} /> : '--'}
            </Text>
          )
        },
      },
      {
        labelRender: () => {
          return (
            <BaseTooltip
              text={`${t('totalBorrowings')}`}
              afterText={{
                children: ' :',
              }}
              textStyles={{
                textAlign: 'center',
                textStyle: '14',
                color: 'purple.100',
              }}
            >
              <Text textAlign="center" textStyle="14" whiteSpace="break-spaces">
                {t('totalBorrowingsToolTip')}
              </Text>
            </BaseTooltip>
          )
        },

        valueRender: () => {
          return (
            <Text textStyle="20">
              {borrowBalance ? <NumberTips value={borrowBalance} shortNum={2} symbol="$" /> : '--'}
            </Text>
          )
        },
      },
      {
        labelRender: () => {
          return (
            <BaseTooltip
              text={`${t('collateral')}`}
              afterText={{
                children: ' :',
              }}
              textStyles={{
                textAlign: 'left',
                textStyle: '14',
                color: 'purple.300',
              }}
            >
              <Text textAlign="left" textStyle="14" whiteSpace="break-spaces">
                {t('collateralToolTip')}
              </Text>
            </BaseTooltip>
          )
        },

        valueRender: () => {
          return (
            <Text textStyle="20">
              {supplyBalance ? <NumberTips value={supplyBalance} shortNum={2} symbol="$" /> : '--'}
            </Text>
          )
        },
      },
      borrowBalance && {
        labelRender: () => {
          return (
            <BaseTooltip
              text={`${t('borrowingPowerUsed')}`}
              afterText={{
                children: ' :',
              }}
              textStyles={{
                textAlign: 'center',
                textStyle: '14',
                color: 'purple.100',
              }}
            >
              <VStack alignItems="start">
                <Text>{t('borrowingPowerUsedToolTipFirst')}</Text>
                <Text>{t('borrowingPowerUsedToolTipSecond')}</Text>
              </VStack>
            </BaseTooltip>
          )
        },

        valueRender: () => {
          return (
            <Text textStyle="20">
              {borrowRatio ? (
                <NumberTips value={borrowRatio > 1 ? 1 : borrowRatio} isRatio />
              ) : (
                '--'
              )}
            </Text>
          )
        },
      },
      borrowBalance && {
        labelRender: () => {
          return (
            <BaseTooltip
              text={`${t('heathFactor')}`}
              afterText={{
                children: ' :',
              }}
              textStyles={{
                textAlign: 'left',
                textStyle: '14',
                color: 'purple.300',
              }}
            >
              <VStack alignItems="start" textAlign="left">
                <Text>{t('heathFactorToolTipFirst')}</Text>
                <Text>{t('heathFactorToolTipSecond')}</Text>
                <Text>{t('heathFactorToolTipThrid')}</Text>
                <Text>{t('heathFactorToolTipFourth')}</Text>
                <Text textAlign="left">{t('heathFactorToolTipFive')}</Text>
              </VStack>
            </BaseTooltip>
          )
        },
        valueRender: () => {
          return (
            <HStack spacing={{ base: px2vw(14), xl: '14px' }}>
              <Text>
                {' '}
                {healthFactor?.rowValue ? (
                  <>
                    <NumberTips
                      showTrue
                      toolTipProps={{ isDisabled: false }}
                      value={healthFactor?.rowValue}
                      isRatio={true}
                    />
                  </>
                ) : (
                  '--'
                )}
              </Text>
              {healthFactor && <Health width={px2vw(70)} value={healthFactor?.rowValue * 100} />}
            </HStack>
          )
        },
      },
    ],
    [apy, borrowBalance, borrowRatio, healthFactor, supplyBalance, t]
  )

  return (
    <>
      <Box
        // display={!type || type === 'myBank' ? 'inherit' : 'none'}
        marginTop={{ base: px2vw(30) }}
        marginBottom={{ base: px2vw(30) }}
      >
        <VStack spacing={{ base: px2vw(20) }} padding={{ base: px2vw(10) }}>
          {/* 下拉选择框 */}
          <Select
            display={{ base: 'flex' }}
            value="/dashboard"
            alignSelf="start"
            options={dashboardSubMenu}
            isAuto={false}
            valueChange={(item: any) => {
              router.push(item.value)
              // dashboardStore.setState({
              //   mobileType: item.value,
              // })
            }}
          />
          {/* 信息 */}

          <InfoList
            data={topData as any}
            textStyle="20"
            padding={{ base: px2vw(20) }}
            width="100%"
            color="white"
            borderRadius="xl"
            backgroundColor="gray.100"
          />
          {/* 钱包余额 */}
          {/* <DashboardMobileFluxReward /> */}
          {/* 列表 */}
          <DashboardMobileList />

          {/* 我的农场 */}
        </VStack>
      </Box>
      {/* <Box display={type === 'myFarm' ? 'inherit' : 'none'}>
        <MyFarm />
      </Box> */}
    </>
  )
}
export default Index
