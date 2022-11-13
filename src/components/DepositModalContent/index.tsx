import { Box, Center, Text, useBoolean, VStack } from '@chakra-ui/react'
import React, { useContext, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { utils } from 'ethers'
import { useTranslation } from 'next-i18next'

import dashboardStore, { borrowTab } from '@/stores/pages/dashboard'
import InfoList from '@/components/InfoList'
import ModalInput from '@/components/ModalInput'
import ShowMoreButton from '@/components/ShowMoreButton'
import NumberTips from '@/components/NumberTips'
import ApprovedButtonGroup from '@/components/ApprovedButtonGroup'
import { DashboardModalContext, DashModalContentProps } from '@/components/Modals/DashboardModal'
import HealthFactorCmp from '@/components/HealthFactorCmp'
import BaseTooltip from '@/components/BaseTooltip'

import fluxAppStore from '@/stores/contract/fluxApp'
import globalStore from '@/stores/global'
import px2vw from '@/utils/px2vw'
import useSendTransaction from '@/hooks/useSendTransaction'
import useMarketInfo from '@/hooks/useMarketInfo'
import { getWalletContract } from '@/contracts/funcs'
import { CoinMarket, ERC20Market } from '@/contracts/abis'
import { netconfigs } from '@/consts/network'
import { NetEnum } from '@/consts'

// import { Status, TxMark, TxType } from '@/consts/status'

const Index = React.memo(({ record, onClose, onConfirm }: DashModalContentProps) => {
  const { t } = useTranslation(['dashboard'])
  const { borrowBalance } = fluxAppStore()
  const { connectNet } = globalStore()

  const [inputValue, setInputValue] = useState<string | number>('')
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [isShow, setIsShow] = useBoolean(false)
  const { sendTransaction } = useSendTransaction()

  const { isApprovedMemo, getHealthFactor, getBorrowPowerAdded, errorInfoDesposit } = useMarketInfo(
    record || {},
    inputValue
  )
  const useDashboardModalContext = useContext(DashboardModalContext)

  // 用户有借款的时候，不允许存
  const userBorrowings = useMemo(() => {
    // 未加载

    if (!record?.userBorrowings) return 0
    else {
      // 已有借款
      if (Number(utils.formatUnits(record?.userBorrowings?.toString()).toString()) > 0) {
        return 1
      }
      // 无借款
      else {
        return 2
      }
    }
  }, [record?.userBorrowings])

  const healthFactor = useMemo(() => {
    return getHealthFactor('deposit')
  }, [getHealthFactor])

  const infoListData = useMemo(() => {
    return [
      {
        labelRender: () => {
          return (
            <BaseTooltip
              text={t('asCollateral') as string}
              afterText={{
                children: ':',
              }}
              textStyles={{
                color: 'grey.100',
              }}
            >
              <Text>{t('asCollateralToolTip')}</Text>
            </BaseTooltip>
          )
        },
        value: 'YES',
      },
      {
        labelRender: () => {
          return (
            <BaseTooltip
              text={t('borrowPowerAdded') as string}
              afterText={{
                children: ':',
              }}
              textStyles={{
                color: 'grey.100',
              }}
            >
              <VStack>
                <Text>{t('borrowPowerToolTipsFirst')}</Text>
                <Text>{t('borrowPowerToolTipsSecond')}</Text>
              </VStack>
            </BaseTooltip>
          )
        },
        valueRender: () => {
          return (
            <Text>
              ${' '}
              {getBorrowPowerAdded ? (
                <NumberTips
                  toolTipProps={{ isDisabled: false }}
                  value={getBorrowPowerAdded}
                  shortNum={2}
                />
              ) : (
                '--'
              )}
            </Text>
          )
        },
      },
      {
        label: `${t('maximumLTV')} ⓘ :`,
        labelRender: () => {
          return (
            <BaseTooltip
              text={t('maximumLTV') as string}
              afterText={{
                children: ':',
              }}
              textStyles={{
                color: 'grey.100',
              }}
            >
              <Text>{t('maximumLTVToolTips')}</Text>
            </BaseTooltip>
          )
        },
        valueRender: () => {
          return (
            <Text>
              {record?.maxinumLTVRatio ? (
                <NumberTips
                  toolTipProps={{ isDisabled: false }}
                  isRatio
                  value={Number(
                    utils.formatUnits(record?.maxinumLTVRatio?.toString(), 18).toString()
                  )}
                />
              ) : (
                '--'
              )}
            </Text>
          )
        },
      },
    ]
  }, [getBorrowPowerAdded, record?.maxinumLTVRatio, t])

  // 使用发送交易的hook
  const submit = () => {
    if (Number(inputValue) === 0) {
      return false
    }
    const market = getWalletContract(
      record?.address,
      record?.isCoinMarket ? CoinMarket : ERC20Market
    )
    setIsButtonLoading(true)
    const value = new BigNumber(new BigNumber(inputValue).decimalPlaces(record?.decimals, 1))
      .times(new BigNumber(10).pow(record?.decimals))
      .toString()
    if (record?.isCoinMarket) {
      sendTransaction(
        { contract: market, method: 'mint', value, action: 'supply' },
        (res) => {
          setIsButtonLoading(false)
          if (!res?.err) {
            // 交易完成
            onConfirm ? onConfirm() : onClose && onClose()
            PubSub.publish('transactionComplete')
            setInputValue(0)
            useDashboardModalContext?.getLoanPoolMeta && useDashboardModalContext?.getLoanPoolMeta()
          }
        },
        () => {
          // const item: any = {
          //   date: Date.now(),
          //   type: TxType.supply,
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
        { contract: market, method: 'mint', args: [value], action: 'supply' },
        (res) => {
          setIsButtonLoading(false)
          if (!res?.err) {
            // 交易完成
            onConfirm ? onConfirm() : onClose && onClose()
            PubSub.publish('transactionComplete')
            setInputValue(0)

            useDashboardModalContext?.getLoanPoolMeta && useDashboardModalContext?.getLoanPoolMeta()
          }
        },
        () => {
          // const item: any = {
          //   date: Date.now(),
          //   type: TxType.supply,
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
  }

  return (
    <>
      <Box display={userBorrowings === 2 ? 'inherit' : 'none'}>
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
                .formatUnits(record?.userUnderlyingBalance?.toString(), record?.decimals)
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
          errorInfo={errorInfoDesposit}
          buttonProps={{
            text: 'MAX',
            buttonClick: () => {
              if (!record?.userUnderlyingBalance) return
              if (record?.isCoinMarket) {
                setInputValue(
                  new BigNumber(
                    utils.formatUnits(record?.userUnderlyingBalance?.toString(), record?.decimals)
                  ).gt(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)
                    ? new BigNumber(
                        utils.formatUnits(
                          record?.userUnderlyingBalance?.toString(),
                          record?.decimals
                        )
                      )
                        .minus(netconfigs[connectNet as NetEnum]?.prePlatTotal as any)
                        .toString()
                    : 0
                )
              } else {
                setInputValue(
                  new BigNumber(
                    utils.formatUnits(record?.userUnderlyingBalance?.toString(), record?.decimals)
                  ).toString() || ''
                )
              }
            },
          }}
          inputProps={{
            value: inputValue,
            valChange: (e) => {
              setInputValue(e)
            },
          }}
        />

        <ShowMoreButton text={t('advanced')} visible={isShow} onClick={setIsShow.toggle} />
        {isShow && (
          <>
            <InfoList
              marginTop={{ base: px2vw(15), xl: '15px' }}
              marginBottom={{ base: px2vw(10), xl: '10px' }}
              data={infoListData as any}
            />
            {healthFactor && (
              <HealthFactorCmp healthFactor={healthFactor} hasBorrow={Boolean(borrowBalance)} />
            )}
          </>
        )}

        <ApprovedButtonGroup
          record={record}
          onClose={onClose}
          isApproved={isApprovedMemo}
          rightButtonProps={{
            text: t('Deposit'),
            buttonType: 'add',
            disabled: isButtonLoading || Boolean(errorInfoDesposit),
            isLoading: isButtonLoading,
            onClick: () => {
              submit()
            },
          }}
        />
      </Box>
      {/* 有借款的提示 */}
      <Box display={userBorrowings === 1 ? 'inherit' : 'none'}>
        <Center width="100%" marginTop={{ base: px2vw(30), xl: '30px' }}>
          <Text textAlign="center" width={{ base: px2vw(240), xl: '240px' }} color="red.200">
            {t('Repay outstanding', { symbol: record?.symbol })}
          </Text>
        </Center>
        <ApprovedButtonGroup
          record={record}
          onClose={onClose}
          isApproved={true}
          rightButtonProps={{
            text: t('goToRepay'),
            onClick: () => {
              dashboardStore.setState({
                depositModalIsOpen: false,
                borrowModalIsOpen: true,
                currentBorrowTab: borrowTab[1],
              })
            },
          }}
        />
      </Box>
    </>
  )
})

export default Index
