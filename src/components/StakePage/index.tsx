import React, { useState, useEffect, useMemo } from 'react'
import { useInterval } from 'react-use'
import { Flex, Text } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import RadioGroup from '@/components/RadioGroup'
import Select from '@/components/Select'
import NumberTips from '@/components/NumberTips'
import NoData from '@/components/NoData'
import px2vw from '@/utils/px2vw'
import stakeStore from '@/stores/pages/stake'
import globalStore from '@/stores/global'
import { useTranslation } from 'next-i18next'
import fluxReportStore from '@/stores/contract/fluxReport'

const StakeCard = dynamic(() => import('../StakeCard'), { ssr: false })

export enum StakeType {
  flux = 'flux',
  lp = 'lp',
  zo = 'zo',
}

function StakePage() {
  const { t } = useTranslation(['stake'])
  const { isLogin, userAddress, connectNet, fluxJson } = globalStore()
  const { fluxPrice, getFluxPrice } = fluxReportStore()
  const { stakeList, tvl, getStakePools, getUnclaimedFluxAtStake } = stakeStore()
  const [curTab, setTab] = useState<StakeType | null>(null)

  useEffect(() => {
    if (stakeList.length) {
      getStakePools()
      if (!isLogin) return
      getUnclaimedFluxAtStake()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakeList.length, isLogin, userAddress, connectNet])

  useInterval(() => {
    getStakePools()
    getFluxPrice()
    if (!isLogin) return
    getUnclaimedFluxAtStake()
  }, 10000)

  const options = useMemo(() => {
    const list = fluxJson?.[connectNet as string]?.stakePools
    if (!list) return []
    return Object.keys(list)?.filter((it: any) => !it?.swapdex)?.length
      ? [
          {
            label: t('ZO Staking'),
            value: StakeType.flux,
          },
          {
            label: t('LpZO Staking'),
            value: StakeType.lp,
          },
          // {
          //   label: 'Partner Staking',
          //   value: '2',
          // },
        ]
      : [
          {
            label: t('LpFLUX Staking'),
            value: StakeType.lp,
          },
          // {
          //   label: 'Partner Staking',
          //   value: '2',
          // },
        ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fluxJson, connectNet])

  useEffect(() => {
    if (!options.length) return
    if (!curTab) {
      setTab(options[0]?.value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])

  return (
    <Flex direction="column" p={{ base: `0 ${px2vw(10)}`, xl: 0 }}>
      {/* 顶部数据 */}
      <Flex
        w="full"
        alignItems="center"
        justifyContent={{ base: 'space-between', xl: 'space-around' }}
        mt={{ base: px2vw(20), xl: '30px' }}
      >
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          w={{ base: px2vw(216), xl: 'fit-content' }}
          h={{ base: px2vw(71), xl: 'fit-content' }}
          color="white"
          textStyle={{ base: '20', xl: '36' }}
          bg={{ base: 'gray.100', xl: 'transparent' }}
          borderRadius={{ base: 'xl', xl: 0 }}
        >
          {tvl ? <NumberTips value={tvl} symbol="$" shortNum={2} /> : '--'}
          <Text
            mt={{ base: px2vw(10), xl: '10px' }}
            color="purple.300"
            textStyle={{ base: '12', xl: '24' }}
            fontWeight="normal"
          >
            {t('Stake Locked Value')}
          </Text>
        </Flex>
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          w={{ base: px2vw(129), xl: 'fit-content' }}
          h={{ base: px2vw(71), xl: 'fit-content' }}
          color="white"
          textStyle={{ base: '20', xl: '36' }}
          bg={{ base: 'gray.100', xl: 'transparent' }}
          borderRadius={{ base: 'xl', xl: 0 }}
        >
          {fluxPrice ? <NumberTips value={fluxPrice} symbol="$" shortNum={2} /> : '--'}
          <Text
            mt={{ base: px2vw(10), xl: '10px' }}
            color="purple.300"
            textStyle={{ base: '12', xl: '24' }}
            fontWeight="normal"
          >
            {t('ZO Price')}
          </Text>
        </Flex>
      </Flex>
      {stakeList?.length ? (
        <>
          {/* 标签行 */}
          <Flex alignItems="center" mt={{ base: px2vw(30), xl: '50px' }}>
            <RadioGroup
              display={{ base: 'none', xl: 'flex' }}
              options={options}
              defaultValue={curTab}
              onChange={(val: StakeType) => setTab(val)}
            />
            {/* 下拉选择框 */}
            <Select
              display={{ base: 'flex', xl: 'none' }}
              options={options}
              value={curTab}
              valueChange={(item: any) => setTab(item?.value)}
            />
          </Flex>
          <Flex
            direction={{ base: 'column', xl: 'row' }}
            flexWrap="wrap"
            ml={{ base: 0, xl: '-72.5px' }}
            pb={{ base: px2vw(50), xl: 0 }}
          >
            {stakeList
              .filter((it) =>
                curTab === StakeType.lp ? it?.type === StakeType.lp : it?.type !== StakeType.lp
              )
              ?.map((item) => (
                <StakeCard key={item?.name} type={item?.type} data={item} />
              ))}
          </Flex>
        </>
      ) : (
        <NoData />
      )}
    </Flex>
  )
}

export default React.memo(StakePage)
