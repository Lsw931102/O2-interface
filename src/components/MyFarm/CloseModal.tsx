import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Flex, Text, Image, Stack } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'next-i18next'

import BaseTooltip from '@/components/BaseTooltip'
import px2vw from '@/utils/px2vw'
import { SlippageRadio } from '@/components/Form/Radio'
import BaseButton from '@/components/BaseButton'
import { FormLabelList, LabelList } from '@/components/Form/LabelList'
import { TokenImgBox } from '@/components/FarmModal/WizardStep2'
import shutOffImg from '@/assets/images/svg/shutOff.svg'
import { PoolBox } from '@/components/FarmPool'
import Steps from '@/components/Steps'
import { useEffectOnce } from 'react-use'
import { ethers } from 'ethers'
import farmStore from '@/stores/contract/farm'
import { strategyCloseSimu, strategyWithdrawData } from '@/utils/v2'
import NumberTips from '../NumberTips'
import BigNumber from 'bignumber.js'
import { getWalletContract } from '@/contracts'
import { Orderbook } from '@/contracts/abis'
import useSendTransaction from '@/hooks/useSendTransaction'
import globalStore from '@/stores/global'

export const restListProps = {
  p: { base: px2vw(10), xl: '10px' },
  borderRadius: { base: px2vw(10), xl: '10px' },
  bgColor: 'gray.100',
}

