import React from 'react'
import { getI18nSSRProps, GetI18nServerSideProps } from '@/utils/i18n'
import StakePage from '@/components/StakePage'

function Stake() {
  return <StakePage />
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['stake'])) },
  }
}
export default Stake
