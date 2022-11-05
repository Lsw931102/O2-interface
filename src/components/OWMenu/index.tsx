import React from 'react'
import { useRouter } from 'next/router'
import px2vw from '@/utils/px2vw'
import { setStore } from '@/utils/storage'
import DrawerBox from '../DrawerBox'
import BaseButton from '../BaseButton'
import Footer from '../Footer'

interface IProps {
  isOpen: boolean
  onClose: () => void
}
function Index({ isOpen, onClose }: IProps) {
  const router = useRouter()
  return (
    <DrawerBox isOpen={isOpen} onClose={onClose}>
      <>
        <BaseButton
          needVerify={false}
          position="absolute"
          right={px2vw(15)}
          top={px2vw(20)}
          text={router.locale === 'en' ? '中' : 'EN'}
          minW={px2vw(30)}
          w={px2vw(30)}
          h={px2vw(30)}
          p="0 !important"
          my="auto"
          textStyle={{
            color: 'purple.300',
            textStyle: '12',
            fontWeight: '600',
          }}
          bgColor="transparent"
          border="1px solid"
          borderColor="purple.300"
          boxSizing="border-box"
          borderRadius="50%"
          buttonClick={() => {
            router.push(router.pathname, undefined, {
              locale: router.locale === 'en' ? 'zh' : 'en',
            })
            setStore('lang', [router.locale === 'en' ? 'zh' : 'en'])
          }}
        />
        <Footer pt="0" />
      </>
    </DrawerBox>
  )
}

export default React.memo(Index)
