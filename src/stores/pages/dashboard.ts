import { InfoItemProps } from '@/components/ModalTab'
import create from 'zustand'

type IMobileType = 'myBank' | 'myFarm'
interface ICrossStore {
  supplyList: any[] | null
  borrowingList: any[] | null
  currentBorrowTab: any
  currentDespositTab: any
  borrowModalIsOpen: boolean
  depositModalIsOpen: boolean
  mobileType: IMobileType
  setSupplyList: (value: any[] | null) => void
  setBorrowingList: (value: any[] | null) => void
  setCurrentBorrowTab: (value: any) => void
  setDespositTab: (value: any) => void
}

export const borrowTab: [InfoItemProps, InfoItemProps] = [
  { label: 'BORROW', value: 'BORROW' },
  {
    label: 'REPAY',
    value: 'REPAY',
  },
]

export const despositTab: [InfoItemProps, InfoItemProps] = [
  { label: 'DEPOSIT', value: 'DEPOSIT' },
  {
    label: 'WITHDRAW',
    value: 'WITHDRAW',
  },
]

const dashboardStore = create<ICrossStore>((set) => ({
  supplyList: null,
  borrowingList: null,
  currentBorrowTab: borrowTab[1],
  currentDespositTab: despositTab[1],
  borrowModalIsOpen: false,
  depositModalIsOpen: false,
  mobileType: 'myBank',
  setSupplyList: (value) =>
    set(() => {
      return { supplyList: value }
    }),
  setBorrowingList: (value) => set(() => ({ borrowingList: value })),
  setCurrentBorrowTab: (value) => set(() => ({ currentBorrowTab: value })),
  setDespositTab: (value) => set(() => ({ currentDespositTab: value })),
}))

export default dashboardStore
