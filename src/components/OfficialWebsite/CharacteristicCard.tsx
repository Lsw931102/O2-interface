import React, { useMemo } from 'react'
import {
  Box,
  Center,
  Text,
  Image,
  ImageProps,
  BoxProps,
  TextProps,
  CenterProps,
  Stack,
} from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
// import { completeUrl } from '@/utils/common'

import SwiperCore, { Pagination, Autoplay } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import newsBorder from '@/assets/images/newsBorder.png'

SwiperCore.use([Pagination, Autoplay])

export interface CharacteristicCardIProps extends BoxProps {
  imgprop?: ImageProps
  imgboxprop?: CenterProps
  titletextprop?: TextProps
  contenttextprop?: TextProps
}

export interface IProps {
  cardList: CharacteristicCardIProps[]
}
// 卡牌
export const CardRender = (item: CharacteristicCardIProps) => {
  return (
    <Box
      w={{ base: 'full', xl: '260px' }}
      h={{ base: px2vw(299), xl: '299px' }}
      pt={{ base: px2vw(50), xl: '50px' }}
      bgImage={newsBorder}
      bgRepeat="no-repeat"
      bgSize="contain"
      bgPos="center"
      {...item}
    >
      <Center
        h={{ base: px2vw(45), xl: '45px' }}
        mb={{ base: px2vw(30), xl: '30px' }}
        {...item?.imgboxprop}
      >
        <Image mx="auto" {...item?.imgprop} />
      </Center>
      <Text
        mb={{ base: px2vw(40), xl: '20px' }}
        textStyle="18"
        color="#56B45F"
        fontWeight="600"
        textAlign="center"
        {...item?.titletextprop}
      />
      <Text
        mb={{ base: px2vw(40), xl: '20px' }}
        padding={{ base: 0, xl: '0 10px' }}
        textStyle="12"
        lineHeight="16px"
        color="silver.300"
        fontWeight="300"
        textAlign="center"
        {...item?.contenttextprop}
      />
    </Box>
  )
}

function Index({ ...prop }: IProps) {
  const pcPage = useMemo(
    () => {
      return (
        <Stack direction="row" spacing="100px" justifyContent="center">
          {prop.cardList.map((item: CharacteristicCardIProps, index: number) => {
            return <CardRender key={index} {...item} />
          })}
        </Stack>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
            }}
          >
            {prop.cardList.map((item: CharacteristicCardIProps, index: number) => {
              return (
                <SwiperSlide key={`CharacteristicCard${index}`}>
                  <CardRender flexShrink={0} {...item} />
                </SwiperSlide>
              )
            })}
          </Swiper>
        </Center>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
