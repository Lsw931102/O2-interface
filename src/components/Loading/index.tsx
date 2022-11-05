import React from 'react'
import { Center, Image } from '@chakra-ui/react'

import px2vw from '@/utils/px2vw'
import { turn } from '@/theme/animations'

import tableLoadingIcon from '@/assets/images/tableLoadingIcon.png'

const Loading = React.memo(
  ({ loadingIcon = tableLoadingIcon, loading }: { loadingIcon?: string; loading?: boolean }) => {
    return (
      <Center
        width="100%"
        height="100%"
        minHeight={{ base: px2vw(150), xl: '150px' }}
        padding={{
          base: `${px2vw(15)} ${px2vw(20)} ${px2vw(15)} ${px2vw(20)}`,
          xl: `20px`,
        }}
        // height={{ md: '60px' }}
        marginBottom={{ base: px2vw(10), xl: '15px' }}
        // width="100%"
        opacity={loading ? '0.3' : '1'}
        backgroundColor="gray.200"
        textStyle="16"
        lineHeight={{ base: px2vw(30), xl: '30px' }}
        color="purple.300"
        borderRadius="xl"
        _hover={{
          boxShadow: '0px 0px 6px rgba(255, 255, 255, 0.25)',
        }}
      >
        <Image
          width={{ base: px2vw(30), xl: '30px' }}
          height={{ base: px2vw(30), xl: '30px' }}
          src={loadingIcon}
          alt="loading"
          animation={`${turn} 3s linear infinite`}
          ignoreFallback
        />
      </Center>
    )
  }
)
export default Loading
