import { Text, HStack, Image, StackProps, Stack, Box } from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { buttonHover } from '@/theme/utils'
import px2vw from '@/utils/px2vw'

import rightArrow from '@/assets/images/svg/rightArrow.svg'

export interface CrossFromChainProps extends StackProps {
  icon?: string
  text?: string
}

export function CrossChainLabel({ icon, text, ...stackProps }: CrossFromChainProps) {
  return (
    <HStack
      textStyle={{ base: '16', xl: '18' }}
      width="100%"
      height={{ base: px2vw(40), xl: '60px' }}
      padding={{ base: px2vw(10), xl: '10px' }}
      justifyContent="center"
      alignItems="center"
      borderRadius="xl"
      {...stackProps}
    >
      <Box
        backgroundColor={!icon ? 'white' : 'initial'}
        backgroundImage={icon || 'inherit'}
        backgroundRepeat="no-repeat"
        backgroundSize="contain"
        backgroundPosition="center"
        height={{ base: px2vw(30), xl: '40px' }}
        width={{ base: px2vw(30), xl: '40px' }}
        borderRadius="round"
      />
      <Text whiteSpace="nowrap">{text || '--'}</Text>
    </HStack>
  )
}

export function CrossFromChain({ icon, text }: CrossFromChainProps) {
  const { t } = useTranslation(['cross'])
  return (
    <Stack
      direction={{ base: 'row', xl: 'column' }}
      flex="1"
      alignItems={{ base: 'center', xl: 'flex-start' }}
      width={{ base: '100%', xl: '100%' }}
      spacing={{ base: px2vw(52), xl: '10px' }}
      backgroundColor={{ base: 'gray.100', xl: 'inherit' }}
      borderRadius={{ base: 'xl', xl: 'inherit' }}
    >
      <Text textStyle="14" paddingLeft={{ base: px2vw(10), xl: '10px' }}>
        {t('From')}
      </Text>
      <CrossChainLabel
        icon={icon}
        text={text}
        backgroundColor={{ base: 'initial', xl: 'gray.100' }}
        justifyContent={{ base: 'start', xl: 'center' }}
      />
    </Stack>
  )
}

export function CrossToChain({ icon = '', text = '', onClick }: CrossFromChainProps) {
  const { t } = useTranslation(['cross'])
  return (
    <Stack
      direction={{ base: 'row', xl: 'column' }}
      onClick={onClick}
      flex="1"
      alignItems={{ base: 'center', xl: 'flex-start' }}
      spacing={{ base: px2vw(79), xl: '10px' }}
      width={{ base: '100%', xl: 'inherit' }}
      backgroundColor={{ base: 'gray.200', xl: 'inherit' }}
      borderRadius={{ base: 'xl', xl: 'inherit' }}
    >
      <Text textStyle="14" paddingLeft={{ base: px2vw(10), xl: '10px' }}>
        {t('To')}
      </Text>
      <HStack
        spacing={{ base: px2vw(75), xl: '28px' }}
        textStyle={{ base: '16', xl: '18' }}
        width="100%"
        height={{ base: px2vw(40), xl: '60px' }}
        padding={{ base: px2vw(10), xl: '10px' }}
        justifyContent="center"
        alignItems="center"
        backgroundColor={{ base: 'initial', xl: 'gray.200' }}
        borderRadius="xl"
        _hover={buttonHover}
      >
        <HStack spacing={{ base: px2vw(5), xl: '5px' }}>
          {icon && (
            <Image
              width={{ base: px2vw(30), xl: '40px' }}
              height={{ base: px2vw(30), xl: '40px' }}
              src={icon}
              ignoreFallback
            />
          )}
          <Text whiteSpace="nowrap">{text}</Text>
        </HStack>

        <Image
          marginLeft={{ base: px2vw(20), xl: 'inherit' }}
          width={{ base: px2vw(7), xl: '10px' }}
          src={rightArrow}
          ignoreFallback
        />
      </HStack>
    </Stack>
  )
}
export default React.memo(CrossToChain)
