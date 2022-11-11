import React from 'react'
import { TextProps } from '@chakra-ui/react'
import ModalTab, { InfoItemProps } from '@/components//ModalTab'
import Modal from '@/components/Modal'
import { IModalProps } from '@/components/Modal'
import useGetLoanPoolMeta from '@/hooks/useGetLoanPoolMeta'

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} footerRender={footerRender}>
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
