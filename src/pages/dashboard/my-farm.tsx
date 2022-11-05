import React, { useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { getI18nSSRProps, GetI18nServerSideProps } from '@/utils/i18n'

import SubMenu from '@/components/SubMenu'
import { completeUrl } from '@/utils/common'
import Loading from '@/components/Loading'
import Select from '@/components/Select'
import { dashboardSubMenu } from '@/components/DashboardUI/MobileUI'

import px2vw from '@/utils/px2vw'

const MyFarm = dynamic(() => import('@/components/MyFarm'), {
  ssr: false,
  loading: () => <Loading loading />,
})

function Farm() {
  const { t } = useTranslation(['farm'])

  const router = useRouter()

  const subMenu: any[] = useMemo(() => {
    return [
      {
        label: t('My Bank'),
        value: '0',
        icon: completeUrl('menu/bank.png'),
        name: t('My Bank'),
        content: null,
        onClick: () => {
          router.push({ pathname: '/dashboard' })
        },
      },
      {
        label: t('My Farm'),
        value: '1',
        icon: completeUrl('menu/farm.png'),
        name: t('My Farm'),
        content: null,
      },
    ]
  }, [t, router])

  return (
    <>
      <Box display={{ base: 'none', xl: 'initial' }}>
        <SubMenu subArr={subMenu} defaultIndex={1} onChange={() => null} />
      </Box>
      <Select
        display={{ base: 'flex', xl: 'none' }}
        marginTop={{ base: px2vw(30) }}
        marginLeft={{ base: px2vw(10) }}
        value="/dashboard/my-farm"
        alignSelf="start"
        isAuto={false}
        options={dashboardSubMenu}
        valueChange={(item: any) => {
          router.push(item.value)
        }}
      />
      <MyFarm />
    </>
  )
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['farm'])) },
  }
}
export default Farm
