import React from 'react'
import { Button, Flex, Text, Image, Center, ButtonProps, Box } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import px2vw from '@/utils/px2vw'
import shutOff from '@/assets/images/svg/shutOff.svg'
import { AddIcon, CloseIcon, MinusIcon, ChevronUpIcon } from '@chakra-ui/icons'
import globalStore from '@/stores/global'
import { isNetRight } from '@/utils/common'

// 按钮类型，close: X，add: +，remove: -，shutOff:类似关机键
type buttonType = 'close' | 'add' | 'remove' | 'shutOff' | 'closeUp'

export interface IProps extends ButtonProps {
  text?: string // 按钮文案
  textStyle?: any // 文本自定义样式
  isCircular?: boolean // 是否为圆形按钮
  needVerify?: boolean // 是否需要验证登陆和网络
  iconBg?: string // icon如果有外层边框圆圈，icon外层边框颜色
  iconBgStyle?: any // icon如果有外层边框圆圈，icon外层边框样式
  buttonType?: buttonType // 按钮如果有icon，则传入icon类型
  iconStyle?: any // 按钮内图标样式
  specialIcon?: any // 如果有特殊的icon，可以直接传入
  specialIconIsLeft?: boolean // 特殊icon是否在文案左侧
  buttonClick?: () => void
}

function Index({
  text,
  isCircular = false,
  needVerify = true,
  textStyle,
  iconBg,
  iconBgStyle,
  buttonType,
  iconStyle,
  specialIcon,
  specialIconIsLeft,
  buttonClick,
  ...prop
}: IProps) {
  const { t } = useTranslation()
  const { isLogin, isPC } = globalStore()

  // 返回图标
  const returnIcon = () => {
    return buttonType === 'close' ? (
      <CloseIcon
        w={{ base: px2vw(12), xl: '12px' }}
        h={{ base: px2vw(12), xl: '12px' }}
        color="gray.700"
        {...iconStyle}
      />
    ) : buttonType === 'add' ? (
      <AddIcon
        w={{ base: px2vw(12), xl: '12px' }}
        h={{ base: px2vw(12), xl: '12px' }}
        color="gray.700"
        {...iconStyle}
      />
    ) : buttonType === 'remove' ? (
      <MinusIcon
        w={{ base: px2vw(12), xl: '12px' }}
        h={{ base: px2vw(12), xl: '12px' }}
        color="gray.700"
        {...iconStyle}
      />
    ) : buttonType === 'closeUp' ? (
      <ChevronUpIcon
        w={{ base: px2vw(24), xl: '24px' }}
        h={{ base: px2vw(24), xl: '24px' }}
        color="gray.700"
        {...iconStyle}
      />
    ) : (
      <Image
        ignoreFallback
        src={shutOff}
        w={{ base: px2vw(14), xl: '14px' }}
        h={{ base: px2vw(14), xl: '14px' }}
        color="gray.700"
        {...iconStyle}
      />
    )
  }

  // 返回带有边框的图标
  const returnBorderIcon = () => {
    return (
      <Center
        w={{ base: px2vw(24), xl: '24px' }}
        h={{ base: px2vw(24), xl: '24px' }}
        bgColor={iconBg}
        borderRadius="50%"
        my="auto"
        ml={{ base: px2vw(15), xl: '15px' }}
        {...iconBgStyle}
      >
        {returnIcon()}
      </Center>
    )
  }

  const btnClick = () => {
    if (needVerify) {
      let msg = ''
      if (!isLogin) {
        msg = t('ConnetyourWallet')
      } else {
        if (!isNetRight()) {
          msg = t('ConnectRightNet')
        }
      }
      if (msg) {
        toast.warn(msg, {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
          theme: 'colored',
        })
        return
      }
    }
    buttonClick && buttonClick()
  }

  return (
    <Button
      bgColor="purple.300"
      minW={isCircular ? { base: px2vw(24), xl: '24px' } : { base: px2vw(100), xl: '100px' }}
      h={isCircular ? { base: px2vw(24), xl: '24px' } : { base: px2vw(40), xl: '40px' }}
      px={isCircular ? '0' : { base: px2vw(17), xl: '17px' }}
      borderRadius={isCircular ? '50%' : { base: px2vw(20), xl: '20px' }}
      colorScheme="teal"
      loadingText={text}
      // 'pointer'会引起移动端tap下去的时候有一个点击热区显示
      cursor={{ base: 'inherit', xl: 'pointer' }}
      onClick={btnClick}
      _hover={{
        opacity: {
          base: isPC ? 0.4 : 1,
          xl: isPC ? 0.8 : 1,
        },
      }}
      _active={{
        opacity: {
          base: isPC ? 0.4 : 1,
          xl: isPC ? 0.8 : 1,
        },
      }}
      {...prop}
    >
      <Box opacity={'1 !important'}>
        {isCircular ? (
          specialIcon ? (
            specialIcon
          ) : (
            returnIcon()
          )
        ) : (
          <Flex flexDirection="inherit" justifyContent="center">
            <Text
              color="gray.700"
              textStyle="16"
              lineHeight={prop?.h || { base: px2vw(40), xl: '40px' }}
              order={specialIconIsLeft ? 1 : 0}
              {...textStyle}
            >
              {text}
            </Text>
            {specialIcon ? (
              <Center>{specialIcon}</Center>
            ) : (
              buttonType && (iconBg ? returnBorderIcon() : returnIcon())
            )}
          </Flex>
        )}
      </Box>
    </Button>
  )
}

export default React.memo(Index)
