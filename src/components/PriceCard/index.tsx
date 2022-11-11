import React from 'react'
import { Flex, Text, Image } from '@chakra-ui/react'
import NumberTips from '@/components/NumberTips'
import px2vw from '@/utils/px2vw'

interface IProps {
  data: { [key: string]: any }
}
function Index({ data }: IProps) {
  return (
    <Flex
      direction="column"
      alignItems="center"
      w={{ base: px2vw(170), xl: '170px' }}
      p={{ base: `${px2vw(20)} 0`, xl: '20px 0' }}
      mt={{ base: px2vw(15), xl: '20px' }}
      ml={{ base: 0, xl: '15px' }}
      bg="grey.275"
      borderRadius="llg"
    >
      <Text color="grey.100" textStyle="16" fontWeight="bold">
        {data?.symbol}
      </Text>
      <Text mt={{ base: px2vw(5), xl: '5px' }} textStyle="16" fontWeight="500">
        {data?.tokenPrice !== null ? (
          <NumberTips symbol="$" value={data?.tokenPrice} shortNum={2} />
        ) : (
          '--'
        )}
      </Text>
      <Image
        ignoreFallback
        src={data?.tokenIcon}
        w={{ base: px2vw(60), xl: '60px' }}
        h={{ base: px2vw(60), xl: '60px' }}
        mt={{ base: px2vw(21), xl: '21px' }}
        // borderRadius="round"
      />
      <Text
        mt={{ base: px2vw(20), xl: '20px' }}
        color="grey.450"
        textStyle="12"
        fontWeight="normal"
      >
        {data?.oracle}
      </Text>
    </Flex>
  )
}

export default React.memo(Index)
