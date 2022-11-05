import React, { useEffect } from 'react'
import { Flex } from '@chakra-ui/react'
import { useInterval } from 'react-use'
import px2vw from '@/utils/px2vw'
import fluxReportStore from '@/stores/contract/fluxReport'
import marketsStore from '@/stores/contract/markets'
import globalStore from '@/stores/global'
import PriceCard from '@/components/PriceCard'
import { findIcon } from '@/utils/common'

function PriceList() {
  const { fluxJson, connectNet } = globalStore()
  const { marketList } = marketsStore()
  const { allMarkets, getAllMarkets, fluxPrice, getFluxPrice } = fluxReportStore()

  useEffect(() => {
    if (marketList?.length) {
      getAllMarkets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketList])

  useInterval(() => {
    getFluxPrice()
    if (!marketList?.length) return
    getAllMarkets()
  }, 10000)

  const fluxData: any = {
    address: fluxJson?.[connectNet as string].contracts['ZO'] || 'ZO',
    symbol: 'ZO',
    tokenIcon: findIcon('zo'),
    tokenPrice: fluxPrice,
    oracle: 'SWAP',
  }

  return (
    <Flex
      px={{ base: px2vw(10), xl: 0 }}
      pb={{ base: px2vw(50), xl: 0 }}
      ml={{ base: 0, xl: '-20px' }}
      direction="row"
      flexWrap="wrap"
      justifyContent={{ base: 'space-between', xl: 'flex-start' }}
    >
      {[fluxData].concat(allMarkets).map((item: any) => (
        <PriceCard key={item?.address} data={item} />
      ))}
    </Flex>
  )
}

export default PriceList
