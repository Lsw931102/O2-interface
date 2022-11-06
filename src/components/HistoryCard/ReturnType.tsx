import React from 'react'
import { Flex, Text } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { TxType } from '@/consts/status'
import { useTranslation } from 'next-i18next'

export interface IProps {
  type: TxType // 类型
}

function Index({ type }: IProps) {
  const { t } = useTranslation(['history'])

  return (
    <Flex cursor="default">
      <Text
        textStyle="18"
        fontWeight="500"
        lineHeight={{ base: px2vw(18), xl: '18px' }}
        color="white"
      >
        {t(type)}
      </Text>
    </Flex>
  )
}

export default React.memo(Index)
