import { Stack, Image, Text } from '@chakra-ui/react'
import React from 'react'
import { useRouter } from 'next/router'

import BaseButton from '@/components/BaseButton'
import px2vw from '@/utils/px2vw'

import dashboardEmptyBorrow from '@/assets/images/dashboardEmptyBorrow.png'

function Index() {
  const router = useRouter()

  return (
    <Stack
      paddingTop={{ base: px2vw(22), xl: '22px' }}
      direction="column"
      spacing={{ base: px2vw(50), xl: '50px' }}
      justifyContent="center"
      alignItems="center"
    >
      <Image
        height={{ base: px2vw(140), xl: 'inherit' }}
        width={{ base: px2vw(242), xl: 'inherit' }}
        src={dashboardEmptyBorrow}
        ignoreFallback
      ></Image>
      <Text textStyle="30" color="purple.100">
        No borrowings yet
      </Text>
      <BaseButton
        onClick={() => {
          router.push('/markets?type=borrow')
        }}
        h={{ base: px2vw(64), xl: '64px' }}
        w={{ base: px2vw(232), xl: '232px' }}
        borderRadius="lllg"
        buttonType="add"
        text="Borrow Now"
        iconBg="gray.700"
        iconBgStyle={{
          width: { base: `${px2vw(40)} !important`, xl: '40px !important' },
          height: { base: `${px2vw(40)} !important`, xl: '40px !important' },
        }}
        iconStyle={{
          color: 'purple.100',
          width: { base: `${px2vw(20)} !important`, xl: '20px !important' },
          height: { base: `${px2vw(20)} !important`, xl: '20px !important' },
        }}
        textStyle={{
          textStyle: '24',
          whiteSpace: 'nowrap',
        }}
      ></BaseButton>
    </Stack>
  )
}
export default React.memo(Index)
