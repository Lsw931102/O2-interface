import React, { useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

import BorrowAndLendTopInfos from '@/components/DashboardTopInfos'

import DashboardEmpty from '@/components/DashboardEmpty'

import dashboardStore from '@/stores/pages/dashboard'
import px2vw from '@/utils/px2vw'
// import globalStore from '@/stores/global'
// import { netWhiteList } from '@/consts/whiteList'

const BorrowAndLendList = dynamic(() => import('@/components/DashboardList'), {
  ssr: false,
})

// const BorrowAndLendFluxRewards = dynamic(() => import('@/components/DashboardFluxRewards'), {
//   ssr: false,
// })

function Index() {
  const { supplyList, borrowingList } = dashboardStore()
  // const { connectNet } = globalStore()
  const render = useMemo(() => {
    if (!supplyList || !borrowingList)
      return (
        <>
          <BorrowAndLendTopInfos />
          <BorrowAndLendList />
        </>
      )
    else {
      if (supplyList.length === 0) {
        return <DashboardEmpty />
      } else {
        return (
          <>
            <BorrowAndLendTopInfos />
            <BorrowAndLendList />
          </>
        )
      }
    }
  }, [borrowingList, supplyList])

  const renderMyBank = () => (
    <>
      <Box minH="302px" mt={{ base: px2vw(48), xl: '48px' }}>
        {render}
      </Box>
      {/* claim infos */}
      {/* {netWhiteList.findIndex((item) => item === connectNet) < 0 && <BorrowAndLendFluxRewards />} */}
    </>
  )

  return renderMyBank()
}
export default React.memo(Index)
