import React, { useMemo } from 'react'
import { useToggle } from 'react-use'
import { Flex, Text, Image, Stack } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import OWMenu from '../OWMenu'
import { useTranslation } from 'next-i18next'
import menuIc from '@/assets/images/menu.png'
import headerBg from '@/assets/images/top-bg.png'
import O2HomeIcon from '@/assets/images/svg/O2HomeIcon.svg'

export interface IProps {
  rankNo?: string | number
  rankUrl?: string
}

function Index({ ...props }: IProps) {
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
          // pt={{ base: 0, xl: '30px' }}
          pb={{ base: 0, xl: '100px' }}
          mb={{ base: px2vw(20), xl: 0 }}
          pl={{ base: px2vw(15), xl: 0 }}
        >
          <Stack direction="row" spacing="30px">
            <Image
              w={{ base: px2vw(16), xl: '40px' }}
              h={{ base: px2vw(16), xl: '40px' }}
              my="auto"
              src={O2HomeIcon}
            />
            <Text
              textStyle="16"
              fontWeight="400"
              color="rgba(149, 164, 181, 0.5);"
              lineHeight="40px"
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
              fontWeight="400"
              color="rgba(149, 164, 181, 0.5);"
              lineHeight="40px"
              cursor="pointer"
              onClick={() => window.open('https://certik.org/projects/flux')}
            >
              {t('AuditByCertik')}
            </Text>
          </Stack>

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
