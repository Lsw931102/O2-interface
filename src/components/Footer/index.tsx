import React from 'react'
import { Flex, Image, Text, Stack, FlexProps } from '@chakra-ui/react'
import { useTranslation, Trans } from 'next-i18next'
import px2vw from '@/utils/px2vw'
import logo from '@/assets/images/o2Logo.png'
import trustLogo from '@/assets/images/trustName.png'
import { DOCS } from '@/consts/docs'

function Index({ ...props }: FlexProps) {
  const { t, i18n } = useTranslation(['common'])
  return (
    <Flex
      w="full"
      direction={{ base: 'column', xl: 'row' }}
      alignItems="baseline"
      justifyContent="space-between"
      pb={{ base: 0, xl: '50px' }}
      pt={{ base: 0, xl: '100px' }}
      bg={{ base: 'bg', xl: 'transparent' }}
      borderRadius={{ base: '0 0 16px 16px', xl: 0 }}
      {...props}
    >
      {/* left */}
      <Flex direction="column" p={{ base: `${px2vw(13)} ${px2vw(25)} ${px2vw(15)}`, xl: '0' }}>
        <Stack spacing={{ base: px2vw(15), xl: '25px' }}>
          <Image ignoreFallback src={logo} w="225px" h="43px" />
          <Text color="white" textStyle="12" lineHeight="22px" maxW="356px">
            {t('Flux Protocol')}
          </Text>
          <Flex alignItems="center" justifyContent="space-between">
            <Text textStyle="14" cursor="pointer">
              <a href="mailto: flux@01.finance">{t('Contact US')}</a>
            </Text>
          </Flex>
        </Stack>
      </Flex>
      {/* right */}
      <Flex
        direction="column"
        alignItems="flex-end"
        w={{ base: 'full', xl: 'fit-content' }}
        p={{ base: `${px2vw(10)} ${px2vw(47)} ${px2vw(20)}`, xl: '0' }}
        bg={{ base: 'gray.200', xl: 'transparent' }}
      >
        <Stack
          spacing={{ base: px2vw(23), xl: '50px' }}
          display="flex"
          direction={{ base: 'column', xl: 'row' }}
          w="full"
        >
          <Stack spacing={{ base: px2vw(90), xl: '50px' }} display="flex" direction="row">
            {DOCS?.slice(0, 2).map((item) => (
              <Stack
                spacing={{ base: px2vw(14), xl: '12px' }}
                key={item?.type}
                display="flex"
                direction="column"
              >
                <Text fontWeight="700" textStyle="16" color={item?.color}>
                  <Trans>{item?.type}</Trans>
                </Text>
                {item?.child?.map((it) => (
                  <Text
                    key={it?.name}
                    textStyle={{ base: '14', xl: '12' }}
                    color="white"
                    cursor="pointer"
                    onClick={() =>
                      it?.linkZh && window.open(i18n.language === 'zh' ? it?.linkZh : it?.linkEn)
                    }
                  >
                    <Trans>{it?.name}</Trans>
                  </Text>
                ))}
              </Stack>
            ))}
          </Stack>
          <Stack spacing={{ base: px2vw(90), xl: '50px' }} display="flex" direction="row">
            {DOCS?.slice(2, 3).map((item) => (
              <Stack
                spacing={{ base: px2vw(14), xl: '12px' }}
                key={item?.type}
                display="flex"
                direction="column"
              >
                <Text fontWeight="700" textStyle="16" color={item?.color}>
                  <Trans>{item?.type}</Trans>
                </Text>
                {item?.child?.map((it) => (
                  <Text
                    key={it?.name}
                    textStyle={{ base: '14', xl: '12' }}
                    color="white"
                    cursor="pointer"
                    onClick={() =>
                      it?.linkZh && window.open(i18n.language === 'zh' ? it?.linkZh : it?.linkEn)
                    }
                  >
                    <Trans>{it?.name}</Trans>
                  </Text>
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Image
          ignoreFallback
          display={{ base: 'none', xl: 'initial' }}
          src={trustLogo}
          w={{ base: px2vw(139), xl: '139px' }}
          h={{ base: px2vw(30), xl: '30px' }}
          mt={{ base: px2vw(15), xl: '33px' }}
          mr={{ base: px2vw(-27), xl: 0 }}
        />
      </Flex>
    </Flex>
  )
}

export default React.memo(Index)
