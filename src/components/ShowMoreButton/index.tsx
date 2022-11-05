import React from 'react'
import { HStack, Text, Image, StackProps, ImageProps } from '@chakra-ui/react'

import { buttonHover } from '@/theme/utils'
import px2vw from '@/utils/px2vw'

import bottomArrowGreen from '@/assets/images/svg/bottomArrowGreen.svg'
export interface ShowMoreButtonProps extends StackProps {
  text: string //文案
  visible: boolean //显示还是隐藏
  arrowStyle?: ImageProps
}

function Index({ visible, text, onClick, arrowStyle, ...stackProps }: ShowMoreButtonProps) {
  return (
    <HStack
      marginTop={{ base: px2vw(15), xl: '15px' }}
      color="green.100"
      spacing={{ base: px2vw(8), xl: '8px' }}
      width="max-content"
      onClick={onClick}
      _hover={buttonHover}
      {...stackProps}
    >
      <Text>{text}</Text>
      <Image
        src={bottomArrowGreen}
        ignoreFallback
        transform={visible ? 'inherit' : 'rotate(-90deg)'}
        {...arrowStyle}
      />
    </HStack>
  )
}
export default React.memo(Index)
