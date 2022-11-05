import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Image, VStack, Text, useBoolean } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import getConfig from 'next/config'

import RadioGroup from '@/components/RadioGroup'
import Select from '@/components/Select'
import Table from '@/components/Table'
import BaseButton from '@/components/BaseButton'
import { InfoItem } from '@/components/InfoList'
import px2vw from '@/utils/px2vw'
import { completeUrl, findIcon } from '@/utils/common'
import globalStore from '@/stores/global'
import { useModal } from '@/components/Modal'
import FarmModal from '@/components/FarmModal'
import farmImg from '@/assets/images/svg/farm.svg'
import type { ColumnItem } from '@/components/Table/type'
import { getPool } from '@/apis/v2'
import useSWR from 'swr'
import { netconfigs } from '@/consts/network'
import { NetEnum } from '@/consts'
import farmStore from '@/stores/contract/farm'
import fluxReportStore from '@/stores/contract/fluxReport'
import marketsStore from '@/stores/contract/markets'
import { returnToken } from '../MyFarm'
import AddModal from '../MyFarm/AddModal'
import { ethers } from 'ethers'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

const { publicRuntimeConfig } = getConfig()

export interface IProps {
  afterClose: () => void
}

export const modalProps = {
  scrollBehavior: 'inside',
  modalBodyProps: {
    padding: { base: `${px2vw(15)} ${px2vw(20)}`, xl: `15px 20px` },
  },
}

export const PoolBox = ({ record, reset }: any) => {
  return (
    <Flex justifyContent="flex-start" alignItems="center" w="full" {...reset}>
      <Box
        position="relative"
        width={{ base: px2vw(50), xl: '50px' }}
        h="max-content"
        mr={{ base: px2vw(5), xl: '5px' }}
      >
        <Image
          position="relative"
          zIndex="2"
          ignoreFallback
          src={findIcon(`${record.token}`.toLocaleLowerCase())}
          w={{ base: px2vw(30), xl: '30px' }}
          h={{ base: px2vw(30), xl: '30px' }}
          borderRadius="round"
        />
        <Image
          position="absolute"
          zIndex="1"
          ignoreFallback
          src={findIcon(`${record.token1}`.toLocaleLowerCase())}
          top="0"
          left={{ base: px2vw(20), xl: '20px' }}
          w={{ base: px2vw(30), xl: '30px' }}
          h={{ base: px2vw(30), xl: '30px' }}
          borderRadius="round"
        />
      </Box>
      <VStack spacing="0" alignItems="start">
        <Text textStyle={{ base: '14', xl: '12' }}>{record.defi || '--'}</Text>
        <Text textStyle={{ base: '16', xl: '14' }}>
          {`${record.token}`.toLocaleUpperCase()}-{`${record.token1}`.toLocaleUpperCase()}
        </Text>
      </VStack>
    </Flex>
  )
}

const APYBox = ({ record }: any) => (
  <VStack spacing="5px">
    <Text textStyle="24" color="green.100">
      {record.apy ? `${new BigNumber(record.apy).times(100).toFixed(2)}%` : '--'}
    </Text>
    <Text textStyle="18" textDecorationLine="line-through">
      {record.defiApy ? `${new BigNumber(record.defiApy).times(100).toFixed(2)}%` : '--'}
    </Text>
  </VStack>
)

const YAPRBox = ({ record }: any) => {
  const { t } = useTranslation('farm')
  return (
    <VStack spacing={{ base: px2vw(8), xl: '8px' }} width="full">
      <InfoItem
        label={`${record?.defi} ${t('APR')}:`}
        value={record.defiApr ? `${new BigNumber(record.defiApr).times(100).toFixed(2)}%` : '--'}
        textStyle="12"
      />
      <InfoItem
        label={`ZO ${t('APR')}:`}
        value={record.FluxAPR ? `${new BigNumber(record.FluxAPR).times(100).toFixed(2)}%` : '--'}
        textStyle="12"
      />
      <InfoItem
        textStyle="12"
        labelRender={() => (
          <Text>
            <Image
              mr={{ base: px2vw(2), xl: '2px' }}
              display="inline-block"
              verticalAlign="middle"
              ignoreFallback
              src={findIcon(`${record?.betterToken?.result?.symbol}`.toLocaleLowerCase())}
              w={{ base: px2vw(12), xl: '12px' }}
              h={{ base: px2vw(12), xl: '12px' }}
            />
            {t('Borrow APY')}:
          </Text>
        )}
        value={
          record.BorrowAPY ? `${new BigNumber(record.BorrowAPY).times(100).toFixed(2)}%` : '--'
        }
      />
    </VStack>
  )
}

