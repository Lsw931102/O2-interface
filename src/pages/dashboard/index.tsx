import React, { useEffect, useMemo } from 'react'
import { Box } from '@chakra-ui/react'

import PcUI from '@/components/DashboardUI/PcUI'
import DashboardNotConnect from '@/components/DashboardNotConnect'
import MobileUI from '@/components/DashboardUI/MobileUI'

import globalStore from '@/stores/global'
import fluxReportStore from '@/stores/contract/fluxReport'
import searchProviderStore from '@/stores/contract/searchProvider'
import fluxStore from '@/stores/contract/flux'
import dashboardStore from '@/stores/pages/dashboard'
import {
  getAccountInformationBorrowList,
  getAccountInformationSupplyList,
} from '@/utils/dataFormat'
import { GetI18nServerSideProps, getI18nSSRProps } from '@/utils/i18n'
import fluxAppStore from '@/stores/contract/fluxApp'
import stakeStore from '@/stores/pages/stake'

function Index() {
  const { isLogin, isPC } = globalStore()
  const { getUnclaimedFluxAtStake } = stakeStore()
  const {
    userMarketsData,
    unclaimedFluxAtLoan,
    getUserMarketsData,
    getUnclaimedFluxAtLoan,
    getUnclaimedFlux,
  } = searchProviderStore()
  const { fluxAppContract, getUserAssets } = fluxAppStore()
  const { allMarkets, getAllMarkets, getFluxPrice } = fluxReportStore()
  const { setSupplyList, setBorrowingList } = dashboardStore()

  const userMarketsArray = useMemo(
    () =>
      userMarketsData &&
      Object.keys(userMarketsData).map((key) => {
        return userMarketsData[key]
      }),
    [userMarketsData]
  )

  useEffect(() => {
    if (
      unclaimedFluxAtLoan.length === 0 ||
      !allMarkets ||
      allMarkets.length === 0 ||
      !userMarketsArray
    )
      return

    setSupplyList(
      getAccountInformationSupplyList(userMarketsArray, allMarkets, unclaimedFluxAtLoan)
    )
    setBorrowingList(
      getAccountInformationBorrowList(userMarketsArray, allMarkets, unclaimedFluxAtLoan)
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMarkets, unclaimedFluxAtLoan, userMarketsArray])

  const getInitInfo = async () => {
    try {
      await fluxStore.getState().getFluxBalance()
      await fluxStore.getState().getFluxSymbol()
      await getAllMarkets()
      await getUserMarketsData()
      await getUnclaimedFluxAtLoan()
      await getUnclaimedFlux()
      await getUserAssets()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!isLogin || !fluxAppContract) return
    getInitInfo()
    getUnclaimedFluxAtStake()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fluxAppContract, isLogin])

  useEffect(() => {
    if (!isLogin || !fluxAppContract) return
    const timer = setInterval(() => {
      getInitInfo()
      getFluxPrice()
    }, 10000)
    return () => {
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fluxAppContract, isLogin])

  return <Box>{isLogin ? <>{isPC ? <PcUI /> : <MobileUI />}</> : <DashboardNotConnect />}</Box>
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['dashboard', 'farm', 'bank'])) },
  }
}
export default React.memo(Index)
