import dynamic from 'next/dynamic'
import { Box, Flex, Text, Image, SimpleGrid } from '@chakra-ui/react'
import Link from '@/components/Link'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useModal } from '@/components/Modal'
import PubSub from 'pubsub-js'

import BaseTooltip from '@/components/BaseTooltip'
import globalStore from '@/stores/global'
import BaseButton from '@/components/BaseButton'
import tractorImg from '@/assets/images/svg/tractor.svg'
import px2vw from '@/utils/px2vw'
import { modalProps, returnWorker } from '@/components/FarmPool'
import DebtModal from '@/components/MyFarm/DebtModal'
import APYModal from '@/components/MyFarm/APYModal'
import farmStore from '@/stores/contract/farm'
import fluxReportStore from '@/stores/contract/fluxReport'
import marketsStore from '@/stores/contract/markets'
import useSWR, { mutate } from 'swr'
import { getOrderList, getPool } from '@/apis/v2'
import { netconfigs } from '@/consts/network'
import { NetEnum } from '@/consts'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/router'
import fluxImg from '@/assets/images/svg/claimFlux.svg'
import { useTranslation } from 'next-i18next'
import DashboardNotConnect from '@/components/DashboardNotConnect'
import { useToggle } from 'react-use'

const DesktopMain = dynamic(() => import('./DesktopMain'), {
  ssr: false,
})
const MobileMain = dynamic(() => import('./MobileMain'), {
  ssr: false,
})

export const NoBox = () => {
  const router = useRouter()
  const { t } = useTranslation('farm')
  return (
    <Flex
      direction={{ base: 'column', xl: 'row' }}
      alignItems="center"
      justifyContent="center"
      mt={{ base: px2vw(44), xl: '140px' }}
      mb={{ base: px2vw(60), xl: '100px' }}
    >
      <Image
        ignoreFallback
        src={tractorImg}
        w={{ base: px2vw(234), xl: '234px' }}
        h={{ base: px2vw(200), xl: '200px' }}
        mr={{ xl: '80px' }}
        mb={{ base: px2vw(40), xl: 0 }}
      />
      <Flex justifyContent="center" alignItems="center" direction="column">
        <Text
          fontSize={{ base: px2vw(30), xl: '30px' }}
          lineHeight="1"
          mb={{ base: px2vw(40), xl: '40px' }}
        >
          {t('noPositionsYet')}
        </Text>
        <Link href="/farm">
          <BaseButton
            w={{ base: px2vw(232), xl: '232px' }}
            h={{ base: px2vw(64), xl: '64px' }}
            borderRadius={{ base: px2vw(32), xl: '32px' }}
            text={t('Go Farm Now')}
            textStyle={{
              textStyle: '24',
              color: 'gray.700',
            }}
            onClick={() => router.push('/farm')}
          />
        </Link>
      </Flex>
    </Flex>
  )
}

