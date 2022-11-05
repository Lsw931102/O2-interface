import React from 'react'
import { completeUrl } from '@/utils/common'
import { Image, ImageProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'

function Index({ ...props }: ImageProps) {
  return (
    <Image
      w={{ base: px2vw(240), xl: '240px' }}
      h={{ base: px2vw(260), xl: '260px' }}
      mx="auto"
      src={completeUrl('noData.svg')}
      {...props}
    />
  )
}

export default React.memo(Index)