const ActionBox = ({ onOpenFn, record }: any) => {
  const { isPC } = globalStore()
  const router = useRouter()
  const [loading, setLoading] = useBoolean(true)
  const { orderInfoList, workerInfos, poolList } = farmStore()
  const { bankList } = fluxReportStore()
  const { onOpen: openAddModal, Modal: AddModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => (
      <AddModal
        datas={{ ...data, defaultType: 1 }}
        onClose={() => {
          onClose?.()
        }}
      />
    ),
  })
  const { t } = useTranslation('farm')

  useEffect(
    () => {
      if (orderInfoList && poolList?.[0]?.workFactor) {
        setLoading.off()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderInfoList, poolList]
  )
  return (
    <>
      <BaseButton
        disabled={loading}
        w={{ base: 'full', xl: '114px' }}
        h={{ base: px2vw(30), xl: '40px' }}
        text={t('Farm')}
        flexDirection="row-reverse"
        specialIcon={
          <Image
            src={farmImg}
            ignoreFallback
            w={{ base: px2vw(24), xl: '24px' }}
            h={{ base: px2vw(24), xl: '24px' }}
          />
        }
        specialIconIsLeft
        textStyle={{
          marginLeft: { base: px2vw(5), xl: '5px' },
          textStyle: '18',
          color: 'gray.700',
        }}
        onClick={async () => {
          const index = poolList.indexOf(record)
          // 已有该仓位，加仓
          if (Number(workerInfos?.orderInfos[index]?.orderId) !== 0) {
            const item = orderInfoList.filter(
              (item: any) =>
                Number(item?.orderId) === Number(workerInfos?.orderInfos[index]?.orderId)
            )[0]
            const newObj = {
              ...item,
              id: Number(item?.orderId), // id 对应Table的rowKey
              orderId: Number(item?.orderId), // id 对应Table的rowKey
              position: '1',
              apy: '',
              debtRatio: new BigNumber(ethers.utils.formatUnits(item?.debt.toString(), 18))
                .div(new BigNumber(ethers.utils.formatUnits(item?.health.toString(), 18)))
                .toString(),
              token: bankList.find((ite) => item?.tokenInfos[0]?.token === ite?.underlying)?.symbol,
              token1: bankList.find((ite) => item?.tokenInfos[1]?.token === ite?.underlying)
                ?.symbol,
              token0Decimal: item?.tokenInfos[0]?.decimals,
              token1Decimal: item?.tokenInfos[1]?.decimals,
              defi: item?.defi,
              lp: ethers.utils.formatUnits(item?.lpAmount.toString(), 18),
              rewards: ethers.utils.formatUnits(item?.flux0.add(item?.flux1).toString(), 18),
              bankTokenInfo0: bankList.find(
                (ite) => item?.tokenInfos[0]?.token === ite?.underlying
              ),
              bankTokenInfo1: bankList.find(
                (ite) => item?.tokenInfos[1]?.token === ite?.underlying
              ),
            }
            if (isPC) {
              openAddModal?.(newObj)
            } else {
              await farmStore.setState({
                mobileData: newObj,
              })
              router.push('/modal/farm/add')
            }
          }
          // 没有该仓位，开仓
          else {
            onOpenFn(record)
          }
        }}
      />
      {AddModalBox}
    </>
  )
}

interface TList {
  dataSource: any[]
  loading: boolean
  onOpenFn?: (data: any) => void
}

