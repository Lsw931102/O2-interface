// 页面顶部二级菜单

import React, { useState } from 'react'
import { Tabs, TabList, Tab, TabPanels, TabPanel, Image, Flex } from '@chakra-ui/react'
import px2vw from '../../utils/px2vw'

export interface ISubmenu {
  icon?: any
  name: string
  content: React.ReactNode
  onClick?: () => void
}

interface IProps {
  subArr: ISubmenu[]
  defaultIndex?: number
  onChange?: any
}
function Index({ subArr, defaultIndex = 0, ...props }: IProps) {
  const [curIndex, setIndex] = useState<number>(defaultIndex)

  return (
    <Tabs
      display={{ base: 'none', xl: 'initial' }}
      index={curIndex}
      onChange={(index: number) => {
        setIndex(index)
      }}
      {...props}
    >
      <Flex direction="column">
        <TabList maxW="600px" border="none">
          {subArr.map((item: ISubmenu, index) => (
            <Tab
              key={item?.name}
              w="fit-content"
              h="52px"
              p="0 30px"
              color="purple.300"
              fontSize={{ base: px2vw(18), xl: '18px' }}
              fontWeight="500"
              opacity={0.3}
              bg="transparent"
              cursor="pointer"
              _selected={{
                cursor: 'auto',
                width: '140px',
                p: 0,
                opacity: 1,
                bg: 'gray.300',
                borderRadius: '0 0 10px 10px',
              }}
              _focus={{
                boxShadow: 'none',
              }}
              onClick={() => item?.onClick?.()}
            >
              {curIndex === index && item?.icon ? (
                <Image ignoreFallback src={item?.icon} w="24px" h="24px" mr="5px" />
              ) : null}
              {item?.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels p="0">
          {subArr.map((item: ISubmenu) => (
            <TabPanel key={`panel${item?.name}`} p="0">
              {item?.content}
            </TabPanel>
          ))}
        </TabPanels>
      </Flex>
    </Tabs>
  )
}

export default React.memo(Index)
