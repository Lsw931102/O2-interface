import {
  VStack,
  HStack,
  Text,
  Switch,
  Image,
  Tooltip,
  Box,
  useBoolean,
  Flex,
} from '@chakra-ui/react'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'next-i18next'

import Table from '@/components/Table'
import BaseButton from '@/components/BaseButton'
import DashboardEmpty from '@/components/DashboardEmpty'
import DashboardEmptyBorrow from '@/components/DashboardEmptyBorrow'
import { ColumnItem } from '@/components/Table/type'
import BorrowModalContent from '@/components/BorrowModalContent'
import DepositModalContent from '@/components/DepositModalContent'
import WithDrawModalContent from '@/components/WithDrawModalContent'
import RepayModalContent from '@/components/RepayModalContent'
import DashboardModal from '@/components/Modals/DashboardModal'
import BaseTooltip from '@/components/BaseTooltip'
import { ReturnToolTips } from '@/components/Market/MarketTable'
import { AmountTitle } from '@/components/DashboardList'
import px2vw from '@/utils/px2vw'

import dashboardStore, { borrowTab, despositTab } from '@/stores/pages/dashboard'
import globalStore from '@/stores/global'
import { netconfigs } from '@/consts/network'
import { completeUrl } from '@/utils/common'

import mobileButtonGackground from '@/assets/images/mobileButtonGackground.png'

export type TabType = 'deposit' | 'borrow'

const DepsitRowActiveNode = React.memo(
  ({ record, setSelectRecord }: { record: any; setSelectRecord: (record: any) => void }) => {
    const { t } = useTranslation(['dashboard'])
    const { setDespositTab } = dashboardStore()

    return (
      <>
        <HStack spacing={px2vw(36)} paddingBottom={px2vw(15)}>
          <VStack>
            <BaseTooltip
              text={t('as collateral') as string}
              textStyles={{
                textStyle: '12',
                color: 'white',
                whiteSpace: 'nowrap',
              }}
            >
              <Text
                textAlign="left"
                textStyle="14"
                lineHeight={{ xl: '18px' }}
                whiteSpace="break-spaces"
              >
                {t('collateralToolTip')}
              </Text>
            </BaseTooltip>
            <Tooltip label={t('in development')} placement="top">
              <Switch isChecked={true} variant="flux" size="lg" colorScheme="purple" />
            </Tooltip>
          </VStack>
          <HStack spacing={px2vw(13)}>
            <BaseButton
              w={px2vw(100)}
              h={px2vw(40)}
              bgColor="gray.200"
              buttonClick={() => {
                setSelectRecord(record)
                setDespositTab(despositTab[1])
                dashboardStore.setState({
                  depositModalIsOpen: true,
                })
              }}
              text={`${t('Withdraw')} -`}
              textStyle={{
                textStyle: 14,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                color: 'green.100',
              }}
            />
            <BaseButton
              w={px2vw(90)}
              h={px2vw(40)}
              bgColor="gray.200"
              buttonClick={() => {
                setSelectRecord(record)
                setDespositTab(despositTab[0])
                dashboardStore.setState({
                  depositModalIsOpen: true,
                })
              }}
              text={`${t('Deposit')} +`}
              textStyle={{
                textStyle: 14,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                color: 'green.100',
              }}
            />
          </HStack>
        </HStack>
      </>
    )
  }
)

const BorrowRowAcitveNode = React.memo(
  ({ record, setSelectRecord }: { record: any; setSelectRecord: (record: any) => void }) => {
    const { t } = useTranslation(['dashboard'])
    const { setCurrentBorrowTab } = dashboardStore()
    return (
      <>
        <HStack spacing={px2vw(19)} justifyContent="center" width="100%" paddingBottom={px2vw(15)}>
          <BaseButton
            w={px2vw(90)}
            h={px2vw(40)}
            bgColor="gray.200"
            buttonClick={() => {
              setSelectRecord(record)
              setCurrentBorrowTab(borrowTab[1])
              dashboardStore.setState({
                borrowModalIsOpen: true,
              })
            }}
            text={`${t('Repay')} -`}
            textStyle={{
              textStyle: 14,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              color: 'purple.100',
            }}
          />
          <BaseButton
            w={px2vw(90)}
            h={px2vw(40)}
            bgColor="gray.200"
            buttonClick={() => {
              setSelectRecord(record)
              setCurrentBorrowTab(borrowTab[0])
              dashboardStore.setState({
                borrowModalIsOpen: true,
              })
            }}
            text={`${t('Borrow')} +`}
            textStyle={{
              textStyle: 14,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              color: 'purple.100',
            }}
          />
        </HStack>
      </>
    )
  }
)

