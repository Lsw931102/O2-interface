import React, { useEffect, useMemo, useState } from 'react'
import { Box, Flex, HStack, Text, Image, Switch, Tooltip, useBoolean } from '@chakra-ui/react'
import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import useSWR from 'swr'
import dayjs from 'dayjs'
import { getBorrowAndLendDetailInfo } from '@/apis/dashboard'

import Table from '@/components/Table'
import BaseButton from '@/components/BaseButton'
import DashboardModal from '@/components/Modals/DashboardModal'
import BaseTooltip from '@/components/BaseTooltip'
import DashboardEmptyBorrow from '@/components/DashboardEmptyBorrow'
import WithDrawModalContent from '@/components/WithDrawModalContent'
import NumberTips from '@/components/NumberTips'
import BorrowModalContent from '@/components/BorrowModalContent'
import RepayModalContent from '@/components/RepayModalContent'
import type { ColumnItem } from '@/components/Table/type'
import DepositModalContent from '@/components/DepositModalContent'
import { ReturnToolTips } from '@/components/Market/MarketTable'

import dashboardStore, { borrowTab, despositTab } from '@/stores/pages/dashboard'
import globalStore from '@/stores/global'

import { completeUrl } from '@/utils/common'
import { netconfigs } from '@/consts/network'

BigNumber.config({ EXPONENTIAL_AT: 99 })

