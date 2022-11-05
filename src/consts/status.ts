// 历史记录类型
export enum TxType {
  all = 'All',
  deposit = 'Deposit',
  borrow = 'Borrow',
  repay = 'Repay',
  withdraw = 'Withdraw',
  stake = 'Stake',
  unstake = 'Unstake',
}

// 历史记录列表类型
export const TxTypeValue: Record<string, string> = {
  [TxType.all]: '-1',
  [TxType.deposit]: '0',
  [TxType.withdraw]: '1',
  [TxType.borrow]: '2',
  [TxType.repay]: '3',
  [TxType.stake]: '5',
  [TxType.unstake]: '4',
}

// 历史记录分类
export enum TxMark {
  lending = 'Lending',
  cross = 'CrossChain',
  stake = 'Stake',
  earned = 'Earned',
}

// 交易状态
export enum Status {
  success = 'success',
  loading = 'loading',
  failed = 'failed',
}
