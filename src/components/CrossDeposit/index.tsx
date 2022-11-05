import React from 'react'
import { Text, Flex } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'

import BaseInput, { IProps as BaseInputProps } from '@/components/BaseInput'
import BaseButton, { IProps as BaseButtonProps } from '@/components/BaseButton'

import px2vw from '@/utils/px2vw'

export interface CrossDepositProps extends BaseInputProps {
  errorInfo?: string | JSX.Element
  maxButtonProps: BaseButtonProps
}

function Index({ errorInfo = '', maxButtonProps, ...inputProps }: CrossDepositProps) {
  const { t } = useTranslation(['cross'])

  return (
    <>
      <Flex
        width="100%"
        padding={{ base: `${px2vw(5)}  ${px2vw(15)}`, xl: '3px 20px' }}
        justifyContent="space-between"
        alignItems="center"
        background="gray.400"
        borderRadius="xl"
        border={errorInfo ? '1px solid' : 'inherit'}
        borderColor={errorInfo ? 'red.200' : 'inherit'}
      >
        <Text whiteSpace="nowrap" marginRight={{ base: px2vw(20), xl: '20px' }}>
          {t('Amount')}
        </Text>
        <BaseInput
          variant="unstyled"
          type="number"
          padding="0"
          textAlign="right"
          fontSize={{ base: `${px2vw(18)}`, xl: '36px' }}
          fontWeight="bold"
          {...inputProps}
        />
        <BaseButton
          text="max"
          w={{ base: px2vw(50), xl: '50px' }}
          h={{ base: px2vw(20), xl: '20px' }}
          minW={{ base: px2vw(50), xl: '50px' }}
          borderRadius={{ base: px2vw(18), xl: '18px' }}
          ml={{ base: px2vw(20), xl: '20px' }}
          {...maxButtonProps}
        />
      </Flex>
      {typeof errorInfo === 'string' ? (
        <Text
          width="100%"
          textStyle="14"
          textAlign="center"
          color="red.200"
          marginTop={{ base: px2vw(15), xl: '15px' }}
        >
          {errorInfo}
        </Text>
      ) : (
        errorInfo
      )}
    </>
  )
}
export default React.memo(Index)
