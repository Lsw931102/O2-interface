import { getWalletContract } from '@/contracts/funcs'
import { ERC20Abi } from '@/contracts/abis'
import useSendTransaction from './useSendTransaction'
import { maxUint256 } from '@/consts'

const useWallet = () => {
  const { sendTransaction, loading: approveLoading } = useSendTransaction()
  // 授权
  const openApprove = async (record: any, completeCallBack: () => void) => {
    const underlyingContract = getWalletContract(record?.underlying, ERC20Abi)

    sendTransaction(
      {
        contract: underlyingContract,
        method: 'approve',
        args: [record?.address, maxUint256],
        action: 'approve',
      },
      (res) => {
        if (!res?.err) {
          completeCallBack && completeCallBack()
        }
      },
      () => {
        // TODO:
        return ''
      }
    )
  }

  return {
    openApprove,
    approveLoading,
  }
}
export default useWallet
