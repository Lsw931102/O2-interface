import React from 'react'
import { Box, Flex, Text, Image } from '@chakra-ui/react'
import { toast } from 'react-toastify'
import px2vw from '@/utils/px2vw'
import { completeUrl, findIcon } from '@/utils/common'
import NumberTips from '../NumberTips'
import { useTranslation } from 'next-i18next'
import fluxReportStore from '@/stores/contract/fluxReport'

export interface IProps {
  activeToken: string
  chooseToken: () => void
}

function Index({ ...prop }: IProps) {
  const { bankDetail } = fluxReportStore()
  const { t } = useTranslation(['currencyDetails'])

  return (
    <Box
      pt={{ base: px2vw(25), xl: '25px' }}
      pr={{ base: px2vw(25), xl: '25px' }}
      pb={{ base: px2vw(30), xl: '30px' }}
      pl={{ base: px2vw(20), xl: '20px' }}
    >
      {/* 币种选择 */}
      <Flex
        justifyContent="center"
        mb={{ base: px2vw(10), xl: '10px' }}
        cursor="pointer"
        onClick={() => prop.chooseToken()}
      >
        {/* 图标 */}
        {prop.activeToken ? (
          <Image
            src={findIcon(prop.activeToken)}
            w={{ base: px2vw(60), xl: '60px' }}
            h={{ base: px2vw(60), xl: '60px' }}
            mr={{ base: px2vw(10), xl: '10px' }}
            borderRadius="50%"
          />
        ) : (
          <Box
            bgColor="white"
            w={{ base: px2vw(60), xl: '60px' }}
            h={{ base: px2vw(60), xl: '60px' }}
            mr={{ base: px2vw(10), xl: '10px' }}
            borderRadius="50%"
          />
        )}
        <Text
          color="purple.300"
          textStyle="24"
          lineHeight={{ base: px2vw(60), xl: '60px' }}
          mr={{ base: px2vw(20), xl: '20px' }}
        >
          {prop.activeToken || '--'}
        </Text>
        <Image
          src={completeUrl('currency-details/downIcon.svg')}
          w={{ base: px2vw(20), xl: '20px' }}
          h={{ base: px2vw(10), xl: '10px' }}
          my="auto"
        />
      </Flex>
      {/* 数据 */}
      <Flex flexWrap="wrap" justifyContent="space-between">
        {/* Market Size */}
        <Flex
          flexDirection="column"
          w="50%"
          mt={{ base: px2vw(20), xl: '20px' }}
          h={{ base: px2vw(35), xl: '35px' }}
        >
          <Text
            textStyle="14"
            color="purple.300"
            fontWeight="normal"
            textAlign="center"
            mb={{ base: px2vw(5), xl: '5px' }}
          >
            {t('marketSize')}
          </Text>
          <Text textStyle="16" color="purple.300" fontWeight="bold" textAlign="center">
            {bankDetail?.marketSize !== undefined && bankDetail?.marketSize !== null ? (
              <NumberTips value={bankDetail?.marketSize} symbol="$" isAbbr shortNum={2} />
            ) : (
              '--'
            )}
          </Text>
        </Flex>
        {/* 分享 */}
        <Flex
          w="50%"
          justifyContent="center"
          cursor="pointer"
          mt={{ base: px2vw(20), xl: '20px' }}
          h={{ base: px2vw(35), xl: '35px' }}
          onClick={() =>
            toast.warn(t('ChartsToast'), {
              position: 'top-center',
              autoClose: 3000,
              hideProgressBar: true,
              theme: 'colored',
            })
          }
        >
          <Text color="purple.300" textStyle="16" lineHeight={{ base: px2vw(35), xl: '35px' }}>
            {t('Charts')}
          </Text>
          <Image
            src={completeUrl('currency-details/share.svg')}
            w={{ base: px2vw(13), xl: '13px' }}
            h={{ base: px2vw(11), xl: '11px' }}
            my="auto"
          />
        </Flex>
        {/* liquidity */}
        <Flex
          flexDirection="column"
          w="50%"
          mt={{ base: px2vw(20), xl: '20px' }}
          h={{ base: px2vw(35), xl: '35px' }}
        >
          <Text
            textStyle="14"
            color="purple.300"
            fontWeight="normal"
            textAlign="center"
            mb={{ base: px2vw(5), xl: '5px' }}
          >
            {t('liquidity')}
          </Text>
          <Text textStyle="16" color="purple.300" fontWeight="bold" textAlign="center">
            {bankDetail?.liquidity !== undefined && bankDetail?.liquidity !== null ? (
              <NumberTips value={bankDetail?.liquidity} symbol="$" isAbbr shortNum={2} />
            ) : (
              '--'
            )}
          </Text>
        </Flex>
        {/* Total Borrowing */}
        <Flex
          flexDirection="column"
          w="50%"
          mt={{ base: px2vw(20), xl: '20px' }}
          h={{ base: px2vw(35), xl: '35px' }}
        >
          <Text
            textStyle="14"
            color="purple.300"
            fontWeight="normal"
            textAlign="center"
            mb={{ base: px2vw(5), xl: '5px' }}
          >
            {t('TotalBorrowing')}
          </Text>
          <Text textStyle="16" color="purple.300" fontWeight="bold" textAlign="center">
            {bankDetail?.totalBorrowingsPrice !== undefined &&
            bankDetail?.totalBorrowingsPrice !== null ? (
              <NumberTips value={bankDetail?.totalBorrowingsPrice} symbol="$" isAbbr shortNum={2} />
            ) : (
              '--'
            )}
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}

export default React.memo(Index)
