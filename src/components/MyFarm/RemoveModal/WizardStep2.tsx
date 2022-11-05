import {
  Box,
  InputGroup,
  SimpleGrid,
  Text,
  NumberInput,
  NumberInputField,
  Stack,
  Image,
  useBoolean,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { useField, useFormikContext } from 'formik'
import { FC, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import BaseButton from '@/components/BaseButton'
import { formatNumFloat } from '@/utils/math'
import FormControl from '@/components/Form/FormControl'
import px2vw from '@/utils/px2vw'
import { FormLabelList, LabelList } from '@/components/Form/LabelList'
import { restListProps } from '@/components/MyFarm/CloseModal'
import { TokenImgBox } from '@/components/FarmModal/WizardStep2'
import { TokenInput } from '@/components/Form/TokenInput'
import { findIcon } from '@/utils/common'
import { ethers } from 'ethers'
import { deLpAmount, strategyDecSimu } from '@/utils/v2'
import farmStore from '@/stores/contract/farm'
import calculatorImg from '@/assets/images/svg/calculator-2.svg'
import { useModal } from '@/components/Modal'
import { modalProps } from '@/components/FarmPool'
import DebtModal from '@/components/MyFarm/DebtModal'
import { getWalletContract } from '@/contracts'
import { ERC20Abi } from '@/contracts/abis'
import useSendTransaction from '@/hooks/useSendTransaction'
import { maxUint256 } from '@/consts'
import NumberTips from '@/components/NumberTips'
import globalStore from '@/stores/global'

const Step = ({ data, approveSuccess }: any) => {
  const { t } = useTranslation(['farm'])
  const { connectNet, fluxJson } = globalStore()
  const { values } = useFormikContext<any>()
  const { poolInfo, simulatedOpening } = farmStore()
  const { sendTransaction } = useSendTransaction()
  const [token0Approve, setToken0Approve] = useBoolean(false)
  const [token1Approve, setToken1Approve] = useBoolean(false)
  const [maxRepay, setMaxRepay] = useState<any>(['0', '0'])

  const { onOpen: openDebtModal, Modal: DebtModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => <DebtModal data={data} onClose={onClose} />,
  })

  useEffect(() => {
    // 设置最大偿还数量
    const tokens = deLpAmount(
      ethers.utils.parseUnits(values?.value),
      data?.lpAmount,
      data?.amount0,
      data?.amount1
    )
    setMaxRepay([
      Math.min(
        new BigNumber(ethers.utils.formatUnits(tokens?.[0], poolInfo?.token0Decimal)).toNumber(),
        new BigNumber(ethers.utils.formatUnits(data?.debt0, data?.token0Decimal)).toNumber()
      ),
      Math.min(
        new BigNumber(ethers.utils.formatUnits(tokens?.[1], poolInfo?.token1Decimal)).toNumber(),
        new BigNumber(ethers.utils.formatUnits(data?.debt1, data?.token1Decimal)).toNumber()
      ),
    ])
    PubSub.subscribe('farm-open-debt-modal', () => {
      openDebtModal?.({ ...poolInfo, ...simulatedOpening, ...poolInfo?.lpInfo })
    })
    return () => {
      PubSub.unsubscribe('farm-open-debt-modal')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedOpening, poolInfo, values])

  useEffect(
    () => {
      try {
        const result = strategyDecSimu(
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
              maxReturn: values?.tokenNum
                ? ethers.utils.parseUnits(values?.tokenNum, data?.token0Decimal)
                : ethers.constants.Zero,
            },
            {
              amount: ethers.constants.Zero,
              debt: ethers.constants.Zero,
              maxReturn: values?.tokenNum1
                ? ethers.utils.parseUnits(values?.tokenNum1, data?.token1Decimal)
                : ethers.constants.Zero,
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values]
  )

  // 授权
  const openApprove = (token: string, valut: string) => {
    token === data?.token0 ? setToken0Approve.on() : setToken1Approve.on()
    const underlyingContract = getWalletContract(token, ERC20Abi)
    sendTransaction(
      {
        contract: underlyingContract,
        method: 'approve',
        args: [valut, maxUint256],
        action: 'Approve',
      },
      () => {
        // 授权完成
        approveSuccess()
        token === data?.token0 ? setToken0Approve.off() : setToken1Approve.off()
      }
    )
  }

  return (
    <>
      <FormLabelList
        name="YourDebt"
        label={t('Your Debt') + ':'}
        restList={{ ...restListProps }}
        data={[
          {
            key: 'token',
            label: (values) => {
              return <TokenImgBox name={`${values?.token}`} />
            },
            value: () => (
              <NumberTips
                value={new BigNumber(
                  ethers.utils.formatUnits(data?.debt0, data?.token0Decimal)
                ).toString()}
                toolTipProps={{ isDisabled: false }}
              />
            ),
          },
          {
            key: 'token1',
            label: (values) => {
              return <TokenImgBox name={`${values?.token1}`} />
            },
            value: () => (
              <NumberTips
                value={new BigNumber(
                  ethers.utils.formatUnits(data?.debt1, data?.token1Decimal)
                ).toString()}
                toolTipProps={{ isDisabled: false }}
              />
            ),
          },
        ]}
      />
      <Stack mt={{ base: px2vw(30), xl: '30px' }} spacing={{ base: px2vw(10), xl: '10px' }}>
        <TokenInput
          label={t('How much debt would you like to repay?')}
          noPoint
          name="tokenNum"
          precision={data?.token0Decimal} // 精度
          isApprove={
            Object(values)?.tokenNum
              ? isNaN(new BigNumber(Object(values)?.tokenNum).toNumber())
                ? true
                : new BigNumber(data?.token0Allowance).gte(new BigNumber(Object(values)?.tokenNum))
              : !new BigNumber(data?.token0Allowance).eq(0)
          }
          isRemove
          maxBtn
          maxNum={maxRepay[0]}
          tips={`${data?.token}`.toLocaleUpperCase()}
          imgUri={findIcon(`${data?.token}`.toLocaleLowerCase())}
          approveLoading={token0Approve}
          onApprove={() =>
            openApprove(
              data?.token0 || data?.orderInfo?.token0,
              fluxJson?.[connectNet as string]?.farm?.Orderbook
            )
          }
        />
        <TokenInput
          name="tokenNum1"
          restLabel={{ mb: 0 }}
          precision={data?.token1Decimal} // 精度
          isApprove={
            Object(values)?.tokenNum1
              ? isNaN(new BigNumber(Object(values)?.tokenNum1).toNumber())
                ? true
                : new BigNumber(data?.token1Allowance).gte(new BigNumber(Object(values)?.tokenNum1))
              : !new BigNumber(data?.token1Allowance).eq(0)
          }
          isRemove
          maxBtn
          maxNum={maxRepay[1]}
          tips={`${data?.token1}`.toLocaleUpperCase()}
          imgUri={findIcon(`${data?.token1}`.toLocaleLowerCase())}
          approveLoading={token1Approve}
          onApprove={() =>
            openApprove(
              data?.token1Address || data?.orderInfo?.token1,
              fluxJson?.[connectNet as string]?.farm?.Orderbook
            )
          }
        />
      </Stack>
      <Box
        mt={{ base: px2vw(10), xl: '10px' }}
        p={{ base: px2vw(10), xl: '10px' }}
        borderRadius={{ base: px2vw(10), xl: '10px' }}
        bgColor="rgba(170, 185, 222, 0.1)"
      >
        <LabelList
          restList={{
            px: 0,
          }}
          data={[
            {
              key: 'DebtRatio',
              label: () => <Text textStyle="12">{t('debtRatio')}</Text>,
              value: () => {
                return (
                  <Text
                    textStyle="12"
                    cursor="pointer"
                    onClick={() => {
                      PubSub.publish('farm-open-debt-modal')
                    }}
                  >
                    {data?.debt.mul(10000).div(data?.health).toNumber() / 100}%
                    <span> → {simulatedOpening?.ratio}% </span>
                    <Image
                      src={calculatorImg}
                      ignoreFallback
                      w={{ base: px2vw(14), xl: '14px' }}
                      h={{ base: px2vw(14), xl: '14px' }}
                      display="inline-block"
                      verticalAlign="middle"
                      mr={{ base: px2vw(5), xl: '5px' }}
                      my="auto"
                    />
                  </Text>
                )
              },
            },
          ]}
        />
      </Box>
      {new BigNumber(simulatedOpening?.ratio).gte(new BigNumber(data?.workFactor / 100)) && (
        <Text
          textAlign="center"
          color="red.200"
          textStyle="14"
          mt={{ base: px2vw(20), xl: '20px' }}
        >
          {t('debtTips2', { workFactor: data?.workFactor / 100 })}
        </Text>
      )}

      {DebtModalBox}
    </>
  )
}
export default Step

type LPInputControlProps = any

export const LPInput: FC<LPInputControlProps> = ({
  name,
  precision = 4,
  label,
  max,
  ...rest
}: LPInputControlProps) => {
  const [field, , { setValue }] = useField(name)
  const { values, setFieldTouched } = useFormikContext()

  const handleChange = (...arr: any[]) => {
    const value = formatNumFloat(arr[0].target.value, precision)
    setValue(value)
  }

  const { t } = useTranslation(['farm'])

  return (
    <FormControl
      name={name}
      label={typeof label === 'function' ? `${label(values)}:` : `${label}:` ?? ''}
      {...rest}
    >
      <Box
        borderRadius={{ base: px2vw(10), xl: '10px' }}
        p={{ base: px2vw(10), xl: '10px' }}
        bgColor="gray.400"
      >
        <Text textStyle="12">
          {t('Position LP Amount')} {max}
        </Text>
        <InputGroup mt={{ base: px2vw(15), xl: '15px' }}>
          <NumberInput
            w="100%"
            min={0}
            max={max}
            focusBorderColor="none"
            value={field.value}
            precision={precision}
          >
            <NumberInputField
              onChange={handleChange}
              onBlur={() => {
                setFieldTouched(name, true)
              }}
              inputMode="decimal"
              placeholder="0.00"
              fontSize="20"
              textAlign="center"
              fontWeight="bold"
              height={{ base: px2vw(20), xl: '20px' }}
              border="none"
            />
          </NumberInput>
        </InputGroup>
        <Box px={{ base: px2vw(10), xl: '10px' }} mt={{ base: px2vw(20), xl: '20px' }}>
          <SimpleGrid
            columns={4}
            spacing={{ base: px2vw(22), xl: '22px' }}
            justifyContent="space-between"
            marginTop={{ base: px2vw(-4), xl: '-4px' }}
          >
            {[25, 50, 75, 100].map((item) => (
              <BaseButton
                key={item}
                text={item !== 100 ? `${item}%` : 'MAX'}
                minW="full"
                h={{ base: px2vw(20), xl: '20px' }}
                textStyle={{ textStyle: '14' }}
                onClick={() => {
                  const value = new BigNumber(max).times(item).div(100).toFixed(precision)
                  setValue(value)
                }}
              />
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </FormControl>
  )
}
