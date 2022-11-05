import { Box, SimpleGrid, Flex, Image, IconButton, Text, Stack } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { ViewIcon } from '@chakra-ui/icons'
import { useState, useMemo } from 'react'
import useSWR from 'swr'

import BaseTooltip from '@/components/BaseTooltip'
import Pagination from '@/components/Pagination'
import NumberTips from '@/components/NumberTips'
import globalStore from '@/stores/global'
import { netconfigs } from '@/consts/network'
import BaseButton from '@/components/BaseButton'
import List from './List'
import fluxImg from '@/assets/images/svg/claimFlux.svg'
import px2vw from '@/utils/px2vw'
import MobilePositions from './MobilePositions'
import { PoolBox } from '@/components/FarmPool'
import { TableLoading, TableEmpty } from '@/components/Table'
import tableLoadingIcon from '@/assets/images/tableLoadingIcon.png'
import { getBistByStatus } from '@/apis/v2'
import type { NetEnum } from '@/consts'

const pageSize = 10

export const Table = ({
  dataSource,
  rowKey,
  columns,
  renderHeaderColumn,
  renderFooterColumn,
  loading,
  ...res
}: any) => {
  if (loading) {
    return <TableLoading loadingIcon={tableLoadingIcon} loading={loading} />
  }
  return (
    <Stack spacing={px2vw(15)} {...res}>
      {Array.isArray(dataSource) && dataSource.length > 0 ? (
        dataSource.map((values) => (
          <Stack
            key={values[rowKey] ?? values?.key}
            spacing={px2vw(15)}
            p={px2vw(15)}
            bgColor="gray.200"
            borderRadius="md"
          >
            {renderHeaderColumn?.(values)}
            {columns.map((column: any) => {
              return (
                <Box key={`${values[rowKey] ?? values?.key}-${column.key}`}>
                  <Flex justifyContent="space-between" textStyle="14">
                    <Flex minW={px2vw(140)} align="left" alignItems="center">
                      {typeof column?.label === 'function' ? (
                        <Flex alignItems="center">{column.label(values)}:</Flex>
                      ) : column.label ? (
                        `${column.label}:`
                      ) : (
                        ''
                      )}
                    </Flex>
                    <Flex className="ellipsis" alignItems="center">
                      {typeof column?.value === 'function'
                        ? column.value(values)
                        : column.value ?? '--'}
                    </Flex>
                  </Flex>
                  {column?.bottomRender?.(values)}
                </Box>
              )
            })}
            {renderFooterColumn?.(values)}
          </Stack>
        ))
      ) : (
        <TableEmpty loading={loading} />
      )}
    </Stack>
  )
}

const ClosedPosition = () => {
  const { connectNet, userAddress } = globalStore()
  const [pageIndex, onPageChange] = useState(1)

  // TODO: 在旧版本(< 1.1.0)中，SWR 会浅比较每次渲染时的参数，如果其中任何一个发生了变化，就会触发重新验证
  const objs = useMemo(
    () =>
      connectNet
        ? {
            chainId: netconfigs?.[connectNet as NetEnum]?.ChainId,
            page: pageIndex,
            pageSize,
            status: 3,
            userAddress: userAddress,
          }
        : null,
    [connectNet, pageIndex, userAddress]
  )
  const { data, isValidating } = useSWR([objs], getBistByStatus.fetcher, {
    refreshInterval: 1000 * 30, // 30s 轮询
    revalidateOnFocus: false,
  })

  const columns = useMemo(() => {
    return [
      {
        key: 'status',
        label: 'Action',
        value: (record: any) => {
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
        key: 'PositionValue',
        label: 'Position Changed',
        value: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips value={`${record.amount0}`} toolTipProps={{ isDisabled: false }} isAbbr />
              {' ' + `${record.currency}`.split('-')[0]}
            </Text>
          )
        },
        bottomRender: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips value={`${record.amount1}`} toolTipProps={{ isDisabled: false }} isAbbr />
              {' ' + `${record.currency}`.split('-')[1]}
            </Text>
          )
        },
      },
      {
        key: 'Repayment',
        label: 'Repayment',
        value: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips value={`${record.debt0}`} toolTipProps={{ isDisabled: false }} isAbbr />
              {' ' + `${record.currency}`.split('-')[0]}
            </Text>
          )
        },
        bottomRender: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips value={`${record.debt1}`} toolTipProps={{ isDisabled: false }} isAbbr />
              {' ' + `${record.currency}`.split('-')[1]}
            </Text>
          )
        },
      },
      {
        key: 'Received',
        label: 'Received',
        value: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips
                value={`${record.recived0}`}
                toolTipProps={{ isDisabled: false }}
                isAbbr
              />
              {' ' + `${record.currency}`.split('-')[1]}
            </Text>
          )
        },
        bottomRender: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips
                value={`${record.recived1}`}
                toolTipProps={{ isDisabled: false }}
                isAbbr
              />
              {' ' + `${record.currency}`.split('-')[1]}
            </Text>
          )
        },
      },
    ]
  }, [])

  return (
    <>
      <Table
        rowKey="id"
        renderHeaderColumn={(values: any) => {
          return (
            <Flex alignItems="center" mb={px2vw(15)}>
              #{values?.orderId || ''}
              <PoolBox
                reset={{
                  justifyContent: 'center',
                  w: 'auto',
                  ml: { base: px2vw(10), xl: '10px' },
                }}
                record={{
                  ...values,
                  token: `${values.currency}`.split('-')[0],
                  token1: `${values.currency}`.split('-')[1],
                }}
              />
              <Flex flex={1} justifyContent="flex-end">
                <IconButton
                  onClick={() => {
                    window.open(`${netconfigs[connectNet || '']?.txScanUrl}/${values?.txHash}`)
                  }}
                  minW={px2vw(30)}
                  w={px2vw(30)}
                  h={px2vw(30)}
                  isRound
                  color="purple.300"
                  aria-label="scan"
                  size="lg"
                  bgColor="gray.700"
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
              </Flex>
            </Flex>
          )
        }}
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
    </>
  )
}

