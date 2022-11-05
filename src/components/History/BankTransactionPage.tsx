import React, { useEffect, useState } from 'react'
import { Box, Flex, Image } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import RadioGroup from '@/components/RadioGroup'
import { useTranslation } from 'next-i18next'
import { TxTypeValue } from '@/consts/status'
import HistoryCard from '../HistoryCard'
import Select from '../Select'
import useSWR from 'swr'
import { getQueryTradeDetailInfoList } from '@/apis/history'
import globalStore from '@/stores/global'
import { netconfigs } from '@/consts/network'
import NoData from '../NoData'
import BaseButton from '../BaseButton'
import { completeUrl } from '@/utils/common'

export interface IProps {
  selectOptions: {
    label: string
    value: string
  }[]
  selectValue: string
  selectChange: (val: string) => void
}

function Index({ selectOptions, selectValue, selectChange }: IProps) {
  const { t } = useTranslation(['history'])
  const { connectNet, userAddress } = globalStore()
  const [curTab, setTab] = useState('-1') // 单选框的值
  const [historyList, setHistoryList] = useState<any>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(9)
  const [totalPages, setTotalPages] = useState(1)

  const { data: getQueryTradeDetailInfoListData } = useSWR(
    userAddress && connectNet ? [getQueryTradeDetailInfoList.key, curTab, page, userAddress] : null,
    (_, cur, page, user) =>
      getQueryTradeDetailInfoList.fetcher(
        cur === '-1'
          ? {
              chainType: netconfigs[connectNet || '']?.apiChainType,
              pageIndex: page,
              pageSize: pageSize,
              userAddress: user,
            }
          : {
              chainType: netconfigs[connectNet || '']?.apiChainType,
              pageIndex: page,
              pageSize: pageSize,
              type: Number(cur),
              userAddress: user,
            }
      ),
    { revalidateOnFocus: false, focusThrottleInterval: 0 }
  )

  useEffect(
    () => {
      if (
        getQueryTradeDetailInfoListData &&
        getQueryTradeDetailInfoListData?.code === 200 &&
        getQueryTradeDetailInfoListData?.data?.data
      ) {
        const res = getQueryTradeDetailInfoListData?.data?.data
        setTotalPages(getQueryTradeDetailInfoListData?.data?.totalPages)
        const list = res?.map((item: any) => {
          return {
            status: 'success',
            type: returnTxTypeKey(String(item?.type)),
            coin: returenOtherCoin(item?.tokenSymbol)
              ? 'FLUX'
              : returnTxTypeKey(String(item?.type)) === 'Stake' ||
                returnTxTypeKey(String(item?.type)) === 'Unstake'
              ? 'FLUX'
              : item?.tokenSymbol,
            tokensymbol: returenOtherCoin(item?.tokenSymbol) ? null : item?.tokenSymbol,
            date: item?.blockTime,
            hash: item?.transHash,
            value: item?.amount,
            othercoin: returenOtherCoin(item?.tokenSymbol),
          }
        })
        setHistoryList([...historyList, ...list])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getQueryTradeDetailInfoListData]
  )

  // 返回交易对另一个币种
  const returenOtherCoin = (str: string) => {
    const coinList = str.split('-')
    return coinList.length > 1
      ? String(coinList[0]).toUpperCase() === 'FLUX'
        ? coinList[1]
        : coinList[0]
      : null
  }

  // 单选框数组
  const options = Object.keys(TxTypeValue).map((item) => {
    return {
      label: t(item),
      value: TxTypeValue[item],
    }
  })

  // 返回类型key值
  const returnTxTypeKey = (value: string) => {
    let str = ''
    Object.keys(TxTypeValue).forEach((item) => {
      if (TxTypeValue[item] === value) {
        str = item
      }
    })
    return str
  }

  return (
    <Flex
      flexDirection="column"
      w="full"
      pt={{ base: px2vw(30), xl: '30px' }}
      pb={{ base: px2vw(15), xl: '50px' }}
    >
      <Flex
        w="full"
        flexDirection={{ base: 'column', xl: 'row' }}
        justifyContent="space-between"
        mb={{ base: 0, xl: '35px' }}
      >
        {/* 单选框 */}
        <Box px={{ base: px2vw(10), xl: '0' }} order={{ base: 3, xl: 1 }}>
          <RadioGroup
            flexWrap="wrap"
            justifyContent="space-around"
            spacing={{ base: px2vw(18), xl: '15px' }}
            options={options}
            defaultValue={curTab}
            onChange={(val: string) => {
              setPage(1)
              setHistoryList([])
              setTab(val)
            }}
            itemStyle={{
              minW: { base: px2vw(75), xl: '88px' },
              px: '0 !important',
              mb: { base: px2vw(20), xl: '0' },
            }}
          />
        </Box>
        {selectOptions && (
          <Flex
            justifyContent={{ base: 'space-between', xl: 'flex-end' }}
            w={{ base: 'full', xl: '120px' }}
            h={{ base: px2vw(30), xl: '30px' }}
            mb={{ base: px2vw(30), xl: '0' }}
            px={{ base: px2vw(10), xl: '0' }}
            order={2}
          >
            <Select
              display={{ base: 'flex', xl: 'none' }}
              alignSelf="start"
              value={selectValue}
              options={selectOptions}
              valueChange={(val: any) => selectChange(val.value)}
            />
          </Flex>
        )}
      </Flex>
      {/* 列表 */}
      <Flex flexWrap="wrap">
        {historyList.length ? (
          historyList.map((item: any, index: number) => {
            return (
              <HistoryCard
                key={index}
                {...item}
                mr={index + (1 % 3) === 0 ? 0 : { base: 'auto', xl: '65px' }}
                ml={{ base: 'auto', xl: '0' }}
                mb={{ base: px2vw(15), xl: '25px' }}
              />
            )
          })
        ) : (
          <NoData />
        )}
        <Box w="full" px={{ base: px2vw(10), xl: 0 }}>
          <BaseButton
            display={historyList.length ? (totalPages > page ? 'initial' : 'none') : 'none'}
            w="full"
            h={{ base: px2vw(60), xl: '60px' }}
            borderRadius="16px"
            bgColor="gray.200"
            text="Load More"
            textStyle={{
              color: 'purple.300',
              textAlign: 'center',
            }}
            specialIcon={
              <Image
                w={{ base: px2vw(14), xl: '14px' }}
                h={{ base: px2vw(16), xl: '16px' }}
                ml={{ base: px2vw(10), xl: '10px' }}
                my="auto"
                src={completeUrl('loadMore.svg')}
              />
            }
            onClick={() => setPage(page + 1)}
          />
        </Box>
      </Flex>
    </Flex>
  )
}
export default React.memo(Index)
