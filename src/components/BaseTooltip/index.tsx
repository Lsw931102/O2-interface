import React from 'react'
import {
  Flex,
  Text,
  TextProps,
  TooltipProps,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverBody,
  Box,
} from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
// import { completeUrl } from '@/utils/common'
import globalStore from '@/stores/global'

export interface IProps extends TooltipProps {
  text?: string
  textStyles?: TextProps
  afterText?: TextProps // 感叹号后的文案
  openUrl?: string // FAQ的链接
  iconBefore?: boolean // 感叹号是否在文案前面
  isPureVersion?: boolean // 是否为纯净版，去除关闭按钮、标题、more
  textRender?: React.ReactNode // 自定义组件，传入该值将替代text文案
  textRenderIconStyle?: TextProps // 在textRender存在的情况下，感叹号的样式
  isMultiple?: boolean // 多行
  iconRender?: React.ReactNode // 感叹号的替换按钮
}

function Index({ children, isPureVersion = false, isMultiple, ...prop }: IProps) {
  const { isPC } = globalStore()

  return (
    <Flex
      justifyContent="flex-start"
      alignItems="center"
      onClick={(e) => {
        !isPC && e.stopPropagation()
      }}
    >
      {prop?.textRender ? (
        <Box display={{ base: 'none', xl: 'flex' }}>{prop?.textRender}</Box>
      ) : (
        <Text
          display={{ base: 'none', xl: 'flex' }}
          textStyle="14"
          color="white"
          order={2}
          {...prop?.textStyles}
        >
          {prop?.text}
        </Text>
      )}
      <Box order={prop?.iconBefore ? 1 : 3}>
        <Popover trigger={!isPC ? 'click' : 'hover'}>
          <PopoverTrigger>
            <Flex>
              {prop?.textRender ? (
                <Box display={{ base: 'flex', xl: 'none' }}>{prop?.textRender}</Box>
              ) : (
                <Text
                  display={{ base: 'flex', xl: 'none' }}
                  textStyle="14"
                  color="white"
                  order={2}
                  {...prop?.textStyles}
                >
                  {prop?.text}
                </Text>
              )}
              {prop?.iconRender ? (
                prop?.iconRender
              ) : (
                <Text
                  ml={prop?.iconBefore ? 0 : { base: px2vw(3), xl: '3px' }}
                  mr={{ base: px2vw(3), xl: '3px' }}
                  textStyle="14"
                  color="white"
                  cursor="pointer"
                  order={prop?.iconBefore ? 1 : 3}
                  {...prop?.textStyles}
                  {...prop?.textRenderIconStyle}
                >
                  ⓘ
                </Text>
              )}
            </Flex>
          </PopoverTrigger>
          <PopoverContent
            w={{ base: px2vw(355), xl: '355px' }}
            minH={{ base: px2vw(165), xl: '165px' }}
            p="0"
            bg="bg"
            borderRadius={{ base: px2vw(16), xl: '16px' }}
            border="2px solid"
            borderColor="rgba(149, 164, 181, 0.7)"
            opacity="1"
          >
            <PopoverCloseButton top="20px" right="20px" />
            <PopoverBody
              w="full"
              minH={{ base: px2vw(165), xl: '165px' }}
              px={{ base: px2vw(20), xl: '20px' }}
              py={{ base: px2vw(30), xl: '30px' }}
            >
              <Text
                maxW={{ base: px2vw(270), xl: '270px' }}
                mb={{ base: px2vw(20), xl: '20px' }}
                textStyle="24"
                lineHeight={{ base: px2vw(30), xl: '30px' }}
                overflow="hidden"
                textOverflow="ellipsis"
                display="-webkit-box"
                color="white"
                css={{
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {!isPureVersion && `ⓘ ${prop?.text}`}
              </Text>
              <Box
                mb={{ base: px2vw(20), xl: '20px' }}
                whiteSpace={isMultiple ? 'normal' : 'inherit'}
              >
                {children}
              </Box>
              {/* {!isPureVersion && (
                <Flex
                  justifyContent="flex-end"
                  cursor="pointer"
                  onClick={() => window.open(prop.openUrl || 'https://discuss.01.finance/t/flux')}
                >
                  <Text textStyle="14" color="white" mr={{ base: px2vw(5), xl: '5px' }}>
                    FAQ
                  </Text>
                  <Image
                    src={completeUrl('official-website/share.svg')}
                    w={{ base: px2vw(10), xl: '10px' }}
                    h={{ base: px2vw(10), xl: '10px' }}
                    my="auto"
                  />
                </Flex>
              )} */}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
      <Text order={4} textStyle="14" color="white" {...prop?.afterText} />
    </Flex>
  )
}

export default React.memo(Index)
