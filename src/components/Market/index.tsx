import React, { useEffect, useState } from 'react'
import { useUnmount } from 'react-use'
import dynamic from 'next/dynamic'
import { cloneDeep } from 'lodash'
import fluxReportStore from '@/stores/contract/fluxReport'
import marketsStore from '@/stores/contract/markets'
import dashboardStore, { borrowTab, despositTab } from '@/stores/pages/dashboard'
import globalStore from '@/stores/global'
import DashboardModal from '../Modals/DashboardModal'
import BorrowModalContent from '../BorrowModalContent'
import RepayModalContent from '../RepayModalContent'
import DepositModalContent from '../DepositModalContent'
import WithDrawModalContent from '../WithDrawModalContent'
import Loading from '@/components/Loading'

const MarketTable = dynamic(() => import('./MarketTable'), {
  ssr: false,
  loading: () => <Loading loading={true} />,
})

const MarketTableMobile = dynamic(() => import('./MarketTableMobile'), {
  ssr: false,
  loading: () => <Loading loading={true} />,
})

export const ModalRender = React.memo(
  ({
    onCloseClick,
    onConfirm,
    tableButtonCalBack,
  }: {
    onCloseClick: () => void
    onConfirm: () => void
    tableButtonCalBack: any
  }) => {
    const { marketList } = marketsStore()
    const {
      currentBorrowTab,
      currentDespositTab,
      borrowModalIsOpen,
      depositModalIsOpen,
      setCurrentBorrowTab,
      setDespositTab,
    } = dashboardStore()
    return (
      <>
        {tableButtonCalBack && (
          <DashboardModal
            record={cloneDeep(
              marketList.find(
                (item: any) =>
                  String(item?.underlying).toUpperCase() ===
                  String(tableButtonCalBack?.record.underlying).toUpperCase()
              )
            )}
            currentTab={currentBorrowTab}
            isOpen={borrowModalIsOpen}
            tabs={borrowTab}
            tabColor="white"
            onSelect={(val) => setCurrentBorrowTab(val)}
            onClose={() => {
              onCloseClick()
              dashboardStore.setState({
                borrowModalIsOpen: false,
              })
            }}
          >
            {currentBorrowTab.value === 'BORROW' ? (
              <BorrowModalContent
                onConfirm={() => {
                  onConfirm()
                  dashboardStore.setState({
                    borrowModalIsOpen: false,
                  })
                }}
              />
            ) : (
              <RepayModalContent
                onConfirm={() => {
                  onConfirm()
                  dashboardStore.setState({
                    borrowModalIsOpen: false,
                  })
                }}
              />
            )}
          </DashboardModal>
        )}

        {tableButtonCalBack && (
          <DashboardModal
            record={cloneDeep(
              marketList.find(
                (item: any) =>
                  String(item?.underlying).toUpperCase() ===
                  String(tableButtonCalBack?.record.underlying).toUpperCase()
              )
            )}
            currentTab={currentDespositTab}
            tabs={despositTab}
            tabColor="white"
            isOpen={depositModalIsOpen}
            onSelect={(val) => setDespositTab(val)}
            onClose={() => {
              onCloseClick()
              dashboardStore.setState({
                depositModalIsOpen: false,
              })
            }}
          >
            {currentDespositTab.value === 'DEPOSIT' ? (
              <DepositModalContent
                onConfirm={() => {
                  onConfirm()
                  dashboardStore.setState({
                    depositModalIsOpen: false,
                  })
                }}
              />
            ) : (
              <WithDrawModalContent
                onConfirm={() => {
                  onConfirm()
                  dashboardStore.setState({
                    depositModalIsOpen: false,
                  })
                }}
              />
            )}
          </DashboardModal>
        )}
      </>
    )
  }
)

export interface IProps {
  mobileCurTab: string
}

function Index({ mobileCurTab }: IProps) {
  const { isPC } = globalStore()
  const { marketList } = marketsStore()
  const { getLoanPoolReport, bankList } = fluxReportStore()
  const [tableButtonCalBack, setTableButtonCallBack] = useState<any>(null)

  useEffect(() => {
    if (marketList && marketList?.length) {
      if (!bankList.length) {
        getLoanPoolReport()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketList])

  // 当页面卸载时，清楚数据
  useUnmount(() => {
    fluxReportStore.setState({
      bankList: [],
    })
  })

  return (
    <>
      {/* 表格 */}
      {isPC ? (
        <MarketTable tableList={bankList} tableButtonClick={(val) => setTableButtonCallBack(val)} />
      ) : (
        <MarketTableMobile
          mobileCurTab={mobileCurTab}
          tableList={bankList}
          tableButtonClick={(val) => setTableButtonCallBack(val)}
        />
      )}

      <ModalRender
        onCloseClick={() => setTableButtonCallBack(null)}
        onConfirm={() => {
          setTableButtonCallBack(null)
          getLoanPoolReport()
        }}
        tableButtonCalBack={tableButtonCalBack}
      />
    </>
  )
  // return renderPage()
}

export default React.memo(Index)
