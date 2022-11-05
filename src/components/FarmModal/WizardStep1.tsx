import { Flex, Box, Stack, useBoolean } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'

import { PoolBox } from '@/components/FarmPool'
import px2vw from '@/utils/px2vw'
import { TokenInput } from '@/components/Form/TokenInput'
import { findIcon } from '@/utils/common'
import { useFormikContext } from 'formik'
import BigNumber from 'bignumber.js'
import { getWalletContract } from '@/contracts'
import { ERC20Abi } from '@/contracts/abis'
import useSendTransaction from '@/hooks/useSendTransaction'
import { maxUint256 } from '@/consts'
import globalStore from '@/stores/global'

const Step = ({ data, approveSuccess }: any) => {
  const { t } = useTranslation(['farm', 'common'])
  const { connectNet, fluxJson } = globalStore()
  const { values } = useFormikContext()
  const { sendTransaction } = useSendTransaction()
  const [token0Approve, setToken0Approve] = useBoolean(false)
  const [token1Approve, setToken1Approve] = useBoolean(false)
  // 授权
  const openApprove = (token: string, valut: string) => {
    token === data?.token0 ? setToken0Approve.on() : setToken1Approve.on()
    const underlyingContract = getWalletContract(token, ERC20Abi)
    sendTransaction(
      {
        contract: underlyingContract,
        method: 'approve',
        args: [valut, maxUint256],
        action: 'Approve',
      },
      () => {
        // 授权完成
        approveSuccess()
        token === data?.token0 ? setToken0Approve.off() : setToken1Approve.off()
      }
    )
  }
  return (
    <>
      <Flex alignItems="center" justifyContent="center" w="full">
        <Box w="max-content">
          <PoolBox
            record={{
              token: data.token,
              token1: data.token1,
              defi: data.defi,
            }}
          />
        </Box>
      </Flex>
      <Box textStyle="14" mt={{ base: px2vw(30), xl: '30px' }}>
        {t('tips1')}
      </Box>
      <Stack mt={{ base: px2vw(25), xl: '25px' }} spacing={{ base: px2vw(10), xl: '10px' }}>
        <TokenInput
          name="tokenNum"
          precision={data?.token0Decimal} // 精度
          isApprove={
            Object(values)?.tokenNum
              ? isNaN(new BigNumber(Object(values)?.tokenNum).toNumber())
                ? true
                : new BigNumber(data?.token0Allowance).gte(new BigNumber(Object(values)?.tokenNum))
              : !new BigNumber(data?.token0Allowance).eq(0)
          }
          maxBtn
          label={t('walletBalance')}
          labelValue={() => {
            return `${data?.token0Balance} ${`${data?.token}`.toLocaleUpperCase()}`
          }}
          maxNum={data?.token0Balance}
          tips={`${data?.token}`.toLocaleUpperCase()}
          imgUri={findIcon(`${data?.token}`.toLocaleLowerCase())}
          approveLoading={token0Approve}
          onApprove={() =>
            openApprove(data?.token0, fluxJson?.[connectNet as string]?.farm?.Orderbook)
          }
        />
        <TokenInput
          name="tokenNum1"
          precision={data?.token1Decimal} // 精度
          isApprove={
            Object(values)?.tokenNum1
              ? isNaN(new BigNumber(Object(values)?.tokenNum1).toNumber())
                ? true
                : new BigNumber(data?.token1Allowance).gte(new BigNumber(Object(values)?.tokenNum1))
              : !new BigNumber(data?.token1Allowance).eq(0)
          }
          maxBtn
          label={t('walletBalance')}
          labelValue={() => {
            return `${data?.token1Balance} ${`${data?.token1}`.toLocaleUpperCase()}`
          }}
          maxNum={data?.token1Balance}
          tips={`${data?.token1}`.toLocaleUpperCase()}
          imgUri={findIcon(`${data?.token1}`.toLocaleLowerCase())}
          approveLoading={token1Approve}
          onApprove={() =>
            openApprove(data?.token1Address, fluxJson?.[connectNet as string]?.farm?.Orderbook)
          }
        />
      </Stack>
      <Box textStyle="12" mt={{ base: px2vw(44), xl: '44px' }} lineHeight="1.5">
        {t('tips11')}
      </Box>
    </>
  )
}
export default Step
