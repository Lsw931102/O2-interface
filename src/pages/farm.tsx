import React, { useEffect, useMemo, useState } from 'react'
import { Box, Stack, Flex } from '@chakra-ui/react'
import { useTranslation, Trans } from 'next-i18next'
import BigNumber from 'bignumber.js'
import dynamic from 'next/dynamic'

import { getI18nSSRProps, GetI18nServerSideProps } from '@/utils/i18n'
import px2vw from '@/utils/px2vw'
import SubMenu, { ISubmenu } from '@/components/SubMenu'
import { completeUrl } from '@/utils/common'
import FarmPosition from '@/components/FarmPosition'
import Loading from '@/components/Loading'
import { getMsg } from '@/apis/v2'
import useSWR from 'swr'
import globalStore from '@/stores/global'
import { netconfigs } from '@/consts/network'
import { NetEnum } from '@/consts'
import NumberTips from '@/components/NumberTips'
import { useToggle } from 'react-use'
import BaseTooltip from '@/components/BaseTooltip'

const FarmPool = dynamic(() => import('@/components/FarmPool'), {
  ssr: false,
  loading: () => <Loading loading />,
})

const Info = () => {
  const { t } = useTranslation(['farm'])
  const { connectNet } = globalStore()
  const { data: getMsgData } = useSWR(
    connectNet && netconfigs && netconfigs[connectNet as NetEnum]?.ChainId
      ? [getMsg.key, netconfigs[connectNet as NetEnum]?.ChainId]
      : null,
    (_, chainId) =>
      getMsg.fetcher({
        chainId: chainId,
      }),
    { revalidateOnFocus: false }
  )
  const [msgData, setMsgData] = useState<any>({
    tvl: {
      title: `${t('totalValueLocked')}`,
      value: '',
    },
    tc: {
      title: t('totalCollateral'),
      value: '',
    },
    tb: {
      title: t('totalBorrowing'),
      value: '',
    },
    ap: {
      title: t('activePositions'),
      value: '',
    },
  })
  const msgArr = Object.keys(msgData)
  useEffect(() => {
    if (getMsgData && getMsgData.code === 200) {
      setMsgData({
        tvl: {
          title: `${t('totalValueLocked')}`,
          value: getMsgData?.data?.totalValueLocked,
        },
        tc: {
          title: t('totalCollateral'),
          value: getMsgData?.data?.totalCollateral,
        },
        tb: {
          title: t('totalBorrowing'),
          value: getMsgData?.data?.totalBorrowing,
        },
        ap: {
          title: t('activePositions'),
          value: String(getMsgData?.data?.activePositions),
        },
      })
    }
  }, [getMsgData, t])

  return (
    <Stack
      direction={{ base: 'column', xl: 'row' }}
      spacing={{ base: px2vw(17), xl: '60px' }}
      padding={{ base: px2vw(20), xl: 'inherit' }}
      ml={{ base: px2vw(10), xl: 'inherit' }}
      mr={{ base: px2vw(10), xl: 'inherit' }}
      borderRadius={{ base: 'xl', xl: 'inherit' }}
      bgColor={{ base: 'gray.100', xl: 'inherit' }}
    >
      {msgArr.map((key) => {
        return (
          <Flex
            key={key}
            direction={{ xl: 'column-reverse' }}
            bgColor={{ xl: 'gray.100' }}
            justifyContent="space-between"
            py={{ xl: '22px' }}
            w={{ base: 'full', xl: `${100 / msgArr.length}%` }}
            h={{ xl: '101px' }}
            borderRadius="md"
            align="center"
          >
            <Box textStyle={{ base: '12', xl: '18' }} className="ellipsis" maxW="full">
              {key === 'tvl' ? (
                <BaseTooltip
                  isMultiple
                  text={t('totalValueLocked')}
                  textStyles={{ textStyle: { base: '12', xl: '18' } }}
                >
                  {t('tips119')}
                </BaseTooltip>
              ) : (
                <Trans>{msgData[key]?.title}</Trans>
              )}
            </Box>
            <Box
              color="white"
              textStyle={{ base: '14', xl: '24' }}
              className="ellipsis"
              maxW="full"
            >
              {/* {msgData[key]?.value ? `$ ${new BigNumber(msgData[key]?.value).toFormat(2)}` : '--'} */}
              {msgData[key]?.value || msgData[key]?.value === 0 ? (
                <NumberTips
                  value={new BigNumber(msgData[key]?.value).toString()}
                  symbol={key === 'ap' ? undefined : '$'}
                  shortNum={2}
                />
              ) : (
                '--'
              )}
            </Box>
          </Flex>
        )
      })}
    </Stack>
  )
}

function Farm() {
  const { t } = useTranslation('farm')
  const [isFetch, setFetch] = useToggle(true) // 是否要重新请求数据
  const { userAddress } = globalStore()

  const subMenu: ISubmenu[] = useMemo(() => {
    return [
      {
        icon: completeUrl('menu/farm.png'),
        name: t('Farm'),
        content: null,
      },
    ]
  }, [t])

  useEffect(
    () => {
      setFetch(true)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userAddress]
  )

  return (
    <>
      <Box display={{ base: 'none', xl: 'initial' }}>
        <SubMenu subArr={subMenu} />
      </Box>
      <Box mt={{ base: px2vw(20), xl: '100px' }} mb={{ base: px2vw(20), xl: '50px' }}>
        <Info />
      </Box>
      <Flex direction={{ base: 'column', xl: 'row-reverse' }}>
        <Box w={{ xl: '405px' }} ml={{ xl: '55px' }}>
          {/* My Active Positions */}
          <FarmPosition isFetch={isFetch} closeFetch={() => setFetch(false)} />
        </Box>
        <Box flex={1} mt={{ base: px2vw(45), xl: 0 }}>
          {/* Pool */}
          <FarmPool afterClose={() => setFetch(true)} />
        </Box>
      </Flex>
    </>
  )
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['farm'])) },
  }
}
export default Farm
