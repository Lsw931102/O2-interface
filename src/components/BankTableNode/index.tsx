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
        bgColor="green.570"
        iconBg="gray.700"
        iconStyle={{ color: 'white' }}
        textStyle={{ color: 'white' }}
        buttonClick={() => {
          onButtonsClick('Deposit', record)
        }}
      />
      <BaseButton
        w="138px"
        text={t('Withdraw')}
        buttonType="remove"
        bgColor="green.570"
        iconBg="gray.700"
        iconStyle={{ color: 'white' }}
        textStyle={{ color: 'white' }}
        buttonClick={() => {
          onButtonsClick('Withdraw', record)
        }}
      />
      <BaseButton
        w="121px"
        text={t('Borrow')}
        buttonType="add"
        bgColor="green.570"
        iconBg="gray.700"
        iconStyle={{ color: 'white' }}
        textStyle={{ color: 'white' }}
        buttonClick={() => {
          onButtonsClick('Borrow', record)
        }}
      />
      <BaseButton
        w="112px"
        text={t('Repay')}
        buttonType="remove"
        bgColor="green.570"
        iconBg="gray.700"
        iconStyle={{ color: 'white' }}
        textStyle={{ color: 'white' }}
        buttonClick={() => {
          onButtonsClick('Repay', record)
        }}
      />
      <BaseButton
        w="149px"
        text={t('TokenInfo')}
        buttonType="shutOff"
        bgColor="green.570"
        iconBg="gray.700"
        iconStyle={{ color: 'white' }}
        textStyle={{
          marginRight: '15px',
          whiteSpace: 'nowrap',
          color: 'white',
        }}
        specialIcon={<Image src={signal} />}
        onClick={() => router.push(`/marketinfo?token=${underlying}`)}
      />
    </HStack>
  )
}
export default Index
