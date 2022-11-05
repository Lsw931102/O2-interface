import React, { useMemo, useState } from 'react'
import { Flex, Text, Box } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { useTranslation } from 'next-i18next'

function Index() {
  const { t } = useTranslation(['official'])
  const [timeList] = useState([
    {
      time: t('timeLine1Time'),
      title: t('timeLine1Title'),
    },
    {
      time: t('timeLine2Time'),
      title: t('timeLine2Title'),
    },
    {
      time: t('timeLine3Time'),
      title: t('timeLine3Title'),
    },
    {
      time: t('timeLine4Time'),
      title: t('timeLine4Title'),
    },
    {
      time: t('timeLine5Time'),
      title: t('timeLine5Title'),
    },
    {
      time: t('timeLine6Time'),
      title: t('timeLine6Title'),
    },
    {
      time: t('timeLine7Time'),
      title: t('timeLine7Title'),
    },
    {
      time: t('timeLine8Time'),
      title: t('timeLine8Title'),
    },
    {
      time: t('timeLine9Time'),
      title: t('timeLine9Title'),
    },
    {
      time: t('timeLine10Time'),
      title: t('timeLine10Title'),
    },
  ])

  const render = useMemo(
    () => {
      return (
        <Flex
          flexDirection={{ base: 'column', xl: 'row' }}
          w="full"
          my={{ base: px2vw(0), xl: '210px' }}
        >
          {timeList.map((item: any, index: number) => {
            return (
              <Box
                key={index}
                w={{ base: px2vw(20), xl: 'full' }}
                h={{ base: px2vw(120), xl: '20px' }}
                mx="auto"
                bgColor={index % 2 === 0 ? 'rgba(170, 185, 222, 0.4)' : 'rgba(170, 185, 222, 0.2)'}
                pos="relative"
              >
                {/* 时间 */}
                <Text
                  w={{ base: px2vw(86), xl: '86px' }}
                  textAlign={{ base: index % 2 === 0 ? 'right' : 'left', xl: 'center' }}
                  textStyle="12"
                  color="purple.300"
                  fontWeight="900"
                  opacity="0.4"
                  m={{ base: 0, xl: 'auto' }}
                  pos="absolute"
                  top={
                    index % 2 === 0
                      ? { base: px2vw(13), xl: '-22px' }
                      : { base: px2vw(10), xl: '30px' }
                  }
                  left={{ base: index % 2 === 0 ? px2vw(-96) : px2vw(30), xl: '0' }}
                  right={{ base: 'auto', xl: '0' }}
                >
                  {item?.time}
                </Text>
                {/* 内容 */}
                <Flex
                  w={{ base: px2vw(86), xl: '86px' }}
                  h={index % 2 === 0 ? 'auto' : { base: 'auto', xl: '100px' }}
                  flexDirection="column"
                  justifyContent="flex-end"
                  m={{ base: 0, xl: 'auto' }}
                  pos="absolute"
                  top={
                    index % 2 === 0
                      ? { base: px2vw(35), xl: '30px' }
                      : { base: px2vw(35), xl: '-110px' }
                  }
                  left={{ base: index % 2 === 0 ? px2vw(-96) : px2vw(30), xl: '0' }}
                  right={{ base: 'auto', xl: '0' }}
                >
                  <Text
                    textStyle="14"
                    lineHeight={{ base: px2vw(14), xl: '16px' }}
                    color="purple.300"
                    fontWeight="700"
                    textAlign={{ base: index % 2 === 0 ? 'right' : 'left', xl: 'left' }}
                  >
                    {item?.title}
                  </Text>
                </Flex>
                {/* 分割线 */}
                <Box
                  w={{ base: px2vw(137), xl: '1px' }}
                  h={{ base: px2vw(1), xl: '137px' }}
                  bgColor="purple.300"
                  opacity="0.4"
                  pos="absolute"
                  left={
                    index % 2 === 0 ? { base: px2vw(-93), xl: '0' } : { base: px2vw(-24), xl: '0' }
                  }
                  top={
                    index % 2 === 0
                      ? { base: px2vw(0), xl: '-25px' }
                      : { base: px2vw(0), xl: '-90px' }
                  }
                  _before={{
                    content: "''",
                    w: { base: px2vw(6), xl: '6px' },
                    h: { base: px2vw(6), xl: '6px' },
                    borderRadius: '50%',
                    bgColor: 'purple.300',
                    pos: 'absolute',
                    left: { base: px2vw(-3), xl: '-2.5px' },
                    top: { base: px2vw(-3), xl: '-2px' },
                  }}
                  transform={
                    index % 2 === 0
                      ? { base: 'rotate(180deg)', xl: 'rotate(0deg)' }
                      : { base: 'rotate(0deg)', xl: 'rotate(180deg)' }
                  }
                />
              </Box>
            )
          })}
        </Flex>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return render
}
export default React.memo(Index)
