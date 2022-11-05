import React, { useMemo } from 'react'
import { Box, Flex, Text, Image, CenterProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { TxType } from '@/consts/status'
import { completeUrl, findIcon } from '@/utils/common'
import { turn } from '@/theme/animations'

import NumberTips from '../NumberTips'
import ReturnDate from '../HistoryCard/ReturnDate'
import { netconfigs } from '@/consts/network'
import globalStore from '@/stores/global'

type cardStatus = 'success' | 'fail' | 'loading'

export interface IProps extends CenterProps {
  status: cardStatus // 状态
  type: TxType // 类型
  date: string // 日期
  hash?: string // hash
  debtrepaidvalue?: string
  remainingdebtvalue?: string
  collaterallostvalue?: string
  tokenlist?: any
}

function Index({ ...prop }: IProps) {
  const { connectNet } = globalStore()

  const render = useMemo(
    () => (
      <Box
        w={{ base: px2vw(355), xl: '355px' }}
        bgColor="gray.200"
        borderRadius="16px"
        p="15px"
        {...prop}
      >
        {/* 卡片顶部区域 */}
        <Flex justifyContent="space-between" mb={{ base: px2vw(20), xl: '20px' }}>
          {/* 状态和时间 */}
          <Flex>
            {/* 状态图片 */}
            <Image
              w={{ base: px2vw(20), xl: '20px' }}
              h={{ base: px2vw(20), xl: '20px' }}
              mr={{ base: px2vw(5), xl: '5px' }}
              src={
                prop.status === 'success'
                  ? completeUrl('history/historySuccess.svg')
                  : prop.status === 'fail'
                  ? completeUrl('history/historyFail.svg')
                  : completeUrl('history/historyLoading.svg')
              }
              animation={prop.status === 'loading' ? `${turn} 3s linear infinite` : ''}
            />
            {/* 日期 */}
            <ReturnDate date={prop.date} />
          </Flex>
          {/* hash和按钮组 */}
          {prop?.hash && (
            <Flex>
              {/* <Text
            textStyle="14"
            lineHeight={{ base: px2vw(20), xl: '20px' }}
            color="purple.300"
            mr={{ base: px2vw(10), xl: '10px' }}
          >
            {formatHash(prop.hash)}
          </Text> */}
              {/* 复制按钮 */}
              {/* <Image
            w={{ base: px2vw(20), xl: '20px' }}
            h={{ base: px2vw(20), xl: '20px' }}
            mr={{ base: px2vw(10), xl: '10px' }}
            src={completeUrl('history/historyCopy.svg')}
            cursor="pointer"
          /> */}
              {/* 分享按钮 */}
              <Image
                w={{ base: px2vw(20), xl: '20px' }}
                h={{ base: px2vw(20), xl: '20px' }}
                src={completeUrl('history/historyShare.svg')}
                cursor="pointer"
                onClick={() => {
                  window.open(`${netconfigs[connectNet || '']?.txScanUrl}/${prop?.hash}`, '_blank')
                }}
              />
            </Flex>
          )}
        </Flex>
        {/* 卡片底部区域 */}
        <Flex flexDirection="column">
          {prop?.tokenlist && (
            <Flex flexDir="column" mb={{ base: px2vw(20), xl: '20px' }}>
              {/* 币种图片 */}
              <Flex flexWrap="wrap">
                {prop?.tokenlist?.map((item: any, index: number) => {
                  return (
                    <Image
                      key={index}
                      w={{ base: px2vw(20), xl: '20px' }}
                      h={{ base: px2vw(20), xl: '20px' }}
                      mr={{ base: px2vw(5), xl: '5px' }}
                      mb={{ base: px2vw(5), xl: '5px' }}
                      src={findIcon(item?.tokenSymbol)}
                    />
                  )
                })}
              </Flex>
              <Flex flexWrap="wrap">
                {prop?.tokenlist?.map((item: any, index: number) => {
                  return (
                    <Text
                      key={index}
                      textStyle="18"
                      color="purple.300"
                      lineHeight={{ base: px2vw(20), xl: '20px' }}
                      mb={{ base: px2vw(5), xl: '5px' }}
                    >
                      {index > 0 ? `+${item?.tokenSymbol}` : item?.tokenSymbol}
                    </Text>
                  )
                })}
              </Flex>
            </Flex>
          )}
          <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
            <Text textStyle="18" color="purple.300">
              Debt Repaid
            </Text>
            <Text textStyle="18" color="purple.300">
              {prop?.debtrepaidvalue ? <NumberTips value={prop?.debtrepaidvalue} /> : '--'}
            </Text>
          </Flex>
          <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
            <Text textStyle="18" color="purple.300">
              Remaining Debt
            </Text>
            <Text textStyle="18" color="purple.300">
              0
            </Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text textStyle="18" color="purple.300">
              Collateral Lost
            </Text>
            <Text textStyle="18" color="purple.300">
              {prop?.debtrepaidvalue ? <NumberTips value={prop?.collaterallostvalue} /> : '--'}
            </Text>
          </Flex>
        </Flex>
      </Box>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [{ ...prop }, connectNet]
  )

  return render
}

export default React.memo(Index)
