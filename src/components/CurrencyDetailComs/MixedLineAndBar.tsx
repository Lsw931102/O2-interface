import React, { useEffect, useRef, useState } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { unitNumberFormat } from '@/utils/math'
import * as echarts from 'echarts'
import { useTranslation } from 'next-i18next'
import useSWR from 'swr'
import { getLoadHistoryList } from '@/apis/bank'
import { netconfigs } from '@/consts/network'
import globalStore from '@/stores/global'
import BigNumber from 'bignumber.js'
import marketsStore from '@/stores/contract/markets'
import fluxReportStore from '@/stores/contract/fluxReport'

export interface listItem {
  date: string
  value: number
}
export interface IProps {
  tokenAddress: string
}

function Index({ ...prop }: IProps) {
  const { t } = useTranslation(['currencyDetails'])
  const { connectNet } = globalStore()
  const { marketList } = marketsStore()
  const { bankDetail } = fluxReportStore()
  const refContainer = useRef(null)
  const [activeTab, setActiveTab] = useState('DEPOSIT')
  const [totalDeposit, setTotalDeposit] = useState<listItem[]>([])
  const [depositAPY, setDepositAPY] = useState<listItem[]>([])
  const [totalBorrow, setTotalBorrow] = useState<listItem[]>([])
  const [borrowAPY, setBorrowAPY] = useState<listItem[]>([])
  const { data: getLoadHistoryListData } = useSWR(
    connectNet
      ? [
          getLoadHistoryList.key,
          prop.tokenAddress,
          marketList.find(
            (item: any) =>
              String(item?.underlying).toUpperCase() === String(prop.tokenAddress).toUpperCase()
          )?.address,
        ]
      : null,
    (_, _addr, address) =>
      getLoadHistoryList.fetcher({
        chainType: netconfigs[connectNet || '']?.apiChainType,
        tokenAddress: address,
        days: 60,
      }),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    if (getLoadHistoryListData && getLoadHistoryListData.code === 200 && bankDetail?.price) {
      const res = getLoadHistoryListData?.data
      const totalDepositList: listItem[] = []
      const depositAPYList: listItem[] = []
      const totalBorrowList: listItem[] = []
      const borrowAPYList: listItem[] = []
      res.map((item: any) => {
        const date = formatterTime(item?.blockTime)
        totalDepositList.push({
          date,
          value: new BigNumber(item?.totalSupply).times(bankDetail?.price).toNumber(),
        })
        depositAPYList.push({
          date,
          value: Number(new BigNumber(item?.supplyApr).times(100).toFixed(2)),
        })
        totalBorrowList.push({
          date,
          value: new BigNumber(item?.totalBorrows).times(bankDetail?.price).toNumber(),
        })
        borrowAPYList.push({
          date,
          value: Number(new BigNumber(item?.borrowApr).times(100).toFixed(2)),
        })
      })
      setTotalDeposit(totalDepositList)
      setDepositAPY(depositAPYList)
      setTotalBorrow(totalBorrowList)
      setBorrowAPY(borrowAPYList)
    }
  }, [getLoadHistoryListData, bankDetail, prop.tokenAddress])

  useEffect(() => {
    if (refContainer.current) {
      const myChart = echarts.init(refContainer.current)
      const colors = activeTab === 'DEPOSIT' ? '#D1FF85' : '#9C90FF'
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              type: 'solid',
              width: 1,
              color: '#AAB9DE',
              opacity: 0.5,
            },
          },
          backgroundColor: '#2F2F3B',
          borderColor: '#2F2F3B',
          borderRadius: 10,
          formatter: function (params: any) {
            let str = `<span style='color: #AAB9DE'>${params[0].axisValue}</span>` + '<br />'
            params.forEach((item: any, idx: any) => {
              switch (item.componentSubType) {
                case 'bar':
                  str += `<span style='color:${colors}'>${item.seriesName}: $ ${unitNumberFormat(
                    item.data,
                    2
                  )}</span>`
                  break
                case 'line':
                  str += `<span style='color:${colors}'>${item.seriesName}: ${item.data}%</span>`
                  break
                default:
                  str += 'w(ﾟДﾟ)w'
              }
              str += idx === params.length - 1 ? '' : '<br/>'
            })
            return str
          },
        },
        color: [colors, colors],
        legend: {
          data: [
            t(activeTab === 'DEPOSIT' ? 'TotalDeposit' : 'TotalBorrowing'),
            t(activeTab === 'DEPOSIT' ? 'depositAPY' : 'borrowAPY'),
          ],
          textStyle: {
            color: '#AAB9DE',
            fontFamily: 'Rubik',
            fontWeight: 'bold',
            fontSize: 14,
          },
          bottom: 30,
          align: 'right',
        },
        grid: {
          left: 0,
          right: 0,
          bottom: 74,
          top: 0,
        },
        xAxis: [
          {
            show: false,
            type: 'category',
            data: totalDeposit.map((item) => item.date),
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: t(activeTab === 'DEPOSIT' ? 'TotalDeposit' : 'TotalBorrowing'),
            min: 0,
            max:
              activeTab === 'DEPOSIT'
                ? Math.max(...totalDeposit.map((item) => item.value))
                : Math.max(...totalBorrow.map((item) => item.value)),
            interval:
              activeTab === 'DEPOSIT'
                ? Math.ceil(Math.max(...totalDeposit.map((item) => item.value)) / 6)
                : Math.ceil(Math.max(...totalBorrow.map((item) => item.value)) / 6),
            axisLabel: {
              show: false,
              formatter: '{value} ml',
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
                color: '#AAB9DE',
                opacity: 0.2,
              },
            },
          },
          {
            type: 'value',
            name: t(activeTab === 'DEPOSIT' ? 'depositAPY' : 'borrowAPY'),
            min: 0,
            max:
              activeTab === 'DEPOSIT'
                ? Math.max(...depositAPY.map((item) => item.value))
                : Math.max(...borrowAPY.map((item) => item.value)),
            interval:
              activeTab === 'DEPOSIT'
                ? Math.ceil(Math.max(...depositAPY.map((item) => item.value)) / 6)
                : Math.ceil(Math.max(...borrowAPY.map((item) => item.value)) / 6),
            axisLabel: {
              show: false,
              formatter: '{value} °C',
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
                color: '#AAB9DE',
                opacity: 0.2,
              },
            },
          },
        ],
        series: [
          {
            name: t(activeTab === 'DEPOSIT' ? 'TotalDeposit' : 'TotalBorrowing'),
            type: 'bar',
            data:
              activeTab === 'DEPOSIT'
                ? totalDeposit.map((item) => item.value)
                : totalBorrow.map((item) => item.value),
            itemStyle: {
              borderRadius: [16, 16, 0, 0],
              opacity: 0.6,
            },
          },
          {
            name: t(activeTab === 'DEPOSIT' ? 'depositAPY' : 'borrowAPY'),
            type: 'line',
            areaStyle: {
              color: colors,
              opacity: 0.2,
            },
            yAxisIndex: 1,
            data:
              activeTab === 'DEPOSIT'
                ? depositAPY.map((item) => item.value)
                : borrowAPY.map((item) => item.value),
            itemStyle: {
              borderColor: colors,
              borderWidth: 8,
              opacity: 0.6,
            },
          },
        ],
      }

      myChart.setOption(option)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, totalDeposit, totalBorrow, depositAPY, borrowAPY])

  // 时间戳处理
  const formatterTime = (timeStamp: string) => {
    const time = new Date(timeStamp)
    const y = time.getFullYear()
    const m = time.getMonth() + 1 < 10 ? `0${time.getMonth() + 1}` : time.getMonth() + 1
    const d = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
    return y + '.' + m + '.' + d
  }

  return (
    <Box px={{ base: px2vw(10), xl: '45px' }}>
      <Flex
        w="full"
        h={{ base: px2vw(70), xl: '70px' }}
        justifyContent={{ base: 'center', xl: 'flex-end' }}
      >
        <Text
          textStyle="16"
          lineHeight={{ base: px2vw(70), xl: '70px' }}
          color="green.100"
          cursor="pointer"
          mr={{ base: px2vw(40), xl: '40px' }}
          opacity={activeTab === 'DEPOSIT' ? 1 : 0.3}
          onClick={() => setActiveTab('DEPOSIT')}
        >
          {t('DEPOSIT')}
        </Text>
        <Text
          textStyle="16"
          lineHeight={{ base: px2vw(70), xl: '70px' }}
          color="purple.100"
          cursor="pointer"
          opacity={activeTab === 'BORROW' ? 1 : 0.3}
          onClick={() => setActiveTab('BORROW')}
        >
          {t('BORROW')}
        </Text>
      </Flex>
      <Box
        ref={refContainer}
        w={{ base: 'full', xl: '692px' }}
        h={{ base: px2vw(315), xl: '315px' }}
      />
    </Box>
  )
}

export default React.memo(Index)
