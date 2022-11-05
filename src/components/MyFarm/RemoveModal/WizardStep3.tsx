import {
  Box,
  Flex,
  InputGroup,
  SimpleGrid,
  Text,
  NumberInput,
  NumberInputField,
  Stack,
  Image,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { useField, useFormikContext } from 'formik'
import { FC, useEffect } from 'react'
import BigNumber from 'bignumber.js'

import BaseButton from '@/components/BaseButton'
import { formatNumFloat } from '@/utils/math'
import FormControl from '@/components/Form/FormControl'
import px2vw from '@/utils/px2vw'
import { FormLabelList, LabelList } from '@/components/Form/LabelList'
import { restListProps } from '@/components/MyFarm/CloseModal'
import { TokenImgBox } from '@/components/FarmModal/WizardStep2'
import { SlippageRadio } from '@/components/Form/Radio'
import calculatorImg from '@/assets/images/svg/calculator-2.svg'
import farmStore from '@/stores/contract/farm'
import { ethers } from 'ethers'
import NumberTips from '@/components/NumberTips'
import { useModal } from '@/components/Modal'
import { modalProps } from '@/components/FarmPool'
import DebtModal from '@/components/MyFarm/DebtModal'
import BaseTooltip from '@/components/BaseTooltip'

const Step = ({ data }: any) => {
  const { t } = useTranslation(['farm', 'common'])
  const { values } = useFormikContext<any>()
  const { poolInfo, lpInfo, simulatedOpening } = farmStore()

  const { onOpen: openDebtModal, Modal: DebtModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => <DebtModal data={data} onClose={onClose} />,
  })

  useEffect(() => {
    PubSub.subscribe('farm-open-debt-modal', () => {
      openDebtModal?.({ ...poolInfo, ...simulatedOpening, ...lpInfo })
    })
    return () => {
      PubSub.unsubscribe('farm-open-debt-modal')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedOpening, poolInfo, lpInfo, values])
  return (
    <>
      <Stack spacing={{ base: px2vw(25), xl: '25px' }}>
        {/* 如果是max平仓 */}
        {!new BigNumber(values?.value).isEqualTo(new BigNumber(data.lp).toFixed(4)) ? (
          <LabelList
            restList={restListProps}
            data={[
              {
                key: 'DebtRatio',
                label: t('debtRatio'),
                value: () => {
                  return (
                    // icons 没有替换
                    <Text
                      cursor="pointer"
                      onClick={() => {
                        PubSub.publish('farm-open-debt-modal')
                      }}
                    >
                      {data?.debt.mul(10000).div(data?.health).toNumber() / 100}% →{' '}
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
                    </Flex>
                  )
                },
              },
            ]}
          />
        ) : (
          <FormLabelList
            name="t1"
            label={t('tips5') + ':'}
            restList={restListProps}
            data={[
              {
                key: 'token',
                label: () => {
                  return <TokenImgBox name={`${values?.token}`} />
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
                  return <TokenImgBox name={`${values?.token1}`} />
                },
                value: () => (
                  <NumberTips
                    value={ethers.utils.formatUnits(data?.amount1, data?.token1Decimal)}
                  />
                ),
              },
            ]}
          />
        )}

        <FormLabelList
          name="t2"
          label={t('youWillRepayDebt') + ':'}
          restList={restListProps}
          data={[
            {
              key: 'token',
              label: (values) => {
                return <TokenImgBox name={`${values?.token}`} />
              },
              value: () => (
                <NumberTips
                  value={
                    new BigNumber(values?.value).isEqualTo(new BigNumber(data.lp).toFixed(4))
                      ? ethers.utils.formatUnits(poolInfo?.debt0, poolInfo?.token0Decimal)
                      : Object(values)?.tokenNum
                  }
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
                  value={
                    new BigNumber(values?.value).isEqualTo(new BigNumber(data.lp).toFixed(4))
                      ? ethers.utils.formatUnits(poolInfo?.debt1, poolInfo?.token1Decimal)
                      : Object(values)?.tokenNum1
                  }
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
              label: (values) => {
                return <TokenImgBox name={`${values?.token}`} />
              },
              value: () => {
                const slippage = Number((values?.slippage as string)?.split('-')[1]) / 100
                return (
                  <NumberTips
                    value={ethers.utils.formatUnits(
                      simulatedOpening?.back0.mul((1 - slippage) * 1000).div(1000),
                      data?.token0Decimal
                    )}
                  />
                )
              },
            },
            {
              key: 'token1',
              label: (values) => {
                return <TokenImgBox name={`${values?.token1}`} />
              },
              value: () => {
                const slippage = Number((values?.slippage as string)?.split('-')[1]) / 100
                return (
                  <NumberTips
                    value={ethers.utils.formatUnits(
                      simulatedOpening?.back1.mul((1 - slippage) * 1000).div(1000),
                      data?.token1Decimal
                    )}
                  />
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
              value: `${new BigNumber(
                ethers.utils.formatUnits(
                  simulatedOpening?.swapAmt,
                  simulatedOpening?.reverse ? data?.token1Decimal : data?.token0Decimal
                )
              )
                .times(0.0025)
                .toFixed(4)} ${simulatedOpening?.reverse ? data?.token1 : data?.token}`,
            },
          ]}
        />
      </Stack>
      <SlippageRadio
        name="slippage"
        label={
          <BaseTooltip isMultiple text={t('slippageTolerance')} textStyles={{ textStyle: '12' }}>
            {t('tips116')}
          </BaseTooltip>
        }
      />
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
