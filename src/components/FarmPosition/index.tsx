import React, { useEffect, useState } from 'react'
import { Box, HStack, VStack, Text, Image, Flex } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'

import Table from '@/components/Table'
import px2vw from '@/utils/px2vw'
import { findIcon, getAPY } from '@/utils/common'
import BaseButton from '@/components/BaseButton'
import wrench from '@/assets/images/svg/wrench.svg'
import tractorImg from '@/assets/images/svg/tractor2.svg'
import type { ColumnItem } from '@/components/Table/type'
import { Trans } from 'react-i18next'
import { getOrderList } from '@/apis/v2'
import useSWR from 'swr'
import globalStore from '@/stores/global'
import { netconfigs } from '@/consts/network'
import { NetEnum } from '@/consts'
import farmStore from '@/stores/contract/farm'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import NumberTips from '../NumberTips'
import fluxReportStore from '@/stores/contract/fluxReport'
import marketsStore from '@/stores/contract/markets'
import connectIc from '@/assets/images/connect.png'
import Modal from '@/components/Modal'
import { useToggle } from 'react-use'
import ConnectWallet from '@/components/ConnectWallet'
import ConnectWalletH5 from '@/components/ConnectWallet/mobile'

export interface IProps {
  isFetch?: boolean
  closeFetch?: () => void
}

export const RenderFarmEmpty = () => {
  const { isLogin, isPC } = globalStore()
  const [connectVisible, setConnectVisible] = useToggle(false)
  const [connectVisibleH5, setConnectVisibleH5] = useToggle(false)

  const { t } = useTranslation('farm')
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      py={{ base: px2vw(60), xl: '60px' }}
    >
      <Image
        ignoreFallback
        src={tractorImg}
        w={{ base: px2vw(140), xl: '140px' }}
        h={{ base: px2vw(120), xl: '120px' }}
        mb={{ base: px2vw(40), xl: '40px' }}
      />
      <Trans>
        {isLogin ? (
          t('No positions yet')
        ) : (
          <Flex cursor="pointer" onClick={isPC ? setConnectVisible : setConnectVisibleH5}>
            <Image ignoreFallback src={connectIc} w="14px" h="14px" mr="5px" />
            <Text color="red.200" textStyle="14">
              {t('Connect Wallet')}
            </Text>
          </Flex>
        )}
      </Trans>
      <Modal
        isOpen={connectVisible}
        hasBg={false}
        width={375}
        padding={0}
        onClose={() => setConnectVisible(false)}
      >
        <ConnectWallet onClose={() => setConnectVisible(false)} />
      </Modal>
      <ConnectWalletH5 isOpen={connectVisibleH5} onClose={() => setConnectVisibleH5(false)} />
    </Flex>
  )
}

