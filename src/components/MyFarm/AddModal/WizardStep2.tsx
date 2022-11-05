import {
  Flex,
  Box,
  SimpleGrid,
  Image,
  Text,
  IconButton,
  Input,
  useNumberInput,
  InputGroup,
  InputRightElement,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import px2vw from '@/utils/px2vw'
import { LabelList } from '@/components/Form/LabelList'
import calculatorImg from '@/assets/images/svg/calculator-2.svg'
import {
  calculationMaxLeverage,
  simulatedOpeningMethod,
  TokenImgBox,
} from '@/components/FarmModal/WizardStep2'
import FormControl from '@/components/Form/FormControl'
import farmStore from '@/stores/contract/farm'
import { useEffect, useMemo, useState } from 'react'
import { useField, useFormikContext } from 'formik'
import { calculationMaxToken, calculationTokens, formatNumFloat } from '@/utils/math'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import APYModal from '@/components/MyFarm/APYModal'
import { useModal } from '@/components/Modal'
import { modalProps } from '@/components/FarmPool'
import { findIcon, getAPY } from '@/utils/common'
import NumberTips from '@/components/NumberTips'
import DebtModal from '../DebtModal'
import { AddIcon, MinusIcon } from '@chakra-ui/icons'
import BaseButton from '@/components/BaseButton'
import { useEffectOnce } from 'react-use'
import BaseTooltip from '@/components/BaseTooltip'

export const YCBox = ({ name }: { name: string }) => {
  const { values } = useFormikContext<any>()

  const { t } = useTranslation(['farm'])

  const tokenArr = useMemo(() => {
    const arr = []
    if (values.tokenNum && values.tokenNum > 0) {
      arr.push({
        name: values.token,
        value: values.tokenNum,
      })
    }
    if (values.tokenNum1 && values.tokenNum1 > 0) {
      arr.push({
        name: values.token1,
        value: values.tokenNum1,
      })
    }
    return arr
  }, [values.token, values.token1, values.tokenNum, values.tokenNum1])

  return (
    <FormControl name={name} label={t('yourCollateral')}>
      <SimpleGrid
        columns={tokenArr.length}
        spacing={{ base: px2vw(15), xl: '15px' }}
        mt={{ base: px2vw(15), xl: '15px' }}
        mb={{ base: px2vw(25), xl: '25px' }}
      >
        {Array.isArray(tokenArr) &&
          tokenArr.map((item) => {
            return (
              <Flex
                key={item.name}
                height={{ base: px2vw(61), xl: '61px' }}
                borderRadius={{ base: px2vw(10), xl: '10px' }}
                bgColor="gray.100"
                justifyContent="center"
                alignItems="center"
                direction="column"
              >
                <Box mb={{ base: px2vw(4), xl: '4px' }}>
                  <NumberTips value={item.value} />
                </Box>
                <TokenImgBox name={item.name} />
              </Flex>
            )
          })}
      </SimpleGrid>
    </FormControl>
  )
}

export const LeverageBox = ({
  max,
  name,
  precision,
  step,
}: {
  max: number
  name: string
  step: number
  precision: number
}) => {
  const { values, setFieldValue } = useFormikContext<any>()
  const { poolInfo } = farmStore()
  const { t } = useTranslation(['farm'])

  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } = useNumberInput({
    step,
    value: values[name],
    min: 0,
    max,
    precision,
    onChange: async (v) => {
      let value = formatNumFloat(v, precision)
      if (+value > max) {
        value = max
      }
      setFieldValue(name, value)
      // 获取借贷的币种数量
      const tokenDebt = calculationTokens(
        values.tokenNum ? values.tokenNum : 0,
        poolInfo?.token0Price,
        poolInfo?.token0Liqudity,
        values.tokenNum1 ? values.tokenNum1 : 0,
        poolInfo?.token1Price,
        poolInfo?.token1Liqudity,
        value,
        values?.percent
      )
      // 模拟开仓
      simulatedOpeningMethod({
        values,
        debtToken0: tokenDebt?.token0Result,
        debtToken1: tokenDebt?.token1Result,
        debt0: ethers.constants.Zero,
        debt1: ethers.constants.Zero,
        lpAmount: poolInfo?.lpAmount,
        lp: poolInfo?.lpInfo,
      })
    },
  })

  const inc = getIncrementButtonProps()
  const dec = getDecrementButtonProps()
  const input = getInputProps()
  return (
    <FormControl name={name} label={`${t('setBorrowingLeverage')} ( Max: ${max} x )`}>
      <Flex
        mt={{ base: px2vw(15), xl: '15px' }}
        mb={{ base: px2vw(25), xl: '25px' }}
        px={{ base: px2vw(15), xl: '15px' }}
      >
        <IconButton
          {...dec}
          w={{ base: px2vw(40), xl: '40px' }}
          h={{ base: px2vw(40), xl: '40px' }}
          isRound
          color="gray.700"
          aria-label="-"
          size="lg"
          bgColor="purple.300"
          icon={<MinusIcon />}
          _hover={{
            opacity: {
              base: 1,
              xl: 0.8,
            },
          }}
          _active={{
            opacity: {
              base: 1,
              xl: 0.8,
            },
          }}
        />
        <Box flex={1} px={{ base: px2vw(35), xl: '35px' }}>
          <InputGroup border="0" bgColor="gray.700" borderRadius={{ base: px2vw(16), xl: '16px' }}>
            <Input
              {...input}
              color="white"
              fontSize="24"
              textAlign="right"
              h={{ base: px2vw(40), xl: '40px' }}
              bgColor="transparent"
              border="0 !important"
              boxShadow="none !important"
              pr="45%"
              zIndex="2"
            />
            <InputRightElement
              zIndex="1"
              h={{ base: px2vw(40), xl: '40px' }}
              w="40%"
              justifyContent="flex-start"
            >
              <Text textStyle="14" color="white" mt={{ base: px2vw(5), xl: '5px' }}>
                X
              </Text>
            </InputRightElement>
          </InputGroup>
        </Box>
        <IconButton
          {...inc}
          w={{ base: px2vw(40), xl: '40px' }}
          h={{ base: px2vw(40), xl: '40px' }}
          isRound
          color="gray.700"
          aria-label="+"
          size="lg"
          bgColor="purple.300"
          icon={<AddIcon />}
          _hover={{
            opacity: {
              base: 1,
              xl: 0.8,
            },
          }}
          _active={{
            opacity: {
              base: 1,
              xl: 0.8,
            },
          }}
        />
      </Flex>
    </FormControl>
  )
}

