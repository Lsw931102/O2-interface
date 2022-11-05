import React from 'react'
import DrawerBox from '../DrawerBox'
import ConnectWallet from './index'

interface IProps {
  isOpen: boolean
  onClose: () => void
}
function Index({ isOpen, onClose }: IProps) {
  return (
    <DrawerBox isOpen={isOpen} onClose={onClose}>
      <ConnectWallet onClose={onClose} />
    </DrawerBox>
  )
}

export default React.memo(Index)
