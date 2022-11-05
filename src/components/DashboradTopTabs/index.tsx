import React, { useMemo } from 'react'
import { HStack, StackProps, Image, Text } from '@chakra-ui/react'
import { completeUrl } from '@/utils/common'
import { buttonHover } from '@/theme/utils'

export interface TabItemProps {
  label?: string
  value?: any
  icon?: string
}

export interface DashboardTopTabsProps extends StackProps {
  options: TabItemProps[]
  value?: any
  onChange?: (record: any) => void
}
function Index({ options, value, onChange, ...stackStyleProps }: DashboardTopTabsProps) {
  const renderItem = useMemo(() => {
    return options.map((item) => {
      return (
        <HStack
          key={item.value}
          onClick={() => {
            onChange && onChange(item)
          }}
          spacing="5px"
          height="100%"
          justifyContent="center"
          width="140px"
          borderBottomLeftRadius="md"
          borderBottomRightRadius="md"
          backgroundColor={value === item.value ? 'gray.300' : 'inherit'}
          _hover={buttonHover}
        >
          {item.icon && (
            <Image width="18px" height="18px" src={completeUrl('menu/bank.png')} ignoreFallback />
          )}
          {item.label && <Text>{item.label}</Text>}
        </HStack>
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, value])
  return (
    <HStack spacing="0" justifyContent="center" height="52px" {...stackStyleProps}>
      {renderItem}
    </HStack>
  )
}
export default React.memo(Index)