export const DebtBox = ({ name, oldData }: { name: string; max: number; oldData?: any }) => {
  const { values } = useFormikContext<any>()
  const [field, , { setValue }] = useField(name)
  // const [showTips, setTips] = useState('')
  const { poolInfo, simulatedOpening } = farmStore()
  const { t } = useTranslation(['farm', 'common'])

  const { onOpen: openDebtModal, Modal: DebtModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => <DebtModal data={data} onClose={onClose} />,
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
        values?.leverage,
        values?.percent
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
    return () => {
      PubSub.unsubscribe('farm-open-debt-modal')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedOpening, poolInfo, values])

  function handleChange(value: number) {
    // 获取借贷的币种数量
    const tokenDebt = calculationTokens(
      values.tokenNum ? values.tokenNum : 0,
      poolInfo?.token0Price,
      poolInfo?.token0Liqudity,
      values.tokenNum1 ? values.tokenNum1 : 0,
      poolInfo?.token1Price,
      poolInfo?.token1Liqudity,
      values?.leverage,
      value
    )
    setValue(value)
    // 模拟开仓
    simulatedOpeningMethod({
      values,
      debtToken0: tokenDebt?.token0Result,
      debtToken1: tokenDebt?.token1Result,
      debt0: ethers.constants.Zero,
      debt1: ethers.constants.Zero,
      lpAmount: poolInfo?.lpAmount,
      lp: poolInfo?.lpInfo,
    })
  }
  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    ;(e.target as any).name = name
    field.onBlur(e)
  }
  const isNotEnough =
    new BigNumber(
      new BigNumber(
        ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
      ).toFixed(4)
    ).gt(new BigNumber(new BigNumber(poolInfo?.token0Liqudity)).toFixed(4)) ||
    new BigNumber(
      new BigNumber(
        ethers.utils.formatUnits(simulatedOpening?.debt1, poolInfo.token1Decimal)
      ).toFixed(4)
    ).gt(new BigNumber(new BigNumber(poolInfo?.token1Liqudity)).toFixed(4))
  const SliderMain =
    !new BigNumber(poolInfo?.token0Liqudity).eq(0) &&
    !new BigNumber(poolInfo?.token1Liqudity).eq(0) ? (
      <>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          mt={{ base: px2vw(15), xl: '15px' }}
          mb={{ base: px2vw(10), xl: '10px' }}
        >
          <Flex justifyContent="center" alignItems="center">
            <Image
              src={findIcon(`${values.token}`.toLocaleLowerCase())}
              ignoreFallback
              w={{ base: px2vw(20), xl: '20px' }}
              h={{ base: px2vw(20), xl: '20px' }}
              display="block"
              mr={{ base: px2vw(5), xl: '5px' }}
            />
            <Text>{values.percent}%</Text>
          </Flex>
          {/* <Box flex={1} color="#FE6779" textAlign="center">
            {showTips}
          </Box> */}
          <Flex justifyContent="center" alignItems="center">
            <Text>{100 - values.percent}%</Text>
            <Image
              src={findIcon(`${values.token1}`.toLocaleLowerCase())}
              ignoreFallback
              w={{ base: px2vw(20), xl: '20px' }}
              h={{ base: px2vw(20), xl: '20px' }}
              display="block"
              ml={{ base: px2vw(5), xl: '5px' }}
            />
          </Flex>
        </Flex>
        <Box h={{ base: px2vw(30), xl: '30px' }} marginBlockEnd={{ base: px2vw(20), xl: '20px' }}>
          <Slider {...field} min={0} max={100} step={1} onChange={handleChange} onBlur={handleBlur}>
            <SliderTrack
              bg="#9C90FF"
              borderRadius={{ base: px2vw(15), xl: '15px' }}
              h={{ base: px2vw(30), xl: '30px' }}
            >
              <SliderFilledTrack
                bg="#6C6FB0"
                h={{ base: px2vw(30), xl: '30px' }}
                bgColor="#6C6FB0"
              />
            </SliderTrack>
            <SliderThumb boxSize={{ base: px2vw(30), xl: '30px' }} />
          </Slider>
        </Box>
        {isNotEnough && (
          <Flex
            color="#FE6779"
            justifyContent={'space-between'}
            alignItems={'center'}
            marginBlockEnd={{ base: px2vw(15), xl: '15px' }}
          >
            <Box>
              {new BigNumber(
                new BigNumber(
                  ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
                ).toFixed(4)
              ).gt(new BigNumber(new BigNumber(poolInfo?.token0Liqudity)).toFixed(4))
                ? poolInfo?.token
                : poolInfo?.token1}{' '}
              {t('exceeds its liquidity.')}
            </Box>
            <BaseButton
              text={`${
                new BigNumber(
                  new BigNumber(
                    ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
                  ).toFixed(4)
                ).gt(new BigNumber(new BigNumber(poolInfo?.token0Liqudity)).toFixed(4))
                  ? poolInfo?.token
                  : poolInfo?.token1
              } MAX`}
              height={{ base: px2vw(30), xl: '30px' }}
              width={{ base: px2vw(110), xl: '110px' }}
              onClick={() => {
                const result = calculationMaxToken(
                  values.tokenNum ? values.tokenNum : 0,
                  poolInfo?.token0Price,
                  values.tokenNum1 ? values.tokenNum1 : 0,
                  poolInfo?.token1Price,
                  values?.leverage,
                  new BigNumber(
                    new BigNumber(
                      ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
                    ).toFixed(4)
                  ).gt(new BigNumber(new BigNumber(poolInfo?.token0Liqudity)).toFixed(4))
                    ? 0
                    : 1,
                  poolInfo?.token0Liqudity,
                  poolInfo?.token1Liqudity
                )
                setValue(new BigNumber(result?.newTokenRatio).times(100).toString())
                // 模拟开仓
                simulatedOpeningMethod({
                  values,
                  debtToken0: result?.token0Result,
                  debtToken1: result?.token1Result,
                  debt0: ethers.constants.Zero,
                  debt1: ethers.constants.Zero,
                  lpAmount: poolInfo?.lpAmount,
                  lp: poolInfo?.lpInfo,
                })
              }}
            />
          </Flex>
        )}
      </>
    ) : (
      <>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          mt={{ base: px2vw(15), xl: '15px' }}
          mb={{ base: px2vw(10), xl: '10px' }}
        >
          <Flex justifyContent="center" alignItems="center">
            <Image
              src={findIcon(
                `${
                  values?.tokenNum
                    ? new BigNumber(poolInfo?.token0Liqudity).eq(0)
                      ? values.token1
                      : values.token
                    : new BigNumber(poolInfo?.token1Liqudity).eq(0)
                    ? values.token
                    : values.token1
                }`.toLocaleLowerCase()
              )}
              ignoreFallback
              w={{ base: px2vw(20), xl: '20px' }}
              h={{ base: px2vw(20), xl: '20px' }}
              display="block"
              mr={{ base: px2vw(5), xl: '5px' }}
            />
            <Text>100%</Text>
          </Flex>
        </Flex>
        <Box
          w="full"
          h={{ base: px2vw(30), xl: '30px' }}
          bgColor="#6C6FB0"
          borderRadius={{ base: px2vw(15), xl: '15px' }}
          mb={{ base: px2vw(20), xl: '20px' }}
        />
        {isNotEnough && (
          <Flex
            color="#FE6779"
            justifyContent={'space-between'}
            alignItems={'center'}
            marginBlockEnd={{ base: px2vw(15), xl: '15px' }}
          >
            <Box>
              {new BigNumber(
                new BigNumber(
                  ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
                ).toFixed(4)
              ).gt(new BigNumber(new BigNumber(poolInfo?.token0Liqudity)).toFixed(4))
                ? poolInfo?.token
                : poolInfo?.token1}{' '}
              {t('exceeds its liquidity.')}
            </Box>
            <BaseButton
              text={`${
                new BigNumber(
                  new BigNumber(
                    ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
                  ).toFixed(4)
                ).gt(new BigNumber(new BigNumber(poolInfo?.token0Liqudity)).toFixed(4))
                  ? poolInfo?.token
                  : poolInfo?.token1
              } MAX`}
              height={{ base: px2vw(30), xl: '30px' }}
              width={{ base: px2vw(110), xl: '110px' }}
              onClick={() => {
                const result = calculationMaxToken(
                  values.tokenNum ? values.tokenNum : 0,
                  poolInfo?.token0Price,
                  values.tokenNum1 ? values.tokenNum1 : 0,
                  poolInfo?.token1Price,
                  values?.leverage,
                  new BigNumber(
                    new BigNumber(
                      ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
                    ).toFixed(4)
                  ).gt(new BigNumber(new BigNumber(poolInfo?.token0Liqudity)).toFixed(4))
                    ? 0
                    : 1,
                  poolInfo?.token0Liqudity,
                  poolInfo?.token1Liqudity
                )
                setValue(new BigNumber(result?.newTokenRatio).times(100).toString())
                // 模拟开仓
                simulatedOpeningMethod({
                  values,
                  debtToken0: result?.token0Result,
                  debtToken1: result?.token1Result,
                  debt0: ethers.constants.Zero,
                  debt1: ethers.constants.Zero,
                  lpAmount: poolInfo?.lpAmount,
                  lp: poolInfo?.lpInfo,
                })
              }}
            />
          </Flex>
        )}
      </>
    )

  return (
    <FormControl name={name} label={t('Debt composition ( You will borrow )')}>
      {SliderMain}
      <LabelList
        restList={{
          p: { base: px2vw(10), xl: '10px' },
          borderRadius: { base: px2vw(10), xl: '10px' },
          bgColor: 'gray.100',
        }}
        data={[
          {
            key: 'DebtRatio',
            label: t('debtRatio'),
            value: () => {
              if (oldData) {
                // 获取借贷的币种数量
                const tokenDebt = calculationTokens(
                  values.tokenNum ? values.tokenNum : 0,
                  poolInfo?.token0Price,
                  poolInfo?.token0Liqudity,
                  values.tokenNum1 ? values.tokenNum1 : 0,
                  poolInfo?.token1Price,
                  poolInfo?.token1Liqudity,
                  values?.leverage,
                  values?.percent
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
                  <Text
                    cursor="pointer"
                    onClick={() => {
                      PubSub.publish('farm-open-debt-modal')
                    }}
                  >
                    {new BigNumber(ethers.utils.formatUnits(oldData?.debt.toString(), 18))
                      .div(new BigNumber(ethers.utils.formatUnits(oldData?.health.toString(), 18)))
                      .times(100)
                      .toFixed(2)}
                    % → {res?.ratio}%
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
              } else {
                return (
                  // icons 没有替换
                  <Text
                    cursor="pointer"
                    onClick={() => {
                      PubSub.publish('farm-open-debt-modal')
                    }}
                  >
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
              }
            },
          },
          {
            key: 'Liquidity',
            label: () => {
              return (
                <Text textStyle="12" color={'rgba(170, 185, 222, 0.5)'}>
                  {values.token} {t('Liquidity')}
                </Text>
              )
            },
            value: () => {
              return (
                <Text textStyle="12" color={'rgba(170, 185, 222, 0.5)'}>
                  <NumberTips value={poolInfo?.token0Liqudity} />
                </Text>
              )
            },
          },
          {
            key: 'token',
            label: () => {
              return (
                <TokenImgBox
                  name={values.token}
                  isRed={new BigNumber(
                    new BigNumber(
                      ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
                    ).toFixed(4)
                  ).gt(new BigNumber(new BigNumber(poolInfo?.token0Liqudity)).toFixed(4))}
                />
              )
            },
            value: () => {
              return (
                <Text
                  color={
                    new BigNumber(
                      new BigNumber(
                        ethers.utils.formatUnits(simulatedOpening?.debt0, poolInfo.token0Decimal)
                      ).toFixed(4)
                    ).gt(new BigNumber(new BigNumber(poolInfo?.token0Liqudity)).toFixed(4))
                      ? '#FE6779'
                      : 'inherit'
                  }
                >
                  {oldData ? (
                    <>
                      <NumberTips
                        value={new BigNumber(
                          ethers.utils.formatUnits(oldData?.debt0, oldData.token0Decimal)
                        ).toString()}
                      />{' '}
                      →
                      <NumberTips
                        value={new BigNumber(
                          ethers.utils.formatUnits(
                            simulatedOpening?.debt0,
                            poolInfo?.tokenInfos[0]?.decimals
                          )
                        )
                          .plus(
                            new BigNumber(
                              ethers.utils.formatUnits(oldData?.debt0, oldData.token0Decimal)
                            )
                          )
                          .toString()}
                      />
                    </>
                  ) : (
                    <>
                      <NumberTips
                        value={new BigNumber(
                          ethers.utils.formatUnits(
                            simulatedOpening?.debt0,
                            poolInfo?.tokenInfos[0]?.decimals
                          )
                        ).toString()}
                      />
                    </>
                  )}
                </Text>
              )
            },
          },
          {
            key: 'Liquidity1',
            label: () => {
              return (
                <Text textStyle="12" color={'rgba(170, 185, 222, 0.5)'}>
                  {values.token1} {t('Liquidity')}
                </Text>
              )
            },
            value: () => {
              return (
                <Text textStyle="12" color={'rgba(170, 185, 222, 0.5)'}>
                  <NumberTips value={poolInfo?.token1Liqudity} />
                </Text>
              )
            },
          },
          {
            key: 'token1',
            label: () => {
              return (
                <TokenImgBox
                  name={values.token1}
                  isRed={new BigNumber(
                    new BigNumber(
                      ethers.utils.formatUnits(simulatedOpening?.debt1, poolInfo.token1Decimal)
                    ).toFixed(4)
                  ).gt(new BigNumber(new BigNumber(poolInfo?.token1Liqudity)).toFixed(4))}
                />
              )
            },
            value: () => {
              return (
                <Text
                  color={
                    new BigNumber(
                      new BigNumber(
                        ethers.utils.formatUnits(simulatedOpening?.debt1, poolInfo.token0Decimal)
                      )
                    ).gt(new BigNumber(poolInfo?.token1Liqudity))
                      ? '#FE6779'
                      : 'inherit'
                  }
                >
                  {oldData ? (
                    <>
                      <NumberTips
                        value={new BigNumber(
                          ethers.utils.formatUnits(oldData?.debt1, oldData.token1Decimal)
                        ).toString()}
                      />{' '}
                      →
                      <NumberTips
                        value={new BigNumber(
                          ethers.utils.formatUnits(
                            simulatedOpening?.debt1,
                            poolInfo?.tokenInfos[1]?.decimals
                          )
                        )
                          .plus(
                            new BigNumber(
                              ethers.utils.formatUnits(oldData?.debt1, oldData.token1Decimal)
                            )
                          )
                          .toString()}
                      />
                    </>
                  ) : (
                    <NumberTips
                      value={new BigNumber(
                        ethers.utils.formatUnits(
                          simulatedOpening?.debt1,
                          poolInfo?.tokenInfos[1]?.decimals
                        )
                      ).toString()}
                    />
                  )}
                </Text>
              )
            },
          },
        ]}
      />
      {DebtModalBox}
    </FormControl>
  )
}
const Step = () => {
  const { t } = useTranslation(['farm', 'common'])
  const { values, setFieldValue } = useFormikContext<any>()
  const { poolInfo, simulatedOpening } = farmStore()
  const [maxPercent, setMaxPercent] = useState(100) // 百分比条token0最大百分比
  const [max, setMax] = useState(poolInfo?.farmInfo?.maxLever - 1) // 杠杆最大倍数
  const [nowDebtRatio, setNowDebtRatio] = useState<any>(null)

  const { onOpen: openAPYModal, Modal: APYModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => <APYModal data={data} onClose={onClose} />,
  })
  // 最大杠杆重置
  useEffectOnce(() => {
    setMax(poolInfo?.farmInfo?.maxLever - 1)
    const res = calculationMaxLeverage(values, poolInfo)
    setMax(res?.max as any)
    setFieldValue('leverage', res?.value)
  })

  useEffect(() => {
    PubSub.subscribe('farm-open-apy-modal', () => {
      openAPYModal?.({ ...poolInfo, ...simulatedOpening, addValues: values, oldData: poolInfo })
    })
    return () => {
      PubSub.unsubscribe('farm-open-apy-modal')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedOpening, poolInfo, values])

  // 处理最大百分比
  useEffectOnce(() => {
    // 获取最大可借贷的token0币种数量
    const tokenDebt0 = calculationTokens(
      values.tokenNum ? values.tokenNum : 0,
      poolInfo?.token0Price,
      poolInfo?.token0Liqudity,
      values.tokenNum1 ? values.tokenNum1 : 0,
      poolInfo?.token1Price,
      poolInfo?.token1Liqudity,
      values?.leverage,
      100
    )
    if (new BigNumber(tokenDebt0.token0Result).lte(new BigNumber(poolInfo?.token0Liqudity))) {
      setMaxPercent(100)
      setFieldValue(
        'percent',
        values?.tokenNum && values?.tokenNum1 ? values?.percent : values?.tokenNum ? 100 : 0
      )
    } else {
      // 计算总价值
      const totalPrice = new BigNumber(values.tokenNum ? values.tokenNum : 0)
        .times(new BigNumber(poolInfo?.token0Price))
        .plus(
          new BigNumber(values.tokenNum1 ? values.tokenNum1 : 0).times(
            new BigNumber(poolInfo?.token1Price)
          )
        )
      // 计算总债务
      const totalDebt = new BigNumber(values?.leverage).times(totalPrice)
      // 计算token0的数量乘以token0的价格，再除以总债务，得到百分比
      const result = new BigNumber(
        new BigNumber(poolInfo?.token0Liqudity)
          .times(new BigNumber(poolInfo?.token0Price))
          .div(totalDebt)
          .toNumber()
      )
        .times(100)
        .toFixed(0)
      setMaxPercent(new BigNumber(result).toNumber())
    }
    // 计算最新债务率
    const tokenDebt = calculationTokens(
      values.tokenNum ? values.tokenNum : 0,
      poolInfo?.token0Price,
      poolInfo?.token0Liqudity,
      values.tokenNum1 ? values.tokenNum1 : 0,
      poolInfo?.token1Price,
      poolInfo?.token1Liqudity,
      values?.leverage,
      values?.percent
    )
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
    setNowDebtRatio(res?.ratio)
  })

  return (
    <>
      <YCBox name="YCTL" />
      <LeverageBox
        max={max}
        name="leverage"
        precision={max >= 8 ? 1 : 1}
        step={max >= 8 ? 1 : 0.5}
      />
      <DebtBox name="percent" max={maxPercent} oldData={poolInfo} />
      <LabelList
        restList={{
          p: { base: px2vw(10), xl: '10px' },
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
                ...poolInfo,
                ...simulatedOpening,
                addValues: values,
                oldData: poolInfo,
              })
              const oldApyData = getAPY({
                ...poolInfo,
              })
              return (
                <Text cursor="pointer" onClick={() => PubSub.publish('farm-open-apy-modal')}>
                  <NumberTips value={oldApyData?.APY} isRatio /> →{' '}
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
      {new BigNumber(nowDebtRatio).gte(new BigNumber(poolInfo?.workFactor / 100)) && (
        <Text
          textAlign="center"
          color="red.200"
          textStyle="14"
          my={{ base: px2vw(20), xl: '20px' }}
        >
          {t('debtTips2', { workFactor: poolInfo?.workFactor / 100 })}
        </Text>
      )}
      {APYModalBox}
    </>
  )
}
export default Step
