import React, { useMemo } from 'react'
import { useTranslation } from 'next-i18next'

import { Center, CenterProps, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react'

import Health from '@/components/Health'
import NumberTips from '@/components/NumberTips'
import BaseTooltip from '@/components/BaseTooltip'
import searchProviderStore from '@/stores/contract/searchProvider'

import { getBorrowRatio, getTotalApy } from '@/utils/dataFormat'
import fluxAppStore from '@/stores/contract/fluxApp'
import useMarketInfo from '@/hooks/useMarketInfo'

interface ContainerItemProps extends CenterProps {
  children: any
}
export function ContainerItem({ children, ...containerProps }: ContainerItemProps) {
  return (
    <Center
      flexDirection="column"
      width={{ md: '100%' }}
      height={{ md: '106px' }}
      padding={{ md: '25px 22px' }}
      marginBottom={{ md: '15px' }}
      borderRadius={{ md: 'xxl' }}
      backgroundColor="grey.275"
      color="white"
      {...containerProps}
    >
      {children}
    </Center>
  )
}

function Index() {
  const { t } = useTranslation(['dashboard'])

  const { apy } = searchProviderStore()
  const { supplyBalance, borrowBalance, borrowLimit } = fluxAppStore()

  const { getHealthFactor } = useMarketInfo()
  const borrowRatio = useMemo(
    () => getBorrowRatio(borrowBalance, borrowLimit),
    [borrowBalance, borrowLimit]
  )

  const healthFactor = useMemo(() => getHealthFactor('deposit'), [getHealthFactor])

  return (
    <SimpleGrid minChildWidth="320px" spacingX={85}>
      {/* left */}
      <ContainerItem>
        <Stack direction="row" marginBottom={{ md: '16px' }}>
          {/* <Box color="green.300">{t('totalDeposits')} ⓘ : </Box> */}
          <BaseTooltip
            text={`${t('totalDeposits')}`}
            afterText={{
              children: ' :',
            }}
            textStyles={{
              textAlign: 'center',
              textStyle: '14',
              color: 'green.300',
            }}
          >
            <Text
              textAlign="left"
              textStyle="14"
              lineHeight={{ xl: '18px' }}
              whiteSpace="break-spaces"
            >
              {t('totalDepositsToolTip')}
            </Text>
          </BaseTooltip>
          <Text textStyle="20">
            {supplyBalance ? (
              <NumberTips
                toolTipProps={{ isDisabled: false }}
                value={supplyBalance}
                shortNum={2}
                symbol="$"
              />
            ) : (
              '--'
            )}
          </Text>
        </Stack>
        <Stack direction="row">
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
          <Text textStyle="20">
            {apy ? (
              <NumberTips
                toolTipProps={{ isDisabled: false }}
                value={getTotalApy(apy)}
                isRatio={true}
              />
            ) : (
              '--'
            )}
          </Text>
        </Stack>
      </ContainerItem>
      {/* cneter */}
      <ContainerItem>
        <Stack direction="row" marginBottom={{ md: '16px' }}>
          {/* <Box color="purple.100">{t('totalBorrowings')} ⓘ : </Box> */}
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
            <Text
              textAlign="left"
              textStyle="14"
              lineHeight={{ xl: '18px' }}
              whiteSpace="break-spaces"
            >
              {t('totalBorrowingsToolTip')}
            </Text>
          </BaseTooltip>
          <Text textStyle="20">
            {borrowBalance ? (
              <NumberTips
                toolTipProps={{ isDisabled: false }}
                value={borrowBalance}
                shortNum={2}
                symbol="$"
              />
            ) : (
              '--'
            )}
          </Text>
        </Stack>
        <Stack direction="row">
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
            <Text
              textAlign="left"
              textStyle="14"
              lineHeight={{ xl: '18px' }}
              whiteSpace="break-spaces"
            >
              {t('collateralToolTip')}
            </Text>
          </BaseTooltip>
          <Text textStyle="20">
            {supplyBalance ? (
              <NumberTips
                toolTipProps={{ isDisabled: false }}
                value={supplyBalance}
                shortNum={2}
                symbol="$"
              />
            ) : (
              '--'
            )}
          </Text>
        </Stack>
      </ContainerItem>
      {/* right */}
      <ContainerItem display={borrowBalance ? 'flex' : 'none'}>
        <Stack direction="row" marginBottom={{ md: '16px' }}>
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
          <Text textStyle="20">
            {borrowRatio ? (
              <NumberTips
                toolTipProps={{ isDisabled: false }}
                value={borrowRatio > 1 ? 1 : borrowRatio}
                isRatio
              />
            ) : (
              '--'
            )}
          </Text>
        </Stack>
        <Stack direction="row" alignItems="center">
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

          {healthFactor && (
            <Health showValue showLabel width="85px" value={healthFactor?.rowValue * 100} />
          )}
        </Stack>
      </ContainerItem>
    </SimpleGrid>
  )
}

export default React.memo(Index)
