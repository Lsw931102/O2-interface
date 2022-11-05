import React from 'react'
import { Flex, Text, Stack, Box } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { useTranslation } from 'next-i18next'
import px2vw from '@/utils/px2vw'
import BaseButton from '@/components/BaseButton'
import { LabelList } from '@/components/Form/LabelList'
import NumberTips from '../NumberTips'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

const restListProps = {
  p: { base: px2vw(10), xl: '10px' },
  borderRadius: { base: px2vw(10), xl: '10px' },
  bgColor: 'gray.100',
}

const DebtModal = ({ data, onClose }: { data?: any; onClose?: () => any }) => {
  const { t } = useTranslation(['farm', 'common'])

  return (
    <Formik
      initialValues={{}}
      onSubmit={function () {
        // ...
      }}
    >
      {() => {
        return (
          <Form>
            <Box
              textStyle="24"
              fontWeight="800"
              textAlign="center"
              mt={{ base: px2vw(15), xl: '15px' }}
            >
              {t('debtRatio')} (
              {data?.ratio || data?.ratio === 0
                ? String(data?.ratio)
                : new BigNumber(data?.debtRatio).times(100).toFixed(2)}
              %)
            </Box>
            <Box
              textStyle="18"
              mt={{ base: px2vw(10), xl: '10px' }}
              pl={{ base: px2vw(40), xl: '40px' }}
            >
              = {t('debt')} / {t('position')}
            </Box>
            <Flex
              h={{ base: px2vw(10), xl: '10px' }}
              justifyContent="space-between"
              alignItems="center"
              mt={{ base: px2vw(10), xl: '10px' }}
            >
              <Box textStyle="12" color="whiteAlpha.300">
                {t('Safer')}
              </Box>
              <Box
                flex={1}
                mx={{ base: px2vw(5), xl: '5px' }}
                h={{ base: px2vw(10), xl: '10px' }}
                borderRadius={{ base: px2vw(5), xl: '5px' }}
                bgGradient="linear(to-r, #00F58E 0%, #FF3E3E 100%)"
                pos="relative"
                _after={{
                  content: '" "',
                  display: 'block',
                  pos: 'absolute',
                  top: 0,
                  left: `${
                    data?.ratio
                      ? String(data?.ratio)
                      : new BigNumber(data?.debtRatio).times(100).toFixed(2)
                  }%`,
                  bottom: 0,
                  width: '2px',
                  bgColor: 'white',
                  zIndex: 3,
                }}
              />
              <Box textStyle="12" color="whiteAlpha.300">
                {t('Riskier')}
              </Box>
            </Flex>
            <Stack spacing={{ base: px2vw(15), xl: '15px' }} mt={{ base: px2vw(30), xl: '30px' }}>
              <LabelList
                restList={restListProps}
                data={[
                  {
                    key: 'Debt',
                    label: t('debt'),
                    value: () => {
                      const val1 = new BigNumber(
                        ethers.utils.formatUnits(data?.debt0, data?.token0Decimal)
                      ).times(new BigNumber(data?.token0Price))
                      const val2 = new BigNumber(
                        ethers.utils.formatUnits(data?.debt1 || data?.debt1, data?.token1Decimal)
                      ).times(new BigNumber(data?.token1Price))
                      return (
                        <NumberTips value={val1.plus(val2).toString()} shortNum={2} symbol="$" />
                      )
                    },
                    bottomRender: () => {
                      return (
                        <Flex justifyContent="flex-end">
                          <Text
                            textStyle="14"
                            textAlign="right"
                            mt={{ base: px2vw(10), xl: '10px' }}
                          >
                            <NumberTips
                              value={new BigNumber(
                                ethers.utils.formatUnits(
                                  data?.debt0 || data?.debt0,
                                  data?.token0Decimal
                                )
                              ).toString()}
                            />
                            {data?.token || data?.currency.split('-')[0]}
                          </Text>
                          <Text
                            textStyle="14"
                            textAlign="right"
                            mt={{ base: px2vw(10), xl: '10px' }}
                            mx="5px"
                          >
                            +
                          </Text>
                          <Text
                            textStyle="14"
                            textAlign="right"
                            mt={{ base: px2vw(10), xl: '10px' }}
                          >
                            <NumberTips
                              value={new BigNumber(
                                ethers.utils.formatUnits(
                                  data?.debt1 || data?.debt1,
                                  data?.token1Decimal
                                )
                              ).toString()}
                            />
                            {data?.token1 || data?.currency.split('-')[1]}
                          </Text>
                        </Flex>
                      )
                    },
                  },
                ]}
              />
              <LabelList
                restList={restListProps}
                data={[
                  {
                    key: 'Position',
                    label: t('position'),
                    value: () => {
                      const val1 = new BigNumber(
                        ethers.utils.formatUnits(data?.pos0 || data?.amount0, data?.token0Decimal)
                      ).times(new BigNumber(data?.token0Price))
                      const val2 = new BigNumber(
                        ethers.utils.formatUnits(data?.pos1 || data?.amount1, data?.token1Decimal)
                      ).times(new BigNumber(data?.token1Price))
                      return (
                        <NumberTips value={val1.plus(val2).toString()} shortNum={2} symbol="$" />
                      )
                    },
                    bottomRender: () => {
                      return (
                        <Flex justifyContent="flex-end">
                          <Text
                            textStyle="14"
                            textAlign="right"
                            mt={{ base: px2vw(10), xl: '10px' }}
                          >
                            <NumberTips
                              value={new BigNumber(
                                ethers.utils.formatUnits(
                                  data?.pos0 || data?.amount0,
                                  data?.token0Decimal
                                )
                              ).toString()}
                            />
                            {data?.token || data?.currency.split('-')[0]}
                          </Text>
                          <Text
                            textStyle="14"
                            textAlign="right"
                            mt={{ base: px2vw(10), xl: '10px' }}
                            mx="5px"
                          >
                            +
                          </Text>
                          <Text
                            textStyle="14"
                            textAlign="right"
                            mt={{ base: px2vw(10), xl: '10px' }}
                          >
                            <NumberTips
                              value={new BigNumber(
                                ethers.utils.formatUnits(
                                  data?.pos1 || data?.amount1,
                                  data?.token1Decimal
                                )
                              ).toString()}
                            />
                            {data?.token1 || data?.currency.split('-')[1]}
                          </Text>
                        </Flex>
                      )
                    },
                  },
                ]}
              />
              <LabelList
                restList={restListProps}
                data={[
                  {
                    key: 'Liquidity',
                    label: t('liquidityKillFactor'),
                    value: `${data?.killFactor / 100}%`,
                  },
                ]}
              />
            </Stack>
            <Flex
              justifyContent="center"
              mt={{ base: px2vw(35), xl: '35px' }}
              mb={{ base: px2vw(20), xl: '20px' }}
            >
              <BaseButton
                buttonType="close"
                isCircular
                width={{ base: px2vw(46), xl: '46px' }}
                height={{ base: px2vw(46), xl: '46px' }}
                onClick={onClose}
              />
            </Flex>
          </Form>
        )
      }}
    </Formik>
  )
}

export default DebtModal
