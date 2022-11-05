import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Flex, useBoolean, useInterval } from '@chakra-ui/react'
import { getI18nSSRProps, GetI18nServerSideProps } from '@/utils/i18n'
import px2vw from '@/utils/px2vw'
import SubMenu, { ISubmenu } from '@/components/SubMenu'
import CoinInfo from '@/components/CurrencyDetailComs/CoinInfo'
import MyInformation from '@/components/CurrencyDetailComs/MyInformation'
import MixedLineAndBar from '@/components/CurrencyDetailComs/MixedLineAndBar'
import UtilizationRate from '@/components/CurrencyDetailComs/UtilizationRate'
import InterestRateModel from '@/components/CurrencyDetailComs/InterestRateModel'
import MarketDetails from '@/components/CurrencyDetailComs/MarketDetails'
import { changeUrl, completeUrl } from '@/utils/common'
import fluxReportStore from '@/stores/contract/fluxReport'
import marketsStore from '@/stores/contract/markets'
import CrossModal, { CrossTokenContent } from '@/components/Modals/CrossModal'
import { useTranslation } from 'react-i18next'
import fluxAppStore from '@/stores/contract/fluxApp'

function CurrencyDetails() {
  const { t, i18n } = useTranslation(['cross'])
  const router = useRouter()
  const { fluxAppContract, getUserAssets } = fluxAppStore()
  const { getLoanPoolMeta, fluxPrice, fluxReportContract } = fluxReportStore()
  const { marketList } = marketsStore()
  const [activeToken, setActiveToken] = useState<any>(router?.query?.token || 'BTC')
  const [showTokenList, setShowTokenList] = useBoolean(false)

  useInterval(() => {
    fluxReportStore.getState().getFluxPrice()
  }, 10000)

  useEffect(() => {
    if (!marketList.length) return
    if (isNaN(fluxPrice as any) && fluxReportContract) {
      fluxReportStore.getState().getFluxPrice()
    }
    const symbol = marketList.find((item) => item?.underlying === activeToken)?.symbol || ''
    if (marketList.length && !symbol) setShowTokenList.on()
    document.title = i18n.language === 'zh' ? `${symbol} 借贷信息` : `${symbol} market info`
    if (!marketList.length || isNaN(fluxPrice as any)) return
    getList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketList, fluxPrice, activeToken, i18n, fluxReportContract])

  // 获取数据
  const getList = () => {
    getLoanPoolMeta(
      marketList.find(
        (item) => String(item?.underlying).toUpperCase() === String(activeToken).toUpperCase()
      )?.address
    )
  }

  const getInitInfo = async () => {
    await getUserAssets()
  }

  useEffect(() => {
    if (!fluxAppContract) return
    const timer = setInterval(() => {
      getInitInfo()
    }, 10000)
    return () => {
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fluxAppContract])

  const renderPage = useMemo(
    () => (
      <Flex
        justifyContent="space-between"
        flexDirection="column"
        w={{ base: 'full', xl: '1205px' }}
        my={{ base: px2vw(15), xl: '50px' }}
        px={{ base: px2vw(10), xl: '0' }}
      >
        {/* 顶部内容 */}
        <Flex
          w="full"
          justifyContent="space-between"
          flexDirection={{ base: 'column', xl: 'row' }}
          mb={{ base: px2vw(15), xl: '50px' }}
        >
          {/* 左侧版块 */}
          <Flex w="full" flexDirection="column">
            <Box
              w={{ base: 'full', xl: '355px' }}
              h={{ base: px2vw(235), xl: '235px' }}
              mb={{ base: px2vw(15), xl: '20px' }}
              borderRadius={{ base: px2vw(16), xl: '16px' }}
              bgColor="gray.200"
            >
              <CoinInfo
                activeToken={marketList.find((item) => item?.underlying === activeToken)?.symbol}
                chooseToken={() => setShowTokenList.on()}
              />
            </Box>
            <Box
              w={{ base: 'full', xl: '355px' }}
              h={{ base: px2vw(130), xl: '130px' }}
              borderRadius={{ base: px2vw(16), xl: '16px' }}
              bgColor="gray.200"
              mb={{ base: px2vw(15), xl: '0' }}
            >
              <MyInformation
                activeToken={marketList.find((item) => item?.underlying === activeToken)?.symbol}
                onReload={() => getList()}
              />
            </Box>
          </Flex>
          {/* 右侧图表 */}
          <Box
            w={{ base: 'full', xl: '780px' }}
            h={{ base: px2vw(385), xl: '385px' }}
            borderRadius={{ base: px2vw(16), xl: '16px' }}
            bgColor="gray.200"
          >
            <MixedLineAndBar
              tokenAddress={activeToken}
              // tokenAddress={marketList.find((item) => item?.underlying === activeToken)?.underlying}
            />
          </Box>
        </Flex>
        {/* 底部内容 */}
        <Flex w="full" justifyContent="space-between" flexDirection={{ base: 'column', xl: 'row' }}>
          <Box
            w={{ base: 'full', xl: '355px' }}
            h={{ base: px2vw(407), xl: '407px' }}
            borderRadius={{ base: px2vw(16), xl: '16px' }}
            bgColor="gray.200"
            mb={{ base: px2vw(15), xl: '0' }}
          >
            <UtilizationRate
              activeToken={marketList.find((item) => item?.underlying === activeToken)?.symbol}
            />
          </Box>
          <Box
            w={{ base: 'full', xl: '355px' }}
            h={{ base: px2vw(407), xl: '407px' }}
            borderRadius={{ base: px2vw(16), xl: '16px' }}
            bgColor="gray.200"
            mb={{ base: px2vw(15), xl: '0' }}
          >
            <InterestRateModel />
          </Box>
          <Box
            w={{ base: px2vw(355), xl: '355px' }}
            h={{ base: px2vw(407), xl: '407px' }}
            borderRadius={{ base: px2vw(16), xl: '16px' }}
            bgColor="gray.200"
          >
            <MarketDetails
              activeToken={marketList.find((item) => item?.underlying === activeToken)?.symbol}
              activeUrl={marketList.find((item) => item?.underlying === activeToken)?.address}
            />
          </Box>
        </Flex>
        <CrossModal
          modalText={t('Choose a token to refinance')}
          isOpen={showTokenList}
          onClose={() => setShowTokenList.off()}
        >
          <CrossTokenContent
            onItemClick={(val) => {
              const newUrl = changeUrl(router.query, 'token', val?.underlying)
              router.push(`/marketinfo${newUrl}`)
              setShowTokenList.off()
              setActiveToken(val?.underlying)
            }}
            needValid={false}
          />
        </CrossModal>
      </Flex>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getLoanPoolMeta, marketList, showTokenList, activeToken]
  )

  const subMenu: ISubmenu[] = [
    {
      icon: completeUrl('currency-details/returnIcon.svg'),
      name: 'Return',
      content: renderPage,
      onClick: () => router.push('/markets'),
    },
  ]

  return (
    <>
      <Box display={{ base: 'none', xl: 'initial' }}>
        <SubMenu subArr={subMenu} />
      </Box>
      <Box display={{ base: 'initial', xl: 'none' }}>{renderPage}</Box>
    </>
  )
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['currencyDetails', 'cross', 'dashboard'])) },
  }
}
export default CurrencyDetails
