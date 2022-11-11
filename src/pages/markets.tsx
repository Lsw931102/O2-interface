import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { Box, Center, Flex, HStack, Text } from '@chakra-ui/react'
import { getI18nSSRProps, GetI18nServerSideProps } from '@/utils/i18n'
import globalStore from '@/stores/global'
import fluxAppStore from '@/stores/contract/fluxApp'
import fluxReportStore from '@/stores/contract/fluxReport'
import NumberTips from '@/components/NumberTips'
import px2vw from '@/utils/px2vw'
import BaseButton from '@/components/BaseButton'
import mobileButtonGackground from '@/assets/images/mobileButtonGackground.png'

const Market = dynamic(() => import('@/components/Market'), { ssr: false })

function Bank() {
  const router = useRouter()
  const { t } = useTranslation(['bank'])
  const { isPC } = globalStore()
  const { isLogin } = globalStore()
  const { fluxAppContract, getUserAssets } = fluxAppStore()
  const { totalMarketSize, totalBorrowings } = fluxReportStore()
  // 移动单选框值
  const [mobileCurTab, setMobileCurTab] = useState(
    router?.query?.type ? (router?.query?.type === 'deposit' ? '1' : '2') : '1'
  )

  const render = (
    <Center w="full" pt={{ base: px2vw(20), xl: '48px' }} pb={{ base: px2vw(20), xl: '0px' }}>
      <Box w={{ base: 'full', xl: '1220px' }} mx="auto">
        {/* 数值展示区 */}
        <Flex
          flexDirection={{ base: 'column', xl: 'row' }}
          w="full"
          justifyContent="space-around"
          mb={{ base: px2vw(30), xl: '50px' }}
          px={{ base: px2vw(10), xl: '0' }}
        >
          {/* Total Market Size */}
          <Flex
            flexDirection="column"
            justifyContent="center"
            borderRadius={{ base: '16px', xl: '0' }}
            bgColor={{ base: 'gray.100', xl: 'transparent' }}
            w={{ base: 'full', xl: 'auto' }}
            h={{ base: px2vw(70), xl: 'auto' }}
            mb={{ base: px2vw(15), xl: '0' }}
          >
            <Flex flexDirection="column" mx="auto">
              <Text textStyle={{ base: '20', xl: '36' }} mb={{ base: px2vw(5), xl: '10px' }}>
                {totalMarketSize === '--' ? (
                  '--'
                ) : (
                  <NumberTips value={totalMarketSize as number} symbol="$" shortNum={2} />
                )}
              </Text>
              <Text
                textAlign="center"
                textStyle={{ base: '12', xl: '24' }}
                fontWeight="300"
                color="grey.100"
              >
                {t('TotalMarketSize')}
              </Text>
            </Flex>
          </Flex>
          {/* Total Borrowings */}
          <Flex
            flexDirection="column"
            justifyContent="center"
            borderRadius={{ base: '16px', xl: '0' }}
            bgColor={{ base: 'gray.100', xl: 'transparent' }}
            w={{ base: 'full', xl: 'auto' }}
            h={{ base: px2vw(70), xl: 'auto' }}
          >
            <Flex flexDirection="column" mx="auto">
              <Text textStyle={{ base: '20', xl: '36' }} mb={{ base: px2vw(5), xl: '10px' }}>
                {totalBorrowings === '--' ? (
                  '--'
                ) : (
                  <NumberTips value={totalBorrowings as number} symbol="$" shortNum={2} />
                )}
              </Text>
              <Text
                textAlign="center"
                textStyle={{ base: '12', xl: '24' }}
                fontWeight="300"
                color="grey.100"
              >
                {t('TotalBorrowings')}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        {/* 单选按钮组(移动) */}
        {!isPC && (
          <Flex justifyContent="center" mb={px2vw(20)}>
            <HStack>
              <BaseButton
                onClick={() => setMobileCurTab('1')}
                w={px2vw(177)}
                h={px2vw(40)}
                backgroundImage={mobileButtonGackground}
                backgroundColor="inherit"
                borderRadius="inherit"
                backgroundSize="contain"
                backgroundRepeat="no-repeat"
                opacity={mobileCurTab === '1' ? '1' : '0.3'}
                text={t('Deposit')}
                textStyle={{
                  textStyle: 14,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  color: 'green.100',
                }}
              />
              <BaseButton
                onClick={() => setMobileCurTab('2')}
                w={px2vw(177)}
                h={px2vw(40)}
                backgroundImage={mobileButtonGackground}
                backgroundColor="inherit"
                borderRadius="inherit"
                backgroundSize="contain"
                backgroundRepeat="no-repeat"
                opacity={mobileCurTab === '2' ? '1' : '0.3'}
                text={t('Borrow')}
                textStyle={{
                  textStyle: 14,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  color: 'purple.100',
                }}
              />
            </HStack>
          </Flex>
        )}
        {/* 表格区域 */}
        <Market mobileCurTab={mobileCurTab} />
      </Box>
    </Center>
  )

  const getInitInfo = async () => {
    await getUserAssets()
  }

  useEffect(() => {
    if (!isLogin || !fluxAppContract) return
    const timer = setInterval(() => {
      getInitInfo()
    }, 10000)
    return () => {
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fluxAppContract, isLogin])

  return render
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['bank', 'dashboard'])) },
  }
}
export default Bank
