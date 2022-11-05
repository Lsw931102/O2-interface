import React from 'react'
import { Center, Flex, Text, Image } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { TxType } from '@/consts/status'
import { AddIcon, MinusIcon } from '@chakra-ui/icons'

import { completeUrl } from '@/utils/common'
import { useTranslation } from 'next-i18next'

export interface IProps {
  type: TxType // 类型
}

function Index({ type }: IProps) {
  const { t } = useTranslation(['history'])
  const ReturnIcon = () => {
    if (type === 'Deposit' || type === 'Borrow') {
      return (
        <Center
          w={{ base: px2vw(20), xl: '20px' }}
          h={{ base: px2vw(20), xl: '20px' }}
          mr={{ base: px2vw(5), xl: '5px' }}
          bgColor={type === 'Deposit' ? 'green.100' : 'purple.100'}
          borderRadius="50%"
        >
          <AddIcon
            w={{ base: px2vw(12), xl: '12px' }}
            h={{ base: px2vw(12), xl: '12px' }}
            color="gray.700"
          />
        </Center>
      )
    } else if (type === 'Repay' || type === 'Withdraw') {
      return (
        <Center
          w={{ base: px2vw(20), xl: '20px' }}
          h={{ base: px2vw(20), xl: '20px' }}
          mr={{ base: px2vw(5), xl: '5px' }}
          bgColor={type === 'Withdraw' ? 'green.100' : 'purple.100'}
          borderRadius="50%"
        >
          <MinusIcon
            w={{ base: px2vw(12), xl: '12px' }}
            h={{ base: px2vw(12), xl: '12px' }}
            color="gray.700"
          />
        </Center>
      )
    } else if (type === 'Stake' || type === 'Unstake') {
      return (
        <Image
          w={{ base: px2vw(20), xl: '20px' }}
          h={{ base: px2vw(20), xl: '20px' }}
          mr={{ base: px2vw(5), xl: '5px' }}
          src={
            type === 'Stake'
              ? completeUrl('history/historyStake.svg')
              : completeUrl('history/historyUnStake.svg')
          }
        />
      )
    }
  }
  return (
    <Flex cursor="default">
      {ReturnIcon()}
      {/* {type === 'Cross' ? (
        <Text
          textStyle="18"
          lineHeight={{ base: px2vw(20), xl: '20px' }}
          bgGradient="linear(to-l, #9C90FF, #4F3EE0)"
          bgClip="text"
        >
          {t('CrossChain')}
        </Text>
      ) : (
        <Text
          textStyle="18"
          lineHeight={{ base: px2vw(20), xl: '20px' }}
          color={
            type === 'Withdraw' || type === 'Deposit' || type === 'Approve'
              ? 'green.100'
              : type === 'Repay' || type === 'Borrow'
              ? 'purple.100'
              : type === 'Stake' || type === 'Unstake'
              ? 'purple.300'
              : type === 'Claim'
              ? 'yellow.100'
              : 'transparent'
          }
        >
          {t(type)}
        </Text>
      )} */}
      <Text
        textStyle="18"
        lineHeight={{ base: px2vw(20), xl: '20px' }}
        color={
          type === 'Withdraw' || type === 'Deposit'
            ? 'green.100'
            : type === 'Repay' || type === 'Borrow'
            ? 'purple.100'
            : type === 'Stake' || type === 'Unstake'
            ? 'purple.300'
            : 'transparent'
        }
      >
        {t(type)}
      </Text>
    </Flex>
  )
}

export default React.memo(Index)
