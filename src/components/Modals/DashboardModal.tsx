import React from 'react'
import { TextProps, Image } from '@chakra-ui/react'
import ModalTab, { InfoItemProps } from '@/components//ModalTab'
import Modal from '@/components/Modal'
import { IModalProps } from '@/components/Modal'
import useGetLoanPoolMeta from '@/hooks/useGetLoanPoolMeta'
import px2vw from '@/utils/px2vw'

import forTheP from '@/assets/images/svg/forTheP.svg'
import fromTheP from '@/assets/images/svg/fromTheP.svg'
import globalStore from '@/stores/global'
import { NetEnum } from '@/consts'

export type PickModalProps = Pick<IModalProps, 'isOpen' | 'onClose' | 'children' | 'footerRender'>
export interface DashboardModalProps extends PickModalProps {
  currentTab: any
  tabs: [InfoItemProps, InfoItemProps]
  tabColor?: TextProps['color']
  record?: any
  onSelect: (record: any) => void
}

export interface DashModalContentProps {
  record?: any
  onClose?: DashboardModalProps['onClose']
  onConfirm?: () => void
}

export interface IProps {
  info?: any
  getLoanPoolMeta?: (isRefresh?: boolean) => Promise<void>
}

export const DashboardModalContext = React.createContext<IProps>({})

function Index({
  record,
  isOpen,
  currentTab,
  tabs,
  tabColor = 'purple.100',
  onClose,
  onSelect,
  children,
  footerRender,
}: DashboardModalProps) {
  const { info, getLoanPoolMeta } = useGetLoanPoolMeta(record)
  const { connectNet } = globalStore()
  return (
    <Modal isOpen={isOpen} onClose={onClose} footerRender={footerRender}>
      {record?.symbol === 'PEOPLE' &&
        (connectNet === NetEnum.eth || connectNet === NetEnum.ethTest) && (
          <Image
            src={
              currentTab.label === 'DEPOSIT' || currentTab.label === 'REPAY' ? forTheP : fromTheP
            }
            ignoreFallback
            marginBottom={{ base: px2vw(22), xl: '22px' }}
          />
        )}

      <ModalTab
        tokenIcon={info?.tokenIcon}
        tabs={tabs}
        currentTab={currentTab}
        color={tabColor}
        onChange={onSelect}
      />
      <DashboardModalContext.Provider
        value={{
          info: info || {},
          getLoanPoolMeta: getLoanPoolMeta,
        }}
      >
        {children &&
          React.cloneElement(children as any, {
            onClose: onClose,
            record: info || {},
          })}
      </DashboardModalContext.Provider>
    </Modal>
  )
}
export default React.memo(Index)