export const AmountTitle = React.memo(
  ({
    type,
    record,
    userAddress,
    chainType,
    showMarketPrice,
  }: {
    type: string
    record: any
    userAddress: string
    chainType: string
    showMarketPrice: boolean
  }) => {
    const { t } = useTranslation(['dashboard'])
    const [isShow, setIsShow] = useState(false)

    const { data } = useSWR(isShow ? getBorrowAndLendDetailInfo.key : null, () =>
      getBorrowAndLendDetailInfo.fetcher({
        userAddress: userAddress,
        chainType: chainType,
        tokenAddress: record?.address,
      })
    )

    const sumMemo = useMemo(() => {
      if (!data?.data) {
        return '--'
      } else {
        // 应收利息 = 当前存款余额 - (累积存款 - 累积提现)
        if (type === 'deposit') {
          return new BigNumber(record?.supply)
            .div(10 ** record?.decimals)
            .minus(data?.data?.deposits)
            .plus(data?.data?.withdraw)
            .lt(0)
            ? '--'
            : new BigNumber(record?.supply)
                .div(10 ** record?.decimals)
                .minus(data?.data?.deposits)
                .plus(data?.data?.withdraw)
                .toString()
        } else {
          // 应收利息 =  当前借款余额  - (累积借款 - 累积还款)
          return new BigNumber(record?.borrow)
            .div(10 ** record?.decimals)
            .minus(data?.data?.borrows)
            .plus(data?.data?.repay)
            .lt(0)
            ? '--'
            : new BigNumber(record?.borrow)
                .div(10 ** record?.decimals)
                .minus(data?.data?.borrows)
                .plus(data?.data?.repay)
                .toString()
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.data, type])
    // TODO:绑定方法

    const textRenderMemo = useMemo(() => {
      if (type === 'deposit') {
        return showMarketPrice ? (
          <Text textStyle="18">
            {record?.supplyPrice ? (
              <NumberTips
                toolTipProps={{
                  isDisabled: false,
                }}
                shortNum={2}
                symbol="$"
                value={new BigNumber(record?.supplyPrice).div(10 ** record?.decimals).toString()}
              />
            ) : (
              '--'
            )}
          </Text>
        ) : (
          <Text textStyle="18">
            {record?.supply ? (
              <NumberTips
                toolTipProps={{
                  isDisabled: false,
                }}
                value={new BigNumber(record?.supply).div(10 ** record?.decimals).toString()}
              />
            ) : (
              '--'
            )}
          </Text>
        )
      } else {
        return showMarketPrice ? (
          <Text textStyle="18">
            {record?.borrowPrice ? (
              <NumberTips
                toolTipProps={{
                  isDisabled: false,
                }}
                symbol="$"
                shortNum={2}
                value={new BigNumber(record?.borrowPrice).div(10 ** record?.decimals).toString()}
              />
            ) : (
              '--'
            )}
          </Text>
        ) : (
          <Text textStyle="18">
            {record?.borrow ? (
              <NumberTips
                toolTipProps={{
                  isDisabled: false,
                }}
                value={new BigNumber(record?.borrow).div(10 ** record?.decimals).toString()}
              />
            ) : (
              '--'
            )}
          </Text>
        )
      }
    }, [
      record?.borrow,
      record?.borrowPrice,
      record?.decimals,
      record?.supply,
      record?.supplyPrice,
      showMarketPrice,
      type,
    ])
    return (
      <BaseTooltip
        text={t('Interests payable')}
        textStyles={{
          textStyle: '18',
        }}
        textRender={textRenderMemo}
        textRenderIconStyle={{
          onMouseEnter: () => {
            setIsShow(true)
          },
        }}
      >
        <Text whiteSpace="pre-wrap">
          {type === 'deposit'
            ? t('depositAmountToolTips', { total: sumMemo, symbol: record?.symbol })
            : t('borrowAmountToolTips', { total: sumMemo, symbol: record?.symbol })}
        </Text>
        <Text>
          {t('Last update time')}:
          {dayjs(data?.data?.lastUpdateBlockTime).format('YYYY-MM-DD HH:mm:ss')}{' '}
        </Text>
      </BaseTooltip>
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
            <HStack spacing="5px" width="100%" justifyContent="start">
              <Image width="30px" height="30px" ignoreFallback src={record?.tokenIcon} />
              <Text>{record.symbol}</Text>
            </HStack>
          )
        },
      },
      {
        title: showMarketPrice ? t('price') : t('amount'),
        dataIndex: showMarketPrice ? 'supplyPrice' : 'supply',
        sort: true,
        render: (_: any, record: any) => {
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
        renderTitle: (title: string | string[]) => {
          return (
            <Flex>
              <Image
                w="12px"
                h="12px"
                mr="4px"
                src={completeUrl('menu/changeCoin.svg')}
                cursor="pointer"
                onClick={() => setShowMarketPrice.toggle()}
              />
              <Text fontSize="12px">{title}</Text>
            </Flex>
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
                  lineHeight={{ xl: '18px' }}
                  whiteSpace="break-spaces"
                  color="white"
                >
                  {t('DepositAPRToolTips1')}
                </Text>
              </Box>
              <Box mb="10px">
                <Text
                  textAlign="left"
                  textStyle="14"
                  lineHeight={{ xl: '18px' }}
                  whiteSpace="break-spaces"
                  color="white"
                >
                  {t('DepositAPRToolTips2')}
                </Text>
              </Box>
              <Box>
                <Text
                  textAlign="left"
                  textStyle="14"
                  lineHeight={{ xl: '18px' }}
                  whiteSpace="break-spaces"
                  color="white"
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
      {
        title: t('as collateral'),
        dataIndex: 'asCollateral',
        renderTitle: (title: string | string[]) => {
          return (
            <BaseTooltip
              text={title as string}
              textStyles={{
                fontSize: '12px',
                lineHeight: '12px',
                color: 'white',
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
          )
        },
        render: () => {
          return (
            <Tooltip label={t('in development')} placement="top">
              <Box>
                <Switch isChecked={true} variant="flux" size="lg" colorScheme="purple" />
              </Box>
            </Tooltip>
          )
        },
      },
      {
        title: t('action'),
        dataIndex: 'action',
        render: (_, record) => {
          return (
            <>
              <HStack spacing="22px">
                <BaseButton
                  buttonClick={() => {
                    setSelectRecord(record)
                    setDespositTab(despositTab[1])
                    dashboardStore.setState({
                      depositModalIsOpen: true,
                    })
                  }}
                  isCircular
                  buttonType="remove"
                  bgColor="green.100"
                  iconStyle={{ color: 'gray.700' }}
                />
                <BaseButton
                  buttonClick={() => {
                    setSelectRecord(record)
                    setDespositTab(despositTab[0])
                    dashboardStore.setState({
                      depositModalIsOpen: true,
                    })
                  }}
                  isCircular
                  buttonType="add"
                  bgColor="green.100"
                  iconStyle={{ color: 'gray.700' }}
                />
              </HStack>
            </>
          )
        },
      },
    ],
    [connectNet, setDespositTab, setShowMarketPrice, showMarketPrice, t, userAddress]
  )

  const borrowColumns: ColumnItem[] = useMemo(
    () => [
      {
        title: t('assets'),
        dataIndex: 'symbol',

        sort: true,
        render: (_, record) => {
          return (
            <HStack spacing="5px" width="100%" justifyContent="center">
              <Image width="30px" height="30px" ignoreFallback src={record?.tokenIcon} />
              <Text>{record.symbol}</Text>
            </HStack>
          )
        },
      },
      {
        title: showMarketPrice ? t('price') : t('amount'),
        dataIndex: showMarketPrice ? 'borrowPrice' : 'borrow',
        sort: true,
        render: (_: any, record: any) => {
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
        renderTitle: (title: string | string[]) => {
          return (
            <Flex>
              <Image
                w="12px"
                h="12px"
                mr="4px"
                src={completeUrl('menu/changeCoin.svg')}
                cursor="pointer"
                onClick={() => setShowMarketPrice.toggle()}
              />
              <Text fontSize="12px">{title}</Text>
            </Flex>
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
                  lineHeight="18px"
                  whiteSpace="break-spaces"
                  color="white"
                >
                  {t('BorrowAPRToolTips1')}
                </Text>
              </Box>
              <Box mb="10px">
                <Text
                  textAlign="left"
                  textStyle="14"
                  lineHeight="18px"
                  whiteSpace="break-spaces"
                  color="white"
                >
                  {t('BorrowAPRToolTips2')}
                </Text>
              </Box>
              <Box mb="10px">
                <Text
                  textAlign="left"
                  textStyle="14"
                  lineHeight="18px"
                  whiteSpace="break-spaces"
                  color="white"
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

      {
        title: t('action'),
        dataIndex: 'action',
        render: (_, record) => {
          return (
            <>
              <HStack spacing="22px" justifyContent="center">
                <BaseButton
                  buttonClick={() => {
                    setSelectRecord(record)
                    setCurrentBorrowTab(borrowTab[1])
                    dashboardStore.setState({
                      borrowModalIsOpen: true,
                    })
                  }}
                  isCircular
                  buttonType="remove"
                  bgColor="grey.200"
                  iconStyle={{ color: 'gray.700' }}
                />
                <BaseButton
                  buttonClick={() => {
                    setSelectRecord(record)
                    setCurrentBorrowTab(borrowTab[0])
                    dashboardStore.setState({
                      borrowModalIsOpen: true,
                    })
                  }}
                  isCircular
                  buttonType="add"
                  bgColor="grey.200"
                  iconStyle={{ color: 'gray.700' }}
                />
              </HStack>
            </>
          )
        },
      },
    ],
    [connectNet, setCurrentBorrowTab, setShowMarketPrice, showMarketPrice, t, userAddress]
  )

  const render = useMemo(() => {
    if (!borrowingList || (Array.isArray(borrowingList) && borrowingList.length > 0)) {
      return (
        <Table
          align="center"
          rowKey="symbol"
          loading={borrowingList ? false : true}
          columns={borrowColumns}
          dataSource={borrowingList}
        ></Table>
      )
    } else {
      return <DashboardEmptyBorrow />
    }
  }, [borrowColumns, borrowingList])

  useEffect(() => {
    if (!borrowModalIsOpen || !depositModalIsOpen) {
      setSelectRecord(null)
    }
  }, [borrowModalIsOpen, depositModalIsOpen])
  return (
    <>
      <Flex width="100%" marginTop={{ md: '54px' }} justifyContent="space-between">
        <Box width={{ md: '600px' }} marginRight="5px">
          <Text color="green.300" textStyle="20" fontWeight="500" marginBottom={{ md: '25px' }}>
            {t('myDeposits')}
          </Text>
          <Table
            align="center"
            rowKey="address"
            loading={supplyList ? false : true}
            columns={despositsColumns}
            dataSource={supplyList}
          ></Table>
        </Box>

        <Box width={{ md: '600px' }}>
          <Text color="purple.100" textStyle="20" fontWeight="500" marginBottom={{ md: '25px' }}>
            {t('myBorrowings')}
          </Text>
          {render}
        </Box>
      </Flex>
      {/* 存款modal */}
      <DashboardModal
        record={selectRecord}
        currentTab={currentDespositTab}
        tabs={despositTab}
        tabColor="green.100"
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
      {/* 借款弹窗 */}
      <DashboardModal
        record={selectRecord}
        currentTab={currentBorrowTab}
        tabs={borrowTab}
        tabColor="purple.100"
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