const CloseForm = ({ datas, onClose }: { datas?: any; onClose?: () => any; isOpen: boolean }) => {
  const { t } = useTranslation(['farm', 'common'])
  const { connectNet, fluxJson } = globalStore()
  const [data, setData] = useState(datas)
  const [loading, setLoading] = useState(false)
  const { simulatedOpening } = farmStore()
  const { sendTransaction } = useSendTransaction()

  useEffectOnce(() => {
    getBalance()
  })

  // 处理币种信息
  const getBalance = async () => {
    try {
      const discount = 0.9
      const res = {
        ...datas,
        defaultType: 0,
        token: data.token,
        token0Allowance: ethers.utils.formatUnits(
          data?.tokenInfos[0]?.allowance,
          data?.tokenInfos[0]?.decimals
        ),
        token0Balance: ethers.utils.formatUnits(
          data?.tokenInfos[0]?.balance,
          data?.tokenInfos[0]?.decimals
        ),
        token0Decimal: data?.tokenInfos[0]?.decimals,
        token0Price: ethers.utils.formatUnits(
          data?.tokenInfos[0]?.price,
          data?.tokenInfos[0]?.decimals
        ),
        token0Liqudity: new BigNumber(
          ethers.utils.formatUnits(data?.tokenInfos[0]?.liqudity, data?.tokenInfos[0]?.decimals)
        ).times(discount),
        token1: data.token1,
        token1Allowance: ethers.utils.formatUnits(
          data?.tokenInfos[1]?.allowance,
          data?.tokenInfos[1]?.decimals
        ),
        token1Balance: ethers.utils.formatUnits(
          data?.tokenInfos[1]?.balance,
          data?.tokenInfos[1]?.decimals
        ),
        token1Decimal: data?.tokenInfos[1]?.decimals,
        token1Price: ethers.utils.formatUnits(
          data?.tokenInfos[1]?.price,
          data?.tokenInfos[1]?.decimals
        ),
        token1Liqudity: new BigNumber(
          ethers.utils.formatUnits(data?.tokenInfos[1]?.liqudity, data?.tokenInfos[1]?.decimals)
        ).times(discount),
      }
      setData(res)
      farmStore.setState({
        poolInfo: res,
      })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(
    () => {
      if (!data) return
      simulatedLiquidation()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const validationSchema = useMemo(() => {
    return Yup.object({
      token: Yup.string().default(data?.token),
      token1: Yup.string().default(data?.token1),
      slippage: Yup.string()
        .default('1-1')
        .test('is-moreThan-0', t('Must be a number greater than 0'), (value) => {
          const num = value?.split('-')[1]
          return num ? +num > 0 : false
        }),
    })
  }, [t, data])
  const initialValues = validationSchema.getDefault()

  // 模拟平仓
  const simulatedLiquidation = async () => {
    try {
      const result = strategyCloseSimu(
        {
          debt0: data?.debt0,
          debt1: data?.debt1,
          lpAmount: data?.lpAmount,
        },
        data?.lpInfo as any,
        [
          {
            amount: ethers.constants.Zero,
            debt: ethers.constants.Zero,
            maxReturn: ethers.constants.MaxUint256,
          },
          {
            amount: ethers.constants.Zero,
            debt: ethers.constants.Zero,
            maxReturn: ethers.constants.MaxUint256,
          },
        ]
      )
      farmStore.setState({
        simulatedOpening: result,
      })
    } catch (err) {
      console.log(err)
    }
  }

  const onSubmit = useCallback(
    async (values) => {
      try {
        const params = {
          ...values,
          slippage: Number((values.slippage as string)?.split('-')[1]) / 100,
        }
        setLoading(true)

        const contract = getWalletContract(
          fluxJson?.[connectNet as string]?.farm?.Orderbook,
          Orderbook
        )
        const res = strategyWithdrawData(
          simulatedOpening?.back0.mul((1 - params?.slippage) * 1000).div(1000),
          simulatedOpening?.back1.mul((1 - params?.slippage) * 1000).div(1000)
        )
        try {
          sendTransaction(
            {
              contract: contract,
              method: 'work',
              args: [
                ethers.BigNumber.from(data?.orderId),
                data?.worker,
                ethers.constants.Zero,
                ethers.constants.Zero,
                ethers.constants.Zero,
                ethers.constants.Zero,
                ethers.constants.MaxUint256,
                ethers.constants.MaxUint256,
                res,
              ],
              value: 0,
            },
            () => {
              //TODO:空函数lint检查
              onClose?.()
              setLoading(false)
            },
            (hash: string) => {
              console.log(hash)
            }
          )
        } catch (err) {
          console.log(err, 'err')
        }
      } catch (e: any) {
        console.error('openPosition error:', e)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, simulatedOpening]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {(formik) => (
        <Form>
          <Flex
            direction="column"
            pos="relative"
            h={{ base: px2vw(600), xl: '600px' }}
            pb={{ base: px2vw(45), xl: '45px' }}
          >
            <ModalHeader
              icon={
                <Flex
                  w={{ base: px2vw(20), xl: '20px' }}
                  h={{ base: px2vw(20), xl: '20px' }}
                  mr={{ base: px2vw(5), xl: '5px' }}
                  bgColor="purple.300"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius="100%"
                >
                  <Image
                    src={shutOffImg}
                    w={{ base: px2vw(14), xl: '14px' }}
                    h={{ base: px2vw(14), xl: '14px' }}
                  />
                </Flex>
              }
              title={t('closePosition2')}
              data={{
                id: `#${data?.orderId}`,
                token: data?.token,
                token1: data?.token1,
                defi: data?.defi,
              }}
            />
            <Stack spacing={{ base: px2vw(25), xl: '25px' }}>
              <FormLabelList
                name="t1"
                label={t('tips5') + ':'}
                restList={restListProps}
                data={[
                  {
                    key: 'token',
                    label: () => {
                      return <TokenImgBox name={`${formik.values?.token}`} />
                    },
                    value: () => (
                      <NumberTips
                        value={ethers.utils.formatUnits(data?.amount0, data?.token0Decimal)}
                      />
                    ),
                  },
                  {
                    key: 'token1',
                    label: () => {
                      return <TokenImgBox name={`${formik.values?.token1}`} />
                    },
                    value: () => (
                      <NumberTips
                        value={ethers.utils.formatUnits(data?.amount1, data?.token1Decimal)}
                      />
                    ),
                  },
                ]}
              />
              <FormLabelList
                name="t2"
                label={t('youWillRepayDebt') + ':'}
                restList={restListProps}
                data={[
                  {
                    key: 'token',
                    label: () => {
                      return <TokenImgBox name={`${formik.values?.token}`} />
                    },
                    value: () => (
                      <NumberTips
                        value={ethers.utils.formatUnits(data?.debt0, data?.token0Decimal)}
                      />
                    ),
                  },
                  {
                    key: 'token1',
                    label: () => {
                      return <TokenImgBox name={`${formik.values?.token1}`} />
                    },
                    value: () => (
                      <NumberTips
                        value={ethers.utils.formatUnits(data?.debt1, data?.token1Decimal)}
                      />
                    ),
                  },
                ]}
              />
              <FormLabelList
                name="t3"
                label={t('youWillReceive') + ':'}
                restList={restListProps}
                data={[
                  {
                    key: 'token',
                    label: () => {
                      return <TokenImgBox name={`${formik.values?.token}`} />
                    },
                    value: () => {
                      const slippage =
                        Number((formik?.values.slippage as string)?.split('-')[1]) / 100
                      return simulatedOpening ? (
                        <NumberTips
                          value={ethers.utils.formatUnits(
                            simulatedOpening?.back0.mul((1 - slippage) * 1000).div(1000),
                            data?.token0Decimal
                          )}
                        />
                      ) : (
                        '--'
                      )
                    },
                  },
                  {
                    key: 'token1',
                    label: () => {
                      return <TokenImgBox name={`${formik.values?.token1}`} />
                    },
                    value: () => {
                      const slippage =
                        Number((formik?.values.slippage as string)?.split('-')[1]) / 100
                      return simulatedOpening ? (
                        <NumberTips
                          value={ethers.utils.formatUnits(
                            simulatedOpening?.back1.mul((1 - slippage) * 1000).div(1000),
                            data?.token1Decimal
                          )}
                        />
                      ) : (
                        '--'
                      )
                    },
                  },
                ]}
              />
              <LabelList
                restList={{
                  px: '0',
                }}
                data={[
                  {
                    key: 'SwapFee',
                    label: () => (
                      <BaseTooltip isMultiple text={t('Swap Fee')}>
                        {t('tips114')}
                      </BaseTooltip>
                    ),
                    value: simulatedOpening
                      ? `${new BigNumber(
                          ethers.utils.formatUnits(
                            simulatedOpening?.swapAmt,
                            simulatedOpening?.reverse ? data?.token1Decimal : data?.token0Decimal
                          )
                        )
                          .times(0.0025)
                          .toFixed(4)} ${simulatedOpening?.reverse ? data?.token1 : data?.token}`
                      : '--',
                  },
                ]}
              />
              <SlippageRadio
                name="slippage"
                label={
                  <BaseTooltip
                    isMultiple
                    text={t('slippageTolerance')}
                    textStyles={{ textStyle: '12' }}
                  >
                    {t('tips116')}
                  </BaseTooltip>
                }
              />
            </Stack>
            <Flex
              pos="absolute"
              bottom={{ base: px2vw(5), xl: '5px' }}
              px={{ base: px2vw(5), xl: '5px' }}
              left="0"
              justifyContent="space-between"
              w="full"
            >
              <BaseButton
                text={t('Cancel')}
                width={{ base: px2vw(123), xl: '123px' }}
                onClick={onClose}
              />
              <BaseButton
                width={{ base: px2vw(163), xl: '163px' }}
                text={t('Confirm To Close')}
                isLoading={loading}
                disabled={loading}
                type="submit"
              />
            </Flex>
          </Flex>
        </Form>
      )}
    </Formik>
  )
}

export default CloseForm

export const ModalHeader = ({
  icon,
  title,
  data,
  stepsList,
  stepNumber,
  hasPool = true,
  stepsWidth,
}: any) => (
  <>
    <Flex justifyContent="space-between" mb={{ base: px2vw(30), xl: '30px' }}>
      <Flex alignItems="center">
        {icon}
        <Text
          textStyle="18"
          color="purple.300"
          lineHeight={{ base: px2vw(19), xl: '19px' }}
          fontWeight="bold"
        >
          {title}
        </Text>
      </Flex>
      {stepsList ? (
        <Steps
          stepsList={stepsList}
          width={stepsWidth ? stepsWidth : undefined}
          activeStep={stepNumber}
          my="auto"
        />
      ) : null}
    </Flex>
    {hasPool && (
      <Flex justifyContent="center" alignItems="center" mb={{ base: px2vw(30), xl: '30px' }}>
        {data.id || ''}
        <PoolBox
          reset={{ justifyContent: 'center', w: 'auto', ml: { base: px2vw(10), xl: '10px' } }}
          record={data}
        />
      </Flex>
    )}
  </>
)
