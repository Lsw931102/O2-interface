import React, { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { Image, useDisclosure, Flex, Stack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

import { CrossFromChain, CrossToChain } from '@/components/CrossChain'
import CrossModal, { CrossChainContent } from '@/components/Modals/CrossModal'
import { TextMemoProps } from '@/components/CrossRefinanceForm'

import crossStore from '@/stores/pages/cross'
import globalStore from '@/stores/global'

import px2vw from '@/utils/px2vw'
import { completeUrl } from '@/utils/common'

import onlyArrow from '@/assets/images/svg/onlyArrow.svg'

export interface CrossFromToProps {
  textMemo: TextMemoProps
}
function Index({ textMemo }: CrossFromToProps) {
  const { t } = useTranslation(['cross'])
  const { selectChain } = crossStore()
  const { connectNet, isPC } = globalStore()
  const {
    isOpen: crossToChainModalIsOpen,
    onOpen: crossToChainModalOnOpen,
    onClose: crossToChainModalOnClose,
  } = useDisclosure()

  const router = useRouter()

  useEffect(() => {
    isPC && crossToChainModalOnClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crossToChainModalOnClose, selectChain])

  return (
    <>
      <Stack
        direction={{ base: 'column', xl: 'row' }}
        spacing={{ base: px2vw(15), xl: '15px' }}
        width="100%"
        alignItems="center"
      >
        {/* From */}
        <CrossFromChain
          width={{ base: px2vw(40), xl: '40px' }}
          height={{ base: px2vw(40), xl: '40px' }}
          icon={completeUrl(`chain-entity/${connectNet}.png`)}
          text={connectNet ? `${connectNet?.toLocaleUpperCase()}-FLUX` : '--'}
        />
        {/* 中间箭头 */}
        <Flex
          marginTop={{ xl: '25px !important' }}
          borderRadius="round"
          backgroundColor={textMemo.color}
        >
          <Image
            height={{ base: px2vw(30), xl: '30px' }}
            width={{ base: px2vw(30), xl: '30px' }}
            display="block"
            src={onlyArrow}
            ignoreFallback
            transform={{ base: 'rotate(90deg)', xl: 'inherit' }}
          />
        </Flex>

        {/* To */}
        <CrossToChain
          icon={selectChain ? completeUrl(`chain-entity/${selectChain?.key}.png`) : ''}
          text={selectChain ? `${selectChain?.name?.toLocaleUpperCase()}-FLUX` : t('Choose Chain')}
          onClick={() => {
            isPC ? crossToChainModalOnOpen() : router.push('/cross/choose-chain')
          }}
        />
      </Stack>
      {/* chain modal */}
      <CrossModal
        modalText={t('Choose Chain')}
        isOpen={crossToChainModalIsOpen}
        onClose={crossToChainModalOnClose}
      >
        <CrossChainContent />
      </CrossModal>
    </>
  )
}
export default Index
