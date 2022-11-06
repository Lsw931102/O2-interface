import React, { useEffect, useMemo, useState } from 'react'
import { Flex, Text } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import NumberTips from '../NumberTips'
// import { completeUrl } from '@/utils/common'
import useSWR from 'swr'
import { getTvl } from '@/apis/tvl'
import BigNumber from 'bignumber.js'
// import { netconfigs } from '@/consts/network'
import { useTranslation } from 'react-i18next'

const Tvl = React.memo(
  ({
    totalValueLocked,
    totalVolum,
  }: {
    totalValueLocked: number | string
    totalVolum: number | string
  }) => {
    const { t } = useTranslation(['price'])
    return (
      <Flex
        w="full"
        // h={{ base: px2vw(190), xl: '190px' }}
        mr={{ base: px2vw(15), xl: '15px' }}
        mb={{ base: px2vw(15), xl: '15px' }}
        flexDirection={{ base: 'column', xl: 'row' }}
        justifyContent={{ base: 'center', xl: 'space-around' }}
        alignItems="center"
        // borderRadius="16px"
        // bgColor="gray.200"
      >
        <Flex flexDirection="column">
          <Text textStyle="36" color="white" textAlign="center">
            {totalValueLocked ? (
              <NumberTips value={totalValueLocked} symbol="$" shortNum={2} />
            ) : (
              '--'
            )}
          </Text>
          <Text
            textStyle="24"
            color="grey.100"
            textAlign="center"
            mt={{ base: px2vw(5), xl: '10px' }}
          >
            {t('totalSupply')}
          </Text>
        </Flex>
        <Flex flexDirection="column" mt={{ base: px2vw(20), xl: 0 }}>
          <Text textStyle="36" color="white" textAlign="center">
            {totalVolum ? <NumberTips value={totalVolum} symbol="$" shortNum={2} /> : '--'}
          </Text>
          <Text
            textStyle="24"
            color="grey.100"
            textAlign="center"
            mt={{ base: px2vw(5), xl: '10px' }}
          >
            {t('totalBorrowed')}
          </Text>
        </Flex>
      </Flex>
    )
  }
)

// const Card = React.memo(({ cardInfo, index }: { cardInfo: any; index: number }) => {
//   return (
//     <Flex
//       w={{ base: px2vw(170), xl: '140px' }}
//       h={{ base: px2vw(84), xl: '84px' }}
//       mr={{ base: index % 2 === 0 ? px2vw(15) : 0, xl: '15px' }}
//       mb={{ base: px2vw(15), xl: '22px' }}
//       flexDirection="column"
//       justifyContent="center"
//       borderRadius="16px"
//       bgColor="gray.200"
//       bgImg={completeUrl(
//         `chain-bg/${cardInfo?.chain === 'okexchain' ? 'oec' : cardInfo?.chain}.png`
//       )}
//       bgRepeat="no-repeat"
//       bgSize={{ base: `${px2vw(84)} ${px2vw(84)}`, xl: '84px 84px' }}
//       bgPos="top right"
//     >
//       <Text textStyle="14" color="purple.300" textAlign="center">
//         {netconfigs[cardInfo?.chain === 'okexchain' ? 'oec' : cardInfo?.chain]?.networkName || ''}
//       </Text>
//       <Text textStyle="14" color="white" textAlign="center" mt={{ base: px2vw(10), xl: '10px' }}>
//         {cardInfo ? (
//           <NumberTips
//             value={new BigNumber(cardInfo?.lendingTVL || 0)
//               .plus(cardInfo?.stakedTVL || 0)
//               .plus(cardInfo?.borrowed || 0)
//               .toString()}
//             symbol="$"
//             shortNum={2}
//           />
//         ) : (
//           '-'
//         )}
//       </Text>
//     </Flex>
//   )
// })

function Index() {
  const { data: getTvlData } = useSWR(getTvl.key, () => getTvl.fetcher(), {
    revalidateOnFocus: false,
  })
  const [tvlData, setTvlData] = useState<any>(null)

  useEffect(() => {
    if (getTvlData && getTvlData.code === 200) {
      setTvlData(getTvlData?.data)
    }
  }, [getTvlData])

  const render = useMemo(
    () => (
      <Flex flexDirection={{ base: 'column', xl: 'row' }} w="full" p={{ base: px2vw(10), xl: 0 }}>
        <Tvl
          totalValueLocked={new BigNumber(tvlData?.lendingTVL || 0)
            .plus(tvlData?.stakedTVL || 0)
            .plus(tvlData?.borrowed || 0)
            .toString()}
          totalVolum={tvlData?.borrowed}
        />
        {/* <Flex flexWrap="wrap">
          {tvlData?.detail.map((item: any, index: number) => {
            return <Card key={index} index={index} cardInfo={item} />
          })}
        </Flex> */}
      </Flex>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tvlData]
  )
  return render
}

export default React.memo(Index)
