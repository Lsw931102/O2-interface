import { Radio, Box, Stack, RadioGroup, useBoolean } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { useFormikContext } from 'formik'

import px2vw from '@/utils/px2vw'
import { TokenInput } from '@/components/Form/TokenInput'
import { findIcon } from '@/utils/common'
import useSendTransaction from '@/hooks/useSendTransaction'
import { getWalletContract } from '@/contracts'
import { ERC20Abi } from '@/contracts/abis'
import { maxUint256 } from '@/consts'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import Link from '@/components/Link'
import globalStore from '@/stores/global'

const radioProps = {
  size: 'lg',
  boxShadow: 'none !important',
  borderColor: 'var(--chakra-colors-purple-300) !important',
  bgColor: 'transparent !important',
  color: 'var(--chakra-colors-purple-300) !important',
}

const RadioTypeForm = ({ name }: any) => {
  const { t } = useTranslation(['farm'])
  const { values, setFieldValue } = useFormikContext<any>()
  return (
    <RadioGroup
      sx={{
        '.chakra-radio': {
          cursor: 'pointer',
        },
      }}
      name={name}
      w="max-content"
      m="auto"
      value={values[name]}
      onChange={(v) => {
        setFieldValue(name, +v)
      }}
    >
      <Stack>
        <Radio {...radioProps} value={0}>
          {t('addCollateralOnly')}
        </Radio>
        <Radio {...radioProps} value={1}>
          {t('continueBorrowing')}
        </Radio>
      </Stack>
    </RadioGroup>
  )
}

const Step = ({ data, approveSuccess }: any) => {
  const { t } = useTranslation(['farm'])
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
      <RadioTypeForm name="type" />
      <Box textStyle="14" mt={{ base: px2vw(30), xl: '30px' }}>
        {t('tips1.1')}
      </Box>
      <Stack mt={{ base: px2vw(25), xl: '25px' }} spacing={{ base: px2vw(10), xl: '10px' }}>
        <TokenInput
          name="tokenNum"
          precision={data?.tokenInfos[0]?.decimals} // 精度
          isApprove={
            Object(values)?.tokenNum
              ? isNaN(new BigNumber(Object(values)?.tokenNum).toNumber())
                ? true
                : new BigNumber(
                    ethers.utils.formatUnits(
                      data?.tokenInfos[0]?.allowance,
                      data?.tokenInfos[0]?.decimals
                    )
                  ).gte(new BigNumber(Object(values)?.tokenNum))
              : !new BigNumber(
                  ethers.utils.formatUnits(
                    data?.tokenInfos[0]?.allowance,
                    data?.tokenInfos[0]?.decimals
                  )
                ).eq(0)
          }
          maxBtn
          label={t('walletBalance')}
          labelValue={() => {
            return `${ethers.utils.formatUnits(
              data?.tokenInfos[0]?.balance,
              data?.tokenInfos[0]?.decimals
            )} ${`${data?.token}`.toLocaleUpperCase()}`
          }}
          maxNum={new BigNumber(
            ethers.utils.formatUnits(data?.tokenInfos[0]?.balance, data?.tokenInfos[0]?.decimals)
          ).toString()}
          tips={`${data?.token}`.toLocaleUpperCase()}
          imgUri={findIcon(`${data?.token}`.toLocaleLowerCase())}
          approveLoading={token0Approve}
          onApprove={() =>
            openApprove(
              data?.tokenInfos[0]?.token,
              fluxJson?.[connectNet as string]?.farm?.Orderbook
            )
          }
        />
        <TokenInput
          name="tokenNum1"
          precision={data?.tokenInfos[1]?.decimals} // 精度
          isApprove={
            Object(values)?.tokenNum1
              ? isNaN(new BigNumber(Object(values)?.tokenNum1).toNumber())
                ? true
                : new BigNumber(
                    ethers.utils.formatUnits(
                      data?.tokenInfos[1]?.allowance,
                      data?.tokenInfos[1]?.decimals
                    )
                  ).gte(new BigNumber(Object(values)?.tokenNum1))
              : !new BigNumber(
                  ethers.utils.formatUnits(
                    data?.tokenInfos[1]?.allowance,
                    data?.tokenInfos[1]?.decimals
                  )
                ).eq(0)
          }
          maxBtn
          label={t('walletBalance')}
          labelValue={() => {
            return `${ethers.utils.formatUnits(
              data?.tokenInfos[1]?.balance,
              data?.tokenInfos[1]?.decimals
            )} ${`${data?.token1}`.toLocaleUpperCase()}`
          }}
          maxNum={new BigNumber(
            ethers.utils.formatUnits(data?.tokenInfos[1]?.balance, data?.tokenInfos[1]?.decimals)
          ).toString()}
          tips={`${data?.token1}`.toLocaleUpperCase()}
          imgUri={findIcon(`${data?.token1}`.toLocaleLowerCase())}
          approveLoading={token1Approve}
          onApprove={() =>
            openApprove(
              data?.tokenInfos[1]?.token,
              fluxJson?.[connectNet as string]?.farm?.Orderbook
            )
          }
        />
      </Stack>
      <Link href="#">
        <Box
          textStyle="12"
          mt={{ base: px2vw(44), xl: '44px' }}
          lineHeight="1.5"
          _hover={{ textDecoration: 'underline' }}
        >
          {t('tips11')}
        </Box>
      </Link>
    </>
  )
}
export default Step
