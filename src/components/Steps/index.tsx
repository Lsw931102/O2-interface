import React from 'react'
import { Flex, Text, Center, CenterProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'

export interface stepsItem {
  label: string
  value: string | number
}

export interface IProps extends CenterProps {
  stepsList: stepsItem[] // 步骤条数量
  activeStep: string | number // 选中的步骤
  stepStyle?: any // 步骤条样式，不建议修改宽高
  lineStyle?: any // 线条样式，不建议修改宽高
  textStyle?: any // 按钮文案样式
  stepChange?: (value: string | number) => void
  // 如果要修改按钮宽高，则需要传入以下数据
  width?: number // 整体宽高
  allHeight?: number // 整体宽高且为按钮宽、高度
}

function Index({ stepsList, activeStep, stepChange, ...prop }: IProps) {
  return (
    <Flex
      w={
        prop?.width
          ? { base: px2vw(prop?.width), xl: `${prop?.width}px` }
          : { base: px2vw(176), xl: '176px' }
      }
      h={
        prop?.allHeight
          ? { base: px2vw(prop?.allHeight), xl: `${prop?.allHeight}px` }
          : { base: px2vw(18), xl: '18px' }
      }
      justifyContent="space-between"
      {...prop}
    >
      {stepsList.map((item, index) => {
        return (
          <Center
            key={index}
            w={
              prop?.allHeight
                ? { base: px2vw(prop?.allHeight), xl: `${prop?.allHeight}px` }
                : { base: px2vw(18), xl: '18px' }
            }
            h={
              prop?.allHeight
                ? { base: px2vw(prop?.allHeight), xl: `${prop?.allHeight}px` }
                : { base: px2vw(18), xl: '18px' }
            }
            borderRadius="50%"
            border="1px solid"
            borderColor={'purple.300'}
            bgColor={activeStep === item.value ? 'purple.300' : 'transparent'}
            pos="relative"
            cursor="pointer"
            _after={{
              content: index === stepsList.length - 1 ? 'none' : '""',
              w: {
                base: px2vw(
                  ((prop?.width || 176) - (prop?.allHeight || 18) * stepsList.length) /
                    (stepsList.length - 1)
                ),
                xl: `${
                  ((prop?.width || 176) - (prop?.allHeight || 18) * stepsList.length) /
                  (stepsList.length - 1)
                }px`,
              },
              h: { base: px2vw(1), xl: '1px' },
              bgColor: 'purple.300',
              m: 'auto',
              pos: 'absolute',
              top: 0,
              bottom: 0,
              left: prop?.allHeight
                ? { base: px2vw(prop?.allHeight), xl: `${prop?.allHeight}px` }
                : { base: px2vw(18), xl: '18px' },
              ...prop?.lineStyle,
            }}
            onClick={() => stepChange?.(item.value)}
            {...prop?.stepStyle}
          >
            {/* 按钮文案 */}
            <Text
              textStyle="10"
              lineHeight={
                prop?.allHeight
                  ? { base: px2vw(prop?.allHeight), xl: `${prop?.allHeight}px` }
                  : { base: px2vw(18), xl: '18px' }
              }
              color={activeStep === item.value ? 'black.200' : 'purple.300'}
              fontFamily="Montserrat"
              fontWeight="600"
              textAlign="center"
              {...prop?.textStyle}
            >
              {item.label}
            </Text>
          </Center>
        )
      })}
    </Flex>
  )
}

export default React.memo(Index)
