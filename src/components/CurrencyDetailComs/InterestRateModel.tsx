import React, { useEffect, useRef, useState } from 'react'
import { Box, Text } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import * as echarts from 'echarts'
import { useTranslation } from 'next-i18next'
import { useEffectOnce } from 'react-use'
import BigNumber from 'bignumber.js'
import fluxReportStore from '@/stores/contract/fluxReport'

function Index() {
  const { bankDetail } = fluxReportStore()
  const { t } = useTranslation(['currencyDetails'])
  const refContainer = useRef(null)
  // X轴
  const [xValue] = useState(() => {
    const list = []
    for (let i = 0; i <= 100; i++) {
      list.push(`${i}%`)
    }
    return list
  })
  const [utilizationRate] = useState(() => {
    const list = []
    for (let i = 0; i <= 100; i++) {
      list.push(120)
    }
    return list
  })
  const [borrowAPY, setBorrowAPY] = useState<number[]>([])
  const [depositAPY, setDepositAPY] = useState<number[]>([])

  useEffectOnce(() => {
    getBorrowAPY()
  })

  useEffect(() => {
    getSupplyAPY()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borrowAPY])

  useEffect(() => {
    getCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositAPY, bankDetail])

  // 计算Borrow APY
  const getBorrowAPY = () => {
    const list = []
    for (let i = 0; i <= 100; i++) {
      const x =
        ((Math.exp(20 * (i / 100)) - 1) / (Math.exp(20) - 1)) * 0.995 + 0.2 * (i / 100) + 0.005
      list.push(Math.min(Number(x), 1) * 100)
    }
    setBorrowAPY(list)
  }

  // 计算Supply APY
  const getSupplyAPY = () => {
    setDepositAPY(
      borrowAPY.map((item, index) => {
        return new BigNumber(item).times(index / 100).toNumber()
      })
    )
  }

  // 渲染图标
  const getCanvas = () => {
    if (refContainer.current) {
      const myChart = echarts.init(refContainer.current)
      const option = {
        title: {
          text: t('UtilizationVsAPY'),
          textStyle: {
            color: '#AAB9DE',
            fontSize: 14,
            fontFamily: 'Rubik',
            fontWeight: 500,
            opacity: 0.5,
          },
          left: 20,
          top: 0,
        },
        tooltip: {
          trigger: 'axis',
          showContent: false,
          axisPointer: {
            type: 'line',
            lineStyle: {
              type: 'solid',
              width: 1,
              color: '#AAB9DE',
              opacity: 0.5,
            },
          },
        },
        color: ['#AAB9DE', '#9C90FF', '#D1FF85'],
        legend: {
          type: 'plain',
          data: [t('UtilizationRate'), t('borrowAPY'), t('depositAPY')],
          icon: 'rect',
          textStyle: {
            color: '#fff',
            fontFamily: 'Rubik',
            fontWeight: 'bold',
            fontSize: 12,
          },
          bottom: 15,
          align: 'right',
          itemWidth: 15,
          itemHeight: 3,
        },
        grid: {
          left: 0,
          right: 27,
          bottom: 50,
          top: 50,
          containLabel: true,
        },
        xAxis: {
          show: false,
          type: 'category',
          boundaryGap: false,
          data: xValue,
        },
        yAxis: {
          show: false,
          type: 'value',
          min: 0,
          max: 120,
          interval: 10,
        },
        series: [
          {
            name: t('UtilizationRate'),
            type: 'line',
            stack: 'Utilization Rate',
            data: utilizationRate,
            smooth: true,
            showSymbol: false,
            label: {
              show: true,
              position: 'top',
              color: '#AAB9DE',
              fontFamily: 'Rubik',
              fontSize: 14,
              fontWeight: 'bolder',
              formatter: (params: any) => {
                return params.name
              },
            },
            markPoint: {
              data: [
                {
                  symbol: 'rect',
                  symbolSize: [1, 20],
                  symbolOffset: [0, 15],
                  name: t('Current'),
                  coord: [Number(bankDetail?.utilization), 120],
                  value: Number(bankDetail?.utilization),
                  label: {
                    show: true,
                    position: 'bottom',
                    color: '#AAB9DE',
                    fontFamily: 'Rubik',
                    fontSize: 14,
                    fontWeight: 600,
                    offset: [0, -5],
                    formatter: (par: any) => {
                      return par.name
                    },
                  },
                },
              ],
            },
          },
          {
            name: t('borrowAPY'),
            type: 'line',
            stack: 'Borrow APY',
            data: borrowAPY,
            smooth: true,
            showSymbol: false,
            label: {
              show: true,
              position: 'top',
              color: '#9C90FF',
              fontFamily: 'Rubik',
              fontSize: 14,
              fontWeight: 'bolder',
              formatter: (params: any) => {
                return new BigNumber(params.data).toFixed(2) + '%'
              },
            },
          },
          {
            name: t('depositAPY'),
            type: 'line',
            stack: 'Deposit APY',
            data: depositAPY,
            smooth: true,
            showSymbol: false,
            label: {
              show: true,
              position: 'bottom',
              color: '#D1FF85',
              fontFamily: 'Rubik',
              fontSize: 14,
              fontWeight: 'bolder',
              formatter: (params: any) => {
                return new BigNumber(params.data).toFixed(2) + '%'
              },
            },
          },
        ],
      }

      myChart.setOption(option)
    }
  }

  return (
    <Box py={{ base: px2vw(25), xl: '25px' }}>
      <Box px={{ base: px2vw(20), xl: '20px' }} mb={{ base: px2vw(25), xl: '25px' }}>
        <Text textStyle="16" color="purple.300">
          {t('InterestRateModel')}
        </Text>
      </Box>
      <Box
        ref={refContainer}
        w={{ base: 'full', xl: '355px' }}
        h={{ base: px2vw(300), xl: '340px' }}
      />
    </Box>
  )
}

export default React.memo(Index)
