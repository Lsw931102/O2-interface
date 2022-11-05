import { Box, InputGroup, SimpleGrid, Text, NumberInput, NumberInputField } from '@chakra-ui/react'
import { useField, useFormikContext } from 'formik'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import BaseButton from '@/components/BaseButton'
import { formatNumFloat } from '@/utils/math'
import FormControl from '@/components/Form/FormControl'
import px2vw from '@/utils/px2vw'
import { FormLabelList } from '@/components/Form/LabelList'
import { restListProps } from '@/components/MyFarm/CloseModal'
import { TokenImgBox } from '@/components/FarmModal/WizardStep2'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { deLpAmount } from '@/utils/v2'
import NumberTips from '@/components/NumberTips'

const Step = ({ data }: any) => {
  const { t } = useTranslation('farm')

  const [amount0, setAmount0] = useState<any>('--')
  const [amount1, setAmount1] = useState<any>('--')
  const { values } = useFormikContext<any>()
  useEffect(
    () => {
      if (!values?.value) return
      const tokens = deLpAmount(
        ethers.utils.parseUnits(values?.value),
        data?.lpAmount,
        data?.amount0,
        data?.amount1
      )
      valChange?.(tokens)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values]
  )
  const valChange = (val: any) => {
    setAmount0(new BigNumber(ethers.utils.formatUnits(val[0], data?.token0Decimal)).toString())
    setAmount1(new BigNumber(ethers.utils.formatUnits(val[1], data?.token1Decimal)).toString())
  }
  return (
    <>
      <LPInput
        name="value"
        label={t('How much LP Token would you like to remove?')}
        noPoint
        data={data}
        max={new BigNumber(ethers.utils.formatUnits(data.lpAmount, 18)).toString()}
      />
      <FormLabelList
        name="t2"
        label={t('Tokens you will remove from the position') + ':'}
        restList={{ ...restListProps }}
        restLabel={{ mt: { base: px2vw(30), xl: '30px' } }}
        data={[
          {
            key: 'token',
            label: (values) => {
              return <TokenImgBox name={`${values?.token}`} />
            },
            value: () => {
              return <NumberTips value={amount0} toolTipProps={{ isDisabled: false }} />
            },
          },
          {
            key: 'token1',
            label: (values) => {
              return <TokenImgBox name={`${values?.token1}`} />
            },
            value: () => {
              return <NumberTips value={amount1} toolTipProps={{ isDisabled: false }} />
            },
          },
        ]}
      />
    </>
  )
}
export default Step

type LPInputControlProps = any

export const LPInput: FC<LPInputControlProps> = ({
  noPoint,
  name,
  precision = 4,
  label,
  max,
  ...rest
}: LPInputControlProps) => {
  const { t } = useTranslation(['farm'])
  const [field, , { setValue }] = useField(name)
  const { values } = useFormikContext()

  const handleChange = (...arr: any[]) => {
    const value = formatNumFloat(arr[0].target.value, precision)
    setValue(value)
    if (isNaN(Number(value)) || value === '') return
  }

  return (
    <FormControl
      name={name}
      label={
        typeof label === 'function'
          ? `${label(values)}${noPoint ? '' : ':'}`
          : `${label}${noPoint ? '' : ':'}` ?? ''
      }
      {...rest}
    >
      <Box
        borderRadius={{ base: px2vw(10), xl: '10px' }}
        p={{ base: px2vw(10), xl: '10px' }}
        bgColor="gray.400"
      >
        <Text textStyle="12">
          {t('positionLpAmount')}: <NumberTips value={max} toolTipProps={{ isDisabled: false }} />
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
              // onBlur={() => {
              //   setFieldTouched(name, true)
              // }}
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
