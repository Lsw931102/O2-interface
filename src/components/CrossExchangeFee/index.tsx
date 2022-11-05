import React from 'react'
import { VStack, Text, Flex, HStack, Box } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'

import { buttonHover } from '@/theme/utils'
import px2vw from '@/utils/px2vw'

import NumberTips from '@/components/NumberTips'

import exchangeFeeCurrent from '@/assets/images/svg/exchangeFeeCurrent.svg'

export interface CrossExchangeFeeProps {
  feeType: number //是否使用flux支付

  fluxFee: any
  normalFee: any
  symbol?: string
  onClick: (feeType: number) => void
}

export interface FeeSwitchProps {
  isActive: boolean
  onClick: () => void
}

export const FeeSwitch = ({ isActive, onClick }: FeeSwitchProps) => {
  return (
    <Box
      onClick={onClick}
      height={{ base: px2vw(14), xl: '14px' }}
      width={{ base: px2vw(14), xl: '14px' }}
      borderRadius="round"
      border={{ base: `${px2vw(2)} solid`, xl: '2px solid' }}
      borderColor="purple.300"
      backgroundImage={isActive ? exchangeFeeCurrent : 'inherit'}
      backgroundSize="contain"
      _hover={buttonHover}
    ></Box>
  )
}

function Index({ feeType, normalFee, symbol = '', onClick }: CrossExchangeFeeProps) {
  const { t } = useTranslation(['cross'])
  return (
    <Flex
      textStyle="14"
      padding={{ base: `0`, xl: '0 10px' }}
      width="100%"
      justifyContent="space-between"
      marginTop="15px !important"
    >
      <Text>{t('Exchange Fee')}</Text>
      <VStack spacing={{ base: px2vw(13), xl: '13px' }} alignItems="flex-end">
        {/* <HStack spacing={{ base: px2vw(5), xl: '5px' }} justifyContent="center" alignItems="center">
          <Text>
            {fluxFee ? <NumberTips toolTipProps={{ isDisabled: false }} value={fluxFee} /> : '--'}{' '}
            FLUX
          </Text>
          <Text>[20%off]</Text>
          <FeeSwitch
            isActive={feeType === 0}
            onClick={() => {
              onClick(0)
            }}
          />
        </HStack> */}
        <HStack spacing={{ base: px2vw(5), xl: '5px' }}>
          <Text>
            {normalFee ? (
              <>
                <NumberTips toolTipProps={{ isDisabled: false }} value={normalFee} /> {symbol}
              </>
            ) : (
              '--'
            )}
          </Text>
          <FeeSwitch
            isActive={feeType === 1}
            onClick={() => {
              onClick(1)
            }}
          />
        </HStack>
      </VStack>
    </Flex>
  )
}
export default React.memo(Index)
