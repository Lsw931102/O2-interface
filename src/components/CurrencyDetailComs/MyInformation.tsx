import React, { useMemo } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { useTranslation } from 'next-i18next'
import { cloneDeep } from 'lodash'
import fluxReportStore from '@/stores/contract/fluxReport'
import marketsStore from '@/stores/contract/markets'
import BaseButton from '../BaseButton'

import BorrowModalContent from '../BorrowModalContent'
import RepayModalContent from '../RepayModalContent'

import DepositModalContent from '../DepositModalContent'
import WithDrawModalContent from '../WithDrawModalContent'
import NumberTips from '../NumberTips'

import DashboardModal from '../Modals/DashboardModal'
import dashboardStore, { borrowTab, despositTab } from '@/stores/pages/dashboard'

export interface IProps {
  activeToken: string
  onReload?: () => void
}

function Index({ ...prop }: IProps) {
  const { bankDetail } = fluxReportStore()
  const { t } = useTranslation(['currencyDetails', 'dashboard'])
  const { marketList } = marketsStore()
  const {
    currentBorrowTab,
    currentDespositTab,
    depositModalIsOpen,
    borrowModalIsOpen,
    setCurrentBorrowTab,
    setDespositTab,
  } = dashboardStore()

  const render = useMemo(
    () => (
      <Box p={{ base: px2vw(20), xl: '20px' }}>
        <Text
          textStyle="16"
          color="purple.300"
          fontWeight="bold"
          mb={{ base: px2vw(12), xl: '12px' }}
        >
          {t('MyInformation')}
        </Text>
        {/* Wallet Balance */}
        <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
          <Text textStyle="14" color="purple.300">
            {t('walletBalance')}:
          </Text>
          <Text textStyle="14" color="purple.300">
            {bankDetail?.walletBalance ? (
              <NumberTips value={bankDetail?.walletBalance} toolTipProps={{ isDisabled: false }} />
            ) : (
              '--'
            )}{' '}
            {prop.activeToken}
          </Text>
        </Flex>
        {/* Deposits */}
        <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
          <Text textStyle="14" color="purple.300">
            {t('Deposits')}:
          </Text>
          <Flex>
            <Text textStyle="14" color="purple.300" mr={{ base: px2vw(10), xl: '10px' }}>
              {bankDetail?.userDeposits ? (
                <NumberTips
                  value={bankDetail?.userDeposits}
                  toolTipProps={{ isDisabled: false }}
                  isAbbr
                />
              ) : (
                '--'
              )}{' '}
              {prop.activeToken}
            </Text>
            <BaseButton
              isCircular
              buttonType="remove"
              bgColor="green.300"
              minW={{ base: px2vw(14), xl: '14px' }}
              h={{ base: px2vw(14), xl: '14px' }}
              mr={{ base: px2vw(10), xl: '10px' }}
              iconStyle={{
                w: { base: px2vw(7), xl: '8px' },
              }}
              buttonClick={() => {
                setDespositTab(despositTab[1])
                dashboardStore.setState({
                  depositModalIsOpen: true,
                })
              }}
            />
            <BaseButton
              isCircular
              buttonType="add"
              bgColor="green.300"
              minW={{ base: px2vw(14), xl: '14px' }}
              h={{ base: px2vw(14), xl: '14px' }}
              iconStyle={{
                w: { base: px2vw(7), xl: '8px' },
              }}
              buttonClick={() => {
                setDespositTab(despositTab[0])
                dashboardStore.setState({
                  depositModalIsOpen: true,
                })
              }}
            />
          </Flex>
        </Flex>
        {/* Borrowings */}
        <Flex justifyContent="space-between" mb={{ base: px2vw(10), xl: '10px' }}>
          <Text textStyle="14" color="purple.300">
            {t('Borrowings')}:
          </Text>
          <Flex>
            <Text textStyle="14" color="purple.300" mr={{ base: px2vw(10), xl: '10px' }}>
              {bankDetail?.userBorrowings ? (
                <NumberTips
                  value={bankDetail?.userBorrowings}
                  toolTipProps={{ isDisabled: false }}
                  isAbbr
                />
              ) : (
                '--'
              )}{' '}
              {prop.activeToken}
            </Text>
            <BaseButton
              isCircular
              buttonType="remove"
              bgColor="purple.100"
              minW={{ base: px2vw(14), xl: '14px' }}
              h={{ base: px2vw(14), xl: '14px' }}
              mr={{ base: px2vw(10), xl: '10px' }}
              iconStyle={{
                w: { base: px2vw(7), xl: '8px' },
              }}
              buttonClick={() => {
                setCurrentBorrowTab(borrowTab[1])
                dashboardStore.setState({
                  borrowModalIsOpen: true,
                })
              }}
            />
            <BaseButton
              isCircular
              buttonType="add"
              bgColor="purple.100"
              minW={{ base: px2vw(14), xl: '14px' }}
              h={{ base: px2vw(14), xl: '14px' }}
              iconStyle={{
                w: { base: px2vw(7), xl: '8px' },
              }}
              buttonClick={() => {
                setCurrentBorrowTab(borrowTab[0])
                dashboardStore.setState({
                  borrowModalIsOpen: true,
                })
              }}
            />
          </Flex>
        </Flex>

        {marketList && bankDetail && (
          <DashboardModal
            record={cloneDeep(
              marketList.find(
                (item: any) =>
                  String(item?.underlying).toUpperCase() ===
                  String(bankDetail.underlying).toUpperCase()
              )
            )}
            tabs={borrowTab}
            tabColor="purple.100"
            currentTab={currentBorrowTab}
            isOpen={borrowModalIsOpen}
            onSelect={(val) => setCurrentBorrowTab(val)}
            onClose={() => {
              dashboardStore.setState({
                borrowModalIsOpen: false,
              })
            }}
          >
            {currentBorrowTab.value === 'BORROW' ? (
              <BorrowModalContent
                onConfirm={() => {
                  dashboardStore.setState({
                    borrowModalIsOpen: false,
                  })
                  prop?.onReload?.()
                }}
              />
            ) : (
              <RepayModalContent
                onConfirm={() => {
                  dashboardStore.setState({
                    borrowModalIsOpen: false,
                  })
                  prop?.onReload?.()
                }}
              />
            )}
          </DashboardModal>
        )}

        {marketList && bankDetail && (
          <DashboardModal
            record={cloneDeep(
              marketList.find(
                (item: any) =>
                  String(item?.underlying).toUpperCase() ===
                  String(bankDetail.underlying).toUpperCase()
              )
            )}
            tabs={despositTab}
            tabColor="green.100"
            currentTab={currentDespositTab}
            isOpen={depositModalIsOpen}
            onSelect={(val) => setDespositTab(val)}
            onClose={() => {
              dashboardStore.setState({
                depositModalIsOpen: false,
              })
            }}
          >
            {currentDespositTab.value === 'DEPOSIT' ? (
              <DepositModalContent
                onConfirm={() => {
                  dashboardStore.setState({
                    depositModalIsOpen: false,
                  })
                  prop?.onReload?.()
                }}
              />
            ) : (
              <WithDrawModalContent
                onConfirm={() => {
                  dashboardStore.setState({
                    depositModalIsOpen: false,
                  })
                  prop?.onReload?.()
                }}
              />
            )}
          </DashboardModal>
        )}
      </Box>
    ),

    [
      t,
      bankDetail,
      prop,
      marketList,
      currentBorrowTab,
      borrowModalIsOpen,
      currentDespositTab,
      depositModalIsOpen,
      setDespositTab,
      setCurrentBorrowTab,
    ]
  )

  return render
}

export default React.memo(Index)
