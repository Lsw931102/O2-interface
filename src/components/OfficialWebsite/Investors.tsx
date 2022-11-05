import React, { useMemo } from 'react'
import { Flex, Text, Image } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { completeUrl } from '@/utils/common'
import { useTranslation } from 'next-i18next'

function Index() {
  const { t } = useTranslation(['official'])
  const render = useMemo(
    () => {
      return (
        <Flex
          w="full"
          flexDirection="column"
          px={{ base: 0, xl: '0' }}
          mt={{ base: px2vw(70), xl: '0' }}
        >
          <Text
            textStyle="24"
            color="purple.300"
            mb={{ base: px2vw(40), xl: '40px' }}
            textAlign={{ base: 'center', xl: 'left' }}
          >
            {t('Investors')}
          </Text>
          <Flex
            flexDirection={{ base: 'column', xl: 'row' }}
            justifyContent="space-between"
            mb={{ base: px2vw(0), xl: '50px' }}
          >
            <Image
              mx={{ base: 'auto', xl: '0' }}
              mb={{ base: px2vw(40), xl: '0' }}
              cursor="pointer"
              src={completeUrl('official-website/Investors1.svg')}
            />
            <Image
              mx={{ base: 'auto', xl: '0' }}
              mb={{ base: px2vw(40), xl: '0' }}
              cursor="pointer"
              src={completeUrl('official-website/Investors2.png')}
            />
            <Image
              mx={{ base: 'auto', xl: '0' }}
              mb={{ base: px2vw(40), xl: '0' }}
              cursor="pointer"
              src={completeUrl('official-website/Investors3.svg')}
            />
          </Flex>
          <Flex
            flexDirection={{ base: 'column', xl: 'row' }}
            justifyContent="space-between"
            flexWrap="wrap"
          >
            <Image
              mx={{ base: 'auto', xl: '0' }}
              mb={{ base: px2vw(40), xl: '0' }}
              cursor="pointer"
              src={completeUrl('official-website/Investors4.svg')}
            />
            <Image
              mx={{ base: 'auto', xl: '0' }}
              mb={{ base: px2vw(40), xl: '0' }}
              cursor="pointer"
              src={completeUrl('official-website/Investors5.svg')}
            />
            <Image
              mx={{ base: 'auto', xl: '0' }}
              mb={{ base: px2vw(40), xl: '0' }}
              cursor="pointer"
              src={completeUrl('official-website/Investors6.svg')}
            />
          </Flex>
        </Flex>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return render
}
export default React.memo(Index)
