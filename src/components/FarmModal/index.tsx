import React, { useMemo, useState, useCallback } from 'react'
import { Flex, Text, Box, Image, CenterProps } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'next-i18next'

import px2vw from '@/utils/px2vw'
import { completeUrl } from '@/utils/common'
import Steps from '@/components/Steps'
import BaseButton from '@/components/BaseButton'
import WizardStep1 from './WizardStep1'
import WizardStep2, { calculationMaxLeverage, simulatedOpeningMethod } from './WizardStep2'
import WizardStep3 from './WizardStep3'
import { useEffectOnce } from 'react-use'
import globalStore from '@/stores/global'
import { ethers } from 'ethers'
import farmStore from '@/stores/contract/farm'
import { calculationTokens } from '@/utils/math'
import useSendTransaction from '@/hooks/useSendTransaction'
import { getWalletContract } from '@/contracts'
import { Orderbook } from '@/contracts/abis'
import { strategyAddTwoData } from '@/utils/v2'
import BigNumber from 'bignumber.js'
import { netconfigs } from '@/consts/network'

export interface IProps extends CenterProps {
  datas: any
  onClose: () => void
}

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const Wizard = ({
  children,
  initialValues,
  onSubmit,
  onClose,
  ignoreStepFn,
  renderModalHeader,
  data,
}: {
  children: any
  data?: any
  initialValues: any
  onSubmit: any
  onClose: any
  ignoreStepFn?: (v: any) => boolean
  renderModalHeader?: (stepsList: any, stepNumber: any) => any
}) => {
  const { t } = useTranslation(['farm'])
  const [stepNumber, setStepNumber] = useState(0)
  const steps = React.Children.toArray(children)
  const [snapshot, setSnapshot] = useState(initialValues)

  const stepsList: any = useMemo(() => {
    return steps
      ? steps.map((_item, index) => ({
          label: index + 1,
          value: index,
        }))
      : []
  }, [steps])

  const step: any = steps[stepNumber]
  const totalSteps = steps.length
  const isLastStep = stepNumber === totalSteps - 1

  const next = (values: any) => {
    setSnapshot(values)
    if (ignoreStepFn?.(values)) {
      setStepNumber(totalSteps - 1)
    } else {
      setStepNumber(Math.min(stepNumber + 1, totalSteps - 1))
    }
  }

  const previous = (values: any) => {
    setSnapshot(values)
    if (ignoreStepFn?.(values)) {
      setStepNumber(0)
    } else {
      setStepNumber(Math.max(stepNumber - 1, 0))
    }
  }

  const handleSubmit = async (values: any, bag: any) => {
    if (step?.props?.onSubmit) {
      await step?.props?.onSubmit(values, bag)
    }
    if (isLastStep) {
      return await onSubmit(values, bag)
    } else {
      bag.setTouched({})
      next(values)
    }
  }

  // 返回Next按钮点击状态
  const isDisabled = (formik: any) => {
    const { poolInfo, simulatedOpening } = farmStore.getState()
    // 开仓或加仓
    if (formik?.values?.value === undefined) {
      const isNotEnough =
        simulatedOpening && stepNumber === 1
          ? new BigNumber(
              new BigNumber(
                ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
              ).toFixed(4)
            ).gt(new BigNumber(new BigNumber(poolInfo?.token0Liqudity)).toFixed(4)) ||
            new BigNumber(
              new BigNumber(
                ethers.utils.formatUnits(simulatedOpening?.debt1, poolInfo.token1Decimal)
              ).toFixed(4)
            ).gt(new BigNumber(new BigNumber(poolInfo?.token1Liqudity)).toFixed(4))
          : false
      if (!formik?.values?.tokenNum && !formik?.values?.tokenNum1) {
        return true
      }
      if (new BigNumber(formik?.values?.tokenNum).lte(0)) {
        return true
      }
      if (new BigNumber(formik?.values?.tokenNum1).lte(0)) {
        return true
      }
      if (new BigNumber(formik?.values?.tokenNum).gt(new BigNumber(data?.token0Balance))) {
        return true
      }
      if (new BigNumber(formik?.values?.tokenNum1).gt(new BigNumber(data?.token1Balance))) {
        return true
      }
      if (formik?.values?.tokenNum && isNaN(new BigNumber(formik?.values?.tokenNum).toNumber())) {
        return true
      }
      if (formik?.values?.tokenNum1 && isNaN(new BigNumber(formik?.values?.tokenNum1).toNumber())) {
        return true
      }
      if (
        formik?.values?.tokenNum
          ? isNaN(new BigNumber(formik?.values?.tokenNum).toNumber())
            ? true
            : !new BigNumber(data?.token0Allowance).gte(new BigNumber(formik?.values?.tokenNum))
          : new BigNumber(data?.token0Allowance).eq(0)
      ) {
        return true
      }
      if (
        formik?.values?.tokenNum1
          ? isNaN(new BigNumber(formik?.values?.tokenNum1).toNumber())
            ? true
            : !new BigNumber(data?.token1Allowance).gte(new BigNumber(formik?.values?.tokenNum1))
          : new BigNumber(data?.token1Allowance).eq(0)
      ) {
        return true
      }
      if (isNotEnough) {
        return true
      }
      if (formik.isSubmitting) {
        return true
      }
      // 开仓债务率超标
      if (
        new BigNumber(simulatedOpening?.ratio).gte(new BigNumber(poolInfo?.workFactor / 100)) &&
        stepNumber === 1
      ) {
        return true
      }
      // 加仓债务率超标
      if (poolInfo?.lpInfo) {
        const tokenDebt = calculationTokens(
          formik?.values.tokenNum ? formik?.values.tokenNum : 0,
          poolInfo?.token0Price,
          poolInfo?.token0Liqudity,
          formik?.values.tokenNum1 ? formik?.values.tokenNum1 : 0,
          poolInfo?.token1Price,
          poolInfo?.token1Liqudity,
          formik?.values?.leverage,
          formik?.values?.percent
        )
        const res = simulatedOpeningMethod({
          values: formik?.values,
          debtToken0: tokenDebt?.token0Result,
          debtToken1: tokenDebt?.token1Result,
          debt0: poolInfo?.debt0,
          debt1: poolInfo?.debt1,
          lpAmount: poolInfo?.lpAmount,
          lp: poolInfo?.lpInfo,
          noSave: true,
        })
        if (
          new BigNumber(res?.ratio as any).gte(new BigNumber(poolInfo?.workFactor / 100)) &&
          stepNumber === 1
        ) {
          return true
        }
      }
      return false
      // return (!formik?.values?.tokenNum && !formik?.values?.tokenNum1) ||
      //   new BigNumber(formik?.values?.tokenNum).lte(0) ||
      //   new BigNumber(formik?.values?.tokenNum1).lte(0) ||
      //   new BigNumber(formik?.values?.tokenNum).gt(new BigNumber(data?.token0Balance)) ||
      //   new BigNumber(formik?.values?.tokenNum1).gt(new BigNumber(data?.token1Balance)) ||
      //   (formik?.values?.tokenNum && isNaN(new BigNumber(formik?.values?.tokenNum).toNumber())) ||
      //   (formik?.values?.tokenNum1 && isNaN(new BigNumber(formik?.values?.tokenNum1).toNumber())) ||
      //   formik?.values?.tokenNum
      //   ? isNaN(new BigNumber(formik?.values?.tokenNum).toNumber())
      //     ? true
      //     : !new BigNumber(data?.token0Allowance).gte(new BigNumber(formik?.values?.tokenNum))
      //   : new BigNumber(data?.token0Allowance).eq(0) || formik?.values?.tokenNum1
      //   ? isNaN(new BigNumber(formik?.values?.tokenNum1).toNumber())
      //     ? true
      //     : !new BigNumber(data?.token1Allowance).gte(new BigNumber(formik?.values?.tokenNum1))
      //   : new BigNumber(data?.token1Allowance).eq(0) || isNotEnough || formik.isSubmitting
    }
    // 减仓
    else {
      return (
        formik?.values?.value === '' ||
        isNaN(new BigNumber(formik?.values?.value).toNumber()) ||
        new BigNumber(formik?.values?.value).lte(0) ||
        new BigNumber(new BigNumber(formik?.values?.value).toFixed(4)).gt(
          new BigNumber(new BigNumber(data?.lp).toFixed(4))
        ) ||
        (new BigNumber(simulatedOpening?.ratio).gte(new BigNumber(poolInfo?.workFactor / 100)) &&
          stepNumber === 1) ||
        formik.isSubmitting
      )
    }
  }

  return (
    <Formik
      initialValues={snapshot}
      onSubmit={handleSubmit}
      validationSchema={step.props.validationSchema}
    >
      {(formik) => {
        return (
          <Form>
            <Flex
              className="dark-input"
              direction="column"
              pos="relative"
              minH={{ base: px2vw(600), xl: '600px' }}
              pb={{ base: px2vw(45), xl: '45px' }}
            >
              {renderModalHeader?.(stepsList, stepNumber)}

              <Box w="full" flex={1}>
                {step}
              </Box>

              <Flex
                pos="absolute"
                bottom={{ base: px2vw(5), xl: '5px' }}
                left="50%"
                justifyContent="space-between"
                w={stepNumber > 0 ? 'full' : '76%'}
                ml={stepNumber > 0 ? '-50%' : '-38%'}
              >
                <BaseButton
                  buttonType={'close'}
                  width={
                    stepNumber > 0
                      ? { base: px2vw(67), xl: '67px' }
                      : { base: px2vw(100), xl: '100px' }
                  }
                  onClick={onClose}
                />
                {stepNumber > 0 && (
                  <BaseButton
                    text={t('Back')}
                    onClick={() => previous(formik.values)}
                    width={{ base: px2vw(100), xl: '100px' }}
                  />
                )}
                <BaseButton
                  width={{ base: px2vw(100), xl: '100px' }}
                  text={isLastStep ? t('Confirm') : t('Next')}
                  isLoading={formik.isSubmitting}
                  // disabled={
                  //   // !formik?.values?.value ||
                  //   (!formik?.values?.tokenNum && !formik?.values?.tokenNum1) ||
                  //   new BigNumber(formik?.values?.tokenNum).lte(0) ||
                  //   new BigNumber(formik?.values?.tokenNum1).lte(0) ||
                  //   new BigNumber(formik?.values?.tokenNum).gt(
                  //     new BigNumber(data?.token0Balance)
                  //   ) ||
                  //   new BigNumber(formik?.values?.tokenNum1).gt(
                  //     new BigNumber(data?.token1Balance)
                  //   ) ||
                  //   isNaN(new BigNumber(Object(formik?.values?.tokenNum)?.tokenNum1).toNumber()) ||
                  //   isNaN(new BigNumber(Object(formik?.values?.tokenNum1)?.tokenNum1).toNumber()) ||
                  //   formik.isSubmitting
                  // }
                  disabled={isDisabled(formik)}
                  type="submit"
                />
              </Flex>
            </Flex>
          </Form>
        )
      }}
    </Formik>
  )
}

