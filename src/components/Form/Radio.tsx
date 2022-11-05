import {
  Center,
  Flex,
  Box,
  Stack,
  useRadioGroup,
  useRadio,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react'
import { useField, useFormikContext } from 'formik'
import React, { FC, useCallback, useState } from 'react'
import { round } from 'mathjs'

import FormControl, { BaseProps } from './FormControl'
import { formatNumFloat } from '@/utils/math'
import px2vw from '@/utils/px2vw'

export type RadioControlProps = BaseProps & { restList?: any }

const options = ['1-0.5', '1-1']

const precision = 1

export const SlippageRadio: FC<RadioControlProps> = (props: RadioControlProps) => {
  const { name, label, restList, ...rest } = props

  const [field] = useField(name)
  const { setFieldValue, setFieldTouched } = useFormikContext()

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'framework',
    value: field?.value,
    defaultValue: options[0],
    onChange: (value: string) => {
      setFieldValue(name, value)
    },
  })

  const group = getRootProps()

  return (
    <FormControl
      name={name}
      mt={{ base: px2vw(15), xl: '15px' }}
      restLabel={{ mr: 0 }}
      label={
        <Flex justifyContent="space-between" alignItems="center" w="full">
          <Flex textStyle="12">{label}:</Flex>
          <Stack direction="row" spacing={{ base: px2vw(10), xl: '10px' }} {...restList} {...group}>
            {options.map((value) => {
              const radio = getRadioProps({ value })
              return (
                <RadioCard key={value} {...radio}>
                  {value}
                </RadioCard>
              )
            })}
            <InputRadioCard
              {...getRadioProps({ value: field?.value || options[0] })}
              onBlur={() => {
                setFieldTouched(name, true)
              }}
            />
          </Stack>
        </Flex>
      }
      {...rest}
    ></FormControl>
  )
}

function RadioCard(props: any) {
  const { getInputProps, getCheckboxProps } = useRadio(props)
  const input = getInputProps()
  const checkbox = getCheckboxProps()
  return (
    <Box as="label">
      <input {...input} />
      <Center
        {...checkbox}
        cursor="pointer"
        textStyle="12"
        bg="gray.400"
        borderRadius={{ base: px2vw(6), xl: '6px' }}
        _hover={{ bg: 'gray.500' }}
        _checked={{
          bg: 'black.200',
          color: 'white',
          fontWeight: 'bold',
        }}
        w={{ base: px2vw(40), xl: '40px' }}
        h={{ base: px2vw(14), xl: '14px' }}
        lineHeight={{ base: px2vw(14), xl: '14px' }}
      >
        {`${props.children}`.split('-')[1]}%
      </Center>
    </Box>
  )
}

function InputRadioCard(props: any) {
  const isChecked = props.value?.split('-')[0] === '2'
  const [v, setV] = useState('0')
  const { getInputProps } = useRadio({
    ...props,
    isChecked,
    value: `2-${v}`,
  })

  const input = getInputProps()

  const onChange = useCallback(
    function (event: React.ChangeEvent<HTMLInputElement>) {
      let value = formatNumFloat(event.target.value, precision)
      if (+value > 100) {
        value = '100'
      }
      setV(value)
      props.onChange?.(`2-${value}`)
    },
    [props]
  )
  const onFocus = function () {
    props?.onChange?.(`2-${v}`)
  }
  // 黑魔法
  const onBlur = function () {
    // let value = '0.1'
    // if (v != '0') {
    const value = round(+v, 1).toFixed(1)
    // }
    setV(value)
    props.onChange?.(`2-${value}`)
    props?.onBlur?.()
  }

  const checkbox = {
    'data-checked': isChecked ? true : undefined,
  }

  return (
    <Flex as="label" alignItems="center" justifyContent="center" pointerEvents="none">
      <input {...input} value={`2-${v}`} />
      <NumberInput
        w="100%"
        min={0.1}
        max={99}
        step={0.1}
        value={v}
        focusBorderColor="rgba(255, 255, 255, 0.2)"
        precision={precision}
      >
        <NumberInputField
          {...checkbox}
          _hover={{ bg: 'gray.500' }}
          _checked={{
            bg: 'black.200',
            color: 'white',
            fontWeight: 'bold',
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
          inputMode="decimal"
          w={{ base: px2vw(50), xl: '50px' }}
          h={{ base: px2vw(14), xl: '14px' }}
          lineHeight={{ base: px2vw(14), xl: '14px' }}
          fontSize="12"
          bg="gray.400"
          borderRadius={{ base: px2vw(6), xl: '6px' }}
          border="none"
          paddingInlineStart={{ base: px2vw(10), xl: '10px' }}
          paddingInlineEnd={{ base: px2vw(10), xl: '10px' }}
          pointerEvents="auto"
        />
      </NumberInput>
      <Box ml={{ base: px2vw(2), xl: '2px' }} textStyle="12" color="white" userSelect="none">
        %
      </Box>
    </Flex>
  )
}
