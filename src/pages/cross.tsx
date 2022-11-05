import React, { useEffect, useState } from 'react'
import { Flex, HStack, Text, TextProps } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

import crossStore from '@/stores/pages/cross'
import globalStore from '@/stores/global'

import px2vw from '@/utils/px2vw'

import crossTabLeft from '@/assets/images/crossTabLeft.png'
import crossTabRight from '@/assets/images/crossTabRight.png'
import fluxReportStore from '@/stores/contract/fluxReport'
import searchProviderStore from '@/stores/contract/searchProvider'
import { GetI18nServerSideProps, getI18nSSRProps } from '@/utils/i18n'
import { useTranslation } from 'react-i18next'
import fluxAppStore from '@/stores/contract/fluxApp'

const CrossRefinanceForm = dynamic(() => import('@/components/CrossRefinanceForm'), { ssr: false })

export function CrossTabItem(props: TextProps) {
  return (
    <Text
      flex="1"
      height={{ base: px2vw(40), xl: '60px' }}
      textStyle={{ base: '14', xl: '20' }}
      lineHeight={{ base: px2vw(40), xl: '60px' }}
      textAlign="center"
      _hover={{
        cursor: 'pointer',
      }}
      {...props}
    >
      {props.children}
    </Text>
  )
}

function Index() {
  const { t } = useTranslation(['cross'])
  const { currentTab, setCurrentTab, reset, hotpotConfigJson, initHotpotConfigJson } = crossStore()
  const [tab, setTab] = useState(currentTab)
  const { isLogin, connectNet } = globalStore()
  const { fluxAppContract } = fluxAppStore()

  useEffect(() => {
    if (tab === currentTab) return
    reset()
    setTab(currentTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab])

  useEffect(() => {
    if (!isLogin || !fluxAppContract || !isLogin) return
    fluxReportStore.getState().getAllMarkets()
    searchProviderStore.getState().getUserMarketsData()
    fluxAppStore.getState().getUserAssets()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, fluxAppContract, isLogin, hotpotConfigJson])

  useEffect(() => {
    if (!connectNet) return
    initHotpotConfigJson()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectNet])

  return (
    <Flex
      maxWidth="1260px"
      width={{ base: `100%`, xl: '100vw' }}
      margin={{ base: `${px2vw(30)} 0 ${px2vw(100)}`, xl: '40px 0 100px' }}
      justifyContent="center"
      alignItems="center"
    >
      <Flex flexDirection="column" margin={{ base: `0 ${px2vw(10)}` }}>
        <HStack
          spacing={{ base: px2vw(5), xl: '0px' }}
          width="100%"
          height="100%"
          marginBottom={{ base: px2vw(20), xl: '0px' }}
          alignItems="center"
        >
          <CrossTabItem
            onClick={() => {
              setCurrentTab('refinance')
            }}
            opacity={currentTab === 'refinance' ? 'inherit' : '0.3'}
            borderTopLeftRadius={{ base: 'llg', xl: 'inherit' }}
            borderBottomLeftRadius={{ base: 'llg', xl: 'inherit' }}
            backgroundColor={{
              base: 'gray.400',
              xl: 'inherit',
            }}
            backgroundImage={{
              base: 'inheirt',
              xl: currentTab === 'refinance' ? crossTabLeft : 'inherit',
            }}
            color="green.100"
          >
            {t('Cross-chain Refinance')}
          </CrossTabItem>

          <CrossTabItem
            onClick={() => {
              setCurrentTab('borrow')
            }}
            opacity={currentTab === 'borrow' ? 'inherit' : '0.3'}
            borderTopRightRadius={{ base: 'llg', xl: 'inherit' }}
            borderBottomRightRadius={{ base: 'llg', xl: 'inherit' }}
            backgroundImage={{
              base: 'inheirt',
              xl: currentTab === 'borrow' ? crossTabRight : 'inherit',
            }}
            backgroundColor={{
              base: 'gray.400',
              xl: 'inherit',
            }}
            color="purple.100"
          >
            {t('Cross-chain Borrow')}
          </CrossTabItem>
        </HStack>
        <CrossRefinanceForm />
      </Flex>
    </Flex>
  )
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['cross', 'dashboard'])) },
  }
}

export default Index
