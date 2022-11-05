import { Box, SimpleGrid, Flex, Image, IconButton, Text, useBoolean } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { ViewIcon } from '@chakra-ui/icons'
import { useMemo, useState } from 'react'
import useSWR from 'swr'

import BaseTooltip from '@/components/BaseTooltip'
import Pagination from '@/components/Pagination'
import NumberTips from '@/components/NumberTips'
import globalStore from '@/stores/global'
import { netconfigs } from '@/consts/network'
import { getBistByStatus } from '@/apis/v2'
import BaseButton from '@/components/BaseButton'
import List from './List'
import fluxImg from '@/assets/images/svg/claimFlux.svg'
import { Positions } from './Positions'
import Table from '@/components/Table'
import { PoolBox } from '@/components/FarmPool'
import type { ColumnItem } from '@/components/Table/type'
import type { NetEnum } from '@/consts'
import { getWalletContract } from '@/contracts'
import { Orderbook } from '@/contracts/abis'
import useSendTransaction from '@/hooks/useSendTransaction'

const pageSize = 10

const ClosedPosition = () => {
  const { t } = useTranslation(['farm'])
  const { connectNet, userAddress } = globalStore()
  const [pageIndex, onPageChange] = useState(1)

  // TODO: 在旧版本(< 1.1.0)中，SWR 会浅比较每次渲染时的参数，如果其中任何一个发生了变化，就会触发重新验证
  const objs = useMemo(() => {
    return connectNet
      ? {
          chainId: netconfigs?.[connectNet as NetEnum]?.ChainId,
          page: pageIndex,
          pageSize,
          status: 3, //  0:未处理 （正常持仓） 2（清算）3（已平仓）
          userAddress, //: '0x14da4fc1abd3d749e62c1f5e1cd219a6e31ecc06',
        }
      : null
  }, [connectNet, pageIndex, userAddress])
  const { data, isValidating } = useSWR([objs], getBistByStatus.fetcher, {
    refreshInterval: 1000 * 30, // 30s 轮询
    revalidateOnFocus: false,
  })

  const columns: ColumnItem[] = useMemo(() => {
    return [
      {
        title: 'No.',
        dataIndex: 'id',
        render: (_, record) => {
          return '#' + record.orderId
        },
      },
      {
        title: t('pool'),
        dataIndex: 'Pool',
        render: (_, record) => {
          return (
            <PoolBox
              record={{
                ...record,
                token: `${record.currency}`.split('-')[0],
                token1: `${record.currency}`.split('-')[1],
              }}
            />
          )
        },
      },
      {
        title: t('action'),
        dataIndex: 'Action2',
        render: (_, record) => {
          switch (record.status) {
            case 0:
              return 'Open'
            case 3:
              return 'CLOSE'
            case 4:
              return 'ADD'
            case 5:
              return 'REMOVE'
          }
        },
      },
      {
        title: t('Position Changed'),
        dataIndex: 'Position',
        render: (_, record) => {
          return (
            <Box>
              {+record.amount0 > 0 ? (
                <Text textStyle="16" lineHeight="1.5">
                  <NumberTips
                    value={`${record.amount0}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[0]}
                </Text>
              ) : null}
              {+record.amount1 > 0 ? (
                <Text textStyle="16">
                  <NumberTips value={record.amount1} toolTipProps={{ isDisabled: false }} isAbbr />
                  {' ' + `${record.currency}`.split('-')[1]}
                </Text>
              ) : null}
              {+record.amount0 > 0 || +record.amount1 > 0 ? null : '--'}
            </Box>
          )
        },
      },
      {
        title: t('repayment'),
        dataIndex: 'Repayment',
        render: (_, record) => {
          return (
            <Box>
              {+record.debt0 > 0 ? (
                <Text textStyle="16" lineHeight="1.5">
                  <NumberTips
                    value={`${record.debt0}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[0]}
                </Text>
              ) : null}
              {+record.debt1 > 0 ? (
                <Text textStyle="16">
                  <NumberTips
                    value={`${record.debt1}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[1]}
                </Text>
              ) : null}
              {+record.debt0 > 0 || +record.debt1 > 0 ? null : '--'}
            </Box>
          )
        },
      },
      {
        title: t('Received'),
        dataIndex: 'Received',
        render: (_, record) => {
          return (
            <Box>
              {+record.recived0 > 0 ? (
                <Text textStyle="16" lineHeight="1.5">
                  <NumberTips
                    value={`${record.recived0}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[0]}
                </Text>
              ) : null}
              {+record.recived1 > 0 ? (
                <Text textStyle="16">
                  <NumberTips
                    value={`${record.recived1}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[1]}
                </Text>
              ) : null}
              {+record.recived0 > 0 || +record.recived1 > 0 ? null : '--'}
            </Box>
          )
        },
      },
      {
        title: t('action'),
        dataIndex: 'Action',
        renderTitle: () => null,
        render: (_, record) => {
          return (
            <IconButton
              onClick={() => {
                window.open(`${netconfigs[connectNet || '']?.txScanUrl}/${record?.txHash}`)
              }}
              minW="24px"
              w="24px"
              h="24px"
              isRound
              color="gray.700"
              aria-label="+"
              size="lg"
              bgColor="purple.300"
              icon={<ViewIcon />}
              _hover={{
                opacity: {
                  base: 1,
                  xl: 0.8,
                },
              }}
              _active={{
                opacity: {
                  base: 1,
                  xl: 0.8,
                },
              }}
            />
          )
        },
      },
    ]
  }, [connectNet, t])
  return (
    <Box width="full">
      <Table
        rowKey="id"
        align="center"
        columns={columns}
        loading={!data && isValidating}
        dataSource={data?.list}
      />
      {data?.total > pageSize ? (
        <Flex justifyContent={'flex-end'}>
          <Pagination
            onPageChange={onPageChange}
            pagesCount={Math.ceil(data.total / pageSize)}
            pageSize={pageSize}
            pageIndex={pageIndex}
          />
        </Flex>
      ) : null}
    </Box>
  )
}

const Liquidated = () => {
  const { t } = useTranslation(['farm'])
  const { connectNet, userAddress } = globalStore()
  const [pageIndex, onPageChange] = useState(1)

  // TODO: 在旧版本(< 1.1.0)中，SWR 会浅比较每次渲染时的参数，如果其中任何一个发生了变化，就会触发重新验证
  const objs = useMemo(() => {
    return connectNet && userAddress
      ? {
          chainId: netconfigs?.[connectNet as NetEnum]?.ChainId,
          page: pageIndex,
          pageSize,
          status: 2,
          userAddress, //: '0x14da4fc1abd3d749e62c1f5e1cd219a6e31ecc06',
        }
      : null
  }, [connectNet, pageIndex, userAddress])
  const { data, isValidating } = useSWR([objs], getBistByStatus.fetcher, {
    refreshInterval: 1000 * 30, // 30s 轮询
    revalidateOnFocus: false,
  })

  const columns: ColumnItem[] = useMemo(() => {
    return [
      {
        title: 'No.',
        dataIndex: 'id',
        render: (_, record) => {
          return '#' + record.orderId
        },
      },
      {
        title: t('pool'),
        dataIndex: 'Pool',
        render: (_, record) => {
          return (
            <PoolBox
              record={{
                ...record,
                token: `${record.currency}`.split('-')[0],
                token1: `${record.currency}`.split('-')[1],
              }}
            />
          )
        },
      },
      {
        title: t('Position Value'),
        dataIndex: 'Position',
        render: (_, record) => {
          return (
            <Box>
              {+record.amount0 > 0 ? (
                <Text textStyle="16" lineHeight="1.5">
                  <NumberTips
                    value={`${record.amount0}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[0]}
                </Text>
              ) : null}
              {+record.amount1 > 0 ? (
                <Text textStyle="16">
                  <NumberTips value={record.amount1} toolTipProps={{ isDisabled: false }} isAbbr />
                  {' ' + `${record.currency}`.split('-')[1]}
                </Text>
              ) : null}
              {+record.amount0 > 0 || +record.amount1 > 0 ? null : '--'}
            </Box>
          )
        },
      },
      {
        title: t('Debt Value'),
        dataIndex: 'Debt',
        render: (_, record) => {
          return (
            <Box>
              {+record.debt0 > 0 ? (
                <Text textStyle="16" lineHeight="1.5">
                  <NumberTips
                    value={`${record.debt0}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[0]}
                </Text>
              ) : null}
              {+record.debt1 > 0 ? (
                <Text textStyle="16">
                  <NumberTips
                    value={`${record.debt1}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[1]}
                </Text>
              ) : null}
              {+record.debt0 > 0 || +record.debt1 > 0 ? null : '--'}
            </Box>
          )
        },
      },
      {
        title: t('Received'),
        dataIndex: 'Received',
        render: (_, record) => {
          return (
            <Box>
              {+record.recived0 > 0 ? (
                <Text textStyle="16" lineHeight="1.5">
                  <NumberTips
                    value={`${record.recived0}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[0]}
                </Text>
              ) : null}
              {+record.recived1 > 0 ? (
                <Text textStyle="16">
                  <NumberTips
                    value={`${record.recived1}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[1]}
                </Text>
              ) : null}
              {+record.recived0 > 0 || +record.recived1 > 0 ? null : '--'}
            </Box>
          )
        },
      },
      {
        title: t('Liquidate Fee'),
        dataIndex: 'LiquidateFee',
        render: (_, record) => {
          return (
            <Box>
              {+record.dealFee > 0 ? (
                <Text textStyle="16">
                  <NumberTips
                    value={`${record.dealFee}`}
                    toolTipProps={{ isDisabled: false }}
                    isAbbr
                  />
                  {' ' + `${record.currency}`.split('-')[1]}
                </Text>
              ) : (
                '--'
              )}
            </Box>
          )
        },
      },
      {
        title: t('action'),
        dataIndex: 'Action',
        renderTitle: () => null,
        render: (_, record) => {
          return (
            <IconButton
              onClick={() => {
                window.open(`${netconfigs[connectNet || '']?.txScanUrl}/${record?.txHash}`)
              }}
              minW="24px"
              w="24px"
              h="24px"
              isRound
              color="gray.700"
              aria-label="+"
              size="lg"
              bgColor="purple.300"
              icon={<ViewIcon />}
              _hover={{
                opacity: {
                  base: 1,
                  xl: 0.8,
                },
              }}
              _active={{
                opacity: {
                  base: 1,
                  xl: 0.8,
                },
              }}
            />
          )
        },
      },
    ]
  }, [connectNet, t])
  return (
    <Box width="full">
      <Table
        rowKey="id"
        align="center"
        columns={columns}
        loading={!data && isValidating}
        dataSource={data?.list}
      />
      {data?.total > pageSize ? (
        <Flex justifyContent={'flex-end'}>
          <Pagination
            onPageChange={onPageChange}
            pagesCount={Math.ceil(data.total / pageSize)}
            pageSize={pageSize}
            pageIndex={pageIndex}
          />
        </Flex>
      ) : null}
    </Box>
  )
}

