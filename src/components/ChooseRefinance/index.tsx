import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, Flex, HStack, Text, Image, useDisclosure } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { buttonHover } from '@/theme/utils'
import px2vw from '@/utils/px2vw'
import CrossModal, { CrossTokenContent } from '@/components/Modals/CrossModal'
import { TextMemoProps } from '@/components/CrossRefinanceForm'

import globalStore from '@/stores/global'
import crossStore from '@/stores/pages/cross'

import rightArrow from '@/assets/images/svg/rightArrow.svg'

export interface ChooseRefinanceProps {
  textMemo: TextMemoProps
}

function Index({ textMemo }: ChooseRefinanceProps) {
  const { t } = useTranslation(['cross'])
  const { isPC } = globalStore()
  const router = useRouter()
  const {
    isOpen: crossTokenModalIsOpen,
    onOpen: crossTokenModalOnOpen,
    onClose: crossTokenModalOnClose,
  } = useDisclosure()

  const { selectToken, setSelectToken, setSelectChain } = crossStore()

  useEffect(() => {
    crossTokenModalOnClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectToken])

  return (
    <>
      <Flex
        width="100%"
        padding={{
          base: `${px2vw(5)} ${px2vw(20)} ${px2vw(5)} ${px2vw(20)}`,
          xl: '10px 35px 10px 20px',
        }}
        justifyContent="space-between"
        background="gray.200"
        borderRadius="xl"
        onClick={() => {
          isPC ? crossTokenModalOnOpen() : router.push('/cross/choose-token')
        }}
        _hover={buttonHover}
      >
        <HStack spacing={{ base: px2vw(10), xl: '10px' }}>
          <Box
            width={{ base: px2vw(30), xl: '40px' }}
            height={{ base: px2vw(30), xl: '40px' }}
            textAlign="center"
            textStyle={{ base: '24', xl: '36' }}
            borderRadius="round"
            fontFamily="Bai Jamjuree"
            border={
              selectToken?.tokenIcon
                ? 'inherit'
                : { base: `${px2vw(2)} solid #AAB9DE`, xl: '2px solid #AAB9DE' }
            }
            backgroundImage={selectToken?.tokenIcon}
            backgroundSize="contain"
            lineHeight={{ base: px2vw(24), xl: '36px' }}
          >
            {selectToken?.tokenIcon ? '' : 't'}
          </Box>
          <Text textStyle={{ base: '16', xl: '18' }} whiteSpace="nowrap">
            {selectToken?.symbol || `${textMemo.tokenText}`}
          </Text>
        </HStack>
        <Image
          marginLeft={{ base: px2vw(20), xl: 'inherit' }}
          width={{ base: px2vw(7), xl: '10px' }}
          src={rightArrow}
          ignoreFallback
        />
      </Flex>
      {/* token modal */}
      <CrossModal
        modalText={t('Choose a token to refinance')}
        isOpen={crossTokenModalIsOpen}
        onClose={crossTokenModalOnClose}
      >
        <CrossTokenContent
          onItemClick={(item) => {
            setSelectToken(item)
            setSelectChain(null)
          }}
        />
      </CrossModal>
    </>
  )
}
export default React.memo(Index)
