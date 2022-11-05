import React, { useEffect, useRef } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import * as echarts from 'echarts'
import { useTranslation } from 'next-i18next'
import fluxReportStore from '@/stores/contract/fluxReport'
import NumberTips from '../NumberTips'

export interface IProps {
  activeToken: string
}

function Index({ ...prop }: IProps) {
  const { bankDetail } = fluxReportStore()
  const { t } = useTranslation(['currencyDetails'])
  const refContainer = useRef(null)

  useEffect(() => {
    if (refContainer.current) {
      const myChart = echarts.init(refContainer.current)
      const option = {
        series: [
          {
            name: 'Pressure',
            type: 'gauge',
            radius: '90%',
            min: 0,
            max: 100,
            startAngle: 180,
            endAngle: 0,
            data: [
              {
                value: bankDetail?.utilization || 0,
                name: t('utilization'),
              },
            ],
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            pointer: {
              show: false,
            },
            progress: {
              show: true,
            },
            itemStyle: {
              borderColor: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#9C90FF', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#4F3EE0', // 100% 处的颜色
                  },
                ],
                globalCoord: false, // 缺省为 false
              },
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#9C90FF', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#4F3EE0', // 100% 处的颜色
                  },
                ],
                globalCoord: false, // 缺省为 false
              },
            },
            detail: {
              color: '#AAB9DE',
              fontFamily: 'Rubik',
              fontWeight: 'bold',
              fontSize: 20,
              offsetCenter: ['5%', '-40%'],
              formatter: function (value: any) {
                return value + '%'
              },
            },
            title: {
              color: '#AAB9DE',
              fontFamily: 'Rubik',
              fontWeight: 500,
              fontSize: 12,
              offsetCenter: ['0', '-10%'],
              opacity: 0.5,
            },
          },
        ],
      }

      myChart.setOption(option)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankDetail])

  return (
    <Box px={{ base: px2vw(20), xl: '20px' }} py={{ base: px2vw(25), xl: '25px' }}>
      <Text textStyle="16" color="purple.300" mb={{ base: px2vw(50), xl: '60px' }}>
        {t('UtilizationRate')}
      </Text>
      <Flex justifyContent="center">
        {/* 图表 */}
        <Box
          ref={refContainer}
          w={{ base: px2vw(130), xl: '150px' }}
          h={{ base: px2vw(120), xl: '130px' }}
        />
      </Flex>
      <Flex justifyContent="space-around">
        {/* Available Liquidity */}
        <Flex
          w={{ base: px2vw(140), xl: '120px' }}
          flexDirection="column"
          mb={{ base: px2vw(30), xl: '30px' }}
        >
          <Text
            textStyle="14"
            color="purple.300"
            mb={{ base: px2vw(10), xl: '10px' }}
            fontWeight="normal"
          >
            {t('availableLiquidity')}
          </Text>
          <Text textStyle={{ base: '16', xl: '14' }} color="purple.300" fontWeight="bold">
            {bankDetail?.availableLiquidity ? (
              <NumberTips value={bankDetail?.availableLiquidity} isAbbr shortNum={4} />
            ) : (
              '--'
            )}{' '}
            {prop.activeToken}
          </Text>
        </Flex>
        {/* Total Borrowing */}
        <Flex
          w={{ base: px2vw(140), xl: '120px' }}
          flexDirection="column"
          mb={{ base: px2vw(80), xl: '80px' }}
        >
          <Text
            textStyle={{ base: '16', xl: '14' }}
            color="purple.300"
            mb={{ base: px2vw(10), xl: '10px' }}
            fontWeight="normal"
          >
            {t('TotalBorrowing')}
          </Text>
          <Text textStyle="14" color="purple.300" fontWeight="bold">
            {bankDetail?.totalBorrowingsNum ? (
              <NumberTips value={bankDetail?.totalBorrowingsNum} isAbbr shortNum={4} />
            ) : (
              '--'
            )}{' '}
            {prop.activeToken}
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}

export default React.memo(Index)
