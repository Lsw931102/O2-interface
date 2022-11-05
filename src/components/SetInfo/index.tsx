import React, { useState } from 'react'
import { Stack, Image, Flex } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import DrawerBox from '../DrawerBox'
import Footer from '../Footer'
import Settings from '../Settings'
import settingsIc from '@/assets/images/settings.png'
import infoIc from '@/assets/images/info.png'

interface IProps {
  isOpen: boolean
  onClose: () => void
}
const tabs = [
  { icon: settingsIc, content: <Settings /> },
  { icon: infoIc, content: <Footer /> },
]
function Index({ isOpen, onClose }: IProps) {
  const [curIndex, setIndex] = useState(0)
  return (
    <DrawerBox isOpen={isOpen} onClose={onClose}>
      <>
        <Stack
          display="flex"
          direction="row"
          alignItems="center"
          spacing={px2vw(9)}
          position="absolute"
          top={px2vw(20)}
          right={px2vw(25)}
          zIndex="2"
        >
          {tabs.map((item, index) => (
            <Flex
              key={index}
              alignItems="center"
              justifyContent="center"
              w={px2vw(30)}
              h={px2vw(30)}
              bg={index === curIndex ? 'gray.300' : 'transparent'}
              borderRadius="round"
            >
              <Image
                ignoreFallback
                src={item?.icon}
                w={px2vw(16)}
                h={px2vw(16)}
                onClick={() => setIndex(index)}
              />
            </Flex>
          ))}
        </Stack>
        {tabs[curIndex]?.content}
      </>
    </DrawerBox>
  )
}

export default React.memo(Index)