export const MobileList = ({ dataSource, loading }: TList) => {
  const { t } = useTranslation('farm')
  const { connectNet } = globalStore()
  const router = useRouter()
  const columns: ColumnItem[] = useMemo(() => {
    return [
      {
        title: t('pool'),
        dataIndex: 'pool',
        render: (_keyData, record) => {
          return (
            <VStack spacing={px2vw(24)} w="full">
              <Box w="full">
                <PoolBox record={record} />
              </Box>
              <Flex justifyContent="space-between" alignItems="center" w="full">
                <Text textStyle="12" color="white">
                  {t('APY')}:
                </Text>
                {/* TODO: 这里没有按设计图居中 */}
                <APYBox record={record} />
              </Flex>
            </VStack>
          )
        },
      },
      {
        title: t('Yield APR'),
        dataIndex: 'yieldApy',
        render: (_keyData, record) => {
          return (
            <VStack spacing={{ base: px2vw(20) }} w="full">
              <Box w="full">
                <YAPRBox record={record} />
              </Box>
              <Box w="full">
                <ActionBox
                  onOpenFn={async () => {
                    await farmStore.setState({
                      mobileData: { ...record, defaultType: 1 },
                    })
                    router.push('/modal/farm/open')
                  }}
                  record={record}
                />
              </Box>
            </VStack>
          )
        },
      },
    ]
  }, [router, t])
  const isRenderEmpty = useMemo(() => {
    let t = false
    publicRuntimeConfig.farmNet?.forEach((item: any) => {
      if (connectNet === (NetEnum as any)[item.key]) {
        t = true
      }
    })
    return t
  }, [connectNet])
  return (
    <Table
      align="center"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey="id"
      contentStylesProps={{
        padding: px2vw(15),
        mb: px2vw(15),
      }}
      renderEmpty={
        isRenderEmpty
          ? undefined
          : () => (
              <Box>
                <Text textStyle={'18'} lineHeight={'1.5'}>
                  {t('This feature is currently only supported for')}
                </Text>
                <Text textStyle={'18'} lineHeight={'1.5'} color={'white'}>
                  {(function () {
                    const arr: any[] = []
                    publicRuntimeConfig.farmNet?.forEach((item: any) => {
                      if (!arr.includes(item.tips)) {
                        arr.push(item.tips)
                      }
                    })
                    return arr
                  })()?.join(', ')}
                </Text>
                <Text textStyle={'18'} lineHeight={'1.5'}>
                  {t('Please stay tuned for more chains!')}
                </Text>
              </Box>
            )
      }
    />
  )
}

export const DesktopList = ({ dataSource, loading, onOpenFn }: TList) => {
  const { t } = useTranslation('farm')
  const { connectNet } = globalStore()
  const columns: ColumnItem[] = useMemo(() => {
    return [
      {
        title: t('pool'),
        dataIndex: 'token',
        sort: true,
        render: (_keyData, record) => <PoolBox record={record} />,
      },
      {
        title: t('APY'),
        dataIndex: 'apy',
        sort: true,
        render: (_keyData, record) => <APYBox record={record} />,
      },
      {
        title: t('yieldARP'),
        dataIndex: 'yieldApy',
        width: 180,
        render: (_keyData, record) => <YAPRBox record={record} />,
      },
      {
        title: t('action'),
        dataIndex: 'action',
        render: (_keyData, record) => <ActionBox onOpenFn={onOpenFn} record={record} />,
      },
    ]
  }, [onOpenFn, t])
  const isRenderEmpty = useMemo(() => {
    let t = false
    publicRuntimeConfig.farmNet?.forEach((item: any) => {
      if (connectNet === (NetEnum as any)[item.key]) {
        t = true
      }
    })
    return t
  }, [connectNet])
  return (
    <Table
      align="center"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey="id"
      renderEmpty={
        isRenderEmpty
          ? undefined
          : () => (
              <Box>
                <Text textStyle={'18'} lineHeight={'1.5'} textAlign={'center'}>
                  {t('This feature is currently only supported for')}
                </Text>
                <Text textStyle={'18'} lineHeight={'1.5'} color={'white'} textAlign={'center'}>
                  {(function () {
                    const arr: any[] = []
                    publicRuntimeConfig.farmNet?.forEach((item: any) => {
                      if (!arr.includes(item.tips)) {
                        arr.push(item.tips)
                      }
                    })
                    return arr
                  })()?.join(', ')}
                </Text>
                <Text textStyle={'18'} lineHeight={'1.5'} textAlign={'center'}>
                  {t('Please stay tuned for more chains!')}
                </Text>
              </Box>
            )
      }
    />
  )
}