function Index() {
  const { t } = useTranslation(['dashboard'])
  const {
    supplyList,
    borrowingList,
    currentBorrowTab,
    currentDespositTab,
    depositModalIsOpen,
    borrowModalIsOpen,
    setCurrentBorrowTab,
    setDespositTab,
  } = dashboardStore()
  const { userAddress, connectNet } = globalStore()
  const [currentTab, setCurrentTab] = useState<TabType>('deposit')
  const [selectRecord, setSelectRecord] = useState(null)
  const [showMarketPrice, setShowMarketPrice] = useBoolean(false) // Market显示价值
  const despositsColumns: ColumnItem[] = useMemo(
    () => [
      {
        title: t('assets'),
        dataIndex: 'symbol',
        sort: true,

        render: (_, record) => {
          return (
            <HStack width="100%" spacing={{ base: px2vw(5), xl: '5px' }} justifySelf="start">
              <Image height={px2vw(30)} width={px2vw(30)} ignoreFallback src={record?.tokenIcon} />
              <Text>{record.symbol}</Text>
            </HStack>
          )
        },
      },
      {
        title: showMarketPrice ? t('price') : t('amount'),
        dataIndex: showMarketPrice ? 'supplyPrice' : 'supply',
        sort: true,
        renderTitle: (title: string | string[]) => {
          return (
            <Flex>
              <Image
                w={{ base: px2vw(12) }}
                h={{ base: px2vw(12) }}
                mr={{ base: px2vw(4) }}
                src={completeUrl('menu/changeCoin.svg')}
                cursor="pointer"
                onClick={() => setShowMarketPrice.toggle()}
              />
              <Text fontSize={{ base: px2vw(12) }}>{title}</Text>
            </Flex>
          )
        },
        render: (_, record) => {
          return (
            <AmountTitle
              showMarketPrice={showMarketPrice}
              chainType={netconfigs?.[connectNet as any]?.apiChainType as any}
              userAddress={userAddress}
              record={record}
              type="deposit"
            />
          )
        },
      },
      {
        title: t('apr'),
        dataIndex: 'depositAPR',
        sort: true,
        renderTitle: (title: string | string[]) => {
          return (
            <BaseTooltip
              text={title as string}
              textStyles={{
                fontSize: '12px',
                lineHeight: '12px',
                color: 'white',
              }}
              iconBefore
            >
              <Box mb="10px">
                <Text
                  textAlign="left"
                  textStyle="14"
                  lineHeight={{ base: px2vw(18), xl: '18px' }}
                  whiteSpace="break-spaces"
                  color="purple.300"
                >
                  {t('DepositAPRToolTips1')}
                </Text>
              </Box>
              <Box mb="10px">
                <Text
                  textAlign="left"
                  textStyle="14"
                  lineHeight={{ base: px2vw(18), xl: '18px' }}
                  whiteSpace="break-spaces"
                  color="purple.300"
                >
                  {t('DepositAPRToolTips2')}
                </Text>
              </Box>
              <Box>
                <Text
                  textAlign="left"
                  textStyle="14"
                  lineHeight={{ base: px2vw(18), xl: '18px' }}
                  whiteSpace="break-spaces"
                  color="purple.300"
                >
                  {t('DepositAPRToolTips3')}
                </Text>
              </Box>
            </BaseTooltip>
          )
        },
        render: (text, record) => {
          return <ReturnToolTips text={text} item={record} type="deposit" />
        },
      },
    ],
    [connectNet, setShowMarketPrice, showMarketPrice, t, userAddress]
  )
  const borrowColumns: ColumnItem[] = useMemo(
    () => [
      {
        title: t('assets'),
        dataIndex: 'symbol',
        sort: true,

        render: (_, record) => {
          return (
            <HStack width="100%" spacing={{ base: px2vw(5), xl: '5px' }} justifySelf="start">
              <Image height={px2vw(30)} width={px2vw(30)} ignoreFallback src={record?.tokenIcon} />
              <Text>{record.symbol}</Text>
            </HStack>
          )
        },
      },
      {
        title: showMarketPrice ? t('price') : t('amount'),
        dataIndex: showMarketPrice ? 'borrowPrice' : 'borrow',
        sort: true,
        renderTitle: (title: string | string[]) => {
          return (
            <Flex>
              <Image
                w={{ base: px2vw(12) }}
                h={{ base: px2vw(12) }}
                mr={{ base: px2vw(4) }}
                src={completeUrl('menu/changeCoin.svg')}
                cursor="pointer"
                onClick={() => setShowMarketPrice.toggle()}
              />
              <Text fontSize={{ base: px2vw(12) }}>{title}</Text>
            </Flex>
          )
        },
        render: (_, record) => {
          return (
            <AmountTitle
              showMarketPrice={showMarketPrice}
              chainType={netconfigs?.[connectNet as any]?.apiChainType as any}
              userAddress={userAddress}
              record={record}
              type="borrow"
            />
          )
        },
      },
      {
        title: t('apr'),
        dataIndex: 'borrowAPR',
        sort: true,
        renderTitle: (title: string | string[]) => {
          return (
            <BaseTooltip
              text={title as string}
              textStyles={{
                fontSize: '12px',
                lineHeight: '12px',
                color: 'white',
              }}
              iconBefore
            >
              <Box mb="10px">
                <Text
                  textAlign="left"
                  textStyle="14"
                  lineHeight={{ base: px2vw(18), xl: '18px' }}
                  whiteSpace="break-spaces"
                  color="purple.300"
                >
                  {t('BorrowAPRToolTips1')}
                </Text>
              </Box>
              <Box mb="10px">
                <Text
                  textAlign="left"
                  textStyle="14"
                  lineHeight={{ base: px2vw(18), xl: '18px' }}
                  whiteSpace="break-spaces"
                  color="purple.300"
                >
                  {t('BorrowAPRToolTips2')}
                </Text>
              </Box>
              <Box mb="10px">
                <Text
                  textAlign="left"
                  textStyle="14"
                  lineHeight={{ base: px2vw(18), xl: '18px' }}
                  whiteSpace="break-spaces"
                  color="purple.300"
                >
                  {t('BorrowAPRToolTips3')}
                </Text>
              </Box>
            </BaseTooltip>
          )
        },
        render: (text, record) => {
          return <ReturnToolTips text={text} item={record} type="borrow" />
        },
      },
    ],
    [connectNet, setShowMarketPrice, showMarketPrice, t, userAddress]
  )
  const render = useMemo(() => {
    if (!supplyList || !borrowingList || (Array.isArray(supplyList) && supplyList.length > 0))
      return (
        <>
          <HStack spacing={px2vw(25)}>
            <BaseButton
              buttonClick={() => {
                setCurrentTab('deposit')
              }}
              w={px2vw(140)}
              h={px2vw(40)}
              backgroundImage={mobileButtonGackground}
              backgroundColor="inherit"
              borderRadius="inherit"
              backgroundSize="contain"
              backgroundRepeat="no-repeat"
              opacity={currentTab === 'deposit' ? 'inherit' : '0.3'}
              text={t('Deposit')}
              textStyle={{
                textStyle: 14,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                color: 'green.100',
              }}
            />
            <BaseButton
              buttonClick={() => {
                setCurrentTab('borrow')
              }}
              w={px2vw(140)}
              h={px2vw(40)}
              backgroundImage={mobileButtonGackground}
              backgroundColor="inherit"
              borderRadius="inherit"
              backgroundSize="contain"
              backgroundRepeat="no-repeat"
              opacity={currentTab === 'borrow' ? 'inherit' : '0.3'}
              text={t('Borrow')}
              textStyle={{
                textStyle: 14,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                color: 'purple.100',
              }}
            />
          </HStack>
          <Box
            minH={{ base: px2vw(350), xl: 'initial' }}
            w="full"
            p="0"
            display={currentTab === 'deposit' ? 'block' : 'none'}
          >
            <Table
              align="center"
              rowKey="symbol"
              headerStylesProps={{
                padding: {
                  base: `${px2vw(0)} ${px2vw(20)} ${px2vw(0)} ${px2vw(10)}`,
                },
              }}
              contentStylesProps={{
                padding: {
                  base: `${px2vw(10)} ${px2vw(15)} ${px2vw(20)} ${px2vw(15)}`,
                },
              }}
              loading={!supplyList}
              columns={despositsColumns}
              dataSource={supplyList || []}
              RowActiveNode={(record) => {
                return <DepsitRowActiveNode setSelectRecord={setSelectRecord} record={record} />
              }}
            ></Table>
          </Box>
          <Box
            minH={{ base: px2vw(350), xl: 'initial' }}
            w="full"
            p="0"
            display={currentTab === 'borrow' ? 'block' : 'none'}
          >
            <Box w="full" p="0" display={(borrowingList || []).length > 0 ? 'block' : 'none'}>
              <Table
                align="center"
                rowKey="symbol"
                headerStylesProps={{
                  padding: {
                    base: `${px2vw(0)} ${px2vw(20)} ${px2vw(0)} ${px2vw(10)}`,
                    xl: `0 10px`,
                  },
                }}
                contentStylesProps={{
                  padding: {
                    base: `${px2vw(10)} ${px2vw(15)} ${px2vw(20)} ${px2vw(15)}`,
                  },
                }}
                loading={!borrowingList}
                columns={borrowColumns}
                dataSource={borrowingList || []}
                RowActiveNode={(record) => {
                  return <BorrowRowAcitveNode setSelectRecord={setSelectRecord} record={record} />
                }}
              />
            </Box>
            <Box w="full" p="0" display={(borrowingList || []).length <= 0 ? 'block' : 'none'}>
              <DashboardEmptyBorrow />
            </Box>
          </Box>
          {/* {currentTab === 'deposit' ? (
            <Table
              align="center"
              rowKey="symbol"
              padding={10}
              loading={!supplyList}
              columns={despositsColumns}
              dataSource={supplyList || []}
              RowActiveNode={(record) => {
                return <DepsitRowActiveNode setSelectRecord={setSelectRecord} record={record} />
              }}
            ></Table>
          ) : (borrowingList || []).length > 0 ? (
            <Table
              align="center"
              rowKey="symbol"
              padding={10}
              loading={!borrowingList}
              columns={borrowColumns}
              dataSource={borrowingList || []}
              RowActiveNode={(record) => {
                return <BorrowRowAcitveNode setSelectRecord={setSelectRecord} record={record} />
              }}
            ></Table>
          ) : (
            <DashboardEmptyBorrow />
          )} */}
        </>
      )
    else {
      if (supplyList.length === 0) {
        return <DashboardEmpty />
      }
    }
  }, [borrowColumns, borrowingList, currentTab, despositsColumns, supplyList, t])
  return (
    <>
      {render}

      {/* 存款弹窗 */}
      <DashboardModal
        record={selectRecord}
        currentTab={currentDespositTab}
        tabs={despositTab}
        tabColor="white"
        isOpen={depositModalIsOpen}
        onSelect={(value) => {
          setDespositTab(value)
        }}
        onClose={() => {
          dashboardStore.setState({
            depositModalIsOpen: false,
          })
        }}
      >
        {currentDespositTab.value === 'DEPOSIT' ? (
          <DepositModalContent />
        ) : (
          <WithDrawModalContent />
        )}
      </DashboardModal>
      {/* 借款款弹窗 */}
      <DashboardModal
        record={selectRecord}
        currentTab={currentBorrowTab}
        tabs={borrowTab}
        tabColor="white"
        isOpen={borrowModalIsOpen}
        onSelect={(value) => {
          setCurrentBorrowTab(value)
        }}
        onClose={() => {
          dashboardStore.setState({
            borrowModalIsOpen: false,
          })
        }}
      >
        {currentBorrowTab.value === 'BORROW' ? <BorrowModalContent /> : <RepayModalContent />}
      </DashboardModal>
    </>
  )
}

export default React.memo(Index)
