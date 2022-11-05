import { useToggle } from 'react-use'
import { Center } from '@chakra-ui/layout'
import React from 'react'
import px2vw from '@/utils/px2vw'

import BaseButton from '@/components/BaseButton'
import Modal from '@/components/Modal'
import ConnectWallet from '@/components/ConnectWallet'

import dashboardNotConnect from '@/assets/images/dashboardNotConnect.png'

function Index() {
  const [connectVisible, setConnectVisible] = useToggle(false)
  return (
    <>
      <Center
        width="100%"
        height={{ base: px2vw(466), xl: '466px' }}
        backgroundImage={dashboardNotConnect}
        backgroundRepeat="no-repeat"
        backgroundPosition="center"
        backgroundSize="cover"
      >
        <BaseButton
          onClick={setConnectVisible}
          marginTop={{ base: px2vw(300), xl: '300px' }}
          text="Connect Wallet"
        ></BaseButton>
      </Center>
      <Modal
        isOpen={connectVisible}
        hasBg={false}
        width={375}
        padding={0}
        onClose={() => setConnectVisible(false)}
      >
        <ConnectWallet onClose={() => setConnectVisible(false)} />
      </Modal>
    </>
  )
}
export default Index
