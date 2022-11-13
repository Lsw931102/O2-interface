import { Box, Center, Text } from '@chakra-ui/react'
import React, { useContext, useMemo, useState } from 'react'
import { utils } from 'ethers'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'

import { InfoItem } from '@/components/InfoList'
import ModalInput from '@/components/ModalInput'
import ApprovedButtonGroup from '@/components/ApprovedButtonGroup'
import NumberTips from '@/components/NumberTips'
import { SAFE } from '@/components/WithDrawModalContent'
import { DashboardModalContext, DashModalContentProps } from '@/components/Modals/DashboardModal'
import HealthFactorCmp from '@/components/HealthFactorCmp'

import useMarketInfo from '@/hooks/useMarketInfo'
import useSendTransaction from '@/hooks/useSendTransaction'

import { getWalletContract } from '@/contracts/funcs'
import { CoinMarket, ERC20Market } from '@/contracts/abis'
import px2vw from '@/utils/px2vw'
import dashboardStore, { despositTab } from '@/stores/pages/dashboard'

const Index = React.memo(({ record, onClose, onConfirm }: DashModalContentProps) => {
  const { t } = useTranslation(['dashboard'])
  const { sendTransaction } = useSendTransaction()

  const useDashboardModalContext = useContext(DashboardModalContext)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [inputValue, setInputValue] = useState<string | number>('')

  const { getHealthFactor, errorInfoBorrow } = useMarketInfo(record || {}, inputValue)

  const healthFactorBorrow = useMemo(() => {
    return getHealthFactor('borrow')
  }, [getHealthFactor])

  const userBorrowLimitMemo = useMemo(() => {
    const max =
      record?.userBorrowLimit &&
      new BigNumber(utils.formatUnits(record?.userBorrowLimit.toString(), record?.decimals))

    return max
  }, [record?.decimals, record?.userBorrowLimit])

  // 如果用户有对应币种的存款 不允许借
  const userDeposit = useMemo(() => {
    if (!record?.userDeposits) return 0
    else {
      // 已有借款
      if (new BigNumber(utils.formatUnits(record?.userDeposits?.toString())).toNumber() > 0) {
        return 1
      }
      // 无借款
      else {
        return 2
      }
    }
  }, [record])

  // 当有借款的时候，需要乘以0.85，没有借款的时候乘以1
  const handleMaxButtonClick = () => {
    setInputValue(userBorrowLimitMemo.times(SAFE).toString())
  }

  const submit = () => {
    if (new BigNumber(inputValue).eq(0)) {
      return false
    }
    try {
      setIsButtonLoading(true)

      const market = getWalletContract(
        record?.address,
        record?.isCoinMarket ? CoinMarket : ERC20Market
      )

      const value = new BigNumber(
        new BigNumber(inputValue).decimalPlaces(Number(record?.decimals), 1)
      )
        .times(new BigNumber(10).pow(Number(record?.decimals)))
        .toString()
      sendTransaction(
        { contract: market, method: 'borrow', args: [value], action: 'borrow' },
        (res: any) => {
          setIsButtonLoading(false)
          // 交易完成
          if (!res?.err) {
            PubSub.publish('transactionComplete')
            setInputValue('')
            useDashboardModalContext?.getLoanPoolMeta && useDashboardModalContext?.getLoanPoolMeta()
            onConfirm ? onConfirm() : onClose && onClose()
            // 更新历史记录
          }
        },
        () => {
          // const item = {
          //   date: Date.now(),
          //   type: TxType.borrow,
          //   mark: TxMark.lending,
          //   symbol: record?.symbol,
          //   num: inputValue,
          //   hash,
          //   status: Status.loading,
          // }
          // addHistory(item)
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Box display={userDeposit === 2 ? 'inherit' : 'none'}>
        <Text
          textStyle="12"
          marginTop={{ base: px2vw(30), xl: '30px' }}
          marginBottom={{ base: px2vw(5), xl: '5px' }}
          paddingLeft={{ base: px2vw(10), xl: '10px' }}
          color="purple.300"
        >
          {t('borrowPower')}:{' '}
          {record?.userBorrowLimit ? (
            <NumberTips
              toolTipProps={{ isDisabled: false }}
              value={userBorrowLimitMemo.toString()}
            />
          ) : (
            '--'
          )}{' '}
          {record?.symbol}
        </Text>
        <ModalInput
          errorInfo={errorInfoBorrow}
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
            text: 'SAFE MAX',
            textStyle: {
              textAlign: 'center',
              lineHeight: { base: px2vw(14), xl: '14px' },
              fontSize: { base: px2vw(14), xl: '14px' },
              fontWeight: '500',
              whiteSpace: 'normal',
            },
          }}
        />
        <InfoItem
          label={`${t('poolLiquidity')} : `}
          valueRender={() => {
            return (
              <Text>
                {record?.liquidity ? (
                  <>
                    {' '}
                    <NumberTips
                      toolTipProps={{ isDisabled: false }}
                      value={utils.formatUnits(record?.liquidity.toString(), record?.decimals)}
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

        <HealthFactorCmp healthFactor={healthFactorBorrow} hasBorrow={true} />
        <ApprovedButtonGroup
          record={record}
          onClose={onClose}
          isApproved={true}
          rightButtonProps={{
            text: t('Borrow'),
            disabled: isButtonLoading || Boolean(errorInfoBorrow),
            isLoading: isButtonLoading,
            buttonType: 'add',
            // specialIcon: () => <Image src={addIcon} w="24px" ml="15px" />,
            onClick: () => {
              submit()
            },
          }}
        />
      </Box>

      {/* 有存款的提示 */}
      <Box display={userDeposit === 1 ? 'inherit' : 'none'}>
        <Center width="100%" marginTop={{ base: px2vw(30), xl: '30px' }}>
          <Text width={{ base: px2vw(240), xl: '232px' }} color="red.200" textAlign="center">
            {t('borrwing disabled due to existing', { symbol: record?.symbol })}
          </Text>
        </Center>
        <ApprovedButtonGroup
          record={record}
          onClose={onClose}
          isApproved={true}
          rightButtonProps={{
            text: t('goToWithdraw'),
            onClick: () => {
              dashboardStore.setState({
                borrowModalIsOpen: false,
                depositModalIsOpen: true,
                currentDespositTab: despositTab[1],
              })
            },
          }}
        />
      </Box>
    </>
  )
})
export default Index
