import { Stack, Image, Text } from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import BaseButton from '@/components/BaseButton'
import px2vw from '@/utils/px2vw'

import dashboardEmpty from '@/assets/images/dashboardEmpty.png'

function Index() {
  const router = useRouter()
  const { t } = useTranslation(['dashboard'])
  return (
    <Stack
      direction={{ base: 'column', xl: 'row' }}
      justifyContent="center"
      spacing={{ base: px2vw(40), xl: '80px' }}
    >
      <Image
        height={{ base: px2vw(126), xl: 'inherit' }}
        width={{ base: px2vw(242), xl: 'inherit' }}
        src={dashboardEmpty}
        ignoreFallback
      />
      <Stack
        direction="column"
        alignItems={{ base: 'center', xl: 'inherit' }}
        spacing={{ base: px2vw(40), xl: '40px' }}
        paddingTop={{ base: px2vw(0), xl: '70px' }}
      >
        <Text textStyle="30" color="green.100">
          {t('No deposits yet')}
        </Text>
        <BaseButton
          onClick={() => {
            router.push('/markets?type=deposit')
          }}
          h={{ base: px2vw(64), xl: '64px' }}
          w={{ base: px2vw(232), xl: '232px' }}
          borderRadius="lllg"
          buttonType="add"
          text={t('Deposit Now')}
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
    </Stack>
  )
}
export default React.memo(Index)
