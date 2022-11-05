import React, { useMemo, useCallback, useState } from 'react'
import { Flex, CenterProps } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import * as Yup from 'yup'
import { useTranslation } from 'next-i18next'

import px2vw from '@/utils/px2vw'
import { Wizard, WizardStep } from '@/components/FarmModal'
import { ModalHeader } from '@/components/MyFarm/CloseModal'
import WizardStep1 from './WizardStep1'
import WizardStep2 from './WizardStep2'
import WizardStep3 from './WizardStep3'
import farmStore from '@/stores/contract/farm'
import { ethers } from 'ethers'
import { useEffectOnce } from 'react-use'
import { calculationTokens } from '@/utils/math'
import { calculationMaxLeverage, simulatedOpeningMethod } from '@/components/FarmModal/WizardStep2'
import { getWalletContract } from '@/contracts'
import { strategyAddTwoData } from '@/utils/v2'
import useSendTransaction from '@/hooks/useSendTransaction'
import { Orderbook } from '@/contracts/abis'
import BigNumber from 'bignumber.js'
import { netconfigs } from '@/consts/network'
import globalStore from '@/stores/global'

export interface IProps extends CenterProps {
  datas: any
  onClose: () => void
}

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function Index({ onClose, datas }: IProps) {
  const { simulatedOpening, poolInfo } = farmStore()
  const [data, setData] = useState(datas)
  const { sendTransaction } = useSendTransaction()
  const { connectNet, fluxJson } = globalStore()

  useEffectOnce(() => {
    getBalance()
  })

  // 处理币种信息
  const getBalance = async () => {
    try {
      const discount = 0.9
      const res = {
        ...datas,
        defaultType: data?.defaultType,
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
        )
          .times(discount)
          .toString(),
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

  const { t } = useTranslation(['farm', 'common'])

  // 计算nativeCoin最大数量
  const getMaxNativeCoin = (tokenIndex: number) => {
    let newMaxNum = '0'
    // 判断是否为平台币
    const nativeCoin = netconfigs[connectNet as any]?.nativeCoin
    let result = '0'
    if (nativeCoin === 'CFX') {
      result = new BigNumber(
        tokenIndex === 0
          ? new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[0]?.balance, data?.tokenInfos[0]?.decimals)
            ).toString()
          : new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[1]?.balance, data?.tokenInfos[1]?.decimals)
            ).toString()
      )
        .minus(1)
        .toString()
    } else if (nativeCoin === 'BNB') {
      result = new BigNumber(
        tokenIndex === 0
          ? new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[0]?.balance, data?.tokenInfos[0]?.decimals)
            ).toString()
          : new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[1]?.balance, data?.tokenInfos[1]?.decimals)
            ).toString()
      )
        .minus(0.01)
        .toString()
    } else if (nativeCoin === 'HT') {
      result = new BigNumber(
        tokenIndex === 0
          ? new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[0]?.balance, data?.tokenInfos[0]?.decimals)
            ).toString()
          : new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[1]?.balance, data?.tokenInfos[1]?.decimals)
            ).toString()
      )
        .minus(0.01)
        .toString()
    } else if (nativeCoin === 'OKT') {
      result = new BigNumber(
        tokenIndex === 0
          ? new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[0]?.balance, data?.tokenInfos[0]?.decimals)
            ).toString()
          : new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[1]?.balance, data?.tokenInfos[1]?.decimals)
            ).toString()
      )
        .minus(0.01)
        .toString()
    } else if (nativeCoin === 'ETH') {
      result = new BigNumber(
        tokenIndex === 0
          ? new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[0]?.balance, data?.tokenInfos[0]?.decimals)
            ).toString()
          : new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[1]?.balance, data?.tokenInfos[1]?.decimals)
            ).toString()
      )
        .minus(0.01)
        .toString()
    } else if (nativeCoin === 'MATIC') {
      result = new BigNumber(
        tokenIndex === 0
          ? new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[0]?.balance, data?.tokenInfos[0]?.decimals)
            ).toString()
          : new BigNumber(
              ethers.utils.formatUnits(data?.tokenInfos[1]?.balance, data?.tokenInfos[1]?.decimals)
            ).toString()
      )
        .minus(1)
        .toString()
    }
    newMaxNum = result
    return newMaxNum
  }

  const validationSchema = useMemo(
    () => {
      return Yup.object({
        type: Yup.number().default(data.defaultType ?? 1), // 控制默认加仓模式选项
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
        .default(data?.farmInfo?.maxLever - 1)
        .min(0)
        .max(data?.farmInfo?.maxLever - 1)
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
  const initialValues = useMemo(() => {
    return {
      ...validationSchema.getDefault(),
      ...validationSchema2.getDefault(),
      ...validationSchema3.getDefault(),
    }
  }, [validationSchema, validationSchema2, validationSchema3])

  const onSubmit = useCallback(
    async (values, { setSubmitting }) => {
      try {
        const params = {
          ...values,
          slippage: Number((values.slippage as string)?.split('-')[1]) / 100,
        }
        setSubmitting(true)

        const contract = getWalletContract(
          fluxJson?.[connectNet as string]?.farm?.Orderbook,
          Orderbook
        )
        const res = strategyAddTwoData(
          simulatedOpening?.lpAmount
            .sub(data?.lpAmount || '0')
            .mul((1 - params?.slippage) * 1000)
            .div(1000)
        )
        await sendTransaction(
          {
            contract: contract,
            method: 'work',
            args: [
              ethers.BigNumber.from(data?.orderId),
              data?.worker,
              params?.tokenNum ? ethers.utils.parseUnits(params?.tokenNum) : ethers.constants.Zero,
              params.type === 1
                ? ethers.utils.parseUnits(
                    new BigNumber(
                      ethers.utils.formatUnits(simulatedOpening?.debt0, data?.token0Decimal)
                    ).toFixed(data?.token0Decimal),
                    data?.token0Decimal
                  )
                : ethers.constants.Zero,
              params?.tokenNum1
                ? ethers.utils.parseUnits(params?.tokenNum1)
                : ethers.constants.Zero,
              params.type === 1
                ? ethers.utils.parseUnits(
                    new BigNumber(
                      ethers.utils.formatUnits(simulatedOpening?.debt1, data?.token1Decimal)
                    ).toFixed(data?.token1Decimal),
                    data?.token1Decimal
                  )
                : ethers.constants.Zero,
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
    [data, simulatedOpening]
  )

  return (
    <Wizard
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
      data={data}
      renderModalHeader={(stepsList: any, stepNumber: any) => (
        <ModalHeader
          hasPool={stepNumber === 0}
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
              <AddIcon
                color="gray.700"
                w={{ base: px2vw(14), xl: '14px' }}
                h={{ base: px2vw(14), xl: '14px' }}
              />
            </Flex>
          }
          title={t('addPosition')}
          data={{
            id: `#${data?.orderId}`,
            token: data?.token,
            token1: data?.token1,
            defi: data?.defi,
          }}
          stepsList={stepsList}
          stepNumber={stepNumber}
        />
      )}
      ignoreStepFn={({ type }: any) => {
        return type === 0
      }}
    >
      <WizardStep
        onSubmit={(values: any) => {
          const res = calculationMaxLeverage(values, poolInfo)
          // 获取借贷的币种数量
          const tokenDebt = calculationTokens(
            values.tokenNum ? values.tokenNum : 0,
            data?.token0Price,
            data?.token0Liqudity,
            values.tokenNum1 ? values.tokenNum1 : 0,
            data?.token1Price,
            data?.token1Liqudity,
            values?.type === 0 ? 0 : res?.value,
            values.type === 1
              ? values?.tokenNum && values?.tokenNum1
                ? values?.percent
                : values?.tokenNum
                ? 100
                : 0
              : 0
          )
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
            debtToken0: values.type === 1 ? tokenDebt?.token0Result : '0',
            debtToken1: values.type === 1 ? tokenDebt?.token1Result : '0',
            lp: data?.lpInfo,
            debt0: ethers.constants.Zero,
            debt1: ethers.constants.Zero,
            lpAmount: data?.lpAmount,
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
