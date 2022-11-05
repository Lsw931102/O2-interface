import React, { useMemo } from 'react'
import { useToggle } from 'react-use'
import { Flex, Text, Image } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import px2vw from '@/utils/px2vw'
import { completeUrl } from '@/utils/common'
import BaseButton from '../BaseButton'
import OWMenu from '../OWMenu'
import { useTranslation } from 'next-i18next'
import menuIc from '@/assets/images/menu.png'
import headerBg from '@/assets/images/top-bg.png'
import { setStore } from '@/utils/storage'

export interface IProps {
  rankNo?: string | number
  rankUrl?: string
}

function Index({ ...props }: IProps) {
  const router = useRouter()
  const { i18n, t } = useTranslation(['official'])
  const [isOpen, setOpen] = useToggle(false)
  const render = useMemo(
    () => {
      return (
        <Flex
          as="header"
          position={{ base: 'fixed', xl: 'initial' }}
          top="0"
          zIndex="1401"
          bg={{ base: `url(${headerBg}) no-repeat bottom center`, xl: 'none' }}
          backgroundSize={`100vw ${px2vw(70)}`}
          w="full"
          justifyContent="space-between"
          alignItems="center"
          pt={{ base: 0, xl: '30px' }}
          pb={{ base: 0, xl: '55px' }}
          mb={{ base: px2vw(20), xl: 0 }}
          pl={{ base: px2vw(15), xl: 0 }}
        >
          <Flex cursor="pointer" onClick={() => window.open(props?.rankUrl)}>
            <Image
              w={{ base: px2vw(16), xl: '20px' }}
              h={{ base: px2vw(16), xl: '20px' }}
              mr={{ base: px2vw(5), xl: '10px' }}
              my="auto"
              src={completeUrl('official-website/ranking.svg')}
            />
            <Text textStyle={{ base: '16', xl: '24' }} lineHeight={{ base: px2vw(16), xl: '40px' }}>
              {t('GlobalLendingRank')} #{props?.rankNo || '--'}
            </Text>
            <Image
              w={{ base: px2vw(10), xl: '16px' }}
              h={{ base: px2vw(10), xl: '16px' }}
              ml={{ base: px2vw(5), xl: '5px' }}
              my="auto"
              src={completeUrl('official-website/share.svg')}
            />
          </Flex>
          {/* pc端右侧 */}
          <Flex display={{ base: 'none', xl: 'flex' }} alignItems="center">
            <Text
              textStyle="16"
              fontWeight="700"
              color="purple.300"
              lineHeight="40px"
              mr="40px"
              cursor="pointer"
              onClick={() =>
                i18n.language === 'en'
                  ? window.open('https://fluxdoc.01.finance/english')
                  : window.open('https://fluxdoc.01.finance/v/cn/english')
              }
            >
              {t('WhitePaper')}
            </Text>
            <Text
              textStyle="16"
              fontWeight="700"
              color="purple.300"
              lineHeight="40px"
              mr="40px"
              cursor="pointer"
              onClick={() => window.open('https://certik.org/projects/flux')}
            >
              {t('AuditByCertik')}
            </Text>
            <BaseButton
              display={{ base: 'none', xl: 'flex' }}
              mr="40px"
              w="180px"
              h="50px"
              borderRadius="50px"
              bgColor="yellow.100"
              text="APP"
              textStyle={{
                color: 'gray.700',
                fontSize: '32px',
                lineHeight: '50px',
              }}
              specialIconIsLeft
              specialIcon={
                <Image
                  w="32px"
                  h="32px"
                  mr="20px"
                  my="auto"
                  src={completeUrl('official-website/rocket.svg')}
                />
              }
              onClick={() => router.push('/markets')}
            />
            <BaseButton
              needVerify={false}
              text={router.locale === 'en' ? '中' : 'EN'}
              minW={{ base: px2vw(30), xl: '30px' }}
              h={{ base: px2vw(30), xl: '30px' }}
              p="0 !important"
              my="auto"
              border="1px solid"
              borderColor="purple.300"
              borderRadius="50%"
              bgColor="transparent"
              textStyle={{
                color: 'purple.300',
                fontSize: '12px',
              }}
              buttonClick={() => {
                router.push(router.pathname, undefined, {
                  locale: router.locale === 'en' ? 'zh' : 'en',
                })
                setStore('lang', [router.locale === 'en' ? 'zh' : 'en'])
              }}
            />
          </Flex>
          {/* 移动端右侧 */}
          <Flex display={{ base: 'initial', xl: 'none' }}>
            <Image ignoreFallback src={menuIc} w={px2vw(46)} h={px2vw(46)} onClick={setOpen} />
            <OWMenu isOpen={isOpen} onClose={() => setOpen(false)} />
          </Flex>
        </Flex>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props]
  )

  return render
}
export default React.memo(Index)
