import React, { useEffect } from 'react'
import { ChakraProvider, Flex, Box, useMediaQuery } from '@chakra-ui/react'

import Head from 'next/head'
import getConfig from 'next/config'
import type { AppProps } from 'next/app'
import { appWithTranslation, useTranslation } from 'next-i18next'

import { useRouter } from 'next/router'
import { ToastContainer } from 'react-toastify'
import useSWR from 'swr'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import 'swiper/css'

import { getI18nSSRProps, GetI18nStaticProps } from '@/utils/i18n'
import theme from '@/theme'
import '@/styles/global.scss'
import 'react-toastify/dist/ReactToastify.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import px2vw from '@/utils/px2vw'
import { appInit } from '@/utils/init'
import globalStore from '@/stores/global'
import Notice from '@/components/Notice'
import { getNotice } from '@/apis/notice'
import { getSessionStorage } from '@/utils/storage'
const { publicRuntimeConfig } = getConfig()

function App({ Component, pageProps }: AppProps) {
  const { i18n } = useTranslation(['common'])
  const [isPC] = useMediaQuery('(min-width: 1024px)')
  const router = useRouter()
  const { noticeData } = globalStore()
  const { data: getNoticeData } = useSWR(
    getSessionStorage('noticeRemark') !== 'close' ? [getNotice.key, i18n.language] : null,
    (_, language) =>
      getNotice.fetcher({
        language,
      }),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    // Sentry错误统计
    Sentry.init({
      dsn: 'https://35f4ceb8841a405ea6fba6bedca78b8d@sentry.01defi.com/4',
      integrations: [new Integrations.BrowserTracing()],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    })
    // 初始化
    appInit()
    window.zoConfig = publicRuntimeConfig
  }, [])

  useEffect(() => {
    if (globalStore.getState().isPC !== isPC) {
      globalStore.setState({
        isPC,
      })
    }
  }, [isPC])

  useEffect(
    () => {
      if (getNoticeData && getNoticeData.code === 200) {
        globalStore.setState({
          noticeData: getNoticeData?.data[0],
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getNoticeData]
  )

  return (
    <>
      <Head>
        <title>{`${pageProps?.title || publicRuntimeConfig.title}`}</title>
        <meta charSet="utf-8" />
        <meta name="App-Config" content="fullscreen=yes,useHistoryState=yes,transition=yes" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="yes" name="apple-touch-fullscreen" />
        <meta content="telephone=no,email=no" name="format-detection" />
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
        />
        <link
          rel="shortcut icon"
          href={`${publicRuntimeConfig.cdn}/favicon.ico`}
          type="image/x-icon"
        />
        <link
          href={`${publicRuntimeConfig.cdn}/images/apple-touch-icon-144-precomposed.png`}
          rel="apple-touch-icon-precomposed"
        />
      </Head>
      <ChakraProvider resetCSS theme={theme}>
        {/* 公告 */}
        {noticeData && <Notice />}

        <Flex w="100vw" minH="100vh" pt={noticeData ? { base: 0, xl: '120px' } : 0}>
          <Box
            position="relative"
            w="full"
            maxW={{ base: 'full', xl: '1400px' }}
            m="0 auto"
            p={{
              base: router.pathname === '/' ? 0 : `${px2vw(46)} 0 0`,
              xl: router.pathname === '/' ? '52px 0 0' : '0',
            }}
          >
            <Box w={{ base: 'full', xl: 'auto' }}>
              <Flex w="full" justifyContent="flex-end">
                {router.pathname === '/' ? null : <Header />}
              </Flex>
              <Box>
                <Component {...(pageProps ?? {})} />
              </Box>
              <Flex display={{ base: 'none', xl: 'flex' }}>
                <Footer />
              </Flex>
            </Box>
          </Box>
        </Flex>
        <ToastContainer />
      </ChakraProvider>
    </>
  )
}

export const getStaticProps = async (context: GetI18nStaticProps) => {
  return {
    props: {
      ...(await getI18nSSRProps(context, [])),
    },
  }
}

// 这里要注意，切换语言会导致整体 APP 组件卸载再初始化
export default appWithTranslation(App)
