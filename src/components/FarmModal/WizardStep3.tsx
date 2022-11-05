import { Flex, Box, Image, Text, Stack } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'

import px2vw from '@/utils/px2vw'
import { LabelList } from '@/components/Form/LabelList'
import { SlippageRadio } from '@/components/Form/Radio'
import calculatorImg from '@/assets/images/svg/calculator-2.svg'
import { useFormikContext } from 'formik'
import farmStore from '@/stores/contract/farm'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import NumberTips from '../NumberTips'
import { useEffect } from 'react'
import { useModal } from '@/components/Modal'
import { modalProps } from '@/components/FarmPool'
import DebtModal from '../MyFarm/DebtModal'
import { getAPY } from '@/utils/common'
import APYModal from '../MyFarm/APYModal'
import BaseTooltip from '@/components/BaseTooltip'

const restListProps = {
  p: { base: px2vw(10), xl: '10px' },
  borderRadius: { base: px2vw(10), xl: '10px' },
  bgColor: 'gray.100',
}

const Step = () => {
  const { t } = useTranslation(['farm', 'common'])
  const { values } = useFormikContext<any>()
  const { poolInfo, lpInfo, simulatedOpening } = farmStore()

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
      openDebtModal?.({ ...poolInfo, ...simulatedOpening, ...lpInfo })
    })
    PubSub.subscribe('farm-open-apy-modal', () => {
      openAPYModal?.({
        ...{ ...poolInfo, stake0: values?.tokenNum, stake1: values?.tokenNum1 },
        ...simulatedOpening,
      })
    })
    return () => {
      PubSub.unsubscribe('farm-open-debt-modal')
      PubSub.unsubscribe('farm-open-apy-modal')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedOpening, poolInfo, lpInfo, values])

  return (
    <Stack spacing={{ base: px2vw(15), xl: '15px' }}>
      <LabelList
        restList={restListProps}
        data={[
          {
            key: 'DebtRatio',
            label: t('debtRatio'),
            value: () => {
              return (
                // icons 没有替换
                <Text cursor="pointer" onClick={() => PubSub.publish('farm-open-debt-modal')}>
                  {simulatedOpening?.ratio}%{' '}
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
                      left: `${simulatedOpening?.ratio}%`,
                      bottom: 0,
                      width: '2px',
                      bgColor: 'white',
                      zIndex: 3,
                    }}
                  />
                  <Box textStyle="12" color="whiteAlpha.300">
                    {t('Riskier')}
                  </Box>
                  {/* <Icon
                    w={{ base: px2vw(10), xl: '10px' }}
                    h={{ base: px2vw(10), xl: '10px' }}
                    as={WarningIcon}
                    pos="absolute"
                    color="gray.700"
                    zIndex="2"
                    top="0"
                    left="80%"
                  /> */}
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
            value: `${lpInfo?.killFactor / 100}%`,
          },
        ]}
      />
      <LabelList
        restList={restListProps}
        data={[
          {
            key: 'Collateral',
            label: t('collateral'),
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
            label: t('debt'),
            value: () => {
              return (
                <Text textAlign="right">
                  <NumberTips
                    value={new BigNumber(
                      ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
                    ).toFixed(4)}
                  />
                  {values?.token}
                </Text>
              )
            },
            bottomRender: () => {
              return (
                <Text textAlign="right">
                  <NumberTips
                    value={new BigNumber(
                      ethers.utils.formatUnits(simulatedOpening?.debt1, poolInfo.token1Decimal)
                    ).toFixed(4)}
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
            value: () => {
              return (
                <Text textAlign="right">
                  <NumberTips
                    value={new BigNumber(
                      ethers.utils.formatUnits(simulatedOpening?.pos0, poolInfo.token0Decimal)
                    ).toFixed(4)}
                  />
                  {values?.token}
                </Text>
              )
            },
            bottomRender: () => {
              return (
                <Text textAlign="right">
                  <NumberTips
                    value={new BigNumber(
                      ethers.utils.formatUnits(simulatedOpening?.pos1, poolInfo.token1Decimal)
                    ).toFixed(4)}
                  />
                  {values?.token1}
                </Text>
              )
            },
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
              const apyData = getAPY({
                ...{ ...poolInfo, stake0: values?.tokenNum, stake1: values?.tokenNum1 },
                ...simulatedOpening,
              })
              return (
                <Text cursor="pointer" onClick={() => PubSub.publish('farm-open-apy-modal')}>
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
