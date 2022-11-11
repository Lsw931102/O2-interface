import {
  ModalBody,
  Modal,
  ModalContent,
  ModalOverlay,
  ModalProps,
  Image,
  Center,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import React, { cloneElement, useState } from 'react'

import px2vw from '@/utils/px2vw'
import BaseButton from '@/components/BaseButton'

import buttonCancel from '@/assets/images/svg/buttonCancel.svg'

export interface IModalProps extends ModalProps {
  hasCloseButton?: boolean //是否有叉叉的关闭按钮
  hasTopRightCloseButton?: boolean //是否有右上方的关闭按钮
  footerRender?: () => React.ReactNode
  width?: number //最小宽度
  padding?: number //内边剧
  modalBodyProps?: any
  bg?: string // 背景色
  data?: any
  hasBg?: boolean
  children: any
  // | React.ReactNode
  // | ReactElement<any, string | JSXElementConstructor<any>>
  // | ((props: {
  //     isOpen: boolean
  //     onClose: () => void
  //     data?: any
  //   }) => ReactElement<any, string | JSXElementConstructor<any>>)
}

function Index({
  isOpen,
  data,
  isCentered = true,
  hasCloseButton = false,
  children,
  hasTopRightCloseButton = false,
  width = 375,
  padding = 20,
  onClose,
  footerRender,
  modalBodyProps,
  ...otherModalProps
}: IModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered={isCentered} {...otherModalProps}>
      <ModalOverlay />
      <ModalContent
        // width={{ base: '98vw', xl: 'inherit' }}
        position="relative"
        // maxWidth={{ base: 'inherit', xl: 'inintal' }}
        marginTop={{ base: 'inherit', lg: px2vw(260), xl: 'inherit' }}
        background="grey.600"
        borderRadius="xl"
        w={{ base: '98vw', xl: width }}
        minW={{ base: '98vw', xl: width }}
        maxW={{ base: '98vw', xl: width }}
        maxH="100vh"
      >
        <ModalBody
          minHeight={{ base: px2vw(200), xl: '200px' }}
          padding={{ base: px2vw(padding), xl: `${padding}px` }}
          {...modalBodyProps}
        >
          {hasTopRightCloseButton && <ModalCloseButton />}
          {/* function 的时候性能要高一点 */}
          {typeof children === 'function'
            ? children({
                isOpen,
                onClose,
                data,
              })
            : children
            ? React.Children.map(children, (child) =>
                child
                  ? cloneElement(child, {
                      isOpen,
                      onClose,
                      data,
                    })
                  : child
              )
            : children}
          {footerRender
            ? footerRender()
            : hasCloseButton && (
                <Center>
                  <BaseButton
                    needVerify={false}
                    buttonClick={onClose}
                    h={{ base: px2vw(46), xl: '46px' }}
                    w={{ base: px2vw(46), xl: '46px' }}
                    minW="initial"
                    bg="grey.660"
                    borderRadius="llg"
                    margin={{ base: `${px2vw(40)} auto 0`, xl: '40px auto 0' }}
                    // isCircular
                    specialIcon={
                      <Image
                        height={{ base: px2vw(22), xl: '22px' }}
                        width={{ base: px2vw(22), xl: '22px' }}
                        maxWidth="inherit"
                        src={buttonCancel}
                        ignoreFallback
                      />
                    }
                  />
                </Center>
              )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
export default Index

// TODO: 暂时没有做渲染优化
export const useModal = (opts: any) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [data, setData] = useState<any>()

  const ThisModal = <Index data={data} {...opts} isOpen={isOpen} onClose={onClose} />

  return {
    isOpen,
    onOpen: (v?: any) => {
      setData(v)
      setTimeout(() => {
        onOpen?.()
      }, 100)
    },
    onClose,
    Modal: ThisModal,
  }
}
