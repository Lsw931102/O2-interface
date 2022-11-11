import React, { useMemo } from 'react'
import { Box, Flex, Text, Image, CenterProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { TxType } from '@/consts/status'
import { findIcon } from '@/utils/common'

import ReturnDate from './ReturnDate'
import ReturnType from './ReturnType'
import NumberTips from '../NumberTips'
import { netconfigs } from '@/consts/network'
import globalStore from '@/stores/global'

import historyShare from '@/assets/images/historyShare.png'

type cardStatus = 'success' | 'fail' | 'loading'

export interface IProps extends CenterProps {
  status: cardStatus // 状态
  type: TxType // 类型
  date: string // 日期
  coin: string // 币种
  tokensymbol: string | null // api币种名称
  othercoin?: string // 交易对的另一个币种
  hash?: string // hash
  value?: string | number // 数量
}

function Index({ ...prop }: IProps) {
  const { connectNet } = globalStore()

  const render = useMemo(
    () => (
      <Box
        w={{ base: px2vw(355), xl: '355px' }}
        h={{ base: px2vw(90), xl: '90px' }}
        bgColor="grey.275"
        borderRadius="llg"
        p="15px"
        {...prop}
      >
        {/* 卡片顶部区域 */}
        <Flex justifyContent="space-between" mb={{ base: px2vw(20), xl: '20px' }}>
          {/* 状态和时间 */}
          <Flex>
            {/* 状态图片 */}
            {/* <Image
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
            /> */}
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
                src={historyShare}
                cursor="pointer"
                onClick={() => {
                  window.open(`${netconfigs[connectNet || '']?.txScanUrl}/${prop?.hash}`, '_blank')
                }}
              />
            </Flex>
          )}
        </Flex>
        {/* 卡片底部区域 */}
        <Flex justifyContent="space-between">
          {/* 类型 */}
          <ReturnType type={prop.type} />
          {/* 币种及数量 */}
          <Flex>
            {/* 币种 */}
            {!prop?.othercoin ? (
              <Image
                w={{ base: px2vw(20), xl: '20px' }}
                h={{ base: px2vw(20), xl: '20px' }}
                mr={{ base: px2vw(5), xl: '5px' }}
                src={findIcon(prop?.coin)}
              />
            ) : (
              <Flex pos="relative" mr={{ base: px2vw(5), xl: '5px' }}>
                <Image
                  w={{ base: px2vw(20), xl: '20px' }}
                  h={{ base: px2vw(20), xl: '20px' }}
                  src={findIcon(prop?.coin)}
                  zIndex={2}
                  pos="absolute"
                  right={{ base: px2vw(15), xl: '15px' }}
                />
                <Image
                  w={{ base: px2vw(20), xl: '20px' }}
                  h={{ base: px2vw(20), xl: '20px' }}
                  src={findIcon(prop?.othercoin)}
                />
              </Flex>
            )}
            {/* 数量及单位 */}
            <Text
              textStyle="18"
              lineHeight={{ base: px2vw(18), xl: '18px' }}
              color="white"
              cursor="default"
            >
              {prop?.othercoin ? (
                <NumberTips value={prop.value} isAbbr symbol="$" />
              ) : (
                <>
                  <NumberTips value={prop.value} /> {prop?.tokensymbol || prop?.coin}
                </>
              )}
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
