import React from 'react'
import { Stack, Image, Text } from '@chakra-ui/react'

import px2vw from '@/utils/px2vw'

import eosDefi from '@/assets/images/eosDefi.png'
import O2HomeLogo from '@/assets/images/O2HomeLogo.png'
import NumberTips from '../NumberTips'
import BigNumber from 'bignumber.js'

export interface IProps {
  tvl?: string | number
  marketSize?: string | number
  chainOrder: string[]
  maxSupply?: string | number
  totalSupply?: string | number
  price?: string | number
}
function Index(props: IProps) {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      spacing={{ base: px2vw(50), md: '100px' }}
      margin="0 auto"
      justify="center"
      alignItems="center"
    >
      {/* LEFT AREA */}
      <Stack direction="column" spacing="30px" alignItems="center">
        <Image
          src={O2HomeLogo}
          height={{ base: px2vw(239), md: '280px' }}
          width={{ base: px2vw(239), md: '280px' }}
        />
        <Image
          src={eosDefi}
          width={{ base: px2vw(200), md: '200px' }}
          height={{ base: px2vw(48), md: '48px' }}
        />
      </Stack>
      {/* RIGHT AREA */}

      <Stack direction="column" spacing="40px" alignItems={{ base: 'center', md: 'flex-start' }}>
        {/* totalValue */}
        <Stack direction="column" spacing="10px">
          <Text textStyle={{ base: '40', md: '60' }}>
            {props?.tvl ? <NumberTips value={props?.tvl} symbol="$" isAbbr shortNum={2} /> : '--'}
          </Text>
          <Text textStyle={{ base: '16', md: '22' }} color="purple.300">
            Total value locked in O2
          </Text>
        </Stack>
        {/* marketSize */}
        <Stack direction="column" spacing="10px">
          <Text textStyle={{ base: '24', md: '36' }}>
            {props?.marketSize ? (
              <NumberTips value={props?.marketSize} symbol="$" isAbbr shortNum={2} />
            ) : (
              '--'
            )}
          </Text>
          <Text textStyle={{ base: '16', md: '22' }} color="purple.300">
            Market Size
          </Text>
        </Stack>
        {/* otherInfos */}
        <Stack direction="row" spacing="10px">
          <Stack
            padding={`0 20px`}
            borderLeft={{ base: '0', md: '2px solid' }}
            borderColor="silver.200"
          >
            <Text textStyle="14" color="purple.300">
              Max Supply
            </Text>
            <Text textStyle={{ base: '18', md: '24' }} fontWeight="500" color="white">
              {props?.maxSupply ? (
                <NumberTips value={new BigNumber(props?.maxSupply).toFixed(0)} />
              ) : (
                '--'
              )}
            </Text>
          </Stack>
          <Stack padding={`0 20px`} borderLeft="2px solid" borderColor="silver.200">
            <Text textStyle="14" color="purple.300">
              Total Supply
            </Text>
            <Text textStyle={{ base: '18', md: '24' }} fontWeight="500" color="white">
              {props?.totalSupply ? (
                <NumberTips value={new BigNumber(props?.totalSupply).toFixed(0)} />
              ) : (
                '--'
              )}
            </Text>
          </Stack>
          {/* <Stack padding={`0 20px`} borderLeft="2px solid" borderColor="silver.200">
            <Text textStyle="14" color="purple.300">
              O2 Price
            </Text>
            <Text textStyle="24" fontWeight="500" color="white">
              {props?.price ? <NumberTips value={props?.price} shortNum={2} symbol="$" /> : '--'}
            </Text>
          </Stack> */}
        </Stack>
      </Stack>
    </Stack>
  )
}
export default Index
