import React, { useState } from 'react'
import { Flex, Text, Box, Image, useBoolean, BoxProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { completeUrl, findIcon, getBorrowCombinedAPY, getDepositCombinedAPY } from '@/utils/common'
import BankTableNode from '@/components/BankTableNode'
import Table from '@/components/Table'
import { useTranslation } from 'next-i18next'
import NumberTips from '../NumberTips'
import BaseTooltip from '../BaseTooltip'
import BigNumber from 'bignumber.js'
import dashboardStore from '@/stores/pages/dashboard'
import RadioGroup from '../RadioGroup'

export interface IProps extends BoxProps {
  tableList: any
  tableButtonClick: (val: any) => void
}

// 返回存/借的tooltips
export const ReturnToolTips = React.memo(
  ({ text, item, type }: { text: any; item: any; type: string }) => {
    const { t } = useTranslation(['dashboard'])
    return (
      <BaseTooltip
        isPureVersion
        text={`${new BigNumber(text).times(100).toFixed(2)}%`}
        textStyles={{
          fontSize: '18px',
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
            {t('FLUXRewardAPRToolTipsPC')}:
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
            {t('CombinedAPYToolTipsPC')}:
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

function Index({ tableList, tableButtonClick, ...prop }: IProps) {
  const { t } = useTranslation(['bank'])
  const [showMarketPrice, setShowMarketPrice] = useBoolean(false) // Market显示价值
  const [showBorrowingPrice, setBorrowingPrice] = useBoolean(false) // Borrowing显示价值
  const [showLiquidityPrice, setLiquidityPrice] = useBoolean(false) // Liquidity显示价值
  const [curTab, setTab] = useState('1') // PC单选框值
  const options = [
    {
      label: t('All'),
      value: '1',
    },
    {
      label: t('StableCoins'),
      value: '2',
    },
    // only Deposit在V2中开发
    // {
    //   label: t('only Deposit'),
    //   value: '3',
    // },
  ]
  const { setCurrentBorrowTab, setDespositTab } = dashboardStore()

  // PC表头
  const tableColumns = [
    {
      dataIndex: 'assets',
      title: t('assets'),
      sort: true,
      render: (text: any) => {
        return (
          <Flex>
            <Image
              ignoreFallback
              src={findIcon(text, 'coin')}
              w={{ base: px2vw(40), xl: '40px' }}
              h={{ base: px2vw(40), xl: '40px' }}
              mr={{ base: px2vw(5), xl: '5px' }}
            />
            <Text fontSize="18px" lineHeight={{ base: px2vw(40), xl: '40px' }} fontWeight="500">
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
      dataIndex: showMarketPrice ? 'marketPrice' : 'marketSize',
      title: t('marketSize'),
      sort: true,
      render: (text: any) => {
        return (
          <Text fontSize="18px">
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
      dataIndex: showBorrowingPrice ? 'borrowingPrice' : 'borrowingSize',
      title: t('Borrow'),
      sort: true,
      render: (text: any) => {
        return (
          <Text fontSize="18px">
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
      dataIndex: showLiquidityPrice ? 'liquidityPrice' : 'liquidity',
      title: t('liquidity'),
      sort: true,
      render: (text: any) => {
        return (
          <Text fontSize="18px">
            {showLiquidityPrice ? (
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
              onClick={() => setLiquidityPrice.toggle()}
            />
            <Text fontSize="12px">{title}</Text>
          </Flex>
        )
      },
    },
    {
      dataIndex: 'depositAPR',
      title: t('depositAPR'),
      sort: true,
      render: (text: any, item: any) => {
        return <ReturnToolTips text={text} item={item} type="deposit" />
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
    {
      dataIndex: 'borrowAPR',
      title: t('borrowAPR'),
      sort: true,
      render: (text: any, item: any) => {
        return <ReturnToolTips text={text} item={item} type="borrow" />
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
    {
      dataIndex: 'utilization',
      title: t('utilization'),
      sort: true,
      render: (text: any) => {
        return (
          <Text textAlign="center" fontSize="18px">
            <NumberTips value={text} isRatio />
          </Text>
        )
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
            <Text
              textStyle="14"
              lineHeight={{ base: px2vw(18), xl: '18px' }}
              whiteSpace="break-spaces"
              color="purple.300"
              mb="10px"
            >
              {t('UtilizationToolTips1')}
            </Text>
            <Text
              textStyle="14"
              lineHeight={{ base: px2vw(18), xl: '18px' }}
              color="purple.300"
              whiteSpace="break-spaces"
            >
              {t('UtilizationToolTips2')}
            </Text>
          </BaseTooltip>
        )
      },
    },
  ]

  return (
    <Box {...prop}>
      {/* 按钮组 */}
      <Box display={{ base: 'none', xl: 'flex' }} mb={{ base: px2vw(35), xl: '35px' }}>
        <RadioGroup
          spacing={{ base: px2vw(30), xl: '30px' }}
          options={options}
          defaultValue={curTab}
          onChange={(val: string) => setTab(val)}
        />
      </Box>
      <Table
        loading={tableList.length ? false : true}
        columns={tableColumns}
        dataSource={
          curTab === '2' ? tableList.filter((item: any) => item?.category === 'stable') : tableList
        }
        rowKey="assets"
        headerStylesProps={{
          padding: {
            xl: `0 10px`,
          },
        }}
        contentStylesProps={{
          padding: '10px',
        }}
        RowActiveNode={(record: any) => (
          <BankTableNode
            underlying={record?.underlying}
            record={record}
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
  )
}

export default React.memo(Index)
