import React from 'react'
import { useRouter } from 'next/router'
import { VStack, Text, Image, Box, ModalProps } from '@chakra-ui/react'

import px2vw from '@/utils/px2vw'
import BaseButton from '@/components/BaseButton'

import buttonCancel from '@/assets/images/svg/buttonCancel.svg'

export interface ChoosePageProps {
  children: React.ReactNode
  title: string
  onClose?: ModalProps['onClose']
}

function Index({ title, children, onClose }: ChoosePageProps) {
  const router = useRouter()
  return (
    <Box
      padding={{ base: px2vw(20) }}
      position="relative"
      height={{ base: `calc(100vh - ${px2vw(46)})` }}
    >
      <VStack spacing={{ base: px2vw(40) }}>
        <Text textStyle="18">{title}</Text>
        <Box width="100%" height={{ base: px2vw(440) }} overflowY="auto">
          {children}
        </Box>
      </VStack>
      <BaseButton
        position="absolute"
        left={{ base: `calc(50% - ${px2vw(23)})` }}
        bottom={{ base: px2vw(30) }}
        buttonClick={
          onClose
            ? onClose
            : () => {
                router.back()
              }
        }
        needVerify={false}
        h={{ base: px2vw(46), xl: '46px' }}
        w={{ base: px2vw(46), xl: '46px' }}
        minW="initial"
        borderRadius="round"
        margin={{ base: `${px2vw(40)} auto 0`, xl: '40px auto 0' }}
        opacity={0.5}
        // isCircular
        specialIcon={
          <Image
            height={{ base: px2vw(22), xl: '22px' }}
            width={{ base: px2vw(22), xl: '22px' }}
            maxWidth="inherit"
            src={buttonCancel}
            ignoreFallback
          />
        }
      />
    </Box>
  )
}
export default React.memo(Index)
