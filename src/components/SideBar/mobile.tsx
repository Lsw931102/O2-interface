import React, { useMemo } from 'react'
import { Flex, Image, Text, Box } from '@chakra-ui/react'
import { Trans } from 'next-i18next'
import { useRouter } from 'next/router'
import px2vw from '@/utils/px2vw'
import DrawerBox from '../DrawerBox'
import { IRoute, ROUTES } from '@/consts/routes'
import { crossNet, NetEnum } from '@/consts'
import globalStore from '@/stores/global'

interface IProps {
  isOpen: boolean
  onClose: () => void
}
function Index({ isOpen, onClose }: IProps) {
  const router = useRouter()
  const { connectNet } = globalStore()

  const routes = useMemo(() => {
    return crossNet?.includes(connectNet as NetEnum)
      ? ROUTES.filter((it) => it?.isShow)
      : ROUTES.filter((it) => it?.isShow).filter((it) => it?.path !== '/cross')
  }, [connectNet])

  return (
    <DrawerBox isOpen={isOpen} onClose={onClose}>
      <Flex
        pos="relative"
        mt={px2vw(-13)}
        p={`${px2vw(24)} ${px2vw(25)}`}
        bg="bg"
        borderRadius="0 0 16px 16px"
      >
        <Flex flexWrap="wrap">
          {routes.map((item: IRoute) => (
            <Box
              key={item?.name}
              w="50%"
              mt={px2vw(26)}
              onClick={() => {
                onClose()
                item?.link ? window.open(item?.link, '_blank') : router.push(item.path)
              }}
            >
              <Flex alignItems="center">
                <Image ignoreFallback w={px2vw(24)} h={px2vw(24)} mr={px2vw(10)} src={item?.icon} />
                <Text textStyle="14">
                  <Trans>{item?.name}</Trans>
                </Text>
              </Flex>
            </Box>
          ))}
        </Flex>
        {/* <Text
          pos="absolute"
          bottom="0"
          left={px2vw(120)}
          w={px2vw(135)}
          h={px2vw(44)}
          textStyle="12"
          lineHeight={px2vw(44)}
          fontWeight="bold"
          textAlign="center"
          bg="gray.300"
          borderRadius="16px 16px 0 0"
          onClick={() => window.open('https://v1.flux.01.finance/', '_blank')}
        >
          <Trans>{'Use Old'}</Trans>&nbsp;<Trans>{'Version'}</Trans>
        </Text> */}
      </Flex>
    </DrawerBox>
  )
}

export default React.memo(Index)
