import React, { useMemo } from 'react'
import { Flex, Text, Box, Image, useBoolean, BoxProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { completeUrl, findIcon, getBorrowCombinedAPY, getDepositCombinedAPY } from '@/utils/common'
import BankTableNodeMobile from '@/components/BankTableNodeMobile'
import Table from '@/components/Table'
import { useTranslation } from 'next-i18next'
import NumberTips from '../NumberTips'
import BaseTooltip from '../BaseTooltip'
import BigNumber from 'bignumber.js'
import dashboardStore from '@/stores/pages/dashboard'
import { TAlign } from '../Table/type'

export interface IProps extends BoxProps {
  mobileCurTab: string
  tableList: any
  tableButtonClick: (val: any) => void
}

// 返回存/借的tooltips
export const ReturnToolTips = React.memo(
  ({ text, item, type }: { text: any; item: any; type: string }) => {
    const { t } = useTranslation(['bank', 'dashboard'])
    return (
      <BaseTooltip
        isPureVersion
        text={`${new BigNumber(text).times(100).toFixed(2)}%`}
        textStyles={{
          fontSize: '16px',
          fontWeight: 'normal',
        }}
      >
        <Flex w="full" justifyContent="space-between" mb="10px">
          <Text textStyle="14" color="white">
            {t(type === 'deposit' ? 'DepositInterestRateToolTips' : 'BorrowInterestRateToolTips')}:
          </Text>
          <Text textStyle="14" color="white">
            <NumberTips
              value={new BigNumber(
                type === 'deposit' ? item?.supplyInterestPreDay : item?.borrowInterestPreDay
              )
                .times(365)
                .toString()}
              isRatio
            />
          </Text>
        </Flex>
        <Flex w="full" justifyContent="space-between" mb="10px">
          <Text textStyle="14" color="white">
            {t('FLUXRewardAPRToolTips')}:
          </Text>
          <Text textStyle="14" color="white">
            <NumberTips
              value={new BigNumber(
                type === 'deposit' ? item?.supplyFluxAPY : item?.borrowFluxAPY
              ).toString()}
              isRatio
            />
          </Text>
        </Flex>
        <Flex w="full" justifyContent="space-between" mb="10px">
          <Text textStyle="14" color="white">
            {t('CombinedAPYToolTips')}:
          </Text>
          <Text textStyle="14" color="white">
            {type === 'deposit' ? (
              getDepositCombinedAPY(
                new BigNumber(item?.supplyInterestPreDay).times(365).toString(),
                new BigNumber(item?.supplyFluxAPY).toString()
              ) === 'big' ? (
                '> 1000000%'
              ) : getDepositCombinedAPY(
                  new BigNumber(item?.supplyInterestPreDay).times(365).toString(),
                  new BigNumber(item?.supplyFluxAPY).toString()
                ) === 'small' ? (
                '< -1000000%'
              ) : (
                <NumberTips
                  value={getDepositCombinedAPY(
                    new BigNumber(item?.supplyInterestPreDay).times(365).toString(),
                    new BigNumber(item?.supplyFluxAPY).toString()
                  )}
                  isRatio
                />
              )
            ) : getBorrowCombinedAPY(
                new BigNumber(item?.borrowInterestPreDay).times(365).toString(),
                new BigNumber(item?.borrowFluxAPY).toString()
              ) === 'big' ? (
              '> 1000000%'
            ) : getBorrowCombinedAPY(
                new BigNumber(item?.borrowInterestPreDay).times(365).toString(),
                new BigNumber(item?.borrowFluxAPY).toString()
              ) === 'small' ? (
              '< -1000000%'
            ) : (
              <NumberTips
                value={getBorrowCombinedAPY(
                  new BigNumber(item?.borrowInterestPreDay).times(365).toString(),
                  new BigNumber(item?.borrowFluxAPY).toString()
                )}
                isRatio
              />
            )}
          </Text>
        </Flex>
      </BaseTooltip>
    )
  }
)

function Index({ mobileCurTab, tableList, tableButtonClick, ...prop }: IProps) {
  const { t, i18n } = useTranslation(['bank'])
  const [showMarketPrice, setShowMarketPrice] = useBoolean(false) // Market显示价值
  const [showBorrowingPrice, setBorrowingPrice] = useBoolean(false) // Borrowing显示价值
  const { setCurrentBorrowTab, setDespositTab } = dashboardStore()

  // 移动端表头(存)
  const tableColumnsMobileDeposit = useMemo(
    () => [
      {
        align: 'center' as TAlign,
        dataIndex: 'assets',
        title: t('assets'),
        sort: true,
        render: (text: any) => {
          return (
            <Flex w="full" justifyContent="flex-start">
              <Image
                ignoreFallback
                src={findIcon(text, 'coin')}
                w={px2vw(30)}
                h={px2vw(30)}
                mr={px2vw(5)}
              />
              <Text fontSize="16px" fontWeight="normal">
                {text}
              </Text>
            </Flex>
          )
        },
        renderTitle: (title: string | string[]) => {
          return <Text fontSize="12px">{title}</Text>
        },
      },
      {
        align: 'center' as TAlign,
        dataIndex: showMarketPrice ? 'marketPrice' : 'marketSize',
        title: t('marketSize'),
        sort: true,
        render: (text: any) => {
          return (
            <Text fontSize="16px" fontWeight="normal">
              {showMarketPrice ? (
                <NumberTips value={text} symbol="$" isAbbr shortNum={2} />
              ) : (
                <NumberTips value={text} isAbbr shortNum={4} />
              )}
            </Text>
          )
        },
        renderTitle: (title: string | string[]) => {
          return (
            <Flex>
              <Image
                w={{ base: px2vw(12), xl: '12px' }}
                h={{ base: px2vw(12), xl: '12px' }}
                mr={{ base: px2vw(4), xl: '4px' }}
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
        align: 'center' as TAlign,
        dataIndex: 'depositAPR',
        title: t('APR'),
        sort: true,
        render: (text: any, item: any) => {
          return <ReturnToolTips text={text} item={item} type={'deposit'} />
        },
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
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setShowMarketPrice, showBorrowingPrice, showMarketPrice, i18n]
  )

  // 移动端表头(借)
  const tableColumnsMobileBorrow = useMemo(
    () => [
      {
        align: 'center' as TAlign,
        dataIndex: 'assets',
        title: t('assets'),
        sort: true,
        render: (text: any) => {
          return (
            <Flex w="full" justifyContent="flex-start">
              <Image
                ignoreFallback
                src={findIcon(text, 'coin')}
                w={px2vw(30)}
                h={px2vw(30)}
                mr={px2vw(5)}
              />
              <Text fontSize="16px" fontWeight="normal">
                {text}
              </Text>
            </Flex>
          )
        },
        renderTitle: (title: string | string[]) => {
          return <Text fontSize="12px">{title}</Text>
        },
      },
      {
        align: 'center' as TAlign,
        dataIndex: showBorrowingPrice ? 'borrowingPrice' : 'borrowingSize',
        title: t('borrowingSize'),
        sort: true,
        render: (text: any) => {
          return (
            <Text fontSize="16px" fontWeight="normal">
              {showBorrowingPrice ? (
                <NumberTips value={text} symbol="$" isAbbr shortNum={2} />
              ) : (
                <NumberTips value={text} isAbbr shortNum={4} />
              )}
            </Text>
          )
        },
        renderTitle: (title: string | string[]) => {
          return (
            <Flex>
              <Image
                w={{ base: px2vw(12), xl: '12px' }}
                h={{ base: px2vw(12), xl: '12px' }}
                mr={{ base: px2vw(4), xl: '4px' }}
                src={completeUrl('menu/changeCoin.svg')}
                cursor="pointer"
                onClick={() => setBorrowingPrice.toggle()}
              />
              <Text fontSize="12px">{title}</Text>
            </Flex>
          )
        },
      },
      {
        align: 'center' as TAlign,
        dataIndex: 'borrowAPR',
        title: t('APR'),
        sort: true,
        render: (text: any, item: any) => {
          return <ReturnToolTips text={text} item={item} type={'borrow'} />
        },
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
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setBorrowingPrice, showBorrowingPrice, showMarketPrice, i18n]
  )

  return (
    <Box px={px2vw(10)} {...prop}>
      <Box display={mobileCurTab === '1' ? 'block' : 'none'}>
        <Table
          loading={tableList.length ? false : true}
          columns={tableColumnsMobileDeposit}
          dataSource={tableList}
          rowKey="assets"
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
          RowActiveNode={(record: any) => (
            <BankTableNodeMobile
              record={record}
              type={mobileCurTab}
              underlying={record?.underlying}
              onButtonsClick={(type: string, record: any) => {
                if (type === 'Deposit') {
                  setDespositTab({ label: 'DEPOSIT', value: 'DEPOSIT' })
                  dashboardStore.setState({
                    depositModalIsOpen: true,
                  })
                } else if (type === 'Withdraw') {
                  setDespositTab({
                    label: 'WITHDRAW',
                    value: 'WITHDRAW',
                  })
                  dashboardStore.setState({
                    depositModalIsOpen: true,
                  })
                } else if (type === 'Borrow') {
                  setCurrentBorrowTab({ label: 'BORROW', value: 'BORROW' })
                  dashboardStore.setState({
                    borrowModalIsOpen: true,
                  })
                } else if (type === 'Repay') {
                  setCurrentBorrowTab({
                    label: 'REPAY',
                    value: 'REPAY',
                  })
                  dashboardStore.setState({
                    borrowModalIsOpen: true,
                  })
                }
                tableButtonClick({ type, record })
              }}
            />
          )}
        />
      </Box>
      <Box display={mobileCurTab === '2' ? 'block' : 'none'}>
        <Table
          loading={tableList.length ? false : true}
          columns={tableColumnsMobileBorrow}
          dataSource={tableList}
          rowKey="assets"
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
          RowActiveNode={(record: any) => (
            <BankTableNodeMobile
              record={record}
              type={mobileCurTab}
              underlying={record?.underlying}
              onButtonsClick={(type: string, record: any) => {
                if (type === 'Deposit') {
                  setDespositTab({ label: 'DEPOSIT', value: 'DEPOSIT' })
                  dashboardStore.setState({
                    depositModalIsOpen: true,
                  })
                } else if (type === 'Withdraw') {
                  setDespositTab({
                    label: 'WITHDRAW',
                    value: 'WITHDRAW',
                  })
                  dashboardStore.setState({
                    depositModalIsOpen: true,
                  })
                } else if (type === 'Borrow') {
                  setCurrentBorrowTab({ label: 'BORROW', value: 'BORROW' })
                  dashboardStore.setState({
                    borrowModalIsOpen: true,
                  })
                } else if (type === 'Repay') {
                  setCurrentBorrowTab({
                    label: 'REPAY',
                    value: 'REPAY',
                  })
                  dashboardStore.setState({
                    borrowModalIsOpen: true,
                  })
                }
                tableButtonClick({ type, record })
              }}
            />
          )}
        />
      </Box>
    </Box>
  )
}

export default React.memo(Index)