const NoMain = () => {
  const { t } = useTranslation('farm')

  return (
    <Box mt={{ base: px2vw(20), xl: '0' }} mb={{ base: px2vw(100), xl: '0' }}>
      <SimpleGrid
        display={{ base: 'none', xl: 'flex' }}
        columns={3}
        spacing="70px"
        mt="48px"
        mb="50px"
      >
        <Flex
          w={{ base: 'auto', xl: '360px' }}
          bgColor="gray.100"
          justifyContent="space-between"
          direction="column"
          py="25px"
          h="106px"
          borderRadius="md"
          align="center"
        >
          <Box color="white" textStyle="24" className="ellipsis" maxW="full">
            --
          </Box>
          <Box textStyle="18" className="ellipsis" maxW="full">
            <BaseTooltip isMultiple text={t('totalCollateral')} textStyles={{ textStyle: '18' }}>
              {t('tips113')}
            </BaseTooltip>
          </Box>
        </Flex>
        <Flex
          w={{ base: 'auto', xl: '360px' }}
          bgColor="gray.100"
          justifyContent="space-between"
          direction="column"
          py="25px"
          h="106px"
          borderRadius="md"
          align="center"
        >
          <Box color="white" textStyle="24" className="ellipsis" maxW="full">
            --
          </Box>
          <Box textStyle="18" className="ellipsis" maxW="full" color="#9C90FF">
            <BaseTooltip
              isMultiple
              text={t('totalDebt')}
              textStyles={{ textStyle: '18', color: '#9C90FF' }}
            >
              {t('tips112')}
            </BaseTooltip>
          </Box>
        </Flex>
        <Flex
          w={{ base: 'auto', xl: '360px' }}
          bgColor="gray.100"
          justifyContent="space-between"
          direction="column"
          px="20px"
          py="25px"
          h="106px"
          borderRadius="md"
          align="flex-start"
          pos="relative"
        >
          <Box color="white" textStyle="24" className="ellipsis" maxW="full">
            --
          </Box>
          <Box textStyle="18" className="ellipsis" maxW="full" color="#F5CE81">
            <BaseTooltip
              isMultiple
              text={t('fluxRewards')}
              textStyles={{ textStyle: '18', color: '#F5CE81' }}
            >
              {t('tips111')}
            </BaseTooltip>
          </Box>
          <BaseButton
            pos="absolute"
            right="20px"
            bottom="15px"
            h="30px"
            text={t('claim')}
            bgColor="#F5CE81"
            flexDirection="row-reverse"
            specialIcon={<Image src={fluxImg} ignoreFallback w="16px" h="16px" />}
            specialIconIsLeft
            textStyle={{
              marginLeft: '5px',
              textStyle: '18',
              color: 'gray.700',
            }}
          />
        </Flex>
      </SimpleGrid>
      <SimpleGrid columns={1} spacing={px2vw(15)} display={{ base: 'block', xl: 'none' }}>
        <Box bgColor="gray.100" p={px2vw(20)} borderRadius="md" align="center">
          <Flex justifyContent="space-between" alignItems="center" mb={px2vw(14)}>
            <Box textStyle="14" className="ellipsis" maxW="full">
              <BaseTooltip isMultiple text={t('totalCollateral')} textStyles={{ textStyle: '18' }}>
                {t('tips113')}
              </BaseTooltip>
            </Box>
            <Box color="white" textStyle="14" className="ellipsis" maxW="full">
              --
            </Box>
          </Flex>
          <Flex justifyContent="space-between" alignItems="center">
            <Box textStyle="14" className="ellipsis" maxW="full" color="#9C90FF">
              <BaseTooltip
                isMultiple
                text={t('totalDebt')}
                textStyles={{ textStyle: '18', color: '#9C90FF' }}
              >
                {t('tips112')}
              </BaseTooltip>
            </Box>
            <Box color="white" textStyle="14" className="ellipsis" maxW="full">
              --
            </Box>
          </Flex>
        </Box>
        <Flex
          bgColor="gray.100"
          direction="column"
          px={px2vw(20)}
          py={px2vw(20)}
          h={px2vw(98)}
          borderRadius="md"
          align="flex-start"
          pos="relative"
        >
          <Box color="white" textStyle="18" className="ellipsis" maxW="full">
            --
          </Box>
          <Box textStyle="14" className="ellipsis" maxW="full" color="#F5CE81" mt={px2vw(10)}>
            <BaseTooltip
              isMultiple
              text={t('fluxRewards')}
              textStyles={{ textStyle: '18', color: '#F5CE81' }}
            >
              {t('tips111')}
            </BaseTooltip>
          </Box>
          <BaseButton
            pos="absolute"
            right={px2vw(20)}
            bottom={px2vw(20)}
            h={px2vw(30)}
            text={t('claim')}
            bgColor="#F5CE81"
            flexDirection="row-reverse"
            specialIcon={<Image src={fluxImg} ignoreFallback w={px2vw(18)} h={px2vw(16)} />}
            specialIconIsLeft
            textStyle={{
              marginLeft: px2vw(5),
              textStyle: '18',
              color: 'gray.700',
            }}
            // onClick={() => onOpenFn(record)}
          />
        </Flex>
      </SimpleGrid>
      <NoBox />
    </Box>
  )
}