export const returnWorker = (record: any) => {
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
      ? record?.farms[0]?.address
      : record?.farms[1]?.address
  } else if (tokenOne) {
    return record?.farms[0]?.address
  } else {
    return record?.farms[1]?.address
  }
}

function Index({ afterClose }: IProps) {
  const [tabOptions, setTabOptions] = useState([
    {
      label: 'All',
      value: '0',
      render: () => (
        <Text h={{ base: px2vw(20), xl: '20px' }} lineHeight={{ base: px2vw(20), xl: '20px' }}>
          ALL
        </Text>
      ),
    },
  ])
  const [curTab, setTab] = useState(tabOptions[0].value)
  const [loading, setLoading] = useState(true)
  const [totalList, setTotalList] = useState<any[]>([]) // 所有数组
  const [dataSource, setData] = useState<any[]>([]) // 选中的数组数据
  const { isPC, connectNet } = globalStore()
  const { marketList } = marketsStore()
  const { getLoanPoolReport, bankList } = fluxReportStore()
  const { workerInfos } = farmStore()

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
        setTotalList(getPoolData?.data)
        // setData(res)
        const list = Object.keys(getPoolData?.data)
        const result = list.map((item: any) => {
          if (item === 'all') {
            return {
              label: 'All',
              value: 'all',
              render: () => (
                <Text
                  h={{ base: px2vw(20), xl: '20px' }}
                  lineHeight={{ base: px2vw(20), xl: '20px' }}
                >
                  ALL
                </Text>
              ),
            }
          } else {
            return {
              label: item,
              value: item,
              render: () => (
                <Text>
                  <Image
                    mr={{ base: px2vw(5), xl: '5px' }}
                    display="inline-block"
                    verticalAlign="middle"
                    ignoreFallback
                    src={completeUrl(`farm/${item}.png`)}
                    w={{ base: px2vw(20), xl: '20px' }}
                    h={{ base: px2vw(20), xl: '20px' }}
                  />
                  {item}
                </Text>
              ),
            }
          }
        })
        const workerList: any = {}
        list.map((item: any) => {
          workerList[item] = getPoolData?.data[item].map((ite: any) => returnWorker(ite))
        })
        farmStore.setState({
          workerList: workerList,
        })
        setTabOptions(result)
        setTab('all')
        editData('all', getPoolData?.data)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getPoolData, workerInfos]
  )

  const MainList = useMemo(() => {
    return isPC ? DesktopList : MobileList
  }, [isPC])

  // 待优化
  const { onOpen, Modal } = useModal({
    ...modalProps,
    children: ({ data, onClose }: any) => (
      <FarmModal
        onClose={() => {
          afterClose?.()
          onClose()
        }}
        datas={data}
      />
    ),
  })

  // 处理数据
  const editData = useCallback(
    (tab: string, arr: any[]) => {
      // 返回展示的Token
      const list = arr[tab as any].map((item: any, index: number) => {
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
          workFactor: workerInfos?.workerInfos[index]?.workFactor,
        }
      })
      setData(list)
      farmStore.setState({
        poolList: list,
      })
      setLoading(false)
    },
    [bankList, workerInfos]
  )

  const onChangeFn = useCallback(
    (val: any) => {
      // 更新数据
      const newTab = typeof val === 'string' ? val : val?.value
      newTab && setTab(newTab)
      editData(val, totalList)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalList, workerInfos]
  )

  return (
    <Box
      ml={{ base: px2vw(10), xl: 'inherit' }}
      mr={{ base: px2vw(10), xl: 'inherit' }}
      mb={{ base: px2vw(70), xl: '0' }}
    >
      <Box w="full" mb={{ base: px2vw(20), xl: '36px' }} pos="relative" zIndex="2">
        {isPC ? (
          <RadioGroup options={tabOptions} value={curTab} onChange={onChangeFn} />
        ) : (
          <Select options={tabOptions} value={curTab} valueChange={onChangeFn} />
        )}
      </Box>
      <Box pos="relative" zIndex="1">
        <MainList dataSource={dataSource} loading={loading} onOpenFn={onOpen} />
      </Box>
      {Modal}
    </Box>
  )
}
export default Index
