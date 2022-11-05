import React from 'react'
import { Box, HStack, useRadio, useRadioGroup, StackProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'

// 1. Create a component that consumes the `useRadio` hook
function RadioCard(props: any) {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        minW={{ base: px2vw(131), xl: '132px' }}
        p={{ base: `${px2vw(8)} ${px2vw(14)}`, xl: '8px 14px' }}
        color="grey.50"
        textStyle="14"
        bg="grey.275"
        cursor="pointer"
        borderRadius="select"
        textAlign="center"
        _checked={{
          color: 'white',
          bg: 'grey.400',
        }}
        {...props?.itemStyle}
      >
        {props.children}
      </Box>
    </Box>
  )
}

interface Item {
  label: string
  value: string | number
  render?: () => React.ReactNode
}
interface IProps extends StackProps {
  options: Item[]
  defaultValue?: any // 默认值/当前选中的值
  onChange: (val: any) => void
  spacing?: any // 间距
  itemStyle?: any // 按钮样式
  value?: any
}
// Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
function CustomGroup({
  options,
  defaultValue,
  onChange,
  spacing,
  value,
  itemStyle,
  ...props
}: IProps) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'fluxRadioGroup',
    defaultValue: defaultValue || options[0]?.value,
    value,
    onChange: onChange,
  })

  const group = getRootProps()

  return (
    <HStack spacing={spacing || { base: px2vw(30), xl: '30px' }} {...group} {...props}>
      {options.map((item: Item) => {
        const radio = getRadioProps({ value: item?.value })
        return (
          <RadioCard key={item?.value} itemStyle={itemStyle} {...radio}>
            {item?.render ? item?.render() : item?.label}
          </RadioCard>
        )
      })}
    </HStack>
  )
}

export default React.memo(CustomGroup)
