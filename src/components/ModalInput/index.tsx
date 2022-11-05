import { HStack, VStack, Text } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import BaseButton, { IProps as ButtonProps } from '@/components/BaseButton'
import px2vw from '@/utils/px2vw'
import BaseInput, { IProps as BaseInputProps } from '@/components/BaseInput'
import { utils } from 'ethers'
import NumberTips from '../NumberTips'

export interface ModalInputProps {
  record?: any
  isApproved?: boolean
  errorInfo?: any
  buttonProps: ButtonProps
  inputProps: BaseInputProps
}

function Index({ record, isApproved, buttonProps, inputProps, errorInfo }: ModalInputProps) {
  const total = useMemo(() => {
    if (!inputProps?.value || !record?.underlyingPrice) return 0
    const value = inputProps.value as number
    const underlyingPrice = Number(utils.formatUnits(record.underlyingPrice?.toString()).toString())
    return value * underlyingPrice
  }, [record, inputProps.value])

  const errorInfoMemo = useMemo(() => {
    if (record?.isCoinMarket) {
      if (!isApproved) {
        return errorInfo?.startsWith('请先授权') || errorInfo?.startsWith('Approve')
          ? ''
          : errorInfo
      } else {
        return errorInfo
      }
    } else {
      return errorInfo
    }
  }, [errorInfo, isApproved, record?.isCoinMarket])

  return (
    <>
      <HStack
        spacing={{ base: px2vw(23), xl: '46px' }}
        width="100%"
        padding={{ base: px2vw(10), xl: '10px' }}
        borderRadius="md"
        backgroundColor="gray.400"
        border={errorInfoMemo ? '1px solid' : 'inherit'}
        borderColor={errorInfoMemo ? 'red.200' : 'inherit'}
      >
        <VStack paddingLeft={{ base: px2vw(35), xl: '35px' }} color="purple.300" alignItems="left">
          <HStack textStyle="22">
            <BaseInput
              variant="unstyled"
              padding="0"
              textAlign="center"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true}
              fontSize={{ base: px2vw(22), xl: '22px' }}
              fontWeight="bold"
              {...inputProps}
              valChange={(v) => {
                inputProps.valChange(v)
              }}
            />
            <Text>{record?.symbol}</Text>
          </HStack>
          <Text>
            ≈ <NumberTips symbol="$" value={total} shortNum={2} />
          </Text>
        </VStack>
        <BaseButton
          h={{ base: px2vw(50), xl: '50px' }}
          w={{ base: px2vw(50), xl: '50px' }}
          minW="inherit"
          borderRadius="50%"
          {...buttonProps}
        />
      </HStack>
      {errorInfoMemo && (
        <Text
          textStyle="14"
          textAlign="center"
          color="red.200"
          marginTop={{ base: px2vw(15), xl: '15px' }}
        >
          {errorInfoMemo}
        </Text>
      )}
    </>
  )
}

export default React.memo(Index)
