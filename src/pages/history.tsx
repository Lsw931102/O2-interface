import React, { useMemo, useState } from 'react'
import { getI18nSSRProps, GetI18nServerSideProps } from '@/utils/i18n'
import { useTranslation } from 'next-i18next'
import BankTransactionPage from '@/components/History/BankTransactionPage'

function History() {
  const { t } = useTranslation(['history'])
  const [selectValue, setSelectValue] = useState('BankTransaction') // 下拉框的值

  // 下拉框数组
  const selectOptions = [
    {
      label: t('BankTransaction'),
      value: 'BankTransaction',
    },
    // {
    //   label: t('FarmTransaction'),
    //   value: 'FarmTransaction',
    // },
    {
      label: t('Liquidated'),
      value: 'Liquidated',
    },
  ]

  const render = useMemo(
    () => (
      <BankTransactionPage
        selectOptions={selectOptions}
        selectValue={selectValue}
        selectChange={(val: string) => setSelectValue(val)}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectValue]
  )

  return render
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['history'])) },
  }
}
export default History
