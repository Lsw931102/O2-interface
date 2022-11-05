import React, { useMemo } from 'react'
import { Box, Text, BoxProps, TextProps, Flex, Center } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { completeUrl } from '@/utils/common'

import SwiperCore, { Pagination, Autoplay } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
SwiperCore.use([Pagination, Autoplay])

export interface NewCardIProps extends BoxProps {
  titletextprop?: TextProps
  contenttextprop?: TextProps
  readmoreprop?: TextProps
  link?: string
}

export interface IProps {
  cardList: NewCardIProps[]
}
// 卡牌
export const CardRender = (item: NewCardIProps) => {
  return (
    <Box
      w={{ base: 'full', xl: '260px' }}
      h={{ base: px2vw(299), xl: '299px' }}
      pt={{ base: px2vw(80), xl: '80px' }}
      px={{ base: px2vw(23), xl: '23px' }}
      bgImage={completeUrl('official-website/newsCard.svg')}
      bgRepeat="no-repeat"
      bgSize="contain"
      bgPos="center"
      {...item}
    >
      <Center h={{ base: px2vw(66), xl: '66px' }} mb={{ base: px2vw(10), xl: '10px' }}>
        <Text
          textStyle="18"
          lineHeight={{ base: px2vw(22), xl: '22px' }}
          color="purple.300"
          fontWeight="bold"
          textAlign="left"
          overflow="hidden"
          textOverflow="ellipsis"
          display="-webkit-box"
          {...item?.titletextprop}
          css={{
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        />
      </Center>
      <Text
        h={{ base: px2vw(64), xl: '64px' }}
        textStyle="12"
        lineHeight={{ base: px2vw(16), xl: '16px' }}
        color="purple.300"
        fontWeight="normal"
        textAlign="left"
        overflow="hidden"
        textOverflow="ellipsis"
        display="-webkit-box"
        {...item?.contenttextprop}
        css={{
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
        }}
      />
      <Text
        mt={{ base: px2vw(25), xl: '25px' }}
        textStyle="14"
        color="purple.300"
        fontWeight="500"
        textAlign="center"
        cursor="pointer"
        onClick={() => window.open(item?.link)}
        {...item?.readmoreprop}
      />
    </Box>
  )
}

function Index({ ...prop }: IProps) {
  const pcPage = useMemo(
    () => {
      return (
        <Flex w="full" justifyContent="space-around">
          {prop.cardList.map((item: NewCardIProps, index: number) => {
            return item && <CardRender key={index} {...item} />
          })}
        </Flex>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prop.cardList]
  )

  const mobilePage = useMemo(
    () => {
      return (
        <Center px={px2vw(57)}>
          <Swiper
            loop={true}
            autoplay={{ delay: 3000 }}
            pagination={{
              clickable: true,
              modifierClass: 'topPagination',
            }}
          >
            {prop.cardList.map((item: NewCardIProps, index: number) => {
              return (
                item && (
                  <SwiperSlide key={index}>
                    <CardRender flexShrink={0} {...item} />
                  </SwiperSlide>
                )
              )
            })}
          </Swiper>
        </Center>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prop.cardList]
  )

  return (
    <Box w="full">
      <Box w="full" display={{ base: 'none', xl: 'block' }}>
        {pcPage}
      </Box>
      <Box w="full" display={{ base: 'block', xl: 'none' }}>
        {mobilePage}
      </Box>
    </Box>
  )
}
export default React.memo(Index)
