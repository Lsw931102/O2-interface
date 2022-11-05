// 移动端抽屉弹出层
import React from 'react'
import { Drawer, DrawerOverlay, DrawerContent, DrawerProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'

interface IProps extends DrawerProps {
  isOpen: boolean
  onClose: () => void
}
const Index: React.FC<IProps> = ({ isOpen, onClose, ...props }) => {
  return (
    <Drawer isOpen={isOpen} placement="top" onClose={onClose}>
      <DrawerOverlay mt={px2vw(46)} bg="gray.700" />
      <DrawerContent mt={px2vw(46)} bg="transparent" borderRadius="0 0 16px 16px">
        {props?.children}
      </DrawerContent>
    </Drawer>
  )
}

export default React.memo(Index)
