import React from 'react'
import { Flex, Text, Center } from '@chakra-ui/react'
// import { cloneDeep } from 'lodash'

import px2vw from '@/utils/px2vw'
import NumberTips from '../NumberTips'
import BaseButton from '../BaseButton'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import BaseTooltip from '../BaseTooltip'

export interface IProps {
  record: any
  underlying?: string
  type: string
  onButtonsClick: (type: string, record: any) => void
}

function Index({ record, underlying, type, onButtonsClick }: IProps) {
  const { t } = useTranslation(['bank'])
  const router = useRouter()

  return (
    <Flex flexDirection="column" paddingBottom={px2vw(15)}>
      {/* liquidity & Utilization */}
      <Flex justifyContent="space-around" mb={px2vw(25)}>
        <Center display="flex" flexDirection="column">
          <Text textStyle="12" color="white" fontWeight="bold" mb={px2vw(10)}>
            {t('liquidity')}
          </Text>
          <Text textStyle="16" color="purple.300" fontWeight="normal">
            <NumberTips value={record?.liquidity} isAbbr />
          </Text>
        </Center>
        <Center display="flex" flexDirection="column">
          {/* <Text textStyle="12" color="white" fontWeight="bold" mb={px2vw(10)}>
            {t('utilization')}
          </Text> */}

          <BaseTooltip
            text={t('utilization')}
            textStyles={{
              fontSize: '12px',
              lineHeight: '12px',
              color: 'white',
              mb: px2vw(10),
            }}
            iconBefore
          >
            <Text
              textStyle="14"
              lineHeight={{ base: px2vw(18), xl: '18px' }}
              whiteSpace="break-spaces"
              mb="10px"
            >
              {t('UtilizationToolTips1')}
            </Text>
            <Text
              textStyle="14"
              lineHeight={{ base: px2vw(18), xl: '18px' }}
              whiteSpace="break-spaces"
            >
              {t('UtilizationToolTips2')}
            </Text>
          </BaseTooltip>
          <Text textStyle="16" color="purple.300" fontWeight="normal">
            <NumberTips value={record?.utilization} isRatio />
          </Text>
        </Center>
      </Flex>
      {/* 按钮组 */}
      <Flex justifyContent="space-between">
        <BaseButton
          text={t('TokenInfo')}
          w={px2vw(110)}
          h={px2vw(40)}
          px="0"
          bgColor="gray.200"
          textStyle={{
            textStyle: '14',
            color: 'purple.300',
          }}
          onClick={() => router.push(`/marketinfo?token=${underlying}`)}
        />
        <BaseButton
          text={type === '1' ? `${t('Withdraw')} -` : `${t('Repay')} -`}
          w={px2vw(100)}
          h={px2vw(40)}
          px="0"
          bgColor="gray.200"
          buttonClick={() => {
            if (type === '1') {
              onButtonsClick('Withdraw', record)
              // setDespositTab({
              //   label: 'WITHDRAW',
              //   value: 'WITHDRAW',
              // })
              // dashboardStore.setState({
              //   depositModalIsOpen: true,
              // })
            } else {
              onButtonsClick('Repay', record)
              // setCurrentBorrowTab({
              //   label: 'REPAY',
              //   value: 'REPAY',
              // })
              // dashboardStore.setState({
              //   borrowModalIsOpen: true,
              // })
            }
          }}
          textStyle={{
            textStyle: '14',
            color: type === '1' ? 'green.100' : 'purple.100',
          }}
        />
        <BaseButton
          text={type === '1' ? `${t('Deposit')} +` : `${t('Borrow')} +`}
          w={px2vw(90)}
          h={px2vw(40)}
          px="0"
          buttonClick={() => {
            if (type === '1') {
              onButtonsClick('Deposit', record)
              // setDespositTab({ label: 'DEPOSIT', value: 'DEPOSIT' })
              // dashboardStore.setState({
              //   depositModalIsOpen: true,
              // })
            } else {
              onButtonsClick('Borrow', record)
              // setCurrentBorrowTab({ label: 'BORROW', value: 'BORROW' })
              // dashboardStore.setState({
              //   borrowModalIsOpen: true,
              // })
            }
          }}
          bgColor="gray.200"
          textStyle={{
            textStyle: '14',
            color: type === '1' ? 'green.100' : 'purple.100',
          }}
        />
      </Flex>
    </Flex>
  )
}
export default Index
