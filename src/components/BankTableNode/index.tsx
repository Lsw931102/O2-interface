import React from 'react'
import { HStack, Image } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import BaseButton from '@/components/BaseButton'

import signal from '@/assets/images/svg/signal.svg'
export interface IProps {
  record: any
  underlying?: string
  onButtonsClick: (type: string, record: any) => void
}

function Index({ record, underlying, onButtonsClick }: IProps) {
  const { t } = useTranslation(['bank'])
  const router = useRouter()

  return (
    <HStack spacing="45px" justifyContent="end" marginRight="15px">
      <BaseButton
        w="124px"
        text={t('Deposit')}
        buttonType="add"
        iconBg="gray.700"
        iconStyle={{ color: 'green.100' }}
        buttonClick={() => {
          onButtonsClick('Deposit', record)
        }}
      />
      <BaseButton
        w="138px"
        text={t('Withdraw')}
        buttonType="remove"
        iconBg="gray.700"
        iconStyle={{ color: 'green.100' }}
        buttonClick={() => {
          onButtonsClick('Withdraw', record)
        }}
      />
      <BaseButton
        w="121px"
        text={t('Borrow')}
        buttonType="add"
        iconBg="gray.700"
        iconStyle={{ color: 'green.100' }}
        buttonClick={() => {
          onButtonsClick('Borrow', record)
        }}
      />
      <BaseButton
        w="112px"
        text={t('Repay')}
        buttonType="remove"
        iconBg="gray.700"
        iconStyle={{ color: 'green.100' }}
        buttonClick={() => {
          onButtonsClick('Repay', record)
        }}
      />
      <BaseButton
        w="149px"
        text={t('TokenInfo')}
        buttonType="shutOff"
        iconBg="gray.700"
        textStyle={{
          marginRight: '15px',
          whiteSpace: 'nowrap',
        }}
        specialIcon={<Image src={signal} />}
        iconStyle={{ color: 'green.100' }}
        onClick={() => router.push(`/marketinfo?token=${underlying}`)}
      />
    </HStack>
  )
}
export default Index