function Index({ isFetch, closeFetch }: IProps) {
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { connectNet, userAddress } = globalStore()
  const { getOrderInfos, orderInfoList, workerList, poolList } = farmStore()
  const { getLoanPoolReport, bankList } = fluxReportStore()
  const { marketList } = marketsStore()
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
      if (
        getOrderListData &&
        getOrderListData.code === 200 &&
        workerList &&
        workerList?.all?.length > 0 &&
        poolList &&
        poolList.length > 0
      ) {
        getOrderInfos(getOrderListData?.data, workerList.all)
        closeFetch?.()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getOrderListData, workerList, poolList]
  )

  // 获取数据
  useEffect(
    () => {
      const timer = setTimeout(() => {
        if (orderInfoList && orderInfoList.length > 0) {
          const arr = orderInfoList.map((item: any) => {
            return {
              ...item,
              id: Number(item?.orderId), // id 对应Table的rowKey
              position: '1',
              apy: '1',
              debtRatio: !item?.health.eq(0)
                ? new BigNumber(
                    ethers.utils.formatUnits(item?.debt.toString(), item?.tokenInfos[0]?.decimals)
                  )
                    .div(
                      new BigNumber(
                        ethers.utils.formatUnits(
                          item?.health.toString(),
                          item?.tokenInfos[0]?.decimals
                        )
                      )
                    )
                    .toFixed(4)
                : 0,
              token: item?.currency?.split('-')[0],
              token1: item?.currency?.split('-')[1],
              defi: item?.defi,
              // betterToken,
              bankTokenInfo0: bankList.find(
                (ite) => item?.tokenInfos[0]?.token === ite?.underlying
              ),
              bankTokenInfo1: bankList.find(
                (ite) => item?.tokenInfos[1]?.token === ite?.underlying
              ),
            }
          })
          const list = arr.sort((before: any, after: any) => {
            return Number(after?.orderId) - Number(before?.orderId)
          })
          setData(list)
          setLoading(false)
        } else {
          setData([])
          setLoading(false)
        }
      }, 1000)
      return () => {
        clearTimeout(timer)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderInfoList]
  )

  const { t } = useTranslation('farm')

  const columns: ColumnItem[] = [
    {
      title: t('position'),
      dataIndex: 'position',
      renderTitle: () => null,
      render: (_keyData, record) => {
        return (
          <Flex justifyContent="center" alignItems="center">
            <VStack spacing={{ base: px2vw(3), xl: '3px' }} mr={{ base: px2vw(5), xl: '5px' }}>
              <Box position="relative" width={{ base: px2vw(35), xl: '35px' }} h="max-content">
                <Image
                  position="relative"
                  zIndex="2"
                  ignoreFallback
                  src={findIcon(`${record.token}`.toLocaleLowerCase())}
                  w={{ base: px2vw(20), xl: '20px' }}
                  h={{ base: px2vw(20), xl: '20px' }}
                  borderRadius="round"
                />
                <Image
                  position="absolute"
                  zIndex="1"
                  ignoreFallback
                  src={findIcon(`${record.token1}`.toLocaleLowerCase())}
                  top="0"
                  left={{ base: px2vw(15), xl: '15px' }}
                  w={{ base: px2vw(20), xl: '20px' }}
                  h={{ base: px2vw(20), xl: '20px' }}
                  borderRadius="round"
                />
              </Box>
              <Text textStyle="12">#{record?.id}</Text>
            </VStack>
            <VStack spacing="0" alignItems="start">
              <Text textStyle="12">{record.defi || '--'}</Text>
              <Text textStyle="14">
                {`${record.token}`.toLocaleUpperCase()}-{`${record.token1}`.toLocaleUpperCase()}
              </Text>
            </VStack>
          </Flex>
        )
      },
    },
    {
      title: t('APY'),
      dataIndex: 'apy',
      render: (_keyData, record) => {
        return (
          <Text textStyle="14" color="green.100">
            {getAPY(record)?.APY && getAPY(record)?.APY !== 'NaN' ? (
              <NumberTips value={getAPY(record)?.APY} isRatio />
            ) : (
              '--'
            )}
          </Text>
        )
      },
    },
    {
      title: t('debtRatio'),
      dataIndex: 'debtRatio',
      align: 'left',
      render: (_keyData, record) => {
        // TODO: Table组件待优化
        return (
          <HStack spacing={{ base: px2vw(20), xl: '20px' }} className="ellipsis">
            <Text textStyle="14">
              {record.debtRatio ? (
                <NumberTips value={record.debtRatio} shortNum={2} isRatio />
              ) : (
                '--'
              )}
            </Text>
            <BaseButton
              h={{ base: px2vw(20), xl: '20px' }}
              minW={{ base: px2vw(20), xl: '20px' }}
              isCircular
              specialIcon={<Image src={wrench} ignoreFallback />}
              onClick={() => router.push('/dashboard/my-farm')}
            />
          </HStack>
        )
      },
    },
  ]

  return (
    <Box
      width={{ base: '100%', xl: '405px' }}
      p={{ base: `${px2vw(15)} ${px2vw(10)}`, xl: '25px 20px' }}
      backgroundColor="gray.100"
      borderRadius={{ base: 'inherit', xl: 'xl' }}
    >
      <Text
        textStyle="18"
        textAlign={{ base: 'center', xl: 'inherit' }}
        mb={{ base: px2vw(30), xl: '30px' }}
      >
        {t('myActivePositions')}
      </Text>
      {data && data.length > 0 ? (
        <Table
          rowKey="id"
          align="center"
          columns={columns}
          loading={loading}
          dataSource={data}
          // renderEmpty={RenderFarmEmpty}
        />
      ) : (
        <RenderFarmEmpty />
      )}
    </Box>
  )
}
export default Index
