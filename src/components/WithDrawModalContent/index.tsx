import { Text } from '@chakra-ui/react'
import React, { useContext, useMemo, useState } from 'react'
import { utils } from 'ethers'
import { useTranslation } from 'next-i18next'
import { BigNumber } from 'bignumber.js'

import { InfoItem } from '@/components/InfoList'
import ModalInput from '@/components/ModalInput'
import NumberTips from '@/components/NumberTips'
import ApprovedButtonGroup from '@/components/ApprovedButtonGroup'
import { DashboardModalContext, DashModalContentProps } from '@/components/Modals/DashboardModal'
import HealthFactorCmp from '@/components/HealthFactorCmp'

import px2vw from '@/utils/px2vw'
import useMarketInfo from '@/hooks/useMarketInfo'
import useSendTransaction from '@/hooks/useSendTransaction'
import { getWalletContract } from '@/contracts/funcs'
import { CoinMarket, ERC20Market } from '@/contracts/abis'
import fluxAppStore from '@/stores/contract/fluxApp'
import { buttonHover } from '@/theme/utils'

export const SAFE = 0.85
BigNumber.config({ EXPONENTIAL_AT: 99 })

const WithDrawModalContent = React.memo(({ record, onClose, onConfirm }: DashModalContentProps) => {
  const { t } = useTranslation(['dashboard'])
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [inputValue, setInputValue] = useState<string | number>('')

  const { borrowBalance } = fluxAppStore()
  const { isApprovedMemo, getHealthFactor, errInfoWithDraw, getHealthFactorBase } = useMarketInfo(
    record,
    inputValue
  )
  const { sendTransaction } = useSendTransaction()

  const useDashboardModalContext = useContext(DashboardModalContext)

  const healthFactor = useMemo(() => {
    return getHealthFactor('withdraw')
  }, [getHealthFactor])

  const withdrawLimitMemo = useMemo(() => {
    const { userWithdrawLimit, decimals } = record
    if (!userWithdrawLimit) return 0
    const { userDepositsNumber, userBorrowingsNumber, underlyingPriceNumber } =
      getHealthFactorBase as any

    if (borrowBalance && new BigNumber(borrowBalance).gt(0)) {
      if (new BigNumber(healthFactor.rowValue).lt(1.3)) {
        return 0
      } else {
        const min = new BigNumber(
          utils.formatUnits(userWithdrawLimit?.toString(), decimals)
        ).toString()

        const value = new BigNumber(userDepositsNumber)
          .minus(new BigNumber(userBorrowingsNumber).times(1.3))
          .div(new BigNumber(underlyingPriceNumber))
        if (value.gt(min)) {
          return min.toString()
        } else {
          return value.toString()
        }
      }
    } else {
      return new BigNumber(utils.formatUnits(userWithdrawLimit?.toString(), decimals)).toString()
    }
  }, [borrowBalance, getHealthFactorBase, healthFactor.rowValue, record])

  // 当有借款的时候，需要乘以0.85，没有借款的时候乘以1
  const handleMaxButtonClick = () => {
    setInputValue(withdrawLimitMemo)
  }

  // 使用发送交易的hookt
  const submit = () => {
    if (new BigNumber(inputValue).eq(0)) {
      return false
    }
    const market = getWalletContract(
      record?.address,
      record?.isCoinMarket ? CoinMarket : ERC20Market
    )
    setIsButtonLoading(true)

    sendTransaction(
      {
        contract: market,
        method: 'redeem',
        args: [
          new BigNumber(inputValue).eq(
            utils.formatUnits(record?.userDeposits?.toString(), record?.decimals).toString()
          )
            ? '0'
            : new BigNumber(inputValue)
                .times(new BigNumber(10).pow(record?.decimals))
                .toFixed(0, 1),
        ],
        action: 'redeem',
      },
      (res) => {
        setIsButtonLoading(false)
        if (!res?.err) {
          // 交易完成
          onConfirm ? onConfirm() : onClose && onClose()
          PubSub.publish('transactionComplete')
          setInputValue('')

          useDashboardModalContext?.getLoanPoolMeta && useDashboardModalContext?.getLoanPoolMeta()
        }
      },
      () => {
        // const item = {
        //   date: Date.now(),
        //   type: TxType.withdraw,
        //   mark: TxMark.lending,
        //   symbol: record?.symbol,
        //   num: inputValue,
        //   hash,
        //   status: Status.loading,
        // }
        // addHistory(item)
      }
    )
  }

  return (
    <>
      <Text
        textStyle="12"
        marginTop={{ base: px2vw(30), xl: '30px' }}
        marginBottom={{ base: px2vw(5), xl: '5px' }}
        paddingLeft={{ base: px2vw(10), xl: '10px' }}
        color="purple.300"
      >
        {t('depositBalance')}:{' '}
        {record?.userDeposits ? (
          <NumberTips
            value={utils.formatUnits(record?.userDeposits?.toString(), record?.decimals)}
            toolTipProps={{ isDisabled: false }}
          />
        ) : (
          '--'
        )}{' '}
        {record?.symbol}
      </Text>
      <ModalInput
        errorInfo={errInfoWithDraw}
        isApproved={isApprovedMemo}
        record={record}
        inputProps={{
          value: inputValue,
          valChange: (e) => {
            setInputValue(e)
          },
        }}
        buttonProps={{
          buttonClick: () => {
            handleMaxButtonClick()
          },
          text: borrowBalance && borrowBalance > 0 ? 'SAFE MAX' : 'MAX',
          textStyle: {
            textAlign: 'center',
            lineHeight: { base: px2vw(14), xl: '14px' },
            fontSize: { base: px2vw(14), xl: '14px' },
            fontWeight: '500',
            whiteSpace: 'normal',
          },
        }}
      />

      {borrowBalance && borrowBalance > 0 ? (
        <InfoItem
          _hover={buttonHover}
          onClick={() => {
            setInputValue(
              new BigNumber(
                utils.formatUnits(record?.userWithdrawLimit?.toString(), record?.decimals)
              ).toString()
            )
          }}
          label={`${t('withdrawLimit')} : `}
          valueRender={() => {
            return (
              <Text>
                {record?.userWithdrawLimit ? (
                  <>
                    <NumberTips
                      toolTipProps={{ isDisabled: false }}
                      value={new BigNumber(
                        utils.formatUnits(record?.userWithdrawLimit?.toString(), record?.decimals)
                      ).toString()}
                    />{' '}
                    {record?.symbol}
                  </>
                ) : (
                  '--'
                )}
              </Text>
            )
          }}
          margin={{ base: `${px2vw(20)} 0 ${px2vw(15)}`, xl: '20px 0 15px' }}
        />
      ) : (
        <></>
      )}

      <InfoItem
        label={`${t('poolLiquidity')} : `}
        valueRender={() => {
          return (
            <Text>
              {record?.liquidity ? (
                <NumberTips
                  toolTipProps={{ isDisabled: false }}
                  value={utils
                    .formatUnits(record?.liquidity?.toString(), record?.decimals)
                    .toString()}
                />
              ) : (
                '--'
              )}{' '}
              {record?.symbol}
            </Text>
          )
        }}
        margin={{ base: `${px2vw(20)} 0 ${px2vw(15)}`, xl: '20px 0 15px' }}
      />

      {healthFactor && (
        <HealthFactorCmp healthFactor={healthFactor} hasBorrow={Boolean(borrowBalance)} />
      )}
      <ApprovedButtonGroup
        record={record}
        onClose={onClose}
        isApproved={true}
        rightButtonProps={{
          text: t('Withdraw'),
          disabled: isButtonLoading || Boolean(errInfoWithDraw),
          isLoading: isButtonLoading,
          buttonType: 'remove',
          onClick: () => {
            submit()
          },
        }}
      />
    </>
  )
})
export default WithDrawModalContent
