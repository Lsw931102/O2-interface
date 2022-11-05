import React from 'react'
import { useTranslation } from 'next-i18next'

import { CrossChainContent } from '@/components/Modals/CrossModal'
import ChoosePage from '@/components/ChoosePage'

import { GetI18nServerSideProps, getI18nSSRProps } from '@/utils/i18n'

function Index() {
  const { t } = useTranslation(['cross'])
  return (
    <ChoosePage title={t('Choose Chain')}>
      <CrossChainContent />
    </ChoosePage>
  )
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['cross'])) },
  }
}
export default Index
