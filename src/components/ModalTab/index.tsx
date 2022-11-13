import React from 'react'
import { HStack, Text, Box, TextProps } from '@chakra-ui/react'
import { buttonHover } from '@/theme/utils'
import isEuqal from 'lodash.isequal'
import px2vw from '@/utils/px2vw'
import { useTranslation } from 'react-i18next'

export interface InfoItemProps {
  label?: string
  value?: any
}

export interface ModalTabProps {
  tabs: [InfoItemProps, InfoItemProps]
  currentTab: any
  color: TextProps['color'] //颜色
  tokenIcon?: string
  onChange: (record: any) => void
}

function Index({ tabs, color, currentTab, tokenIcon, onChange }: ModalTabProps) {
  const { t } = useTranslation(['dashboard'])

  return (
    <Box position="relative">
      <HStack
        spacing={{ base: px2vw(120), xl: '120px' }}
        justifyContent="space-between"
        padding={{ base: `0 ${px2vw(14)}`, xl: '0 14px' }}
      >
        {tabs.map((item) => {
          return (
            <Text
              key={item.value}
              onClick={() => {
                onChange(item)
              }}
              color={isEuqal(currentTab, item) ? color : 'silver.100'}
              textStyle="18"
              fontWeight="bold"
              _hover={buttonHover}
            >
              {t(item.label as any)}
            </Text>
          )
        })}
      </HStack>
      <Box
        borderRadius="round"
        backgroundImage={tokenIcon}
        backgroundColor="white"
        backgroundSize="contain"
        backgroundRepeat="no-repeat"
        width={{ base: px2vw(60), xl: '60px' }}
        height={{ base: px2vw(60), xl: '60px' }}
        top={{ base: px2vw(-40), xl: '-40px' }}
        position="absolute"
        left={{ base: `calc(50% - ${px2vw(30)})`, xl: `calc(50% - 30px)` }}
      />
    </Box>
  )
}
export default Index