export const WizardStep = ({ children }: any) => children

function Index({ onClose, datas }: IProps) {
  const { t } = useTranslation(['farm', 'common'])
  const { userAddress, connectNet, fluxJson } = globalStore()
  const { poolInfo, simulatedOpening, farmContractLensV2, workerInfos, poolList } = farmStore()
  const [data, setData] = useState(datas)
  const { sendTransaction } = useSendTransaction()

  useEffectOnce(() => {
    getBalance()
  })

  // 处理币种信息
  const getBalance = async () => {
    try {
      const discount = 0.9
      // 获取币种价格
      const tokenInfo = await farmContractLensV2.getOrderbookInfo(
        [data.token0, data.token1Address],
        userAddress
      )
      const res = {
        ...datas,
        token: data.token,
        token0Allowance: ethers.utils.formatUnits(
          tokenInfo?.tokenInfos[0]?.allowance,
          data.token0Decimal
        ),
        token0Balance: ethers.utils.formatUnits(
          tokenInfo?.tokenInfos[0]?.balance,
          data.token0Decimal
        ),
        token0Decimal: data.token0Decimal,
        token0Price: ethers.utils.formatUnits(tokenInfo?.tokenInfos[0]?.price, data.token0Decimal),
        token0Liqudity: new BigNumber(
          ethers.utils.formatUnits(tokenInfo?.tokenInfos[0]?.liqudity, data.token0Decimal)
        )
          .times(discount)
          .toString(),
        token1: data.token1,
        token1Allowance: ethers.utils.formatUnits(
          tokenInfo?.tokenInfos[1]?.allowance,
          data.token1Decimal
        ),
        token1Balance: ethers.utils.formatUnits(
          tokenInfo?.tokenInfos[1]?.balance,
          data.token0Decimal
        ),
        token1Decimal: data.token1Decimal,
        token1Price: ethers.utils.formatUnits(tokenInfo?.tokenInfos[1]?.price, data.token0Decimal),
        token1Liqudity: new BigNumber(
          ethers.utils.formatUnits(tokenInfo?.tokenInfos[1]?.liqudity, data.token0Decimal)
        )
          .times(discount)
          .toString(),
      }
      setData(res)
      farmStore.setState({
        poolInfo: res,
      })
    } catch (err) {
      console.log(err)
    }
  }

  // 计算nativeCoin最大数量
  const getMaxNativeCoin = (tokenIndex: number) => {
    let newMaxNum = '0'
    const nativeCoin = netconfigs[connectNet as any]?.nativeCoin
    let result = '0'
    if (nativeCoin === 'CFX') {
      result = new BigNumber(tokenIndex === 0 ? data?.token0Balance : data?.token1Balance)
        .minus(1)
        .toString()
    } else if (nativeCoin === 'BNB') {
      result = new BigNumber(tokenIndex === 0 ? data?.token0Balance : data?.token1Balance)
        .minus(0.01)
        .toString()
    } else if (nativeCoin === 'HT') {
      result = new BigNumber(tokenIndex === 0 ? data?.token0Balance : data?.token1Balance)
        .minus(0.01)
        .toString()
    } else if (nativeCoin === 'OKT') {
      result = new BigNumber(tokenIndex === 0 ? data?.token0Balance : data?.token1Balance)
        .minus(0.01)
        .toString()
    } else if (nativeCoin === 'ETH') {
      result = new BigNumber(tokenIndex === 0 ? data?.token0Balance : data?.token1Balance)
        .minus(0.01)
        .toString()
    } else if (nativeCoin === 'MATIC') {
      result = new BigNumber(tokenIndex === 0 ? data?.token0Balance : data?.token1Balance)
        .minus(1)
        .toString()
    }
    newMaxNum = result
    return newMaxNum
  }

  const validationSchema = useMemo(
    () => {
      return Yup.object({
        token: Yup.string().default(data?.token),
        tokenNum: Yup.string()
          .default(undefined)
          .test('', t('Must be a number greater than 0'), (value: any) => {
            return value === undefined ? true : new BigNumber(value).gte(0)
          })
          .test('', t('Insufficient wallet balance'), (value: any) => {
            return value === undefined
              ? true
              : new BigNumber(value).lte(new BigNumber(data?.token0Balance))
          })
          .test(
            '',
            t('nativeCoinMax', {
              value:
                data?.token === 'CFX'
                  ? '1 CFX'
                  : data?.token === 'BNB'
                  ? '0.01 BNB'
                  : data?.token === 'HT'
                  ? '0.01 HT'
                  : data?.token === 'OKT'
                  ? '0.01 OKT'
                  : data?.token === 'MATIC'
                  ? '1 MATIC'
                  : '0.01 ETH',
            }),
            (value: any) => {
              // 是平台币且输入的值小于余额且预留额不够
              if (
                netconfigs[connectNet as any]?.nativeCoin === data?.token &&
                new BigNumber(value).lte(new BigNumber(data?.token0Balance)) &&
                new BigNumber(value).gt(new BigNumber(getMaxNativeCoin(0)))
              ) {
                return false
              } else {
                return true
              }
            }
          ),
        token1: Yup.string().default(data?.token1),
        tokenNum1: Yup.string()
          .default(undefined)
          .test('', t('Must be a number greater than 0'), (value: any) => {
            return value === undefined ? true : new BigNumber(value).gte(0)
          })
          .test('', t('Insufficient wallet balance'), (value: any) => {
            return value === undefined
              ? true
              : new BigNumber(value).lte(new BigNumber(data?.token1Balance))
          })
          .test(
            '',
            t('nativeCoinMax', {
              value:
                data?.token1 === 'CFX'
                  ? '1 CFX'
                  : data?.token1 === 'BNB'
                  ? '0.01 BNB'
                  : data?.token1 === 'HT'
                  ? '0.01 HT'
                  : data?.token1 === 'OKT'
                  ? '0.01 OKT'
                  : data?.token1 === 'MATIC'
                  ? '1 MATIC'
                  : '0.01 ETH',
            }),
            (value: any) => {
              // 是平台币且输入的值小于余额且预留额不够
              if (
                netconfigs[connectNet as any]?.nativeCoin === data?.token1 &&
                new BigNumber(value).lte(new BigNumber(data?.token1Balance)) &&
                new BigNumber(value).gt(new BigNumber(getMaxNativeCoin(1)))
              ) {
                return false
              } else {
                return true
              }
            }
          ),
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectNet, data, t]
  )
  const validationSchema2 = useMemo(() => {
    return Yup.object({
      leverage: Yup.number()
        .default(data?.farms?.[data?.betterToken?.index]?.maxLever - 1)
        .min(0)
        .max(data?.farms?.[data?.betterToken?.index]?.maxLever - 1)
        .required(),
      percent: Yup.number().default(100).min(0).max(100).integer().required(),
    })
  }, [data])
  const validationSchema3 = useMemo(() => {
    return Yup.object({
      slippage: Yup.string()
        .default('1-1')
        .test('is-moreThan-0', t('Must be a number greater than 0'), (value) => {
          const num = value?.split('-')[1]
          return num ? +num > 0 : false
        }),
    })
  }, [t])
  const initialValues = useMemo(
    () => {
      return {
        ...validationSchema.getDefault(),
        ...validationSchema2.getDefault(),
        ...validationSchema3.getDefault(),
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validationSchema, validationSchema2, validationSchema3, data]
  )

  const onSubmit = useCallback(
    async (values) => {
      try {
        const params = {
          ...values,
          slippage: Number((values.slippage as string)?.split('-')[1]) / 100,
        }

        const contract = getWalletContract(
          fluxJson?.[connectNet as string]?.farm?.Orderbook,
          Orderbook
        )
        const res = strategyAddTwoData(
          simulatedOpening?.lpAmount.mul((1 - params?.slippage) * 1000).div(1000)
        )
        await sendTransaction(
          {
            contract: contract,
            method: 'work',
            args: [
              ethers.constants.MaxUint256,
              poolInfo?.farms[poolInfo?.betterToken?.index]?.address,
              params?.tokenNum ? ethers.utils.parseUnits(params?.tokenNum) : ethers.constants.Zero,
              simulatedOpening?.debt0,
              params?.tokenNum1
                ? ethers.utils.parseUnits(params?.tokenNum1)
                : ethers.constants.Zero,
              simulatedOpening?.debt1,
              ethers.constants.Zero,
              ethers.constants.Zero,
              res,
            ],
            value:
              poolInfo?.token === netconfigs[connectNet as any]?.nativeCoin ||
              poolInfo?.token1 === netconfigs[connectNet as any]?.nativeCoin
                ? poolInfo?.token === netconfigs[connectNet as any]?.nativeCoin
                  ? params?.tokenNum
                    ? ethers.utils.parseUnits(params?.tokenNum).toString()
                    : ethers.constants.Zero
                  : params?.tokenNum1
                  ? ethers.utils.parseUnits(params?.tokenNum1).toString()
                  : ethers.constants.Zero
                : 0,
          },
          () => {
            //TODO:空函数lint检查
            onClose?.()
          },
          (hash: string) => {
            console.log(hash)
          }
        )
      } catch (e: any) {
        console.error('openPosition error:', e)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [poolInfo, simulatedOpening]
  )

  return (
    <Wizard
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
      data={data}
      renderModalHeader={(stepsList: any, stepNumber: any) => (
        <Flex justifyContent="space-between" mb={{ base: px2vw(30), xl: '30px' }}>
          <Flex>
            <Image
              w={{ base: px2vw(24), xl: '24px' }}
              h={{ base: px2vw(19), xl: '19px' }}
              mr={{ base: px2vw(9), xl: '9px' }}
              src={completeUrl('farm/farmSvg.svg')}
            />
            <Text
              textStyle="18"
              color="purple.300"
              lineHeight={{ base: px2vw(19), xl: '19px' }}
              fontWeight="bold"
            >
              {t('GO FARM')}
            </Text>
          </Flex>
          <Steps stepsList={stepsList} activeStep={stepNumber} my="auto" />
        </Flex>
      )}
    >
      <WizardStep
        onSubmit={async (values: any) => {
          const res = calculationMaxLeverage(values, poolInfo)
          // 获取借贷的币种数量
          const tokenDebt = calculationTokens(
            values.tokenNum ? values.tokenNum : 0,
            data?.token0Price,
            data?.token0Liqudity,
            values.tokenNum1 ? values.tokenNum1 : 0,
            data?.token1Price,
            data?.token1Liqudity,
            res?.value,
            values?.tokenNum && values?.tokenNum1 ? values?.percent : values?.tokenNum ? 100 : 0
          )
          poolList.map((item: any, index: number) => {
            if (item?.defi === data?.defi && item?.currency === data?.currency) {
              const lpInfo = {
                lpTotalSupply: workerInfos?.workerInfos[index].lpTotalSupply,
                r0: workerInfos?.workerInfos[index].r0,
                r1: workerInfos?.workerInfos[index].r1,
                killFactor: workerInfos?.workerInfos[index].killFactor,
              }
              farmStore.setState({
                lpInfo: lpInfo,
              })
              // 模拟开仓
              simulatedOpeningMethod({
                values: {
                  ...values,
                  leverage: res?.value,
                  percent:
                    values?.tokenNum && values?.tokenNum1
                      ? values?.percent
                      : values?.tokenNum
                      ? 100
                      : 0,
                },
                debtToken0: tokenDebt?.token0Result,
                debtToken1: tokenDebt?.token1Result,
                lp: lpInfo,
              })
            }
          })
        }}
        validationSchema={validationSchema}
      >
        <WizardStep1 data={data} approveSuccess={() => getBalance()} />
      </WizardStep>
      <WizardStep validationSchema={validationSchema2}>
        <WizardStep2 />
      </WizardStep>
      <WizardStep validationSchema={validationSchema3}>
        <WizardStep3 />
      </WizardStep>
    </Wizard>
  )
}

export default Index
