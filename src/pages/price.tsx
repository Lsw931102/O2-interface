import React from 'react'
import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { getI18nSSRProps, GetI18nServerSideProps } from '@/utils/i18n'
import px2vw from '@/utils/px2vw'

const Tvl = dynamic(() => import('@/components/Tvl'), { ssr: false })
const PriceList = dynamic(() => import('@/components/PriceList'), { ssr: false })

function Price() {
  const renderPage = () => (
    <>
      <Box mt={{ base: px2vw(5), xl: '28px' }} mb={{ base: px2vw(20), xl: '28px' }}>
        <Tvl />
      </Box>
      <PriceList />
    </>
  )

  return <>{renderPage()}</>
}

export const getServerSideProps = async (ctx: GetI18nServerSideProps) => {
  return {
    props: { ...(await getI18nSSRProps(ctx, ['price'])) },
  }
}
export default Price
