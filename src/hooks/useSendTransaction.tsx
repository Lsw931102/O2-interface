import { SetStateAction, useState } from 'react'
import { toast } from 'react-toastify'
import { sendTransactionFun, portalErrorTranslation } from '@/contracts/common'
import TransBox from '@/components/TransBox'
import { useTranslation } from 'next-i18next'
import globalStore from '@/stores/global'
import { netconfigs } from '@/consts/network'
import { NetEnum } from '@/consts'

interface TransactionParams {
  contract: any
  method: any
  value?: any
  args?: any
  action?: string // 存款 | 取款 | 借款 | 还款 | 跨链调仓 | 跨链借款 ｜ 质押 ｜ 赎回 ｜ 授权
}
interface TransactionRes {
  /**loading */
  loading: boolean
  /**hash */
  hash: string
  /**errMsg */
  errMsg: string
  /**发送交易 */
  sendTransaction: (
    params: TransactionParams,
    completeCallback?: (res: any) => void,
    hashCallback?: (res: any) => void
  ) => void
}

const useSendTransaction: () => TransactionRes = () => {
  const { t } = useTranslation()
  const { connectNet } = globalStore()
  const [loading, setLoading] = useState(false)
  const [hash, setHash] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const sendTransaction = (
    params: TransactionParams,
    completeCallback: any = null,
    hashCallback: any = null
  ) => {
    return new Promise((r1, r2) => {
      setLoading(true)
      sendTransactionFun(
        params,
        (hash: SetStateAction<string>) => {
          setHash(hash)
          hashCallback?.(hash)
        },
        (res: any) => {
          // 错误的时候
          if (res?.err) {
            setErrMsg(portalErrorTranslation(res?.err))
            toast(() => <TransBox err={portalErrorTranslation(res?.err)} type="Error" />, {
              position: 'top-right',
              autoClose: false,
              hideProgressBar: true,
              closeOnClick: false,
              className: 'toastBody',
            })
          } else {
            // 成功执行
            toast(
              () => (
                <TransBox
                  err={t('View on explore', {
                    chain: connectNet,
                  })}
                  type="Success"
                  onView={() =>
                    window.open(
                      `${netconfigs[connectNet as NetEnum]?.txScanUrl}/${res?.transactionHash}`
                    )
                  }
                />
              ),
              {
                position: 'top-right',
                autoClose: 50000,
                hideProgressBar: true,
                closeOnClick: false,
                className: 'toastBody',
              }
            )
          }

          completeCallback?.(res)
          setLoading(false)
          r1(res)
          r2(res)
        }
      )
    })
  }
  return {
    loading,
    hash,
    errMsg,
    sendTransaction,
  }
}

export default useSendTransaction
