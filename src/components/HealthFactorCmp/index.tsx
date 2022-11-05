import { Box, Text, VStack } from '@chakra-ui/react'
import React from 'react'

import px2vw from '@/utils/px2vw'

import { InfoItem } from '@/components/InfoList'
import NumberTips from '@/components/NumberTips'
import Health from '@/components/Health'
import { useTranslation } from 'react-i18next'
import BaseTooltip from '../BaseTooltip'

export interface healthFactorCmp {
  healthFactor?: {
    rowValue: number
    finalValue: any
  }
  hasBorrow?: boolean
}
function Index({ healthFactor, hasBorrow }: healthFactorCmp) {
  const { t } = useTranslation(['dashboard'])
  return (
    <>
      {hasBorrow && (
        <Box width="100%">
          <InfoItem
            labelRender={() => {
              return (
                <BaseTooltip
                  text={t('heathFactor') as string}
                  afterText={{
                    children: ':',
                  }}
                  textStyles={{
                    textAlign: 'left',
                  }}
                >
                  <VStack alignItems="start">
                    <Text>{t('heathFactorToolTipFirst')}</Text>
                    <Text>{t('heathFactorToolTipSecond')}</Text>
                    <Text>{t('heathFactorToolTipThrid')}</Text>
                    <Text>{t('heathFactorToolTipFourth')}</Text>
                    <Text>{t('heathFactorToolTipFive')}</Text>
                  </VStack>
                </BaseTooltip>
              )
            }}
            valueRender={() => {
              return (
                <Text>
                  <NumberTips showTrue isRatio value={healthFactor?.rowValue} /> →{' '}
                  <NumberTips showTrue isRatio value={healthFactor?.finalValue} />
                </Text>
              )
            }}
            margin={{ base: `${px2vw(20)} 0 ${px2vw(15)}`, xl: '20px 0 15px' }}
          />
          <Health width="100%" value={healthFactor?.finalValue * 100 || 0} showLabel />
        </Box>
      )}
    </>
  )
}
export default Index
