import React from 'react'
import { Box, Flex, Text, Image, ImageProps, FlexProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { completeUrl } from '@/utils/common'
import NumberTips from '../NumberTips'
import logo from '@/assets/images/o2Logo.png'
import BaseButton from '../BaseButton'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { netconfigs } from '@/consts/network'
import BigNumber from 'bignumber.js'
import globalStore from '@/stores/global'

export interface IProps {
  tvl?: string | number
  marketSize?: string | number
  chainOrder: string[]
  maxSupply?: string | number
  totalSupply?: string | number
  price?: string | number
}

// 返回pc端图片
const ReturnPCIcon = ({
  flexProp,
  imageProp,
  text,
  text2,
}: {
  flexProp?: FlexProps
  imageProp?: ImageProps
  text?: string
  text2?: string
}) => {
  return (
    <Flex
      flexDirection="column"
      pos={{ base: 'relative', xl: 'absolute' }}
      mt={{ base: px2vw(30), xl: 0 }}
      {...flexProp}
    >
      <Flex flexDirection="column" justifyContent="flex-end" h={{ base: px2vw(42), xl: 'auto' }}>
        <Image mx="auto" {...imageProp} />
      </Flex>
      <Flex h={{ base: px2vw(40), xl: 'auto' }} flexDirection="column" justifyContent="center">
        {text && (
          <Text
            textStyle={{ base: '12', xl: '24' }}
            mt={{ base: px2vw(12), xl: '5px' }}
            color="purple.300"
            textAlign="center"
            fontWeight="bold"
          >
            {text}
          </Text>
        )}
        {text2 && (
          <Text
            textStyle={{ base: '12', xl: '24' }}
            lineHeight={{ base: px2vw(14), xl: '16px' }}
            mt={{ base: px2vw(0), xl: '5px' }}
            fontWeight="bold"
            color="purple.300"
            textAlign="center"
          >
            {text2}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}

// 返回链图标
const ReturnChainIcon = ({
  netIndex,
  flexProp,
  prop,
}: {
  netIndex?: number
  flexProp?: FlexProps
  prop: any
}) => {
  if (prop.chainOrder) {
    const list = prop.chainOrder.map((item: any) => {
      return String(
        Object.values(netconfigs).find((ite) => Number(ite?.apiChainType) === Number(item))
          ?.networkName
      ).toLowerCase()
    })
    if (list[netIndex as number]) {
      return (
        <Flex pos="absolute" {...flexProp}>
          <Image
            w="40px"
            h="40px"
            mx="auto"
            opacity="0.4"
            src={completeUrl(`chain/${list[netIndex as number]}.png`)}
          />
        </Flex>
      )
    }
  }
}

function Index({ ...prop }: IProps) {
  const { isPC } = globalStore()
  const { t } = useTranslation(['official'])
  const router = useRouter()

  return (
    <>
      <Image
        src={completeUrl('officiaPeople.svg')}
        mx="auto"
        w={{ base: px2vw(321), xl: '700px' }}
        h={{ base: px2vw(22), xl: '48px' }}
        mb={{ base: px2vw(20), xl: '52px' }}
      />
      <Box
        w={{ base: 'full', xl: '1122px' }}
        h={{ base: 'auto', xl: '810px' }}
        mx="auto"
        bgImage={{ base: '', xl: completeUrl('official-website/topBg.svg') }}
        pos="relative"
      >
        {/* 链 */}
        {isPC && (
          <Box>
            {ReturnChainIcon({
              netIndex: 0,
              flexProp: {
                left: '96px',
                bottom: '207px',
              },
              prop,
            })}
            {ReturnChainIcon({
              netIndex: 1,
              flexProp: {
                left: '41px',
                top: '270px',
              },
              prop,
            })}
            {ReturnChainIcon({
              netIndex: 2,
              flexProp: {
                left: '365px',
                bottom: '178px',
              },
              prop,
            })}
            {ReturnChainIcon({
              netIndex: 3,
              flexProp: {
                right: '359px',
                bottom: '183px',
              },
              prop,
            })}
            {ReturnChainIcon({
              netIndex: 4,
              flexProp: {
                right: '116px',
                top: '170px',
              },
              prop,
            })}
            {ReturnChainIcon({
              netIndex: 5,
              flexProp: {
                right: '22px',
                top: '327px',
              },
              prop,
            })}
            {ReturnChainIcon({
              netIndex: 6,
              flexProp: {
                right: '260px',
                top: '282px',
              },
              prop,
            })}
            {ReturnChainIcon({
              netIndex: 7,
              flexProp: {
                right: '600px',
                top: '63px',
              },
              prop,
            })}
          </Box>
        )}
        {/* 数据版块 */}
        <Flex flexDirection="column" mt={{ base: 0, xl: '214px' }}>
          {/* logo */}
          <Flex justifyContent="space-around" mb={{ base: px2vw(28), xl: '0' }}>
            <Image
              display={{ base: 'none', xl: 'initial' }}
              mb={{ base: 0, xl: '35px' }}
              src={logo}
            />
            <Image
              display={{ base: 'initial', xl: 'none' }}
              mb={{ base: 0, xl: '10px' }}
              src={logo}
            />
            <BaseButton
              needVerify={false}
              display={{ base: 'block', xl: 'none' }}
              w={{ base: px2vw(106), xl: '106px' }}
              h={{ base: px2vw(46), xl: '40px' }}
              borderRadius="50px"
              bgColor="yellow.100"
              my="auto"
              text="APP"
              textStyle={{
                color: 'gray.700',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
              specialIconIsLeft
              specialIcon={
                <Image
                  w={{ base: px2vw(24), xl: '24px' }}
                  h={{ base: px2vw(24), xl: '24px' }}
                  mr={{ base: px2vw(10), xl: '10px' }}
                  my="auto"
                  src={completeUrl('official-website/rocket.svg')}
                />
              }
              onClick={() => router.push('/markets')}
            />
          </Flex>
          {/* Total Value */}
          <Text
            textAlign="center"
            color="#D2E4FF"
            fontSize={{ base: px2vw(40), xl: '60px' }}
            lineHeight={{ base: px2vw(40), xl: '60px' }}
            fontWeight="bold"
            mb={{ base: px2vw(5), xl: '10px' }}
          >
            {prop?.tvl ? <NumberTips value={prop?.tvl} symbol="$" isAbbr shortNum={2} /> : '--'}
          </Text>
          {/* 副标题 */}
          <Text
            textAlign="center"
            color="#D2E4FF"
            fontSize={{ base: px2vw(18), xl: '22px' }}
            lineHeight={{ base: px2vw(18), xl: '22px' }}
            fontWeight="900"
            mb={{ base: px2vw(15), xl: '40px' }}
          >
            {t('totalValue')}
          </Text>
          {/* Market Size */}
          <Flex
            justifyContent="center"
            alignItems="center"
            direction={{ base: 'row', xl: 'column-reverse' }}
          >
            <Text
              color="white"
              fontSize={{ base: px2vw(16), xl: '18px' }}
              lineHeight={{ base: px2vw(24), xl: '36px' }}
              fontWeight="bold"
              mr={{ base: px2vw(10), xl: '10px' }}
            >
              {t('marketSize')}
            </Text>
            <Text
              color="white"
              fontSize={{ base: px2vw(24), xl: '36px' }}
              lineHeight={{ base: px2vw(24), xl: '36px' }}
              fontWeight="bold"
            >
              {prop?.marketSize ? (
                <NumberTips value={prop?.marketSize} symbol="$" isAbbr shortNum={2} />
              ) : (
                '--'
              )}
            </Text>
          </Flex>
        </Flex>
        {/* 图标 */}
        <Flex
          display={{ base: 'none', xl: 'flex' }}
          justifyContent="space-between"
          px={{ base: px2vw(20), xl: '0' }}
        >
          {ReturnPCIcon({
            flexProp: {
              left: { base: 'auto', xl: '219px' },
              top: { base: 'auto', xl: '136px' },
            },
            imageProp: {
              w: { base: px2vw(50), xl: '103px' },
              h: { base: px2vw(42), xl: '86px' },
              src: completeUrl('official-website/Lending.svg'),
            },
            text: t('Lending'),
          })}
          {ReturnPCIcon({
            flexProp: {
              right: { base: 'auto', xl: '385px' },
              top: { base: 'auto', xl: '54px' },
            },
            imageProp: {
              w: { base: px2vw(50), xl: '110px' },
              h: { base: px2vw(29), xl: '64px' },
              src: completeUrl('official-website/Leveraged.svg'),
            },
            text: t('Leveraged'),
          })}
          {ReturnPCIcon({
            flexProp: {
              left: { base: 'auto', xl: '180px' },
              bottom: { base: 'auto', xl: '310px' },
            },
            imageProp: {
              w: { base: px2vw(60), xl: '120px' },
              h: { base: px2vw(38), xl: '74px' },
              src: completeUrl('official-website/CrossChain.svg'),
            },
            text: t('CrossChain'),
          })}
          {ReturnPCIcon({
            flexProp: {
              right: { base: 'auto', xl: '82px' },
              bottom: { base: 'auto', xl: '248px' },
            },
            imageProp: {
              w: { base: px2vw(50), xl: '100px' },
              h: { base: px2vw(40), xl: '90px' },
              src: completeUrl('official-website/HighRisk.svg'),
            },
            text: t('HighRisk'),
            text2: t('TokenLending'),
          })}
        </Flex>
        <Flex
          display={{ base: 'flex', xl: 'none' }}
          justifyContent="space-between"
          px={{ base: px2vw(20), xl: '0' }}
        >
          {ReturnPCIcon({
            flexProp: {
              left: { base: 'auto', xl: '219px' },
              top: { base: 'auto', xl: '136px' },
            },
            imageProp: {
              w: { base: px2vw(50), xl: '103px' },
              h: { base: px2vw(42), xl: '86px' },
              src: completeUrl('official-website/LendingMobile.svg'),
            },
            text: t('Lending'),
          })}
          {ReturnPCIcon({
            flexProp: {
              right: { base: 'auto', xl: '385px' },
              top: { base: 'auto', xl: '54px' },
            },
            imageProp: {
              w: { base: px2vw(50), xl: '110px' },
              h: { base: px2vw(29), xl: '64px' },
              src: completeUrl('official-website/LeveragedMobile.svg'),
            },
            text: t('Leveraged'),
          })}
          {ReturnPCIcon({
            flexProp: {
              left: { base: 'auto', xl: '180px' },
              bottom: { base: 'auto', xl: '310px' },
            },
            imageProp: {
              w: { base: px2vw(60), xl: '120px' },
              h: { base: px2vw(38), xl: '74px' },
              src: completeUrl('official-website/CrossChainMobile.svg'),
            },
            text: t('CrossChain'),
          })}
          {ReturnPCIcon({
            flexProp: {
              right: { base: 'auto', xl: '82px' },
              bottom: { base: 'auto', xl: '248px' },
            },
            imageProp: {
              w: { base: px2vw(50), xl: '100px' },
              h: { base: px2vw(40), xl: '90px' },
              src: completeUrl('official-website/HighRiskMobile.svg'),
            },
            text: t('HighRisk'),
            text2: t('TokenLending'),
          })}
        </Flex>
        {/* 移动端链背景图 */}
        {!isPC && (
          <Box w="full" px={px2vw(10)} mt={px2vw(30)} pos="relative">
            <Box
              w="full"
              h={px2vw(269)}
              bgImage={completeUrl('official-website/topBgMobile.svg')}
              bgRepeat="no-repeat"
              bgSize="contain"
              pos="relative"
            />
            <Box>
              {ReturnChainIcon({
                netIndex: 0,
                flexProp: {
                  right: px2vw(50),
                  bottom: px2vw(42),
                },
                prop,
              })}
              {ReturnChainIcon({
                netIndex: 1,
                flexProp: {
                  right: px2vw(178),
                  bottom: px2vw(47),
                },
                prop,
              })}
              {ReturnChainIcon({
                netIndex: 2,
                flexProp: {
                  left: px2vw(41),
                  bottom: px2vw(90),
                },
                prop,
              })}
              {ReturnChainIcon({
                netIndex: 3,
                flexProp: {
                  right: px2vw(54),
                  top: px2vw(25),
                },
                prop,
              })}
              {ReturnChainIcon({
                netIndex: 4,
                flexProp: {
                  right: px2vw(115),
                  top: px2vw(95),
                },
                prop,
              })}
              {ReturnChainIcon({
                netIndex: 5,
                flexProp: {
                  left: px2vw(163),
                  top: px2vw(36),
                },
                prop,
              })}
              {ReturnChainIcon({
                netIndex: 6,
                flexProp: {
                  left: px2vw(117),
                  top: px2vw(89),
                },
                prop,
              })}
              {ReturnChainIcon({
                netIndex: 7,
                flexProp: {
                  left: px2vw(74),
                  top: px2vw(46),
                },
                prop,
              })}
            </Box>
          </Box>
        )}
        {/* 数据 */}
        <Flex
          justifyContent={{ base: 'space-between', xl: 'center' }}
          flexWrap="wrap"
          mt={{ base: px2vw(30), xl: '287px' }}
          px={{ base: px2vw(30), xl: '0' }}
        >
          {/* Max Supply & Total Supply */}
          <Flex
            flexDirection={{ base: 'column', xl: 'row' }}
            w={{ base: 'full', xl: 'auto' }}
            justifyContent={{ base: 'space-between', xl: 'inherit' }}
            mr={{ base: 0, xl: '140px' }}
            mb={{ base: px2vw(25), xl: '0' }}
          >
            <Flex
              flexDirection="column"
              mr={{ base: 0, xl: '70px' }}
              mb={{ base: px2vw(25), xl: 0 }}
            >
              <Text
                textAlign={{ base: 'center', xl: 'left' }}
                textStyle="24"
                fontWeight="bold"
                color="purple.300"
                mb={{ base: px2vw(5), xl: '5px' }}
              >
                {prop?.maxSupply ? (
                  <NumberTips value={new BigNumber(prop?.maxSupply).toFixed(0)} />
                ) : (
                  '--'
                )}
              </Text>
              <Text
                textAlign={{ base: 'center', xl: 'left' }}
                textStyle="14"
                fontWeight="500"
                color="purple.300"
              >
                {t('MaxSupply')}
              </Text>
            </Flex>
            <Flex flexDirection="column">
              <Text
                textAlign={{ base: 'center', xl: 'left' }}
                textStyle="24"
                fontWeight="bold"
                color="purple.300"
                mb={{ base: px2vw(5), xl: '5px' }}
              >
                {prop?.totalSupply ? (
                  <NumberTips value={new BigNumber(prop?.totalSupply).toFixed(0)} />
                ) : (
                  '--'
                )}
              </Text>
              <Text
                textAlign={{ base: 'center', xl: 'left' }}
                textStyle="14"
                fontWeight="500"
                color="purple.300"
              >
                {t('TotalSupply')}
              </Text>
            </Flex>
          </Flex>
          {/* Price & Buy */}
          <Flex
            w={{ base: 'full', xl: 'auto' }}
            justifyContent={{ base: 'space-between', xl: 'inherit' }}
          >
            <Flex flexDirection="column" mr={{ base: 0, xl: '70px' }}>
              <Text
                textStyle="24"
                fontWeight="bold"
                color="purple.300"
                mb={{ base: px2vw(5), xl: '5px' }}
              >
                {prop?.price ? <NumberTips value={prop?.price} shortNum={2} /> : '--'}
              </Text>
              <Text textStyle="14" fontWeight="500" color="purple.300">
                {t('Price')}
              </Text>
            </Flex>
            {/* <Flex
              flexDirection="column"
              justifyContent="center"
              cursor="pointer"
              onClick={() =>
                window.open(
                  i18n?.language === 'en'
                    ? 'https://coinmarketcap.com/currencies/flux-protocol/markets/'
                    : 'https://coinmarketcap.com/zh/currencies/flux-protocol/markets/'
                )
              }
            >
              <Flex mb={{ base: px2vw(5), xl: '5px' }}>
                <Text
                  textStyle="24"
                  lineHeight={{ base: px2vw(24), xl: '20px' }}
                  fontWeight="bold"
                  color="yellow.100"
                  mr={{ base: px2vw(5), xl: '5px' }}
                >
                  {t('BUY')}
                </Text>
                <Image w="20px" h="20px" src={completeUrl('official-website/buy.svg')} />
              </Flex>
              <Text textStyle="14" fontWeight="500" color="yellow.100">
                {t('FLUXToken')}
              </Text>
            </Flex> */}
          </Flex>
        </Flex>
      </Box>
    </>
  )
}

export default React.memo(Index)
