import React from 'react'
import { Flex, Text, Image, Link, FlexProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import globalStore from '@/stores/global'
import { completeUrl } from '@/utils/common'
import { useTranslation } from 'react-i18next'
import { setSessionStorage } from '@/utils/storage'

function Index({ ...prop }: FlexProps) {
  const { i18n, t } = useTranslation(['common'])
  const { isPC, noticeData } = globalStore()

  return (
    <Flex
      justifyContent="space-between"
      w="full"
      bgColor="purple.300"
      pos="fixed"
      top={{ base: 'auto', xl: '0' }}
      bottom={{ base: '0', xl: 'auto' }}
      left="0"
      h={{ base: px2vw(100), xl: '80px' }}
      py={{ base: px2vw(20), xl: '25px' }}
      px={{ base: px2vw(20), xl: '20px' }}
      zIndex="9999"
      {...prop}
    >
      <Image
        w={{ base: px2vw(30), xl: '30px' }}
        h={{ base: px2vw(30), xl: '30px' }}
        src={completeUrl('notice.svg')}
        my="auto"
      />
      <Flex flexDir="column" justifyContent="center" w="calc(100% - 125px)">
        <Text
          textStyle="14"
          fontWeight="500"
          color="black.400"
          lineHeight={{ base: px2vw(16), xl: '16px' }}
          mx="auto"
        >
          {noticeData?.remark?.length >
          (i18n.language === 'zh' ? (isPC ? 170 : 58) : isPC ? 284 : 70)
            ? `${noticeData?.remark.substring(
                0,
                i18n.language === 'zh' ? (isPC ? 170 : 58) : isPC ? 284 : 70
              )}......`
            : noticeData?.remark}
          {noticeData?.link && (
            <Link
              display="inline-block"
              cursor="pointer"
              onClick={() => window.open(noticeData?.link)}
            >
              &nbsp;&gt;&gt; {t('Read More')}
            </Link>
          )}
        </Text>
      </Flex>
      <Image
        w={{ base: px2vw(20), xl: '20px' }}
        h={{ base: px2vw(20), xl: '20px' }}
        src={completeUrl('noticeClose.svg')}
        my="auto"
        cursor="pointer"
        onClick={() => {
          setSessionStorage('noticeRemark', 'close')
          globalStore.setState({
            noticeData: null,
          })
        }}
      />
    </Flex>
  )
}

export default React.memo(Index)