// 列表对比，返回Token
export const returnToken = (record: any) => {
  const { bankList } = fluxReportStore.getState()
  const tokenOne = bankList.find(
    (item) =>
      String(item?.symbol).toLocaleLowerCase() ===
      String(record?.farms[0]?.baseTokenSymbol).toLocaleLowerCase()
  )
  const tokenTwo = bankList.find(
    (item) =>
      String(item?.symbol).toLocaleLowerCase() ===
      String(record?.farms[1]?.baseTokenSymbol).toLocaleLowerCase()
  )
  if (tokenOne && tokenTwo) {
    const tokenOneValue = new BigNumber(tokenOne?.borrowInterestPreDay)
      .times(365)
      .minus(new BigNumber(tokenOne?.borrowFluxAPY))
    const tokenTwoValue = new BigNumber(tokenTwo?.borrowInterestPreDay)
      .times(365)
      .minus(new BigNumber(tokenTwo?.borrowFluxAPY))
    return new BigNumber(tokenOneValue).comparedTo(tokenTwoValue) === -1
      ? { result: tokenOne, index: 0 }
      : { result: tokenTwo, index: 1 }
  } else if (tokenOne) {
    return {
      result: tokenOne,
      index: 0,
    }
  } else {
    return {
      result: tokenTwo,
      index: 1,
    }
  }
}
const MyFarm = () => {
  const { t } = useTranslation('farm')
  const { isPC, isLogin } = globalStore()
  const [isFetch, setFetch] = useToggle(false) // 阻止默认的第一次请求，又用户地址决定是否允许请求
  const [data, setData] = useState<any[]>([])
  const { getOrderInfos, orderInfoList, workerList } = farmStore()
  const { connectNet, userAddress } = globalStore()
  const { getLoanPoolReport, bankList } = fluxReportStore()
  const { marketList } = marketsStore()
  const [totalData, setTotalData] = useState({
    positions: [{}, {}],
    tc: {
      title: t('totalCollateral'),
      value: '--',
    },
    tb: {
      title: t('totalDebt'),
      value: '--',
    },
    reward: {
      title: t('fluxRewards'),
      value: '--',
    },
  })

  // 获取pool列表
  const { data: getPoolData } = useSWR(
    connectNet &&
      netconfigs &&
      netconfigs[connectNet as NetEnum]?.ChainId &&
      bankList &&
      bankList.length > 0
      ? [getPool.key, netconfigs[connectNet as NetEnum]?.ChainId]
      : null,
    (_, chainId) =>
      getPool.fetcher({
        chainId: chainId,
      }),
    { revalidateOnFocus: false }
  )

  // 获取orderIdList
  const { data: getOrderListData } = useSWR(
    connectNet && netconfigs && netconfigs[connectNet as NetEnum]?.ChainId && userAddress && isFetch
      ? [getOrderList.key, netconfigs[connectNet as NetEnum]?.ChainId, userAddress]
      : null,
    (_, chainId, userAddress) =>
      getOrderList.fetcher({
        chainId: chainId,
        userAddress: userAddress,
      }),
    { revalidateOnFocus: false }
  )

  const getNewData = () => {
    if (orderInfoList && orderInfoList.length > 0 && bankList && bankList.length > 0) {
      const arr = orderInfoList.map((item: any) => {
        return {
          ...item,
          id: Number(item?.orderId), // id 对应Table的rowKey
          orderId: Number(item?.orderId), // id 对应Table的rowKey
          position: '1',
          apy: '',
          debtRatio: new BigNumber(ethers.utils.formatUnits(item?.debt.toString(), 18))
            .div(new BigNumber(ethers.utils.formatUnits(item?.health.toString(), 18)))
            .toString(),
          token: item?.currency.split('-')[0],
          token1: item?.currency.split('-')[1],
          token0Decimal: item?.tokenInfos[0]?.decimals,
          token1Decimal: item?.tokenInfos[1]?.decimals,
          defi: item?.defi,
          lp: ethers.utils.formatUnits(item?.lpAmount.toString(), 18),
          rewards: ethers.utils.formatUnits(item?.flux0.add(item?.flux1).toString(), 18),
          bankTokenInfo0: bankList.find((ite) => item?.tokenInfos[0]?.token === ite?.underlying),
          bankTokenInfo1: bankList.find((ite) => item?.tokenInfos[1]?.token === ite?.underlying),
        }
      })
      const list = arr.sort((before: any, after: any) => {
        return Number(after?.orderId) - Number(before?.orderId)
      })
      // 获取总债务价值
      const debtPriceList = list.map((item: any) => {
        const debtPrice0 = new BigNumber(
          ethers.utils.formatUnits(item?.debt0, item?.token0Decimal)
        ).times(
          new BigNumber(ethers.utils.formatUnits(item?.tokenInfos[0]?.price, item?.token0Decimal))
        )
        const debtPrice1 = new BigNumber(
          ethers.utils.formatUnits(item?.debt1, item?.token1Decimal)
        ).times(
          new BigNumber(ethers.utils.formatUnits(item?.tokenInfos[1]?.price, item?.token1Decimal))
        )
        return debtPrice0.plus(debtPrice1).toString()
      })
      const totalDebtPrice = debtPriceList.reduce((sum: any, current: any) => {
        return new BigNumber(current).plus(new BigNumber(sum)).toNumber()
      }, 0)
      // 获取总抵押
      const totalCollateral = list.reduce((sum: any, current: any) => {
        return new BigNumber(current?.stake0)
          .times(new BigNumber(ethers.utils.formatUnits(current?.tokenInfos[0]?.price, 18)))
          .plus(
            new BigNumber(current?.stake1).times(
              new BigNumber(ethers.utils.formatUnits(current?.tokenInfos[1]?.price, 18))
            )
          )
          .plus(new BigNumber(sum))
          .toNumber()
      }, 0)
      // 获取Flux数量
      const totalFlux = list.reduce((sum: any, current: any) => {
        return new BigNumber(current?.rewards).plus(new BigNumber(sum)).toNumber()
      }, 0)
      setData(list)
      setTotalData({
        positions: list ? [{}, {}] : [],
        tc: {
          title: t('totalCollateral'),
          value: totalCollateral,
        },
        tb: {
          title: t('totalDebt'),
          value: new BigNumber(totalDebtPrice).toString(),
        },
        reward: {
          title: t('fluxRewards'),
          value: totalFlux,
        },
      })
    } else if (
      getOrderListData &&
      getOrderListData.code === 200 &&
      getOrderListData.data?.length > 0 &&
      workerList &&
      workerList?.all?.length > 0
    ) {
      setTotalData({
        positions: [{}, {}],
        tc: {
          title: t('totalCollateral'),
          value: '--',
        },
        tb: {
          title: t('totalDebt'),
          value: '--',
        },
        reward: {
          title: t('fluxRewards'),
          value: '--',
        },
      })
    } else {
      farmStore.setState({
        orderInfoList: null,
      })
      setTotalData({
        positions: [],
        tc: {
          title: t('totalCollateral'),
          value: '--',
        },
        tb: {
          title: t('totalDebt'),
          value: '--',
        },
        reward: {
          title: t('fluxRewards'),
          value: '--',
        },
      })
    }
  }

  useEffect(
    () => {
      setFetch(true)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userAddress]
  )

  useEffect(
    () => {
      if (isFetch) {
        mutate([getOrderList.key, netconfigs[connectNet as NetEnum]?.ChainId, userAddress])
        farmStore.setState({
          orderInfoList: null,
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFetch]
  )

  // 获取资产列表
  useEffect(() => {
    if (marketList && marketList?.length) {
      if (!bankList.length) {
        getLoanPoolReport()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketList])

  useEffect(
    () => {
      if (getPoolData && getPoolData.code === 200) {
        const list = Object.keys(getPoolData?.data)
        const workerList: any = {}
        list.map((item: any) => {
          workerList[item] = getPoolData?.data[item].map((ite: any) => returnWorker(ite))
        })
        farmStore.setState({
          workerList: workerList,
        })
        editData('all', getPoolData?.data)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getPoolData]
  )
  const editData = useCallback(
    (tab: string, arr: any[]) => {
      // 返回展示的Token
      const list = arr[tab as any].map((item: any) => {
        const betterToken = returnToken(item)
        return {
          ...item,
          id: item?.address,
          token: item?.currency.split('-')[0],
          token1: item?.currency.split('-')[1],
          tokenAddress: item?.token0,
          token1Address: item?.token1,
          apy: new BigNumber(item?.apr).div(365).plus(1).pow(365).minus(1).toString(),
          defiApy: new BigNumber(item?.apr)
            .plus(new BigNumber(item?.feeAPR))
            .div(365)
            .plus(1)
            .pow(365)
            .minus(1)
            .toString(),
          defiApr: new BigNumber(item?.apr)
            .plus(new BigNumber(item?.feeAPR))
            .times(item?.farms?.[0]?.maxLever),
          betterToken,
          bankTokenInfo0: bankList.find((ite) => item?.token0 === ite?.underlying),
          bankTokenInfo1: bankList.find((ite) => item?.token1 === ite?.underlying),
          borrowInterestPreDay: betterToken?.result?.borrowInterestPreDay, // Borrow APY
          borrowFluxAPY: betterToken?.result?.borrowFluxAPY, // Flux Reward APR
          FluxAPR: new BigNumber(betterToken?.result?.borrowFluxAPY)
            .times(new BigNumber(item?.farms[betterToken?.index as number]?.maxLever).minus(1))
            .toString(),
          BorrowAPY: new BigNumber(betterToken?.result?.borrowInterestPreDay)
            .times(365)
            .times(new BigNumber(item?.farms[betterToken?.index as number]?.maxLever).minus(1))
            .toString(),
        }
      })
      setData(list)
      farmStore.setState({
        poolList: list,
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bankList]
  )

  useEffect(
    () => {
      getOrders()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getOrderListData, workerList]
  )

  // 获取数据
  useEffect(
    () => {
      getNewData()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bankList, orderInfoList, getOrderListData]
  )
  // 获取合约返回的仓位数据以及顶部数据
  const getOrders = () => {
    if (
      getOrderListData &&
      getOrderListData.code === 200 &&
      getOrderListData.data?.length > 0 &&
      workerList &&
      workerList?.all?.length > 0
    ) {
      getOrderInfos(getOrderListData?.data, workerList.all)
    }
  }

  const { onOpen: openDebtModal, Modal: DebtModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => <DebtModal data={data} onClose={onClose} />,
  })
  const { onOpen: openAPYModal, Modal: APYModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => <APYModal data={data} onClose={onClose} />,
  })

  useEffect(() => {
    PubSub.subscribe('my-farm-open-debt-modal', (_name, data) => {
      openDebtModal?.({
        ...data,
        token0Price: ethers.utils.formatUnits(data?.tokenInfos[0].price, 18),
        token1Price: ethers.utils.formatUnits(data?.tokenInfos[1].price, 18),
      })
    })
    PubSub.subscribe('my-farm-open-apy-modal', (_name, data) => {
      openAPYModal?.(data)
    })
    return () => {
      PubSub.unsubscribe('my-farm-open-debt-modal')
      PubSub.unsubscribe('my-farm-open-apy-modal')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const Main = useMemo(() => {
    return isPC ? DesktopMain : MobileMain
  }, [isPC])
  if (!isLogin) {
    return <DashboardNotConnect />
  }
  if (data && data.length > 0 && orderInfoList) {
    return (
      <>
        <Main
          data={totalData}
          list={data}
          afterClose={() => {
            mutate([getOrderList.key, netconfigs[connectNet as NetEnum]?.ChainId, userAddress])
            getOrders()
          }}
          tabChange={(index: number) => {
            if (index === 0) {
              mutate([getOrderList.key, netconfigs[connectNet as NetEnum]?.ChainId, userAddress])
              getOrders()
            }
          }}
        />
        {DebtModalBox}
        {APYModalBox}
      </>
    )
  }
  return <NoMain />
}

export default MyFarm