const DesktopMain = ({ data, list, afterClose, tabChange }: any) => {
  const { t } = useTranslation('farm')
  const { connectNet, fluxJson } = globalStore()
  const [buttonLoading, setButtonLoading] = useBoolean(false)
  const { sendTransaction } = useSendTransaction()
  const tabOptions = useMemo(() => {
    return [
      {
        key: 1,
        label: t('activePosition'),
        tmp: (
          <Positions
            list={list}
            afterClose={() => {
              afterClose?.()
            }}
          />
        ),
      },
      {
        key: 2,
        label: t('Operated Position'),
        tmp: <ClosedPosition />,
      },
      {
        key: 3,
        label: t('Liquidated'),
        tmp: <Liquidated />,
      },
    ]
  }, [list, afterClose, t])

  return (
    <Box>
      <SimpleGrid columns={3} spacing="70px" mt="48px" mb="50px">
        <Flex
          bgColor="gray.100"
          justifyContent="space-between"
          direction="column"
          py="25px"
          h="106px"
          borderRadius="md"
          align="center"
        >
          <Box color="white" textStyle="24" className="ellipsis" maxW="full">
            {data?.tc?.value !== '--' ? (
              <NumberTips
                value={data?.tc?.value}
                shortNum={2}
                symbol="$"
                toolTipProps={{ isDisabled: false }}
              />
            ) : (
              '--'
            )}
          </Box>
          <Box textStyle="18" className="ellipsis" maxW="full">
            <BaseTooltip isMultiple text={t('totalCollateral')} textStyles={{ textStyle: '18' }}>
              {t('tips113')}
            </BaseTooltip>
          </Box>
        </Flex>
        <Flex
          bgColor="gray.100"
          justifyContent="space-between"
          direction="column"
          py="25px"
          h="106px"
          borderRadius="md"
          align="center"
        >
          <Box color="white" textStyle="24" className="ellipsis" maxW="full">
            {data?.tb?.value !== '--' ? (
              <NumberTips
                value={data?.tb?.value}
                shortNum={2}
                symbol="$"
                toolTipProps={{ isDisabled: false }}
              />
            ) : (
              '--'
            )}
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
            {data?.reward?.value !== '--' ? (
              <NumberTips
                value={data?.reward?.value}
                shortNum={2}
                toolTipProps={{ isDisabled: false }}
              />
            ) : (
              '--'
            )}
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
            isLoading={buttonLoading}
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
            onClick={() => {
              setButtonLoading.on()
              const contract = getWalletContract(
                fluxJson?.[connectNet as string]?.farm?.Orderbook,
                Orderbook
              )
              try {
                sendTransaction(
                  {
                    contract: contract,
                    method: 'withdrawRewards',
                    args: [list.map((item: any) => item?.orderId)],
                    value: 0,
                  },
                  () => {
                    //TODO:空函数lint检查
                    setButtonLoading.off()
                  },
                  (hash: string) => {
                    console.log(hash)
                  }
                )
              } catch (err) {
                console.log(err)
              }
            }}
          />
        </Flex>
      </SimpleGrid>
      <List
        tabOptions={tabOptions}
        tabsChange={(index: number) => {
          tabChange(index)
        }}
      />
    </Box>
  )
}

export default DesktopMain
