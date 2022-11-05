import {
  Image,
  Text,
  Button,
  InputLeftElement,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Stack,
  Box,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'
import { useField, useFormikContext } from 'formik'

import FormControl, { BaseProps } from './FormControl'
import px2vw from '@/utils/px2vw'
import { formatNumFloat } from '@/utils/math'
import { netconfigs } from '@/consts/network'
import globalStore from '@/stores/global'
import BigNumber from 'bignumber.js'

interface TInputProps extends BaseProps {
  maxBtn?: boolean
  maxNum?: number | string
  precision?: number
  isApprove: boolean
  isRemove?: boolean
  approveLoading?: boolean
  tips?: string
  effectOnChange?: (
    values: any,
    opts: { setFieldValue?: any; setFieldTouched?: any; setValues?: any; setTouched?: any }
  ) => any
  effectOnBlur?: (
    values: any,
    opts: { setFieldValue?: any; setFieldTouched?: any; setValues?: any; setTouched?: any }
  ) => any
  imgUri: string
  label?: string | ((data: any) => string)
  labelValue?: string | ((data: any) => any)
  onApprove?: any
  noPoint?: boolean
}

export const TokenInput: FC<TInputProps> = ({
  noPoint,
  maxBtn,
  maxNum,
  precision = 4,
  tips,
  effectOnChange,
  effectOnBlur,
  isApprove,
  isRemove,
  approveLoading,
  imgUri,
  label,
  labelValue,
  name,
  onApprove,
  ...props
}: TInputProps) => {
  const { connectNet } = globalStore()
  const [field, , { setValue }] = useField(name)
  const { setFieldValue, setFieldTouched, setValues, setTouched, values, touched } =
    useFormikContext<any>()

  const { t } = useTranslation(['farm'])

  return (
    <FormControl
      name={name}
      label={
        <>
          {typeof label === 'function'
            ? `${label(values)}${noPoint ? '' : ':'}`
            : label
            ? `${label}${noPoint ? '' : ':'}`
            : ''}
          <Text as="span" float="right" className="ellipsis">
            {typeof labelValue === 'function' ? labelValue(values) : labelValue ?? ''}
          </Text>
        </>
      }
      {...props}
    >
      <InputGroup>
        {tips ? (
          <InputLeftElement
            w={{ base: px2vw(80), xl: '80px' }}
            height={{ base: px2vw(40), xl: '40px' }}
            zIndex="3"
            pointerEvents="none"
          >
            <Stack
              direction="row"
              spacing={{ base: px2vw(5), xl: '5px' }}
              justify="center"
              alignItems="center"
            >
              {imgUri && (
                <Image
                  src={imgUri}
                  w={{ base: px2vw(30), xl: '30px' }}
                  h={{ base: px2vw(30), xl: '30px' }}
                  cursor="pointer"
                  ignoreFallback
                />
              )}
              {tips && <Box fontWeight="bold">{tips}</Box>}
            </Stack>
          </InputLeftElement>
        ) : null}
        <NumberInput
          w="100%"
          min={0}
          max={maxNum as number}
          focusBorderColor="rgba(255, 255, 255, 0.2)"
          value={field.value}
          precision={precision}
          isDisabled={!isApprove || props.isDisabled}
        >
          <NumberInputField
            onChange={(...arr) => {
              const value = formatNumFloat(arr[0].target.value, precision)
              const newValues = {
                ...(values as any),
                [name]: value,
              }

              if (effectOnChange) {
                setValues(newValues)

                effectOnChange(newValues, {
                  setFieldValue,
                  setFieldTouched,
                  setValues: (v: any, shouldValidate = true) => {
                    setValues(
                      {
                        ...(values as any),
                        ...v,
                      },
                      shouldValidate
                    )
                  },
                  setTouched: (v: any, shouldValidate = true) => {
                    setTouched(
                      {
                        ...touched,
                        ...v,
                      },
                      shouldValidate
                    )
                  },
                })
              } else {
                setValue(value)
              }
            }}
            onBlur={() => {
              if (effectOnBlur) {
                effectOnBlur(undefined, {
                  setFieldValue,
                  setFieldTouched,
                  setValues: (v: any, shouldValidate = true) => {
                    setValues(
                      {
                        ...(values as any),
                        ...v,
                      },
                      shouldValidate
                    )
                  },
                  setTouched: (v: any, shouldValidate = true) => {
                    setTouched(
                      {
                        ...touched,
                        ...v,
                      },
                      shouldValidate
                    )
                  },
                })
              } else {
                setFieldTouched(name, true)
              }
            }}
            textAlign="right"
            inputMode="decimal"
            placeholder="0.00"
            fontSize="14"
            fontWeight="bold"
            paddingLeft={tips ? '120px' : '20px'}
            paddingRight={{
              base: px2vw(20 + (maxBtn ? 45 : 0)),
              xl: `${20 + (maxBtn ? 45 : 0)}px`,
            }}
            color="purple.300"
            height={{ base: px2vw(40), xl: '40px' }}
            bgColor="gray.400"
            border="none"
            borderRadius={{ base: px2vw(12), xl: '12px' }}
          />
        </NumberInput>
        {isApprove ? (
          maxBtn &&
          maxNum && (
            <InputRightElement w="auto" h="100%" paddingRight={{ base: px2vw(5), xl: '5px' }}>
              <Button
                variant="outline"
                bgColor="purple.300"
                colorScheme="teal"
                color="gray.700"
                borderRadius={{ base: px2vw(10), xl: '10px' }}
                h={{ base: px2vw(20), xl: '20px' }}
                fontWeight="bold"
                fontSize="12"
                px={{ base: px2vw(8), xl: '8px' }}
                onClick={() => {
                  let newMaxNum = '0'
                  // 判断是否为平台币
                  if (
                    netconfigs[connectNet as any]?.nativeCoin ===
                      values[name === 'tokenNum' ? 'token' : 'token1'] &&
                    !isRemove
                  ) {
                    const nativeCoin = netconfigs[connectNet as any]?.nativeCoin
                    let result = '0'
                    if (nativeCoin === 'CFX') {
                      result = new BigNumber(maxNum).minus(1).toString()
                    } else if (nativeCoin === 'BNB') {
                      result = new BigNumber(maxNum).minus(0.01).toString()
                    } else if (nativeCoin === 'HT') {
                      result = new BigNumber(maxNum).minus(0.01).toString()
                    } else if (nativeCoin === 'OKT') {
                      result = new BigNumber(maxNum).minus(0.01).toString()
                    } else if (nativeCoin === 'ETH') {
                      result = new BigNumber(maxNum).minus(0.01).toString()
                    } else if (nativeCoin === 'MATIC') {
                      result = new BigNumber(maxNum).minus(1).toString()
                    }
                    newMaxNum = result
                  } else {
                    newMaxNum = new BigNumber(maxNum).toString()
                  }
                  if (effectOnChange) {
                    const newValues = {
                      ...(values as any),
                      [name]: formatNumFloat(newMaxNum, precision),
                    }
                    setValues(newValues)

                    effectOnChange(newValues, {
                      setFieldValue,
                      setFieldTouched,
                      setValues: (v: any, shouldValidate = true) => {
                        setValues(
                          {
                            ...(values as any),
                            ...v,
                          },
                          shouldValidate
                        )
                      },
                      setTouched: (v: any, shouldValidate = true) => {
                        setTouched(
                          {
                            ...touched,
                            ...v,
                          },
                          shouldValidate
                        )
                      },
                    })
                  } else {
                    setValue(newMaxNum)
                  }
                }}
              >
                Max
              </Button>
            </InputRightElement>
          )
        ) : (
          <InputRightElement w="auto" h="100%">
            <Button
              isLoading={approveLoading}
              variant="outline"
              bgColor="purple.300"
              colorScheme="teal"
              color="gray.700"
              borderRightRadius={{ base: px2vw(10), xl: '10px' }}
              borderLeftRadius={{ base: px2vw(20), xl: '20px' }}
              w={{ base: px2vw(170), xl: '170px' }}
              h="full"
              fontWeight="bold"
              fontSize="12"
              px={{ base: px2vw(8), xl: '8px' }}
              onClick={onApprove}
            >
              {t('Approve To Input')}
            </Button>
          </InputRightElement>
        )}
      </InputGroup>
    </FormControl>
  )
}
