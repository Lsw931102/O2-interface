import React, { useMemo } from 'react'
import { Box, HStack, Text, BoxProps, Image, TextProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import NumberTips from '@/components/NumberTips'

import healthArrow from '@/assets/images/svg/healthArrow.svg'
import globalStore from '@/stores/global'
import { NetEnum } from '@/consts'
import { netconfigs } from '@/consts/network'

export interface HealthProps {
  value: number //进度条的值
  rotate?: boolean //是否旋转
  width?: BoxProps['width'] //宽度
  showLabel?: boolean //是否展示label的值
  showValue?: boolean //展示中间的值
  textStype?: TextProps //双边文字的样式
}

const initInfo = {
  left: 'Riskier',
  right: 'Safer',
}

function Index({
  width = '100%',
  value,
  rotate = false,
  showLabel = false,
  showValue = false,
  textStype,
}: HealthProps) {
  const { connectNet } = globalStore()
  const info = useMemo(() => {
    const cloneInfo = { ...initInfo }
    if (rotate) {
      const t = cloneInfo.right
      cloneInfo.right = cloneInfo.left
      cloneInfo.left = t
    }
    return cloneInfo
  }, [rotate])

  const valueMemo = useMemo(() => {
    if (!connectNet) return 0
    if (value > 200) {
      return 100
    } else if (value < (netconfigs[connectNet as NetEnum] as any).clearPercentage * 100) {
      return 0
    } else {
      return value - (netconfigs[connectNet as NetEnum] as any).clearPercentage * 100
    }
  }, [connectNet, value])

  return (
    <HStack spacing={{ base: px2vw(8), xl: '8px' }}>
      <Text display={showLabel ? 'inherit' : 'none'} color="silver.100" {...textStype}>
        {info.left}
      </Text>
      <Box width="100%">
        <Text
          display={showValue ? 'inherit' : 'none'}
          textStyle="20"
          bgGradient="linear(to-r, #FF3E3E, #00F58E)"
          bgClip="text"
          textAlign="center"
        >
          <NumberTips
            showTrue
            toolTipProps={{ isDisabled: false }}
            value={value / 100}
            isRatio={true}
          />
        </Text>
        <Box position="relative" height={{ base: px2vw(10), xl: '10px' }} width={width}>
          {/* 背景 */}
          <Box
            height="100%"
            width="100%"
            transform={rotate ? 'rotate(180deg)' : 'inherit'}
            bgGradient="linear-gradient(90deg, rgba(255, 62, 62, 0.3) 0%, rgba(0, 245, 142, 0.3) 100%)"
          />
          {/* 中间指针 */}
          <Image
            position="absolute"
            top="0"
            height={{ base: px2vw(10), xl: '10px' }}
            left={{ base: `calc(${valueMemo}% - ${px2vw(6)})`, xl: `calc(${valueMemo}% - 6px)` }}
            src={healthArrow}
            ignoreFallback
          />
        </Box>
      </Box>
      {showLabel && (
        <Text color="silver.100" {...textStype}>
          {info.right}
        </Text>
      )}
    </HStack>
  )
}
export default React.memo(Index)
