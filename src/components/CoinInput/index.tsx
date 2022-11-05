import React from 'react'
import { Flex, Box, Text, Image, Input, CenterProps, Center } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { findIcon } from '@/utils/common'
import BaseButton from '../BaseButton'

export interface IProps extends CenterProps {
  coin: string // 币种
  value: string // 数量
  valueChange: (val: string) => void
  isApprove?: boolean // 是否需要授权
  needMax?: boolean // 是否需要max按钮
  maxClick?: () => void // Max按钮点击事件
  approveClick?: () => void // 授权按钮点击事件
}

function Index({ ...prop }: IProps) {
  return (
    <Box pos="relative">
      {/* 币种 */}
      <Flex h="full" pos="absolute" left={{ base: px2vw(5), xl: '5px' }}>
        <Image
          w={{ base: px2vw(30), xl: '30px' }}
          h={{ base: px2vw(30), xl: '30px' }}
          mr={{ base: px2vw(5), xl: '5px' }}
          my="auto"
          src={findIcon(prop.coin)}
        />
        <Center>
          <Text textStyle="16" color="purple.300" fontWeight="500">
            {prop.coin}
          </Text>
        </Center>
      </Flex>
      <Input
        w="full"
        borderRadius="10px"
        h={{ base: px2vw(40), xl: '40px' }}
        bgColor="gray.400"
        fontFamily="Rubik"
        fontSize="18px"
        color="purple.300"
        textAlign="right"
        pl={{ base: px2vw(88), xl: '88px' }}
        pr={prop?.needMax ? { base: px2vw(65), xl: '65px' } : { base: px2vw(5), xl: '5px' }}
        onChange={(e) => prop.valueChange(e?.target?.value)}
        {...prop}
      />
      {/* max按钮 */}
      {prop?.needMax && (
        <BaseButton
          pos="absolute"
          top={{ base: px2vw(10), xl: '10px' }}
          right={{ base: px2vw(5), xl: '5px' }}
          text="Max"
          w={{ base: px2vw(50), xl: '50px' }}
          h={{ base: px2vw(20), xl: '20px' }}
          onClick={() => prop?.maxClick?.()}
        />
      )}
      {/* 授权 */}
      {prop?.isApprove && (
        <BaseButton
          pos="absolute"
          top="0"
          right="0"
          borderTopRightRadius="10px !important"
          borderBottomRightRadius="10px !important"
          text="Approve To Input"
          w={{ base: px2vw(170), xl: '170px' }}
          h={{ base: px2vw(40), xl: '40px' }}
          textStyle={{
            color: 'gray.700',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'Rubik',
          }}
          onClick={() => prop?.approveClick?.()}
        />
      )}
    </Box>
  )
}

export default React.memo(Index)
