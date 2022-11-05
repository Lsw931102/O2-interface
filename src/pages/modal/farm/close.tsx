import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/router'

import px2vw from '@/utils/px2vw'
import { getI18nSSRProps, GetI18nServerSideProps } from '@/utils/i18n'
import Loading from '@/components/Loading'
import farmStore from '@/stores/contract/farm'

const CloseModal = dynamic(() => import('@/components/MyFarm/CloseModal'), {
  ssr: false,
  loading: () => <Loading loading />,
})

function Farm() {
  const router = useRouter()
  const { mobileData } = farmStore()

  useEffect(
    () => {
      if (mobileData === null) {
        router.back()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mobileData]
  )

  return (
    <>
      <Box py={px2vw(20)} px={px2vw(20)}>
        {mobileData && (
          <CloseModal
            isOpen
            datas={mobileData}
            onClose={() => {
              farmStore.setState({
                mobileData: null,
              })
              router.back()
            }}
          />
        )}
      </Box>
    </>
  )
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['farm'])) },
  }
}
export default Farm
