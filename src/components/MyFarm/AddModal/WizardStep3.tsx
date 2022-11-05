import { Flex, Box, Image, Text, Stack } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'

import px2vw from '@/utils/px2vw'
import { LabelList } from '@/components/Form/LabelList'
import { SlippageRadio } from '@/components/Form/Radio'
import calculatorImg from '@/assets/images/svg/calculator-2.svg'
import farmStore from '@/stores/contract/farm'
import { useFormikContext } from 'formik'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import NumberTips from '@/components/NumberTips'
import { getAPY } from '@/utils/common'
import APYModal from '@/components/MyFarm/APYModal'
import { useModal } from '@/components/Modal'
import { modalProps } from '@/components/FarmPool'
import { useEffect } from 'react'
import DebtModal from '../DebtModal'
import { calculationTokens } from '@/utils/math'
import { simulatedOpeningMethod } from '@/components/FarmModal/WizardStep2'
import BaseTooltip from '@/components/BaseTooltip'

const restListProps = {
  p: { base: px2vw(10), xl: '10px' },
  borderRadius: { base: px2vw(10), xl: '10px' },
  bgColor: 'gray.100',
}

const Step = () => {
  const { t } = useTranslation(['farm', 'common'])
  const { values } = useFormikContext<any>()
  const { poolInfo, simulatedOpening } = farmStore()

  const { onOpen: openDebtModal, Modal: DebtModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => <DebtModal data={data} onClose={onClose} />,
  })
  const { onOpen: openAPYModal, Modal: APYModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => <APYModal data={data} onClose={onClose} />,
  })

  useEffect(() => {
    PubSub.subscribe('farm-open-debt-modal', () => {
      // 获取借贷的币种数量
      const tokenDebt = calculationTokens(
        values.tokenNum ? values.tokenNum : 0,
        poolInfo?.token0Price,
        poolInfo?.token0Liqudity,
        values.tokenNum1 ? values.tokenNum1 : 0,
        poolInfo?.token1Price,
        poolInfo?.token1Liqudity,
        values?.type === 1 ? values?.leverage : 0,
        values?.type === 1 ? values?.percent : 0
      )
      // 模拟开仓
      const res = simulatedOpeningMethod({
        values,
        debtToken0: tokenDebt?.token0Result,
        debtToken1: tokenDebt?.token1Result,
        debt0: poolInfo?.debt0,
        debt1: poolInfo?.debt1,
        lpAmount: poolInfo?.lpAmount,
        lp: poolInfo?.lpInfo,
        noSave: true,
      })
      openDebtModal?.({ ...poolInfo, ...res, ...poolInfo?.lpInfo })
    })
    PubSub.subscribe('farm-open-apy-modal', () => {
      openAPYModal?.({ ...poolInfo, ...simulatedOpening, addValues: values, oldData: poolInfo })
    })
    return () => {
      PubSub.unsubscribe('farm-open-debt-modal')
      PubSub.unsubscribe('farm-open-apy-modal')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedOpening, poolInfo, values])

  return (
    <Stack spacing={{ base: px2vw(15), xl: '15px' }} mt={{ base: px2vw(-15), xl: '-15px' }}>
      <LabelList
        restList={restListProps}
        data={[
          {
            key: 'DebtRatio',
            label: t('debtRatio'),
            value: () => {
              // 获取借贷的币种数量
              const tokenDebt = calculationTokens(
                values.tokenNum ? values.tokenNum : 0,
                poolInfo?.token0Price,
                poolInfo?.token0Liqudity,
                values.tokenNum1 ? values.tokenNum1 : 0,
                poolInfo?.token1Price,
                poolInfo?.token1Liqudity,
                values?.type === 1 ? values?.leverage : 0,
                values?.type === 1 ? values?.percent : 0
              )
              // 模拟开仓
              const res = simulatedOpeningMethod({
                values,
                debtToken0: tokenDebt?.token0Result,
                debtToken1: tokenDebt?.token1Result,
                debt0: poolInfo?.debt0,
                debt1: poolInfo?.debt1,
                lpAmount: poolInfo?.lpAmount,
                lp: poolInfo?.lpInfo,
                noSave: true,
              })
              return (
                // icons 没有替换
                <Text cursor="pointer" onClick={() => PubSub.publish('farm-open-debt-modal')}>
                  {new BigNumber(ethers.utils.formatUnits(poolInfo?.debt.toString(), 18))
                    .div(new BigNumber(ethers.utils.formatUnits(poolInfo?.health.toString(), 18)))
                    .times(100)
                    .toFixed(2)}
                  % → {res?.ratio}%{' '}
                  <Image
                    src={calculatorImg}
                    ignoreFallback
                    w={{ base: px2vw(14), xl: '14px' }}
                    h={{ base: px2vw(14), xl: '14px' }}
                    display="inline-block"
                    verticalAlign="middle"
                    mr={{ base: px2vw(5), xl: '5px' }}
                  />
                </Text>
              )
            },
            bottomRender: () => {
              // 获取借贷的币种数量
              const tokenDebt = calculationTokens(
                values.tokenNum ? values.tokenNum : 0,
                poolInfo?.token0Price,
                poolInfo?.token0Liqudity,
                values.tokenNum1 ? values.tokenNum1 : 0,
                poolInfo?.token1Price,
                poolInfo?.token1Liqudity,
                values?.type === 1 ? values?.leverage : 0,
                values?.type === 1 ? values?.percent : 0
              )
              // 模拟开仓
              const res = simulatedOpeningMethod({
                values,
                debtToken0: tokenDebt?.token0Result,
                debtToken1: tokenDebt?.token1Result,
                debt0: poolInfo?.debt0,
                debt1: poolInfo?.debt1,
                lpAmount: poolInfo?.lpAmount,
                lp: poolInfo?.lpInfo,
                noSave: true,
              })
              return (
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
                      left: `${new BigNumber(res?.ratio as any).toFixed(2)}%`,
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
              )
            },
          },

          {
            key: 'lkf',
            label: () => (
              <BaseTooltip isMultiple text={t('liquidityKillFactor')}>
                {t('tips115')}
              </BaseTooltip>
            ),
            value: `${poolInfo?.killFactor / 100}%`,
          },
        ]}
      />
      <LabelList
        restList={restListProps}
        data={[
          {
            key: 'Collateral',
            label: t('additionalCollateral'),
            value: () => {
              return (
                <Flex>
                  <Text>
                    <NumberTips value={values?.tokenNum || values?.tokenNum1} />
                    {values?.tokenNum ? values?.token : values?.token1}
                  </Text>
                </Flex>
              )
            },
            bottomRender: () => {
              return values?.tokenNum && values?.tokenNum1 ? (
                <Text align="right">
                  <NumberTips value={values?.tokenNum1} />
                  {values?.token1}
                </Text>
              ) : null
            },
          },
        ]}
      />
      <LabelList
        restList={restListProps}
        data={[
          {
            key: 'Debt',
            label: t('newDebt'),
            value: () => {
              return (
                <Flex>
                  <NumberTips
                    value={
                      values.type === 1
                        ? new BigNumber(
                            ethers.utils.formatUnits(
                              simulatedOpening?.debt0,
                              poolInfo.token0Decimal
                            )
                          ).toFixed(4)
                        : 0
                    }
                  />
                  {values?.token}
                </Flex>
              )
            },
            bottomRender: () => {
              return (
                <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
                  <NumberTips
                    value={
                      values.type === 1
                        ? new BigNumber(
                            ethers.utils.formatUnits(
                              simulatedOpening?.debt1,
                              poolInfo.token1Decimal
                            )
                          ).toFixed(4)
                        : 0
                    }
                  />
                  {values?.token1}
                </Text>
              )
            },
          },
        ]}
      />
      <LabelList
        restList={restListProps}
        data={[
          {
            key: 'Est. Position',
            label: t('Est. Position'),
            value: '',
          },
          {
            key: 'token',
            label: values?.token,
            value: `${new BigNumber(
              ethers.utils.formatUnits(poolInfo?.amount0, poolInfo?.token0Decimal)
            ).toFixed(4)} → ${new BigNumber(
              ethers.utils.formatUnits(simulatedOpening?.pos0, poolInfo?.token0Decimal)
            ).toFixed(4)}`,
          },
          {
            key: 'token1',
            label: values?.token1,
            value: `${new BigNumber(
              ethers.utils.formatUnits(poolInfo?.amount1, poolInfo?.token1Decimal)
            ).toFixed(4)} → ${new BigNumber(
              ethers.utils.formatUnits(simulatedOpening?.pos1, poolInfo?.token1Decimal)
            ).toFixed(4)}`,
          },
        ]}
      />
      <LabelList
        restList={{
          px: { base: px2vw(10), xl: '10px' },
        }}
        data={[
          {
            key: 'SwapFee',
            label: () => (
              <BaseTooltip isMultiple text={t('Swap Fee')}>
                {t('tips114')}
              </BaseTooltip>
            ),
            value: `${new BigNumber(
              ethers.utils.formatUnits(
                simulatedOpening?.swapAmt,
                simulatedOpening?.reverse ? poolInfo?.token1Decimal : poolInfo?.token0Decimal
              )
            )
              .times(0.0025)
              .toFixed(4)} ${simulatedOpening?.reverse ? poolInfo?.token1 : poolInfo?.token}`,
          },
          {
            key: 'EstAPY',
            label: t('Est. APY'),
            value: () => {
              const oldData = getAPY({
                ...poolInfo,
              })
              const apyData = getAPY({
                ...poolInfo,
                ...simulatedOpening,
                addValues: values,
                oldData: poolInfo,
              })
              return (
                <Text cursor="pointer" onClick={() => PubSub.publish('farm-open-apy-modal')}>
                  <NumberTips value={oldData?.APY} isRatio /> →{' '}
                  <NumberTips value={apyData?.APY} isRatio />{' '}
                  <Image
                    src={calculatorImg}
                    ignoreFallback
                    w={{ base: px2vw(14), xl: '14px' }}
                    h={{ base: px2vw(14), xl: '14px' }}
                    display="inline-block"
                    verticalAlign="middle"
                    mr={{ base: px2vw(5), xl: '5px' }}
                  />
                </Text>
              )
            },
          },
        ]}
      />
      <Box
        p={{ base: px2vw(10), xl: '10px' }}
        borderRadius={{ base: px2vw(10), xl: '10px' }}
        bgColor="rgba(170, 185, 222, 0.1)"
      >
        <SlippageRadio
          name="slippage"
          label={
            <BaseTooltip isMultiple text={t('slippageTolerance')} textStyles={{ textStyle: '12' }}>
              {t('tips116')}
            </BaseTooltip>
          }
          mt="0"
        />
        <LabelList
          restList={{
            px: 0,
          }}
          data={[
            {
              key: 'Est.Price1',
              label: () => (
                <BaseTooltip
                  isMultiple
                  text={t('Est. Price impact on position value')}
                  textStyle={{ textStyle: '12' }}
                >
                  {t('tips117')}
                </BaseTooltip>
              ),
              value: () => <Text textStyle="12"> ±0.3%</Text>,
            },
            {
              key: 'Est.Price2',
              label: () => (
                <BaseTooltip
                  isMultiple
                  text={t('Est. Price impact on collateral value')}
                  textStyle={{ textStyle: '12' }}
                >
                  {t('tips118')}
                </BaseTooltip>
              ),
              value: () => <Text textStyle="12"> ±0.5%</Text>,
            },
          ]}
        />
      </Box>
      {DebtModalBox}
      {APYModalBox}
    </Stack>
  )
}
export default Step
