import React from 'react'
import { Flex, Text, Stack, Box } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { useTranslation } from 'next-i18next'

import px2vw from '@/utils/px2vw'
import BaseButton from '@/components/BaseButton'
import { LabelList } from '@/components/Form/LabelList'
import { getAPY } from '@/utils/common'
import NumberTips from '../NumberTips'

const restListProps = {
  p: { base: px2vw(10), xl: '10px' },
  borderRadius: { base: px2vw(10), xl: '10px' },
  bgColor: 'gray.100',
}

const DebtModal = ({ data, onClose }: { data?: any; onClose?: () => any }) => {
  const { t } = useTranslation(['farm', 'common'])
  const apyData = getAPY(data)

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
            <Box pt={{ base: px2vw(70), xl: '0px' }}>
              <Box
                textStyle="24"
                fontWeight="800"
                textAlign="center"
                mt={{ base: px2vw(15), xl: '15px' }}
              >
                {t('APY')}(
                <NumberTips value={apyData?.APY} isRatio />)
              </Box>
              <Box textStyle="18" mt={{ base: px2vw(10), xl: '10px' }} textAlign="center">
                = (1 + {t('positionAPR')} / 365) ^ 365 - 1
              </Box>

              <Stack spacing={{ base: px2vw(25), xl: '25px' }} mt={{ base: px2vw(15), xl: '15px' }}>
                <Flex justifyContent="center" alignItems="center" textStyle="12">
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    direction="column"
                    pt={{ base: px2vw(12), xl: '12px' }}
                  >
                    <Text>{t('positionAPR')} =</Text>
                    <Text>
                      (<NumberTips value={apyData?.positionApr} isRatio />)
                    </Text>
                  </Flex>
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    direction="column"
                    ml={{ base: px2vw(10), xl: '10px' }}
                    mr={{ base: px2vw(5), xl: '5px' }}
                  >
                    <Box
                      borderBottomColor="purple.300"
                      borderBottomStyle="solid"
                      borderBottomWidth={{ base: px2vw(1), xl: '1px' }}
                      pb={{ base: px2vw(5), xl: '5px' }}
                    >
                      {t('Daily Income - Daily Cost')}
                    </Box>
                    <Text pt={{ base: px2vw(5), xl: '5px' }}>{t('collateral')}</Text>
                  </Flex>
                  <Box>× 365</Box>
                </Flex>
                <LabelList
                  restList={restListProps}
                  data={[
                    {
                      key: 'Collateral',
                      label: t('collateral'),
                      value: () => (
                        <NumberTips value={apyData?.collateralVal?.total} symbol="$" shortNum={2} />
                      ),
                      bottomRender: () => {
                        return (
                          <Flex justifyContent="flex-end">
                            {Number(apyData?.collateralVal.list[0].num) !== 0 && (
                              <Text
                                textStyle="14"
                                textAlign="right"
                                mt={{ base: px2vw(10), xl: '10px' }}
                              >
                                <NumberTips value={apyData?.collateralVal.list[0].num} />
                                {apyData?.collateralVal.list[0].tokenName}
                              </Text>
                            )}
                            {Number(apyData?.collateralVal.list[0].num) !== 0 &&
                              Number(apyData?.collateralVal.list[1].num) !== 0 && (
                                <Text
                                  textStyle="14"
                                  textAlign="right"
                                  mt={{ base: px2vw(10), xl: '10px' }}
                                  mx={{ base: px2vw(5), xl: '5px' }}
                                >
                                  +
                                </Text>
                              )}
                            {Number(apyData?.collateralVal.list[1].num) !== 0 && (
                              <Text
                                textStyle="14"
                                textAlign="right"
                                mt={{ base: px2vw(10), xl: '10px' }}
                              >
                                <NumberTips value={apyData?.collateralVal.list[1].num} />
                                {apyData?.collateralVal.list[1].tokenName}
                              </Text>
                            )}
                          </Flex>
                        )
                      },
                    },
                  ]}
                />
                <Stack spacing={{ base: px2vw(10), xl: '10px' }}>
                  <Text textAlign="center">
                    {t('estDailyIncome')} ({' '}
                    <NumberTips value={apyData?.dailyIncome} shortNum={2} symbol="$" /> )
                  </Text>
                  <Stack spacing={{ base: px2vw(10), xl: '10px' }} {...restListProps}>
                    <Box>{t('borrowingFluxReward')}</Box>
                    <Flex textStyle="12">
                      <Box flex={1}>
                        {t('from')} {data?.token}:
                      </Box>
                      <Box flex={1}>
                        {t('APR') + ' '}
                        <NumberTips value={apyData?.incomeVal?.fluxReward[0].apr} isRatio />
                      </Box>
                      <Box flex={1} textAlign="right">
                        <NumberTips
                          value={apyData?.incomeVal?.fluxReward[0].total}
                          symbol="$"
                          shortNum={2}
                        />
                      </Box>
                    </Flex>
                    <Flex textStyle="12">
                      <Box flex={1}>
                        {t('from')} {data?.token1}:
                      </Box>
                      <Box flex={1}>
                        {t('APR') + ' '}
                        <NumberTips value={apyData?.incomeVal?.fluxReward[1].apr} isRatio />
                      </Box>
                      <Box flex={1} textAlign="right">
                        <NumberTips
                          value={apyData?.incomeVal?.fluxReward[1].total}
                          symbol="$"
                          shortNum={2}
                        />
                      </Box>
                    </Flex>
                  </Stack>
                  <Stack spacing={{ base: px2vw(10), xl: '10px' }} {...restListProps}>
                    <Box>{t('lpReward')}</Box>
                    <Flex textStyle="12">
                      <Box flex={1}>
                        {t('from')} {data?.defi}:
                      </Box>
                      <Box flex={1}>
                        {t('APR') + ' '} <NumberTips value={apyData?.incomeVal?.lp.apr} isRatio />
                      </Box>
                      <Box flex={1} textAlign="right">
                        <NumberTips value={apyData?.incomeVal?.lp.total} symbol="$" shortNum={2} />
                      </Box>
                    </Flex>
                  </Stack>
                </Stack>
                <Stack spacing={{ base: px2vw(10), xl: '10px' }}>
                  <Text textAlign="center">
                    {t('estDailyCost')} ({' '}
                    <NumberTips value={apyData?.dailyCost} symbol="$" shortNum={2} /> )
                  </Text>
                  <Stack spacing={{ base: px2vw(10), xl: '10px' }} {...restListProps}>
                    <Box>{t('Borrowing Interest')}</Box>
                    <Flex textStyle="12">
                      <Box flex={1}>
                        {t('from')} {data?.token}:
                      </Box>
                      <Box flex={1}>
                        {t('APR') + ' '}{' '}
                        <NumberTips value={apyData?.costVal?.list[0]?.apr} isRatio />
                      </Box>
                      <Box flex={1} textAlign="right">
                        <NumberTips
                          value={apyData?.costVal?.list[0]?.total}
                          symbol="$"
                          shortNum={2}
                        />
                      </Box>
                    </Flex>
                    <Flex textStyle="12">
                      <Box flex={1}>
                        {t('from')} {data?.token1}:
                      </Box>
                      <Box flex={1}>
                        {t('APR') + ' '}{' '}
                        <NumberTips value={apyData?.costVal?.list[1]?.apr} isRatio />
                      </Box>
                      <Box flex={1} textAlign="right">
                        <NumberTips
                          value={apyData?.costVal?.list[1]?.total}
                          symbol="$"
                          shortNum={2}
                        />
                      </Box>
                    </Flex>
                  </Stack>
                </Stack>
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
            </Box>
          </Form>
        )
      }}
    </Formik>
  )
}

export default DebtModal
