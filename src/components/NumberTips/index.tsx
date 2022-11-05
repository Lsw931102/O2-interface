import React from 'react'
import BigNumber from 'bignumber.js'
import { Tooltip, TooltipProps } from '@chakra-ui/react'
import { numberFormat, formatColRatio, unitNumberFormat } from '@/utils/math'
import globalStore from '@/stores/global'

interface IProps {
  // 值
  value?: string | number
  // 货币符号
  symbol?: string
  // label
  label?: string
  // 是否是百分比
  isRatio?: boolean
  // 是否使用缩写
  isAbbr?: boolean
  // 在使用缩写的前提下是否显示千分符
  isThousand?: boolean
  // 在使用缩写且显示千分符的前提下，保留N位小数，最大为3，默认为2位
  thousandNum?: number
  // 是否完整显示
  showFull?: boolean
  // 百分数显示最大值
  maxNum?: number
  // 大于maxNum%绝对值时是否显示真实值
  showTrue?: boolean
  // 保留的小数的位数,数量保留4位，金额、百分比保留两位
  shortNum?: number
  // ToolTip的属性
  toolTipProps?: Pick<TooltipProps, 'isDisabled'>
}

const NumberTips: React.FC<IProps> = ({
  value = 0,
  symbol = '',
  label = '',
  isRatio = false,
  isAbbr = false,
  isThousand = false,
  thousandNum = 2,
  showFull = false,
  maxNum = 300,
  showTrue = false,
  shortNum = 4,
  toolTipProps,
}) => {
  const { isPC } = globalStore()
  let showValue: any = '0'
  let fullValue = '0'
  if (value && new BigNumber(value) && !isNaN(Number(value))) {
    if (isRatio) {
      if (showFull) {
        showValue = numberFormat(new BigNumber(value).times(100), true, 2) + '%'
      } else {
        showValue = formatColRatio(new BigNumber(value).times(100), showTrue, maxNum)
      }
      fullValue = numberFormat(new BigNumber(value).times(100), true, 2) + '%'
    } else {
      if (isAbbr) {
        if (isThousand) {
          const newStr = unitNumberFormat(value)
          const strStart = newStr.substring(0, newStr.length - 1)
          const strEnd = newStr.substring(newStr.length - 1)
          showValue = `${symbol} ${numberFormat(
            strStart,
            true,
            thousandNum > 3 ? 3 : thousandNum
          )}${strEnd}`
        } else {
          showValue = `${symbol} ${unitNumberFormat(value, shortNum)}`
        }
      } else {
        if (new BigNumber(value).eq(0)) {
          showValue = '0'
        } else {
          if (new BigNumber(Number(value)).gte(0.001) || value < 0) {
            showValue = `${symbol} ${numberFormat(value, true, shortNum)}`
          } else {
            showValue = `< ${symbol} 0.001`
          }
        }
      }
      fullValue = numberFormat(value, true)
    }
  } else {
    if (isRatio) {
      showValue = `0%`
    } else {
      showValue = `${symbol} 0`
    }
  }
  return (
    <>
      {!isPC ? (
        showValue
      ) : (
        <Tooltip
          placement="top"
          label={`${label}${fullValue}`}
          hasArrow
          isDisabled={true}
          {...toolTipProps}
        >
          {showValue}
        </Tooltip>
      )}
    </>
  )
}

export default NumberTips
