import React, { useMemo } from 'react'
import { Flex, Image, Box } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Trans } from 'next-i18next'
import logo from '@/assets/images/logo.png'
import { IRoute, ROUTES } from '@/consts/routes'
import { crossNet, NetEnum } from '@/consts'
import globalStore from '@/stores/global'
import Link from '../Link'

function Index() {
  const router = useRouter()
  const { connectNet } = globalStore()

  const routes = useMemo(() => {
    return crossNet?.includes(connectNet as NetEnum)
      ? ROUTES.filter((it) => it?.isShow)
      : ROUTES.filter((it) => it?.isShow).filter((it) => it?.path !== '/cross')
  }, [connectNet])
  return (
    <Flex
      display={{ base: 'none', xl: 'flex' }}
      pos="relative"
      zIndex={11}
      alignItems="center"
      h="120px"
    >
      <Flex alignItems="center">
        <Link href="/" w="40px" h="40px">
          <Image ignoreFallback src={logo} w="40px" h="40px" />
        </Link>
        {routes.map((item: IRoute) => (
          <Box
            key={item?.name}
            ml="30px"
            color={router.pathname === item?.path ? 'white' : 'grey.50'}
            textStyle="16"
            fontWeight="400"
            _hover={{
              color: 'white',
            }}
            cursor="pointer"
            onClick={() =>
              item?.link ? window.open(item?.link, '_blank') : router.push(item.path)
            }
          >
            <Trans>{item?.name}</Trans>
          </Box>
        ))}
      </Flex>
    </Flex>
  )
}

export default React.memo(Index)
