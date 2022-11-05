import { netconfigs } from '@/consts/network'
import { NetEnum } from '@/consts'
import globalStore from '@/stores/global'
import axios from 'axios'
import { i18n } from 'next-i18next'

const fillOption = async function (
  tx: { estimateGasAndCollateral: (arg0: any) => Promise<any> },
  options: {
    from?: string
    value?: number
    to?: any
    gas?: any
    storageLimit?: any
    gasPrice?: any
  }
) {
  try {
    options = Object.assign({}, options)
    return tx
      .estimateGasAndCollateral(options)
      .then(async (estimate: { gasUsed: any; storageCollateralized: any }) => {
        options.gas = '0x' + Math.floor((Number(estimate.gasUsed) * 13) / 10).toString(16)
        options.storageLimit = Number(estimate.storageCollateralized)
        options.gasPrice = '0x' + (1e9).toString(16)
        return options
      })
  } catch (error) {
    console.log(error)
  }
}

/**
 *
 * @param hashCallback hash返回的callback
 * @param completeCallback 交易完成的callback
 * @param value 手续费
 */

export async function sendTransactionFun(
  { contract, method, value = 0, args = [] }: any,
  hashCallback: any,
  completeCallback: any
) {
  const { userAddress, connectNet } = globalStore.getState()
  if (connectNet === NetEnum.conflux || connectNet === NetEnum.confluxTest) {
    const resArgs = args
    let op: any = null
    if (Array.isArray(resArgs)) {
      if (resArgs?.length === 0) {
        op = contract[method]()
      } else {
        if (resArgs?.length === 1) {
          op = contract[method](resArgs[0])
        } else {
          op = contract[method](resArgs[0], resArgs[1])
        }
      }
    } else {
      op = resArgs ? contract[method](resArgs) : contract[method]()
    }
    fillOption(op, {
      from: userAddress,
      value: value,
      to: contract?.address,
    })
      .then(async (res) => {
        const tx = op.sendTransaction(res)
        const txHash = await tx.get()
        hashCallback && hashCallback(txHash.hash)
        await tx
          .executed()
          .then((res: any) => {
            // 交易完成
            completeCallback && completeCallback(res)
          })
          .catch((e: any) => {
            completeCallback && completeCallback({ err: e })
          })
      })
      .catch((e) => {
        completeCallback && completeCallback({ err: e })
      })
  } else {
    try {
      const { connectNet, userAddress } = globalStore.getState()
      const netConfig = netconfigs[connectNet as NetEnum]
      const gasUsed = await contract.estimateGas[method](...args, { value, from: userAddress })
      const gasLimit = gasUsed.mul(130).div(100)
      let gasPrice = null
      if (netConfig?.gasHttpUrl) {
        try {
          const res: any = await axios.get(netConfig?.gasHttpUrl, { timeout: 3000 })
          if (res?.status === '1' && res?.result?.ProposeGasPrice) {
            gasPrice = (res?.result?.ProposeGasPrice * 1.3 * 1e9).toFixed(0)
          }
        } catch {
          // gas价格接口请求失败则忽略
        }
      }
      const ops = gasPrice
        ? { value, gasLimit, gasPrice, from: userAddress }
        : { value, gasLimit, from: userAddress }
      const tx = await contract[method](...args, ops)
      hashCallback && hashCallback(tx.hash)
      // 拿到交易hash
      tx.wait().then((res: any) => {
        // 交易完成
        completeCallback && completeCallback(res)
      })
    } catch (err) {
      // 错误查询错误信息
      try {
        await contract.connect(userAddress).callStatic[method](...args, { value })
        completeCallback && completeCallback({ err })
      } catch (error) {
        completeCallback && completeCallback({ err: error })
      }
    }
  }
}

/**
 * portal 错误信息翻译功能
 * @param e 错误信息
 * @param market 市场，用于拿去其中提示的市场
 * @returns 提示文字
 */
export const portalErrorTranslation = (e: any) => {
  const { connectNet } = globalStore.getState()
  const netConfig = connectNet ? netconfigs[connectNet] : null
  const errmessage = e?.data?.message || e?.message || e?.error || e
  let res = e?.data?.message || e?.message || e?.error || e
  if (i18n?.language === 'zh') {
    if (errmessage.indexOf('REDEEM_INSUFFICIENT_COLLATERAL') !== -1) {
      res = `提现后抵押不足`
    }
    if (
      errmessage.indexOf('User denied transaction') !== -1 ||
      errmessage.indexOf('Rejected by user') !== -1 ||
      errmessage.indexOf('cancel') !== -1 ||
      errmessage.indexOf('UserRejected') !== -1
    ) {
      res = `您已取消交易`
    }
    if (errmessage.indexOf('insufficient funds for intrinsic transaction cost') !== -1) {
      res = `钱包Gas费不足`
    }
  }
  if (errmessage.indexOf('transaction underpriced') !== -1) {
    res =
      i18n?.language === 'zh'
        ? `发送交易失败，钱包设置的交易价格过低，或稍后重试。`
        : 'Send transaction failed, the wallet was set  transaction gas price too low, or try again later.'
  }
  if (errmessage?.toLowerCase().indexOf('insufficient funds') !== -1) {
    res = i18n?.language === 'zh' ? `${netConfig?.nativeCoin}不足。` : res
  }
  if (errmessage.indexOf('Transaction Pool is full') !== -1) {
    res =
      i18n?.language === 'zh'
        ? '交易池拥堵，请稍后重试'
        : 'Please try again later, the trading pool is full'
  }
  if (errmessage.indexOf('INSUFFICIENT_LIQUIDITY_BURNED') !== -1) {
    res = i18n?.language === 'zh' ? '该仓位已经被平过了' : '该仓位已经被平过了(英文版)'
  }
  return res
}
