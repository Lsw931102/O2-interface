import { Box, Center, Text } from '@chakra-ui/react'
import React, { useContext, useMemo, useState } from 'react'
import { utils } from 'ethers'
import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'react-i18next'

import { InfoItem } from '@/components/InfoList'
import ModalInput from '@/components//ModalInput'
import NumberTips from '@/components/NumberTips'
import ApprovedButtonGroup from '@/components/ApprovedButtonGroup'
import HealthFactorCmp from '@/components/HealthFactorCmp'
import { DashboardModalContext, DashModalContentProps } from '@/components/Modals/DashboardModal'

import px2vw from '@/utils/px2vw'
import useSendTransaction from '@/hooks/useSendTransaction'
import useMarketInfo from '@/hooks/useMarketInfo'
import { getWalletContract } from '@/contracts/funcs'
import { CoinMarket, ERC20Market } from '@/contracts/abis'
import fluxAppStore from '@/stores/contract/fluxApp'
import dashboardStore, { borrowTab } from '@/stores/pages/dashboard'
import { NetEnum } from '@/consts'
import { netconfigs } from '@/consts/network'
import globalStore from '@/stores/global'

BigNumber.config({ EXPONENTIAL_AT: 99 })

const Index = React.memo(({ record, onClose, onConfirm }: DashModalContentProps) => {
  const { t } = useTranslation(['dashboard'])
  const { sendTransaction } = useSendTransaction()

  const { borrowBalance } = fluxAppStore()
  const { connectNet } = globalStore()

  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [inputValue, setInputValue] = useState<string | number>('')
  const { isApprovedMemo, errorInfoRepay, getHealthFactor } = useMarketInfo(record, inputValue)

  const useDashboardModalContext = useContext(DashboardModalContext)

  const healthFactorReplay = useMemo(() => {
    return getHealthFactor('repay')
  }, [getHealthFactor])

  // 用户有借款的时候，不允许存
  const userBorrowings = useMemo(() => {
    // 未加载
    if (!record?.userBorrowings) return 0
    else {
      // 已有借款
      if (new BigNumber(utils.formatUnits(record?.userBorrowings?.toString())).toNumber() > 0) {
        return 1
      }
      // 无借款
      else {
        return 2
      }
    }
  }, [record?.userBorrowings])

  const handleMaxButtonClick = () => {
    const userUnderlyingBalance = new BigNumber(
      utils.formatUnits(record?.userUnderlyingBalance?.toString(), record?.decimals)
    )

    const userBorrowings = new BigNumber(
      utils.formatUnits(record?.userBorrowings?.toString(), record?.decimals)
    )
    if (record?.isCoinMarket) {
      // const value = Math.min(userUnderlyingBalance, userBorrowings).toString()
      if (userUnderlyingBalance.gt(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)) {
        if (
          userUnderlyingBalance
            .minus(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)
            .gt(userBorrowings)
        ) {
          setInputValue(userBorrowings.toString())
        } else {
          setInputValue(
            userUnderlyingBalance
              .minus(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)
              .toString()
          )
        }
      } else {
        setInputValue(0)
      }
      // setInputValue(
      //   new BigNumber(value).gt(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)
      //     ? new BigNumber(value)
      //         .minus(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)
      //         .toString()
      //     : 0
      // )
      // setInputValue(value)
    } else {
      const value = userUnderlyingBalance.gt(userBorrowings)
        ? userBorrowings.toString()
        : userUnderlyingBalance.toString()
      setInputValue(value || '')
    }
  }

  const submit = () => {
    if (new BigNumber(inputValue).eq(0)) {
      return false
    }

    setIsButtonLoading(true)
    try {
      const market = getWalletContract(
        record?.address,
        record?.isCoinMarket ? CoinMarket : ERC20Market
      )
      let value
      if (record?.isCoinMarket) {
        value = new BigNumber(new BigNumber(inputValue).decimalPlaces(Number(record?.decimals), 1))
          .times(new BigNumber(10).pow(Number(record?.decimals)))
          .toString()
      } else {
        value = new BigNumber(inputValue).gte(
          utils.formatUnits(record?.userBorrowings?.toString(), record?.decimals)
        )
          ? '0'
          : new BigNumber(new BigNumber(inputValue).decimalPlaces(Number(record?.decimals), 1))
              .times(new BigNumber(10).pow(Number(record?.decimals)))
              .toString()
      }

      if (record?.isCoinMarket) {
        sendTransaction(
          { contract: market, method: 'repay()', value: value, action: 'repay' },
          (res) => {
            setIsButtonLoading(false)
            if (!res?.err) {
              // 交易完成
              onConfirm ? onConfirm() : onClose && onClose()
              PubSub.publish('transactionComplete')
              setInputValue('')
            }
          },
          () => {
            // const item = {
            //   date: Date.now(),
            //   type: TxType.repay,
            //   mark: TxMark.lending,
            //   symbol: record?.symbol,
            //   num: inputValue,
            //   hash,
            //   status: Status.loading,
            // }
            // addHistory(item)
          }
        )
      } else {
        sendTransaction(
          { contract: market, method: 'repay', args: [value], action: 'repay' },
          (res) => {
            setIsButtonLoading(false)
            if (!res?.err) {
              // 交易完成
              PubSub.publish('transactionComplete')
              setInputValue('')

              useDashboardModalContext?.getLoanPoolMeta &&
                useDashboardModalContext?.getLoanPoolMeta()
              onConfirm ? onConfirm() : onClose && onClose()
              // 更新历史记录
              // updateHistory(res?.transactionHash)
            }
          },
          () => {
            // const item = {
            //   date: Date.now(),
            //   type: TxType.repay,
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
    } catch (err) {
      setIsButtonLoading(false)
      console.log(err)
    }
  }

  return (
    <Box>
      <Box display={userBorrowings === 1 ? 'inherit' : 'none'}>
        <Text
          textStyle="12"
          marginTop={{ base: px2vw(30), xl: '30px' }}
          marginBottom={{ base: px2vw(5), xl: '5px' }}
          paddingLeft={{ base: px2vw(10), xl: '10px' }}
          color="purple.300"
        >
          {t('walletBalance')}:{' '}
          {record?.userUnderlyingBalance ? (
            <NumberTips
              value={utils
                .formatUnits(record?.userUnderlyingBalance.toString(), record?.decimals)
                .toString()}
              toolTipProps={{ isDisabled: false }}
            />
          ) : (
            '--'
          )}{' '}
          {record?.symbol}
        </Text>
        <ModalInput
          record={record}
          isApproved={isApprovedMemo}
          errorInfo={errorInfoRepay}
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
            text: 'MAX',
            textStyle: {
              textAlign: 'center',
              lineHeight: { base: px2vw(14), xl: '16px' },
              fontSize: { base: px2vw(14), xl: '16px' },
              whiteSpace: 'normal',
            },
          }}
        />

        <InfoItem
          label={`${t('myBorrowings')}:`}
          valueRender={() => {
            return (
              <Text>
                {record?.userBorrowings ? (
                  <>
                    <NumberTips
                      toolTipProps={{ isDisabled: false }}
                      value={utils
                        .formatUnits(record?.userBorrowings.toString(), record?.decimals)
                        .toString()}
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
        {healthFactorReplay && (
          <HealthFactorCmp healthFactor={healthFactorReplay} hasBorrow={Boolean(borrowBalance)} />
        )}

        <ApprovedButtonGroup
          record={record}
          onClose={onClose}
          isApproved={isApprovedMemo}
          rightButtonProps={{
            text: t('Repay'),
            disabled: isButtonLoading || Boolean(errorInfoRepay),
            isLoading: isButtonLoading,
            buttonType: 'remove',
            onClick: () => {
              submit()
            },
          }}
        />
      </Box>
      <Box display={userBorrowings === 2 ? 'inherit' : 'none'}>
        <Center width="100%" marginTop={{ base: px2vw(30), xl: '30px' }}>
          <Text width={{ base: px2vw(240), xl: '232px' }} color="red.200" textAlign="center">
            {t(`No borrowings yet`)}
          </Text>
        </Center>
        <ApprovedButtonGroup
          record={record}
          onClose={onClose}
          isApproved={true}
          rightButtonProps={{
            text: t('goToBorrow'),
            onClick: () => {
              dashboardStore.setState({
                borrowModalIsOpen: true,
                depositModalIsOpen: false,
                currentBorrowTab: borrowTab[0],
              })
            },
          }}
        />
      </Box>
    </Box>
  )
})

export default Index
