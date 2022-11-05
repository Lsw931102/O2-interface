import React, { useEffect, useMemo, useState } from 'react'
import { Box, HStack, Stack, IconButton, Text, Image } from '@chakra-ui/react'
import { MinusIcon, AddIcon } from '@chakra-ui/icons'
import PubSub from 'pubsub-js'

import Table from '@/components/Table'
import { useModal } from '@/components/Modal'
import { PoolBox, modalProps } from '@/components/FarmPool'
import px2vw from '@/utils/px2vw'
import calculatorImg from '@/assets/images/svg/calculator-2.svg'
import shutOffImg from '@/assets/images/svg/shutOff.svg'
import type { ColumnItem } from '@/components/Table/type'
import CloseModal from './CloseModal'
import RemoveModal from './RemoveModal'
import AddModal from './AddModal'
import { ethers } from 'ethers'
import NumberTips from '../NumberTips'
import { getAPY } from '@/utils/common'
import { useTranslation } from 'next-i18next'
import { NoBox } from './index'
import farmStore from '@/stores/contract/farm'
import BigNumber from 'bignumber.js'
import error from '@/assets/images/error.png'
import BaseTooltip from '../BaseTooltip'

export function Positions({ list, afterClose }: any) {
  const { t } = useTranslation(['farm'])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { orderInfoList } = farmStore()

  useEffect(() => {
    if (list.length > 0 && list?.[0]?.debt) {
      setData(list)
      setLoading(false)
    }
  }, [list, orderInfoList])

  const { onOpen: openCloseModal, Modal: CloseModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data, isOpen }: any) => (
      <CloseModal
        isOpen={isOpen}
        datas={data}
        onClose={() => {
          afterClose?.()
          onClose?.()
        }}
      />
    ),
  })

  const { onOpen: openRemoveModal, Modal: RemoveModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => (
      <RemoveModal
        datas={data}
        onClose={() => {
          afterClose?.()
          onClose?.()
        }}
      />
    ),
  })

  const { onOpen: openAddModal, Modal: AddModalBox } = useModal({
    ...modalProps,
    children: ({ onClose, data }: any) => (
      <AddModal
        datas={{ ...data, defaultType: 0 }}
        onClose={() => {
          afterClose?.()
          onClose?.()
        }}
      />
    ),
  })

  const columns: ColumnItem[] = useMemo(() => {
    return [
      {
        title: 'No.',
        dataIndex: 'orderId',
        render: (_keyData, record) => {
          return `#${record?.orderId}`
        },
      },
      {
        title: t('Pool'),
        dataIndex: 'Pool',
        render: (_keyData, record) => {
          return <PoolBox record={record} />
        },
      },
      {
        title: t('lpAmount'),
        dataIndex: 'lp',
        render: (_keyData, record) => {
          return <NumberTips value={record?.lp} />
        },
      },
      {
        title: t('debt'),
        dataIndex: 'Debt',
        render: (_keyData, record) => {
          return (
            <Box>
              <Text textStyle="16" lineHeight="1.5">
                <NumberTips
                  value={ethers.utils.formatUnits(record?.debt0.toString(), record?.token0Decimal)}
                />{' '}
                {record?.token}
              </Text>
              <Text textStyle="16">
                <NumberTips
                  value={ethers.utils.formatUnits(record?.debt1.toString(), record?.token1Decimal)}
                />{' '}
                {record?.token1}
              </Text>
            </Box>
          )
        },
      },
      {
        title: t('debtRatio'),
        dataIndex: 'debtRatio',
        align: 'left',
        render: (_keyData, record) => {
          // 判断债务率是否大于等于清算线的90%
          return new BigNumber(record.debtRatio)
            .times(100)
            .gte(new BigNumber(record?.killFactor / 100).times(0.9)) ? (
            <BaseTooltip
              isPureVersion
              textRender={
                <Text textStyle="16" color="red.200" cursor="pointer">
                  {record.debtRatio ? <NumberTips value={record.debtRatio} isRatio /> : '--'}
                </Text>
              }
              textRenderIconStyle={{
                fontSize: '16px',
                color: 'red.200',
              }}
              iconRender={
                <Image
                  src={error}
                  ignoreFallback
                  w={{ base: px2vw(14), xl: '14px' }}
                  h={{ base: px2vw(14), xl: '14px' }}
                  ml={{ base: px2vw(5), xl: '5px' }}
                  my="auto"
                  display="inline-block"
                  verticalAlign="middle"
                  cursor="pointer"
                />
              }
            >
              <Text textStyle="14" whiteSpace="break-spaces">
                {t('debtTips', { kill: record?.killFactor / 100 })}
              </Text>
            </BaseTooltip>
          ) : (
            <HStack
              spacing={{ base: px2vw(5), xl: '5px' }}
              className="ellipsis"
              cursor="pointer"
              onClick={() => {
                PubSub.publish('my-farm-open-debt-modal', record)
              }}
            >
              <Text textStyle="16">
                {record.debtRatio ? <NumberTips value={record.debtRatio} isRatio /> : '--'}
              </Text>
              <Image
                src={calculatorImg}
                ignoreFallback
                w={{ base: px2vw(14), xl: '14px' }}
                h={{ base: px2vw(14), xl: '14px' }}
                display="inline-block"
                verticalAlign="middle"
              />
            </HStack>
          )
        },
      },
      {
        title: t('APY'),
        dataIndex: 'apy',
        render: (_keyData, record) => {
          return (
            <HStack
              spacing={{ base: px2vw(5), xl: '5px' }}
              className="ellipsis"
              cursor="pointer"
              onClick={() => {
                PubSub.publish('my-farm-open-apy-modal', record)
              }}
            >
              <Text textStyle="14" color="green.100">
                {getAPY(record)?.APY && getAPY(record)?.APY !== 'NaN' ? (
                  <NumberTips value={getAPY(record)?.APY} isRatio />
                ) : (
                  '--'
                )}
              </Text>
              <Image
                src={calculatorImg}
                ignoreFallback
                w={{ base: px2vw(14), xl: '14px' }}
                h={{ base: px2vw(14), xl: '14px' }}
                display="inline-block"
                verticalAlign="middle"
              />
            </HStack>
          )
        },
      },
      {
        title: t('fluxRewards'),
        dataIndex: 'rewards',
        render: (_keyData, record) => {
          return <NumberTips value={record?.rewards} />
        },
      },
      {
        title: t('action'),
        dataIndex: 'Action',
        render: (_keyData, record) => {
          return (
            <Stack direction="row" spacing="20px">
              <IconButton
                onClick={() => {
                  openRemoveModal?.(record)
                }}
                minW="24px"
                w="24px"
                h="24px"
                isRound
                color="gray.700"
                aria-label="-"
                size="lg"
                bgColor="purple.300"
                icon={<MinusIcon />}
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
              <IconButton
                onClick={() => {
                  openAddModal?.(record)
                }}
                minW="24px"
                w="24px"
                h="24px"
                isRound
                color="gray.700"
                aria-label="+"
                size="lg"
                bgColor="purple.300"
                icon={<AddIcon />}
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
              <IconButton
                onClick={() => {
                  openCloseModal?.(record)
                }}
                minW="24px"
                w="24px"
                h="24px"
                isRound
                color="gray.700"
                aria-label="X"
                size="lg"
                bgColor="purple.300"
                icon={
                  <Image
                    src={shutOffImg}
                    ignoreFallback
                    w="14px"
                    h="14px"
                    display="inline-block"
                    verticalAlign="middle"
                  />
                }
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
            </Stack>
          )
        },
      },
    ]
  }, [t, openRemoveModal, openAddModal, openCloseModal])
  return (
    <Box width="full">
      {orderInfoList && orderInfoList.length > 0 ? (
        <Table rowKey="id" align="center" columns={columns} loading={loading} dataSource={data} />
      ) : (
        <NoBox />
      )}
      {CloseModalBox}
      {RemoveModalBox}
      {AddModalBox}
    </Box>
  )
}
