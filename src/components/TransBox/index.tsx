// 交易成功/失败提示框样式
import React, { useState } from 'react'
import { useInterval } from 'react-use'
import { Center, Flex, Text, Image } from '@chakra-ui/react'
import { SmallCloseIcon, WarningIcon, CheckCircleIcon } from '@chakra-ui/icons'
import { toast } from 'react-toastify'
import { Trans } from 'next-i18next'
import px2vw from '@/utils/px2vw'
import { completeUrl } from '@/utils/common'
import { turn } from '@/theme/animations'
import refreshIc from '@/assets/images/refresh.png'

interface IProps {
  err: any
  type: 'Error' | 'Success'
  onView?: () => void
}

function Index({ err, type, onView }: IProps) {
  const [countdownTime, setCountdownTime] = useState(5) // 倒计时显示文本

  useInterval(() => {
    if (type === 'Error') return
    countdownTime - 1 >= 0 ? setCountdownTime(countdownTime - 1) : toast.dismiss()
  }, 1000)

  return (
    <Flex
      pos="relative"
      w={{ base: px2vw(360), xl: '360px' }}
      minH={{ base: px2vw(90), xl: '90px' }}
      borderRadius="xl"
      border="2px solid"
      borderColor={type === 'Error' ? 'red.200' : 'purple.300'}
      bgColor="black.400"
      py={{ base: px2vw(24), xl: '24px' }}
      px={{ base: px2vw(15), xl: '15px' }}
    >
      <Center>
        {type === 'Error' ? (
          <WarningIcon
            w={{ base: px2vw(24), xl: '24px' }}
            h={{ base: px2vw(24), xl: '24px' }}
            color="red.200"
          />
        ) : (
          <CheckCircleIcon
            w={{ base: px2vw(24), xl: '24px' }}
            h={{ base: px2vw(24), xl: '24px' }}
            color="purple.300"
          />
        )}
      </Center>
      <Center ml={{ base: px2vw(15), xl: '15px' }} w={{ base: px2vw(265), xl: '265px' }}>
        <Flex flexDirection="column" alignItems="flex-start" w="full">
          <Text
            textStyle="18"
            fontWeight="bold"
            color={type === 'Error' ? 'red.200' : 'purple.300'}
            mb="10px"
          >
            <Trans>{type}</Trans>
          </Text>
          <Flex alignItems="center" cursor="pointer" onClick={() => onView?.()}>
            <Text textStyle="14" fontWeight="500" color="white" wordBreak="break-all">
              {String(err)}
            </Text>
            {type === 'Success' ? (
              <Image
                w={{ base: px2vw(20), xl: '20px' }}
                h={{ base: px2vw(20), xl: '20px' }}
                ml={{ base: px2vw(5), xl: '5px' }}
                src={completeUrl('history/historyShare.svg')}
              />
            ) : null}
          </Flex>
        </Flex>
      </Center>
      <Flex
        direction="column"
        alignItems="center"
        pos={type === 'Success' ? 'absolute' : 'initial'}
        top={{ base: px2vw(15), xl: '15px' }}
        right={{ base: px2vw(15), xl: '15px' }}
      >
        <SmallCloseIcon
          w={{ base: px2vw(24), xl: '24px' }}
          h={{ base: px2vw(24), xl: '24px' }}
          color={type === 'Error' ? 'red.200' : 'purple.300'}
          cursor="pointer"
          onClick={() => toast.dismiss()}
        />
        {type === 'Success' && countdownTime ? (
          <Flex
            pos="relative"
            alignItems="center"
            justifyContent="center"
            w={{ base: px2vw(24), xl: '24px' }}
            h={{ base: px2vw(24), xl: '24px' }}
            mt={{ base: px2vw(16), xl: '16px' }}
          >
            <Image
              w={{ base: px2vw(24), xl: '24px' }}
              h={{ base: px2vw(24), xl: '24px' }}
              src={refreshIc}
              animation={`1.5s linear infinite ${turn}`}
            />
            <Text
              pos="absolute"
              top={{ base: px2vw(6), xl: '6px' }}
              left={{ base: px2vw(8), xl: '8px' }}
              textStyle="12"
              fontWeight="500"
            >
              {countdownTime}
            </Text>
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  )
}

export default React.memo(Index)