const Liquidated = () => {
  const { connectNet, userAddress } = globalStore()
  const [pageIndex, onPageChange] = useState(1)

  // TODO: 在旧版本(< 1.1.0)中，SWR 会浅比较每次渲染时的参数，如果其中任何一个发生了变化，就会触发重新验证
  const objs = useMemo(
    () =>
      connectNet && userAddress
        ? {
            chainId: netconfigs?.[connectNet as NetEnum]?.ChainId,
            page: pageIndex,
            pageSize,
            status: 2,
            userAddress,
          }
        : null,
    [connectNet, pageIndex, userAddress]
  )
  const { data, isValidating } = useSWR([objs], getBistByStatus.fetcher, {
    refreshInterval: 1000 * 30, // 30s 轮询
    revalidateOnFocus: false,
  })

  const columns = useMemo(() => {
    return [
      {
        key: 'PositionValue',
        label: 'Position Value',
        value: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips value={`${record.amount0}`} toolTipProps={{ isDisabled: false }} isAbbr />
              {' ' + `${record.currency}`.split('-')[0]}
            </Text>
          )
        },
        bottomRender: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips value={`${record.amount1}`} toolTipProps={{ isDisabled: false }} isAbbr />
              {' ' + `${record.currency}`.split('-')[1]}
            </Text>
          )
        },
      },
      {
        key: 'DebtValue',
        label: 'Debt Value',
        value: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips value={`${record.debt0}`} toolTipProps={{ isDisabled: false }} isAbbr />
              {' ' + `${record.currency}`.split('-')[0]}
            </Text>
          )
        },
        bottomRender: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips value={`${record.debt1}`} toolTipProps={{ isDisabled: false }} isAbbr />
              {' ' + `${record.currency}`.split('-')[1]}
            </Text>
          )
        },
      },
      {
        key: 'Received',
        label: 'Received',
        value: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips
                value={`${record.recived0}`}
                toolTipProps={{ isDisabled: false }}
                isAbbr
              />
              {' ' + `${record.currency}`.split('-')[1]}
            </Text>
          )
        },
        bottomRender: (record: any) => {
          return (
            <Text textStyle="14" textAlign="right" mt={{ base: px2vw(10), xl: '10px' }}>
              <NumberTips
                value={`${record.recived1}`}
                toolTipProps={{ isDisabled: false }}
                isAbbr
              />
              {' ' + `${record.currency}`.split('-')[1]}
            </Text>
          )
        },
      },
      {
        key: 'LiquidateFee',
        label: 'Liquidate Fee',
        value: (record: any) => (
          <Text textStyle="16">
            <NumberTips value={`${record.dealFee}`} toolTipProps={{ isDisabled: false }} isAbbr />
            {' ' + `${record.currency}`.split('-')[1]}
          </Text>
        ),
      },
    ]
  }, [])

  return (
    <>
      <Table
        rowKey="id"
        renderHeaderColumn={(values: any) => {
          return (
            <Flex alignItems="center" mb={px2vw(15)}>
              #{values?.orderId || ''}
              <PoolBox
                reset={{
                  justifyContent: 'center',
                  w: 'auto',
                  ml: { base: px2vw(10), xl: '10px' },
                }}
                record={{
                  ...values,
                  token: `${values.currency}`.split('-')[0],
                  token1: `${values.currency}`.split('-')[1],
                }}
              />
              <Flex flex={1} justifyContent="flex-end">
                <IconButton
                  onClick={() => {
                    window.open(`${netconfigs[connectNet || '']?.txScanUrl}/${values?.txHash}`)
                  }}
                  minW={px2vw(30)}
                  w={px2vw(30)}
                  h={px2vw(30)}
                  isRound
                  color="purple.300"
                  aria-label="scan"
                  size="lg"
                  bgColor="gray.700"
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
              </Flex>
            </Flex>
          )
        }}
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
    </>
  )
}

const MobileMain = ({ data, list, tabChange }: any) => {
  const { t } = useTranslation('farm')

  const tabOptions = [
    {
      key: 1,
      label: t('Active'),
      tmp: <MobilePositions list={list} />,
    },
    {
      key: 2,
      label: t('Operated'),
      tmp: <ClosedPosition />,
    },
    {
      key: 3,
      label: t('Liquidated'),
      tmp: <Liquidated />,
    },
  ]
  return (
    <Box px={px2vw(10)} mt={px2vw(20)}>
      <SimpleGrid columns={1} spacing={px2vw(15)}>
        <Box bgColor="gray.100" p={px2vw(20)} borderRadius="md" align="center">
          <Flex justifyContent="space-between" alignItems="center" mb={px2vw(14)}>
            <Box textStyle="14" className="ellipsis" maxW="full">
              <BaseTooltip isMultiple text={t('totalCollateral')} textStyles={{ textStyle: '18' }}>
                {t('tips113')}
              </BaseTooltip>
            </Box>
            <Box color="white" textStyle="14" className="ellipsis" maxW="full">
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
      <Box my={px2vw(30)}>
        <List
          tabOptions={tabOptions}
          tabsChange={(index: number) => {
            tabChange(index)
          }}
        />
      </Box>
    </Box>
  )
}
export default MobileMain
