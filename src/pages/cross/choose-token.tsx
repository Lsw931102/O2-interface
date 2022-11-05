import React from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { CrossTokenContent } from '@/components/Modals/CrossModal'
import ChoosePage from '@/components/ChoosePage'

import crossStore from '@/stores/pages/cross'

import { GetI18nServerSideProps, getI18nSSRProps } from '@/utils/i18n'

function Index() {
  const router = useRouter()

  const { t } = useTranslation(['cross'])

  const { setSelectToken, setSelectChain } = crossStore()

  return (
    <ChoosePage title={t('Choose a token to refinance')}>
      <CrossTokenContent
        onItemClick={(item) => {
          setSelectToken(item)
          setSelectChain(null)
          router.push('/cross')
        }}
      />
    </ChoosePage>
  )
}
export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['cross'])) },
  }
}

export default Index
