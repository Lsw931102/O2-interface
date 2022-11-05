import { Box, Tabs, Tab, TabPanels, TabPanel, Stack } from '@chakra-ui/react'
import { Trans } from 'next-i18next'

import px2vw from '@/utils/px2vw'

const tabPanelStyles = {
  p: '0',
  py: { base: px2vw(16), xl: '16px' },
}

const tabStyles = {
  minW: { base: px2vw(72), xl: '132px' },
  p: { base: `${px2vw(8)} ${px2vw(14)}`, xl: '8px 14px' },
  color: 'white',
  textStyle: '14',
  bg: 'gray.200',
  opacity: '0.7',
  cursor: 'pointer',
  borderRadius: 'select',
  _checked: {
    bg: 'gray.400',
    opacity: 1,
  },
  _selected: {
    color: 'white',
    bg: 'gray.400',
    opacity: 1,
  },
}

const ListTab = ({ tabOptions, tabsChange }: { tabOptions: any; tabsChange?: any }) => {
  return (
    <Tabs
      variant="soft-rounded"
      colorScheme="gray"
      isLazy
      onChange={(index: number) => {
        tabsChange(index)
      }}
    >
      <Box
        overflowX="auto"
        __css={{
          '::-webkit-scrollbar': {
            height: '0',
          },
          scrollbarWidth: 'none',
        }}
      >
        <Stack spacing={{ base: px2vw(25), xl: '30px' }} w="max-content" direction="row">
          {tabOptions.map((item: any) => (
            <Tab key={`tab-${item.key}`} {...tabStyles}>
              <Trans>{item.label}</Trans>
            </Tab>
          ))}
        </Stack>
      </Box>
      <TabPanels>
        {tabOptions.map((item: any) => (
          <TabPanel key={`panel-${item.key}`} {...tabPanelStyles}>
            {item.render ? item.render() : item.tmp}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  )
}

export default ListTab
