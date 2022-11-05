import React, { useEffect, useState } from 'react'
import { Box, Text, Image, Flex } from '@chakra-ui/react'
import { MinusIcon, AddIcon } from '@chakra-ui/icons'
import PubSub from 'pubsub-js'
import { useTranslation } from 'next-i18next'

import { PoolBox } from '@/components/FarmPool'
import px2vw from '@/utils/px2vw'
import calculatorImg from '@/assets/images/svg/calculator-2.svg'
import { getAPY } from '@/utils/common'
import { Table as MobileTable } from './MobileMain'
import BaseButton from '@/components/BaseButton'
import { NoBox } from './index'
import NumberTips from '../NumberTips'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import farmStore from '@/stores/contract/farm'
import BigNumber from 'bignumber.js'
import BaseTooltip from '../BaseTooltip'
import error from '@/assets/images/error.png'

const MobilePositions = ({ list }: any) => {
  const { t } = useTranslation(['farm'])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // 获取数据
  useEffect(() => {
    if ((list || []).length > 0 && list?.[0]?.debt) {
      setData(list)
      setLoading(false)
    }
  }, [list])

  // const { onOpen: openCloseModal, Modal: CloseModalBox } = useModal({
  //   ...modalProps,
  //   children: ({ onClose, data, isOpen }: any) => (
  //     <CloseModal isOpen={isOpen} datas={data} onClose={onClose} />
  //   ),
  // })

  // const { onOpen: openRemoveModal, Modal: RemoveModalBox } = useModal({
  //   ...modalProps,
  //   children: ({ onClose, data }: any) => <RemoveModal datas={data} onClose={onClose} />,
  // })

  // const { onOpen: openAddModal, Modal: AddModalBox } = useModal({
  //   ...modalProps,
  //   children: ({ onClose, data }: any) => <AddModal datas={data} onClose={onClose} mb="0" />,
  // })

  const columns = [
    {
      key: 'APY',
      label: t('APY'),
      value: (record: any) => (
        <Flex
          alignItems="center"
          justifyContent="center"
          onClick={() => {
            PubSub.publish('my-farm-open-apy-modal', record)
          }}
        >
          {getAPY(record)?.APY && getAPY(record)?.APY !== 'NaN' ? (
            <NumberTips value={getAPY(record)?.APY} isRatio />
          ) : (
            '--'
          )}{' '}
          <Image
            src={calculatorImg}
            ignoreFallback
            w={{ base: px2vw(14), xl: '14px' }}
            h={{ base: px2vw(14), xl: '14px' }}
            display="inline-block"
            verticalAlign="middle"
            mr={{ base: px2vw(5), xl: '5px' }}
          />
        </Flex>
      ),
    },
    {
      key: 'DebtRatio',
      label: t('debtRatio'),
      value: (record: any) => {
        return new BigNumber(record.debtRatio)
          .times(100)
          .gte(new BigNumber(record?.killFactor / 100).times(0.9)) ? (
          <BaseTooltip
            isPureVersion
            textRender={
              <Text textStyle="14" color="red.200" cursor="pointer">
                {record.debtRatio ? <NumberTips value={record.debtRatio} isRatio /> : '--'}
              </Text>
            }
            textRenderIconStyle={{
              fontSize: '14px',
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
          <Flex
            alignItems="center"
            justifyContent="center"
            onClick={() => {
              PubSub.publish('my-farm-open-debt-modal', record)
            }}
          >
            {record.debtRatio ? <NumberTips value={record.debtRatio} isRatio /> : '--'}
            <Image
              src={calculatorImg}
              ignoreFallback
              w={{ base: px2vw(14), xl: '14px' }}
              h={{ base: px2vw(14), xl: '14px' }}
              display="inline-block"
              verticalAlign="middle"
            />
          </Flex>
        )
      },
    },
    {
      key: 'Debt',
      label: t('debt'),
      value: (record: any) => {
        return record?.debt0.eq(0) ? (
          <Text>
            <NumberTips
              value={ethers.utils.formatUnits(record?.debt1.toString(), record?.token1Decimal)}
            />{' '}
            {record?.token1}
          </Text>
        ) : (
          <Text lineHeight="1.5">
            <NumberTips
              value={ethers.utils.formatUnits(record?.debt0.toString(), record?.token0Decimal)}
            />{' '}
            {record?.token}
          </Text>
        )
      },
      bottomRender: (record: any) => {
        return (
          <Text textAlign="right">
            <NumberTips
              value={ethers.utils.formatUnits(record?.debt1.toString(), record?.token1Decimal)}
            />{' '}
            {record?.token1}
          </Text>
        )
      },
    },
    {
      key: 'LP',
      label: t('lpAmount'),
      value: (record: any) => <NumberTips value={record?.lp} />,
    },
    {
      key: 'FLUXRewards',
      label: t('fluxRewards'),
      value: (record: any) => (
        <Flex>
          <NumberTips value={record?.rewards} />
          FLUX
        </Flex>
      ),
    },
  ]

  return (
    <Box width="full">
      {data && data.length > 0 ? (
        <MobileTable
          rowKey="id"
          renderHeaderColumn={(values: any) => {
            return (
              <Flex alignItems="center" mb={px2vw(15)}>
                #{values?.id || ''}
                <PoolBox
                  reset={{
                    justifyContent: 'center',
                    w: 'auto',
                    ml: { base: px2vw(10), xl: '10px' },
                  }}
                  record={values}
                />
              </Flex>
            )
          }}
          renderFooterColumn={(record: any) => {
            return (
              <Flex justifyContent="space-between">
                <BaseButton
                  onClick={async () => {
                    await farmStore.setState({
                      mobileData: record,
                    })
                    router.push({ pathname: '/modal/farm/remove' })
                  }}
                  minW={px2vw(86)}
                  h={px2vw(40)}
                  text={t('Remove')}
                  bgColor="gray.300"
                  flexDirection="row-reverse"
                  specialIcon={<MinusIcon fontSize="12" color="purple.300" />}
                  textStyle={{
                    marginRight: px2vw(3),
                    textStyle: '14',
                    color: 'purple.300',
                  }}
                />
                <BaseButton
                  onClick={async () => {
                    await farmStore.setState({
                      mobileData: { ...record, defaultType: 0 },
                    })
                    localStorage.setItem('test', { ...record, defaultType: 0 })
                    router.push({ pathname: '/modal/farm/add' })
                  }}
                  minW={px2vw(86)}
                  h={px2vw(40)}
                  text={t('Add')}
                  bgColor="gray.300"
                  flexDirection="row-reverse"
                  specialIcon={<AddIcon fontSize="12" color="purple.300" />}
                  textStyle={{
                    marginRight: px2vw(3),
                    textStyle: '14',
                    color: 'purple.300',
                  }}
                />
                <BaseButton
                  onClick={async () => {
                    await farmStore.setState({
                      mobileData: record,
                    })
                    router.push({ pathname: '/modal/farm/close' })
                  }}
                  minW={px2vw(86)}
                  h={px2vw(40)}
                  text={t('Close')}
                  bgColor="gray.300"
                  flexDirection="row-reverse"
                  // specialIcon={
                  //   <Image
                  //     src={shutOffImg}
                  //     ignoreFallback
                  //     w="14px"
                  //     h="14px"
                  //     display="inline-block"
                  //     verticalAlign="middle"
                  //   />
                  // }
                  textStyle={{
                    // marginRight: px2vw(3),
                    textStyle: '14',
                    color: 'purple.300',
                  }}
                />
              </Flex>
            )
          }}
          columns={columns}
          loading={loading}
          dataSource={data}
        />
      ) : (
        <NoBox />
      )}
    </Box>
  )
}
export default MobilePositions
