import React, { useEffect, useState, useRef } from 'react'
import { Flex, Text, Box, useDisclosure, FlexProps, useOutsideClick } from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import px2vw from '@/utils/px2vw'

export interface IOption {
  label: string
  value: string | number

  render?: any
}
interface IProps extends FlexProps {
  options: IOption[]
  valueChange: (item: IOption) => void
  value?: string | number | null
  isAuto?: boolean //是否自动填充值
  placeholder?: string
}
function Index({ options, valueChange, value, placeholder = '', isAuto = true, ...props }: IProps) {
  const [curOption, setOption] = useState(options.find((it) => it.value === value))
  const { isOpen, onOpen, onClose } = useDisclosure()

  const ref: any = useRef()
  useOutsideClick({
    ref: ref,
    handler: onClose,
  })

  useEffect(() => {
    if (value) {
      setOption(options.find((it) => it.value === value))
    } else {
      setOption(options?.[0])
    }
  }, [options, value])

  const selectChange = (item: IOption) => {
    isAuto && setOption(item)

    valueChange?.(item)
    onClose()
  }

  return (
    <Flex
      direction="column"
      w={{ base: px2vw(160), xl: '160px' }}
      pos="relative"
      {...props}
      ref={ref}
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        w="full"
        h={{ base: px2vw(40), xl: '40px' }}
        p={{ base: `0 ${px2vw(15)}`, xl: '0 15px' }}
        color="white"
        fontWeight="normal"
        bg={isOpen ? 'gray.700' : 'gray.400'}
        borderRadius={isOpen ? '15px 15px 0 0' : 'select'}
        onClick={isOpen ? onClose : onOpen}
      >
        {curOption ? (
          <Box>{curOption?.render ? curOption?.render() : curOption?.label}</Box>
        ) : (
          <Text>{placeholder}</Text>
        )}
        {isOpen ? (
          <TriangleUpIcon w={{ base: px2vw(10), xl: '10px' }} h={{ base: px2vw(10), xl: '10px' }} />
        ) : (
          <TriangleDownIcon
            w={{ base: px2vw(10), xl: '10px' }}
            h={{ base: px2vw(10), xl: '10px' }}
          />
        )}
      </Flex>
      {isOpen && (
        <Flex
          pos="absolute"
          top={{ base: px2vw(40), xl: '40px' }}
          direction="column"
          w="full"
          borderRadius="0 0 15px 15px"
        >
          {options
            .filter((it) => it?.value !== curOption?.value)
            .map((item, index) => (
              <Flex
                key={item?.value}
                alignItems="center"
                justifyContent="space-between"
                w="full"
                h={{ base: px2vw(40), xl: '40px' }}
                p={{ base: `0 ${px2vw(15)}`, xl: '0 15px' }}
                color="white"
                fontWeight="normal"
                bg="gray.700"
                borderRadius={
                  index === options.filter((it) => it?.value !== curOption?.value)?.length - 1
                    ? '0 0 15px 15px'
                    : '0'
                }
                onClick={() => selectChange(item)}
              >
                <Box>{item?.render ? item?.render() : item?.label}</Box>
              </Flex>
            ))}
        </Flex>
      )}
    </Flex>
  )
}

export default React.memo(Index)
