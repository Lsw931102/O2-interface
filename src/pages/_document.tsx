import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import { ColorModeScript } from '@chakra-ui/react'

import theme from '@/theme'

export default class Document extends NextDocument {
  // 谷歌统计
  getGoogleTag = () => {
    return {
      __html: `
     window.dataLayer = window.dataLayer || []
     function gtag() {
       dataLayer.push(arguments)
     }
     gtag('js', new Date())
     gtag('config', 'G-44VP8BXS7X')`,
    }
  }
  render() {
    return (
      <Html>
        <Head>
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-44VP8BXS7X"></script>
          <script dangerouslySetInnerHTML={this.getGoogleTag()} />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
