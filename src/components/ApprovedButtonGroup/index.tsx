import React, { useContext, useMemo } from 'react'
import { HStack, Image, StackProps } from '@chakra-ui/react'

import BaseButton, { IProps as BaseButtonProps } from '@/components/BaseButton'
import { DashboardModalContext } from '@/components/Modals/DashboardModal'

import px2vw from '@/utils/px2vw'
import useWallet from '@/hooks/useWallet'
import buttonCancel from '@/assets/images/svg/buttonCancel.svg'
import dashboardStore from '@/stores/pages/dashboard'

export interface ApprovedButtonGroupsProps {
  record?: any
  isApproved: boolean //是否已经授权
  containerStyle?: StackProps
  leftButtonProps?: BaseButtonProps
  rightButtonProps?: BaseButtonProps
  onClose?: () => void
}
function Index({
  record,
  isApproved,
  containerStyle,
  leftButtonProps,
  rightButtonProps,
}: ApprovedButtonGroupsProps) {
  const { approveLoading, openApprove } = useWallet()
  const useDashboardModalContext = useContext(DashboardModalContext)

  const handleClick = async (e: any) => {
    if (isApproved) {
      rightButtonProps?.onClick && rightButtonProps?.onClick(e)
    } else {
      if (record?.isCoinMarket) {
        rightButtonProps?.onClick && rightButtonProps?.onClick(e)
      } else {
        openApprove(record, () => {
          useDashboardModalContext.getLoanPoolMeta && useDashboardModalContext.getLoanPoolMeta()
        })
      }
    }
  }

  const isDisabledMemo = useMemo(() => {
    if (isApproved) {
      return rightButtonProps?.disabled
    } else {
      if (record?.isCoinMarket) {
        return rightButtonProps?.disabled
      } else {
        return approveLoading
      }
    }
  }, [approveLoading, isApproved, record?.isCoinMarket, rightButtonProps?.disabled])

  const isLoadingMemo = useMemo(() => {
    if (isApproved) {
      return rightButtonProps?.isLoading
    } else {
      if (record?.isCoinMarket) {
        return rightButtonProps?.isLoading
      } else {
        return approveLoading
      }
    }
  }, [approveLoading, isApproved, record?.isCoinMarket, rightButtonProps?.isLoading])

  const textMemo = useMemo(() => {
    if (isApproved) {
      return rightButtonProps?.text
    } else {
      if (record?.isCoinMarket) {
        return rightButtonProps?.text
      } else {
        return 'Approve'
      }
    }
  }, [isApproved, record?.isCoinMarket, rightButtonProps?.text])

  const buttonClickMemo = useMemo(() => {
    if (isApproved) {
      return rightButtonProps?.buttonType
    } else {
      if (record?.isCoinMarket) {
        return rightButtonProps?.buttonType
      } else {
        return undefined
      }
    }
  }, [isApproved, record?.isCoinMarket, rightButtonProps?.buttonType])

  return (
    <HStack
      marginTop={{ base: px2vw(30), xl: '30px' }}
      spacing={{ base: px2vw(61), xl: '61px' }}
      justifyContent="center"
      {...containerStyle}
    >
      <BaseButton
        h={{ base: px2vw(40), xl: '40px' }}
        w={{ base: px2vw(100), xl: '100px' }}
        buttonClick={() => {
          dashboardStore.setState({
            borrowModalIsOpen: false,
            depositModalIsOpen: false,
          })
        }}
        specialIcon={<Image src={buttonCancel} />}
        opacity={0.5}
        {...leftButtonProps}
      />
      <BaseButton
        w={{ base: 'auto', xl: 'auto' }}
        h={{ base: px2vw(40), xl: '40px' }}
        minWidth={{ base: px2vw(138), xl: '138px' }}
        textStyle={{ width: { base: 'auto', xl: 'inherit' }, whiteSpace: 'nowrap' }}
        iconBg="gray.700"
        iconStyle={{ color: 'green.100' }}
        {...rightButtonProps}
        text={textMemo}
        buttonType={buttonClickMemo}
        onClick={handleClick}
        disabled={isDisabledMemo}
        isLoading={isLoadingMemo}
      />
    </HStack>
  )
}
export default React.memo(Index)
