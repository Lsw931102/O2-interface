import React, { useEffect, useMemo } from 'react'
import { HStack, SimpleGrid, Text, Image, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

import Modal from '@/components/Modal'
import { PickModalProps } from '@/components/Modals/DashboardModal'
import NoData from '@/components/NoData'

import { buttonHover } from '@/theme/utils'
import { NetEnum, WalletEnum } from '@/consts'
import globalStore from '@/stores/global'
import crossStore from '@/stores/pages/cross'
import px2vw from '@/utils/px2vw'
import { completeUrl } from '@/utils/common'
import fluxReportStore from '@/stores/contract/fluxReport'
import { getAccountInformationSupplyList, transHotpotOkex } from '@/utils/dataFormat'
import searchProviderStore from '@/stores/contract/searchProvider'

export interface DataItem {
  icon: string
  label: string
}

export interface ChainDataItem {
  key: NetEnum
  name: string
  icon: string
  wallet: WalletEnum[]
}

export interface CrossModalProps extends PickModalProps {
  //   isApproved: boolean //是否已经授权
  modalText: string //弹窗标题
  children: React.ReactNode
}
export interface ContentProps {
  data: any[]

  onItemClick: (record: any) => void
}

export interface CrossChainContentProps {
  onItemClick: (record: ChainDataItem) => void
}

export interface CrossTokenContentProps {
  onItemClick: (record: any) => void
  needValid?: boolean // 是否需要验证币种可选
}

export const CrossChainContent = React.memo(() => {
  const router = useRouter()

  const { selectToken, chainList, hotpotConfigJson, setChainList, setSelectChain } = crossStore()

  const { isPC } = globalStore()
  useEffect(() => {
    if (!selectToken || !hotpotConfigJson) return
    setChainList(selectToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectToken, hotpotConfigJson])
  return (
    <>
      {chainList && chainList.length === 0 ? (
        <NoData></NoData>
      ) : (
        <SimpleGrid columns={3} spacing={{ base: px2vw(40), xl: '40px' }}>
          {(chainList || []).map((item: any) => {
            return (
              <VStack
                onClick={() => {
                  if (item?.disabled) return
                  setSelectChain(item)
                  !isPC && router.push('/cross')
                }}
                key={item.key}
                spacing={{ base: px2vw(10), xl: '10px' }}
                _hover={!item?.disabled ? buttonHover : {}}
                opacity={!item?.disabled ? 'inherit' : '0.3'}
              >
                <Image
                  height={{ base: px2vw(40), xl: '40px' }}
                  width={{ base: px2vw(40), xl: '40px' }}
                  src={completeUrl(`chain-entity/${item?.key}.png`)}
                />
                <Text textStyle="18" textAlign="center">
                  {item.name}
                </Text>
              </VStack>
            )
          })}
        </SimpleGrid>
      )}
    </>
  )
})

export const CrossTokenContent = React.memo(
  ({ onItemClick, needValid = true }: CrossTokenContentProps) => {
    const { allMarkets } = fluxReportStore()
    const { currentTab, selectToken, hotpotConfigJson, setChainList } = crossStore()
    const { userMarketsData } = searchProviderStore()
    const { connectNet } = globalStore()

    useEffect(() => {
      setChainList(selectToken)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectToken])

    const userMarketsArray = useMemo(
      () =>
        userMarketsData &&
        Object.keys(userMarketsData).map((key) => {
          return userMarketsData[key]
        }),
      [userMarketsData]
    )

    // 存款列表,当前链
    const supplyList = useMemo(() => {
      return getAccountInformationSupplyList(userMarketsArray, allMarkets)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userMarketsArray, allMarkets])

    // 查找该币种是否支持跨链
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const isSupportCrossFn = (record: any) => {
      const info = (
        hotpotConfigJson?.gateways?.[transHotpotOkex(connectNet as NetEnum)] || []
      ).find((item: any) => {
        return item?.tokenAddress.toLowerCase() === record?.underlying.toLowerCase()
      })
      if (!info?.gateways || (Array.isArray(info?.gateways) && info?.gateways.length === 0)) {
        return false
      } else {
        return true
      }
    }

    const tokenList = useMemo(() => {
      const allMarketsMap = (allMarkets || []).map((item) => {
        const depositFind = (supplyList || []).find(
          (depItem: any) => depItem?.address === item.address
        )
        const isSupportCross = isSupportCrossFn(item)

        const isDepositFind =
          currentTab === 'refinance'
            ? depositFind && isSupportCross
            : !depositFind && isSupportCross

        return {
          ...item,
          disabled: !isDepositFind,
        }
      })
      return allMarketsMap
    }, [allMarkets, currentTab, isSupportCrossFn, supplyList])

    return (
      <>
        {tokenList && tokenList.length === 0 ? (
          <NoData></NoData>
        ) : (
          <SimpleGrid columns={2} spacing={{ base: px2vw(30), xl: '30px' }}>
            {(tokenList || []).map((item) => {
              return (
                <HStack
                  onClick={() => {
                    if (needValid && item?.disabled) return
                    onItemClick(item)
                  }}
                  key={item.address}
                  spacing={{ base: px2vw(5), xl: '5px' }}
                  paddingLeft={{ base: px2vw(20), xl: '20px' }}
                  _hover={!item?.disabled ? buttonHover : {}}
                  opacity={needValid && item?.disabled ? '0.3' : 'inherit'}
                >
                  <Image
                    height={{ base: px2vw(40), xl: '40px' }}
                    width={{ base: px2vw(40), xl: '40px' }}
                    src={item.tokenIcon}
                  />
                  <Text textStyle="18">{item.symbol}</Text>
                </HStack>
              )
            })}
          </SimpleGrid>
        )}
      </>
    )
  }
)

function Index({ modalText, children, isOpen, onClose }: CrossModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} hasCloseButton>
      <Text
        textStyle="18"
        marginTop={{ base: px2vw(10), xl: '10px' }}
        marginBottom={{ base: px2vw(40), xl: '40px' }}
        textAlign="center"
      >
        {modalText}
      </Text>
      {children}
    </Modal>
  )
}
export default React.memo(Index)
