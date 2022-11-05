import React, { useEffect, useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { getI18nSSRProps, GetI18nServerSideProps } from '@/utils/i18n'
import px2vw from '@/utils/px2vw'
import CircuitDiagram from '@/components/OfficialWebsite/CircuitDiagram'
import CharacteristicCard, {
  CharacteristicCardIProps,
} from '@/components/OfficialWebsite/CharacteristicCard'
import { completeUrl } from '@/utils/common'
import NewsCard, { NewCardIProps } from '@/components/OfficialWebsite/NewsCard'
import TImeLine from '@/components/OfficialWebsite/TImeLine'
import OWHeader from '@/components/OfficialWebsite/OWHeader'
import Investors from '@/components/OfficialWebsite/Investors'
import useSWR from 'swr'
import { getOfficialData } from '@/apis/website'
import { useTranslation } from 'next-i18next'
import fluxReportStore from '@/stores/contract/fluxReport'
import marketsStore from '@/stores/contract/markets'
import 'swiper/css/pagination'

function OfficialWebsite() {
  const { t, i18n } = useTranslation(['official'])
  const { marketList } = marketsStore()
  const { getLoanPoolReport } = fluxReportStore()
  const [resultData, setResultData] = useState<any>(null)
  const [newsCardList, setNewsCardList] = useState<NewCardIProps[]>([]) // 新闻卡片组
  // 特点卡牌数组
  const characteristicCardList: CharacteristicCardIProps[] = [
    {
      imgprop: {
        src: completeUrl('official-website/characteristic1.svg'),
        w: { base: px2vw(38), xl: '38px' },
        h: { base: px2vw(45), xl: '45px' },
      },
      titletextprop: {
        children: t('characteristic1Title'),
      },
      contenttextprop: {
        children: t('characteristic1Content'),
      },
    },
    {
      imgprop: {
        src: completeUrl('official-website/characteristic2.svg'),
        w: { base: px2vw(58), xl: '58px' },
        h: { base: px2vw(39), xl: '39px' },
      },
      titletextprop: {
        children: t('characteristic2Title'),
        textStyle: i18n.language === 'en' ? '14' : '18',
        lineHeight:
          i18n.language === 'en'
            ? { base: px2vw(16), xl: '16px' }
            : { base: px2vw(20), xl: '20px' },
      },
      contenttextprop: {
        w: i18n.language === 'en' ? '90%' : 'auto',
        mx: 'auto',
        children: t('characteristic2Content'),
      },
    },
    {
      imgprop: {
        src: completeUrl('official-website/characteristic3.svg'),
        w: { base: px2vw(30), xl: '30px' },
        h: { base: px2vw(45), xl: '45px' },
      },
      titletextprop: {
        w: i18n.language === 'en' ? '90%' : { base: px2vw(117), xl: '117px' },
        textStyle: i18n.language === 'en' ? '14' : '18',
        lineHeight:
          i18n.language === 'en'
            ? { base: px2vw(16), xl: '16px' }
            : { base: px2vw(20), xl: '20px' },
        wordBreak: 'break-word',
        mx: 'auto',
        mb: { base: px2vw(20), xl: '20px' },
        children: t('characteristic3Title'),
      },
      contenttextprop: {
        w: i18n.language === 'en' ? '90%' : { base: px2vw(138), xl: '138px' },
        wordBreak: 'break-word',
        mx: 'auto',
        lineHeight: { base: px2vw(16), xl: '16px' },
        children: t('characteristic3Content'),
      },
    },
    {
      imgprop: {
        src: completeUrl('official-website/characteristic4.svg'),
        w: { base: px2vw(45), xl: '45px' },
        h: { base: px2vw(45), xl: '45px' },
      },
      titletextprop: {
        children: t('characteristic4Title'),
        w: i18n.language === 'en' ? '90%' : 'full',
        textStyle: i18n.language === 'en' ? '14' : '18',
        lineHeight:
          i18n.language === 'en'
            ? { base: px2vw(16), xl: '16px' }
            : { base: px2vw(20), xl: '20px' },
        mx: 'auto',
      },
      contenttextprop: {
        w: i18n.language === 'en' ? '80%' : { base: px2vw(220), xl: '220px' },
        wordBreak: 'break-word',
        mx: 'auto',
        children: t('characteristic4Content'),
        lineHeight: { base: px2vw(16), xl: '16px' },
      },
    },
  ]
  const { data: getOfficialDataData } = useSWR(
    // boo ? getOfficialData.key : null,
    [getOfficialData.key, i18n.language],
    (_, language) =>
      getOfficialData.fetcher({
        language: language,
      }),
    { revalidateOnFocus: false }
  )

  // 提前为market页面获取数据
  useEffect(() => {
    if (marketList?.length) {
      getLoanPoolReport()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketList])

  useEffect(() => {
    if (getOfficialDataData && getOfficialDataData.code === 200) {
      setResultData(getOfficialDataData.data)
      setNewsCardList(
        getOfficialDataData?.data?.news.map((item: any, index: number) => {
          if (index < 3)
            return {
              titletextprop: {
                children: item?.title,
              },
              contenttextprop: {
                children: item?.remark,
              },
              readmoreprop: {
                children: t('ReadMore'),
              },
              link: item?.link,
            }
        })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getOfficialDataData, i18n])

  return (
    <Flex w="full" flexDirection="column" pt={{ base: px2vw(70), xl: '52px' }}>
      {/* header */}
      <OWHeader rankNo={resultData?.rankNo} rankUrl={resultData?.rankUrl} />
      {/* 头部电路图区域 */}
      <CircuitDiagram {...resultData} />
      {/* 特色版块 */}
      <Flex w="full" mt={{ base: px2vw(100), xl: '100px' }} mb={{ base: px2vw(70), xl: '70px' }}>
        <CharacteristicCard cardList={characteristicCardList} />
      </Flex>
      {/* 新闻版块 */}
      {newsCardList.length > 0 && (
        <Flex w="full" mb={{ base: px2vw(70), xl: '70px' }}>
          <NewsCard cardList={newsCardList} />
        </Flex>
      )}

      {/* 时间轴 */}
      <Box w="full">
        <TImeLine />
      </Box>
      {/* 投资方 */}
      <Investors />
    </Flex>
  )
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['official'])) },
  }
}
export default OfficialWebsite
