import React, { useMemo, useCallback, useState } from 'react'
import { Flex, CenterProps } from '@chakra-ui/react'
import * as Yup from 'yup'
import { useTranslation } from 'next-i18next'
import { MinusIcon } from '@chakra-ui/icons'
import BigNumber from 'bignumber.js'

import px2vw from '@/utils/px2vw'
import { Wizard, WizardStep } from '@/components/FarmModal'
import WizardStep1 from './WizardStep1'
import WizardStep2 from './WizardStep2'
import WizardStep3 from './WizardStep3'
import { ModalHeader } from '@/components/MyFarm/CloseModal'
import { useEffectOnce } from 'react-use'
import farmStore from '@/stores/contract/farm'
import { ethers } from 'ethers'
import { getWalletContract } from '@/contracts'
import { Orderbook } from '@/contracts/abis'
import {
  deLpAmount,
  strategyClosePartData,
  strategyCloseSimu,
  strategyDecSimu,
  strategyWithdrawData,
} from '@/utils/v2'
import useSendTransaction from '@/hooks/useSendTransaction'
import globalStore from '@/stores/global'

export interface IProps extends CenterProps {
  datas: any
  onClose: () => void
}

function Index({ onClose, datas }: IProps) {
  const [data, setData] = useState(datas)
  const { connectNet, fluxJson } = globalStore()
  const { poolInfo, simulatedOpening } = farmStore()
  const { sendTransaction } = useSendTransaction()
  const [maxRepay, setMaxRepay] = useState<any>([
    { max: '0', tokenName: '' },
    { max: '0', tokenName: '' },
  ])

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

  const { t } = useTranslation(['farm', 'common'])

  const validationSchema = useMemo(() => {
    return Yup.object({
      token: Yup.string().default(data?.token),
      token1: Yup.string().default(data?.token1),
      value: Yup.number()
        .default(0)
        .moreThan(0, t('Must be a number greater than 0'))
        .max(Number(new BigNumber(data?.lp).toFixed(4) || 0), t('LP不足'))
        .required(t('Must not be empty')),
    })
  }, [data, t])
  const validationSchema2 = useMemo(
    () => {
      return Yup.object({
        tokenNum: Yup.number()
          .default(undefined)
          .max(
            new BigNumber(ethers.utils.formatUnits(data?.debt0, data?.token0Decimal)).toNumber(),
            t('超过最大数量')
          )
          .test('', t('Must be a number greater than 0'), (value: any) => {
            return value === undefined ? true : new BigNumber(value).gte(0)
          })
          .test(
            '',
            t('repayMax', { max: maxRepay[0]?.max, tokenName: maxRepay[0]?.tokenName }),
            (value: any, values: any) => {
              // 设置最大偿还数量
              const tokens = deLpAmount(
                ethers.utils.parseUnits(values?.parent?.value),
                data?.lpAmount,
                data?.amount0,
                data?.amount1
              )
              const token0 = Math.min(
                new BigNumber(
                  ethers.utils.formatUnits(tokens?.[0], poolInfo?.token0Decimal)
                ).toNumber(),
                new BigNumber(ethers.utils.formatUnits(data?.debt0, data?.token0Decimal)).toNumber()
              )
              const token1 = Math.min(
                new BigNumber(
                  ethers.utils.formatUnits(tokens?.[1], poolInfo?.token1Decimal)
                ).toNumber(),
                new BigNumber(ethers.utils.formatUnits(data?.debt1, data?.token1Decimal)).toNumber()
              )
              setMaxRepay([
                {
                  max: token0,
                  tokenName: values?.parent?.token,
                },
                {
                  max: token1,
                  tokenName: values?.parent?.token1,
                },
              ])
              return value ? new BigNumber(value).lte(new BigNumber(token0)) : true
            }
          ),
        tokenNum1: Yup.number()
          .default(undefined)
          .max(
            new BigNumber(ethers.utils.formatUnits(data?.debt1, data?.token1Decimal)).toNumber(),
            t('超过最大数量')
          )
          .test('', t('Must be a number greater than 0'), (value: any) => {
            return value === undefined ? true : new BigNumber(value).gte(0)
          })
          .test(
            '',
            t('repayMax', { max: maxRepay[1]?.max, tokenName: maxRepay[1]?.tokenName }),
            (value: any, values: any) => {
              // 设置最大偿还数量
              const tokens = deLpAmount(
                ethers.utils.parseUnits(values?.parent?.value),
                data?.lpAmount,
                data?.amount0,
                data?.amount1
              )
              const token0 = Math.min(
                new BigNumber(
                  ethers.utils.formatUnits(tokens?.[0], poolInfo?.token0Decimal)
                ).toNumber(),
                new BigNumber(ethers.utils.formatUnits(data?.debt0, data?.token0Decimal)).toNumber()
              )
              const token1 = Math.min(
                new BigNumber(
                  ethers.utils.formatUnits(tokens?.[1], poolInfo?.token1Decimal)
                ).toNumber(),
                new BigNumber(ethers.utils.formatUnits(data?.debt1, data?.token1Decimal)).toNumber()
              )
              setMaxRepay([
                {
                  max: token0,
                  tokenName: values?.parent?.token,
                },
                {
                  max: token1,
                  tokenName: values?.parent?.token1,
                },
              ])
              return value ? new BigNumber(value).lte(new BigNumber(token1)) : true
            }
          ),
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, t, maxRepay]
  )
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
  const initialValues = useMemo(() => {
    return {
      ...validationSchema.getDefault(),
      ...validationSchema2.getDefault(),
      ...validationSchema3.getDefault(),
    }
  }, [validationSchema, validationSchema2, validationSchema3])

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
        if (new BigNumber(new BigNumber(data?.lp).toFixed(4)).eq(new BigNumber(params?.value))) {
          const res = strategyWithdrawData(
            simulatedOpening?.back0.mul((1 - params?.slippage) * 1000).div(1000),
            simulatedOpening?.back1.mul((1 - params?.slippage) * 1000).div(1000)
          )
          await sendTransaction(
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
            },
            (hash: string) => {
              console.log(hash)
            }
          )
        } else {
          const res = strategyClosePartData(ethers.utils.parseUnits(params?.value))
          await sendTransaction(
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
                params?.tokenNum
                  ? new BigNumber(new BigNumber(params?.tokenNum).toFixed(4)).eq(
                      new BigNumber(
                        new BigNumber(
                          ethers.utils.formatUnits(data?.debt0, data?.token0Decimal)
                        ).toFixed(4)
                      )
                    )
                    ? ethers.constants.MaxUint256
                    : ethers.utils.parseUnits(params?.tokenNum, data?.token0Decimal)
                  : ethers.constants.Zero,
                params?.tokenNum1
                  ? new BigNumber(new BigNumber(params?.tokenNum1).toFixed(4)).eq(
                      new BigNumber(
                        new BigNumber(
                          ethers.utils.formatUnits(data?.debt1, data?.token1Decimal)
                        ).toFixed(4)
                      )
                    )
                    ? ethers.constants.MaxUint256
                    : ethers.utils.parseUnits(params?.tokenNum1, data?.token1Decimal)
                  : ethers.constants.Zero,
                res,
              ],
              value: 0,
            },
            () => {
              //TODO:空函数lint检查
              onClose?.()
            },
            (hash: string) => {
              console.log(hash)
            }
          )
        }
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
              <MinusIcon
                color="gray.700"
                w={{ base: px2vw(14), xl: '14px' }}
                h={{ base: px2vw(14), xl: '14px' }}
              />
            </Flex>
          }
          title={t('removePosition')}
          data={{
            id: `#${data?.orderId}`,
            token: data?.token,
            token1: data?.token1,
            defi: data?.defi,
          }}
          stepsList={stepsList}
          stepsWidth={110}
          stepNumber={stepNumber}
        />
      )}
      ignoreStepFn={({ value }: any) => {
        return new BigNumber(value).isEqualTo(new BigNumber(data.lp).toFixed(4))
      }}
    >
      <WizardStep
        validationSchema={validationSchema}
        onSubmit={(values: any) => {
          try {
            // 判断是否为max平仓
            const result = new BigNumber(values?.value).isEqualTo(new BigNumber(data.lp).toFixed(4))
              ? strategyCloseSimu(
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
              : strategyDecSimu(
                  {
                    debt0: data?.debt0,
                    debt1: data?.debt1,
                    lpAmount: data?.lpAmount,
                  },
                  poolInfo?.lpInfo,
                  [
                    {
                      amount: ethers.constants.Zero,
                      debt: ethers.constants.Zero,
                      maxReturn: ethers.constants.Zero,
                    },
                    {
                      amount: ethers.constants.Zero,
                      debt: ethers.constants.Zero,
                      maxReturn: ethers.constants.Zero,
                    },
                  ],
                  ethers.utils.parseUnits(values?.value) || ethers.constants.Zero
                )
            farmStore.setState({
              simulatedOpening: result,
            })
          } catch (err) {
            console.log(err)
          }
        }}
      >
        <WizardStep1 data={data} />
      </WizardStep>
      <WizardStep validationSchema={validationSchema2}>
        <WizardStep2 data={data} approveSuccess={() => getBalance()} />
      </WizardStep>
      <WizardStep validationSchema={validationSchema3}>
        <WizardStep3 data={data} />
      </WizardStep>
    </Wizard>
  )
}

export default Index
