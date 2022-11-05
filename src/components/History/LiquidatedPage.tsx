import React, { useEffect, useMemo, useState } from 'react'
import { Flex } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import LiquidatedCard from '../LiquidatedCard'
import Select from '../Select'
import useSWR from 'swr'
import { getLiqTradeInfo } from '@/apis/history'
import globalStore from '@/stores/global'
import BigNumber from 'bignumber.js'
import { netconfigs } from '@/consts/network'
import NoData from '../NoData'

export interface IProps {
  selectOptions: {
    label: string
    value: string
  }[]
  selectValue: string
  selectChange: (val: string) => void
}

function Index({ selectOptions, selectValue, selectChange }: IProps) {
  const { connectNet, userAddress } = globalStore()
  const [liquidatedCardList, setLiquidatedCardList] = useState([])

  const { data: getLiqTradeInfoData } = useSWR(
    userAddress && connectNet ? [getLiqTradeInfo.key, userAddress] : null,
    (_, user) =>
      getLiqTradeInfo.fetcher({
        chainType: netconfigs[connectNet || '']?.apiChainType,
        userAddress: user,
      }),
    { revalidateOnFocus: false, focusThrottleInterval: 0 }
  )

  useEffect(() => {
    if (getLiqTradeInfoData && getLiqTradeInfoData?.code === 200) {
      const res = getLiqTradeInfoData?.data
      if (!res || !res.length) return
      const list = res?.map((item: any) => {
        return {
          status: 'success',
          // coin: 'ETH',
          date: item?.blockTime,
          hash: item?.transHash,
          debtrepaidvalue: new BigNumber(item?.borrow).toString(),
          remainingdebtvalue: '0',
          collaterallostvalue: new BigNumber(item?.supply).toString(),
          tokenlist: item?.details,
        }
      })
      setLiquidatedCardList(list)
    }
  }, [getLiqTradeInfoData])

  const render = useMemo(
    () => {
      return (
        <Flex
          flexDirection="column"
          w="full"
          pt={{ base: px2vw(30), xl: '100px' }}
          pb={{ base: px2vw(15), xl: '50px' }}
        >
          <Flex
            display={{ base: 'initial', xl: 'none' }}
            w="full"
            flexDirection={{ base: 'column', xl: 'row' }}
            justifyContent="space-between"
            mb={{ base: 0, xl: '35px' }}
          >
            <Flex
              display={{ base: 'flex', xl: 'none' }}
              justifyContent={{ base: 'space-between', xl: 'flex-end' }}
              w={{ base: 'full', xl: '120px' }}
              h={{ base: px2vw(30), xl: '30px' }}
              mb={{ base: px2vw(30), xl: '0' }}
              px={{ base: px2vw(10), xl: '0' }}
              order={2}
            >
              <Select
                value={selectValue}
                display={{ base: 'flex', xl: 'none' }}
                alignSelf="start"
                options={selectOptions}
                valueChange={(val: any) => selectChange(val.value)}
              />
            </Flex>
          </Flex>
          {/* 列表 */}
          <Flex flexWrap="wrap">
            {liquidatedCardList.length ? (
              liquidatedCardList.map((item: any, index: number) => {
                return (
                  <LiquidatedCard
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
          </Flex>
        </Flex>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [liquidatedCardList]
  )

  return render
}
export default React.memo(Index)
