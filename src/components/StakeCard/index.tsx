import React, { useState, useEffect } from 'react'
import { Flex, Text, Image } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useTranslation } from 'next-i18next'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { useUnmount } from 'react-use'
import duration from 'dayjs/plugin/duration'
import NumberTips from '@/components/NumberTips'
import BaseButton from '@/components/BaseButton'
import BaseInput from '@/components/BaseInput'
import BaseTooltip from '@/components/BaseTooltip'
import px2vw from '@/utils/px2vw'
import { findIcon, completeUrl } from '@/utils/common'
import { netconfigs } from '@/consts/network'
import globalStore from '@/stores/global'
import stakeStore from '@/stores/pages/stake'
import fluxReportStore from '@/stores/contract/fluxReport'
import { StakeType } from '../StakePage'
import { getReadContract, getWalletContract } from '@/contracts/funcs'
import { LockTimeStakePoolAbi, StakePoolAbi, ERC20Abi } from '@/contracts/abis'
import { maxUint256, NetEnum } from '@/consts'
import useSendTransaction from '@/hooks/useSendTransaction'

BigNumber.config({ EXPONENTIAL_AT: 99 })

dayjs.extend(duration)
interface IProps {
  type?: StakeType
  data: { [key: string]: any }
}
function StakeCard({ type = StakeType.lp, data }: IProps) {
  const { t } = useTranslation(['stake'])
  const { getStakePools, unclaimedFluxAtStake } = stakeStore()
  const { connectNet, isLogin, userAddress, fluxJson } = globalStore()
  const { fluxPrice } = fluxReportStore()
  const [status, setStatus] = useState(0) // 0：默认状态，1：Approve状态，2：stake状态，3：unStake状态
  const [isOpen, setOpen] = useState(false) // 卡片是否展开（移动端使用）
  const [amount, setAmount] = useState('') // 质押/赎回数量
  const [timer, setTimer] = useState<any>(null) // 倒计时计时器
  const [countdownTime, setCountdownTime] = useState('') // 倒计时显示文本
  const [errMsg, setErrMsg] = useState('')
  const { sendTransaction, loading } = useSendTransaction()

  useEffect(() => {
    if (data?.type !== StakeType.lp && isLogin) {
      getLockTime()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.type, isLogin, userAddress])

  useUnmount(() => {
    setCountdownTime('')
    if (timer) clearInterval(timer)
  })

  // flux单币质押池子，获取锁仓时间
  const getLockTime = async () => {
    try {
      if (timer) {
        setCountdownTime('')
        clearInterval(timer)
      }
      const { userAddress } = globalStore.getState()
      const tokenContract = getReadContract(data?.recipientAddress, LockTimeStakePoolAbi)
      const endTime = (await tokenContract?.lockBlocks(userAddress)) / 1
      const curTimer = setInterval(() => {
        const now = new Date().getTime() / 1000
        const leftSencond = endTime - now
        if (leftSencond > 0) {
          const day = dayjs.duration(leftSencond * 1000).days()
          const hour = dayjs.duration(leftSencond * 1000).hours()
          const minute = dayjs.duration(leftSencond * 1000).minutes()
          const second = dayjs.duration(leftSencond * 1000).seconds()
          setCountdownTime(
            `${day}d:${hour > 9 ? hour : `0${hour}`}h:${minute > 9 ? minute : `0${minute}`}m:${
              second > 9 ? second : `0${second}`
            }s`
              .replace('0d:', '')
              .replace('00h:', '')
              .replace('00m:', '')
          )
        } else {
          clearInterval(timer)
          setCountdownTime('')
        }
      }, 1000)
      setTimer(curTimer)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    errorVerify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount])

  // 错误检查
  const errorVerify = () => {
    if (status === 2) {
      if (new BigNumber(amount).gt(data?.myWalletBalance)) {
        setErrMsg(t('Insufficient wallet balance'))
        return
      }
      if (new BigNumber(amount).gt(data?.myAllownce)) {
        setErrMsg(t(type === StakeType.lp ? 'Approve LP' : 'Approve Flux'))
        return
      }
    }
    if (status === 3 && new BigNumber(amount).gt(data?.myStaked)) {
      setErrMsg(t('Exceeds the locked amount'))
      return
    }
    setErrMsg('')
  }

  // Approve点击事件
  const approveClick = async () => {
    if (status !== 1) {
      setStatus(1)
      return
    }
    try {
      const tokenContract = getWalletContract(data?.token, ERC20Abi)
      sendTransaction(
        {
          contract: tokenContract,
          method: 'approve',
          args: [data?.recipientAddress, maxUint256],
          action: t('Approve'),
        },
        (res) => {
          // 执行完成
          if (res?.err) {
            setStatus(1)
          } else {
            setStatus(0)
            getStakePools()
          }
        }
      )
    } catch (err) {
      console.log(err)
    }
  }

  // stake点击事件
  const stakeClick = async () => {
    if (status !== 2) {
      if (data?.myAllownce && new BigNumber(data?.myAllownce).gt(0)) {
        setStatus(2)
      } else {
        setStatus(1)
      }
      return
    }
    if (!new BigNumber(amount).gt(0)) return
    try {
      const poolContract = getWalletContract(data?.recipientAddress, StakePoolAbi)
      sendTransaction(
        {
          contract: poolContract,
          method: 'stake',
          args: [new BigNumber(amount).times(new BigNumber(10).pow(data?.decimals)).toString()],
          action: t('Stake'),
        },
        (res: any) => {
          // 执行完成
          setStatus(0)
          setAmount('')
          if (res?.err) return
          getStakePools()
          if (data?.type !== StakeType.lp) {
            getLockTime()
          }
        }
      )
    } catch (err) {
      console.log(err)
    }
  }

  // unStake点击事件
  const unStakeClick = async () => {
    if (data?.type !== StakeType.lp && countdownTime) return
    if (status !== 3) {
      setStatus(3)
      return
    }
    if (!new BigNumber(amount).gt(0)) return
    try {
      const poolContract = getWalletContract(data?.recipientAddress, StakePoolAbi)
      sendTransaction(
        {
          contract: poolContract,
          method: 'unStake',
          args: [new BigNumber(amount).times(new BigNumber(10).pow(data?.decimals)).toString()],
          action: t('Unstake'),
        },
        (res) => {
          // 执行完成
          setStatus(0)
          setAmount('')
          if (res?.err) return
          getStakePools()
        }
      )
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="space-between"
      w={{ base: px2vw(355), xl: '355px' }}
      h={{ base: isOpen ? px2vw(484) : px2vw(182), xl: '484px' }}
      p={{
        base: isOpen ? `${px2vw(15)} ${px2vw(20)} ${px2vw(30)}` : `${px2vw(20)}`,
        xl: '15px 20px 30px',
      }}
      mt={{ base: px2vw(15), xl: '35px' }}
      ml={{ base: 0, xl: '72.5px' }}
      bg="gray.200"
      borderRadius="xl"
    >
      <Flex direction="column" w="full" alignItems="center">
        {/* swap */}
        <Flex
          display={{ base: isOpen ? 'flex' : 'none', xl: 'flex' }}
          w="full"
          alignItems="center"
          justifyContent="flex-end"
          mb={{ base: px2vw(15), xl: '15px' }}
          cursor="pointer"
          onClick={() => window.open(data?.liquidityLink, '_blank')}
        >
          <Text textStyle="12" fontWeight="normal">
            {type === StakeType.lp
              ? t('Get LP Token')
              : type === StakeType.flux
              ? t('Get FLUX')
              : t('Get ZO')}
          </Text>
          <Image
            src={completeUrl(
              `swap/${netconfigs[connectNet as NetEnum]?.swapText?.toLowerCase()}.png`
            )}
            w={{ base: px2vw(20), xl: '20px' }}
            h={{ base: px2vw(20), xl: '20px' }}
            ml={{ base: px2vw(5), xl: '5px' }}
          />
        </Flex>
        {/* symbol */}
        <Flex alignItems="center">
          <Flex alignItems="center" direction="row-reverse" mr={{ base: px2vw(10), xl: '10px' }}>
            {type !== StakeType.lp ? (
              <Image
                ignoreFallback
                src={findIcon(type)}
                w={{ base: px2vw(60), xl: '60px' }}
                h={{ base: px2vw(60), xl: '60px' }}
                // borderRadius="round"
              />
            ) : (
              <>
                <Image
                  ignoreFallback
                  src={findIcon(data?.symbol.split('-')[1])}
                  w={{ base: px2vw(60), xl: '60px' }}
                  h={{ base: px2vw(60), xl: '60px' }}
                  ml={{ base: px2vw(-20), xl: '-20px' }}
                  borderRadius="round"
                />
                <Image
                  ignoreFallback
                  src={findIcon(data?.symbol.split('-')[0])}
                  w={{ base: px2vw(60), xl: '60px' }}
                  h={{ base: px2vw(60), xl: '60px' }}
                  ml={{ base: px2vw(-20), xl: '-20px' }}
                  borderRadius="round"
                />
              </>
            )}
          </Flex>
          <Flex
            direction="column"
            justifyContent="space-between"
            h={{ base: px2vw(60), xl: '60px' }}
          >
            <Flex direction="column">
              {type === StakeType.lp ? (
                <Text textStyle="14" fontWeight="normal">
                  {netconfigs[connectNet as NetEnum]?.swapText}
                </Text>
              ) : null}
              <Flex alignItems="center" textStyle="18">
                {type !== StakeType.lp && (
                  <Text>{t(type === StakeType.flux ? 'Lock FLUX' : 'Lock ZO')}&nbsp;</Text>
                )}
                <Text
                  textStyle={type !== StakeType.lp ? '24' : '18'}
                  fontWeight={type !== StakeType.lp ? 'bold' : '500'}
                >
                  {data?.symbol}
                </Text>
              </Flex>
            </Flex>
            <Text textStyle="18" fontWeight="bold">
              APR:{' '}
              {!isNaN(data?.stakedAPY) ? (
                <NumberTips value={data?.stakedAPY} isRatio={true} />
              ) : (
                '--'
              )}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      {/* Total Value Locked */}
      <Flex direction="column" alignItems="center" textStyle="24" fontWeight="bold">
        {type !== StakeType.lp ? (
          <Flex>
            {data?.token0Staked ? <NumberTips value={data?.token0Staked} shortNum={2} /> : '--'}
            &nbsp;{type.toUpperCase()}
          </Flex>
        ) : data?.stakeTvl ? (
          <NumberTips symbol="$" value={data?.stakeTvl} shortNum={2} />
        ) : (
          '--'
        )}
        <Text
          textStyle="14"
          fontWeight="normal"
          mt={{ base: isOpen ? px2vw(10) : px2vw(5), xl: '10px' }}
        >
          {t('Total Value Locked')}
        </Text>
      </Flex>
      <Flex
        display={{ base: isOpen ? 'flex' : 'none', xl: 'flex' }}
        direction="column"
        w="full"
        alignItems="center"
      >
        {/* detail data */}
        <Flex
          direction="column"
          w="full"
          mb={{ base: px2vw(10), xl: '10px' }}
          textStyle="14"
          fontWeight="500"
        >
          <Flex
            alignItems="center"
            justifyContent="space-between"
            mb={{ base: px2vw(15), xl: '15px' }}
          >
            <Text as="label">
              {type === StakeType.lp
                ? t('$10000 Earn')
                : type === StakeType.flux
                ? t('Lock 10000 FLUX Earn')
                : t('Lock 10000 ZO Earn')}{' '}
              ⓘ:
            </Text>
            <Text fontWeight="normal">
              {!isNaN(data?.stakedAPY) ? (
                <NumberTips
                  value={new BigNumber(data?.stakedAPY)
                    .div(365)
                    .times(10000)
                    .div(type === StakeType.lp ? fluxPrice || 1 : 1)
                    .toString()}
                />
              ) : (
                '--'
              )}
              &nbsp; {type.toUpperCase()}/{t('Day')}
            </Text>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            mb={{ base: px2vw(15), xl: '15px' }}
          >
            <Text as="label">{t(data?.type !== StakeType.lp ? 'My Locked' : 'My Staked')}:</Text>
            <BaseTooltip
              isPureVersion={true}
              textRender={
                <Text fontWeight="normal">
                  {isLogin && data?.myStaked ? (
                    <NumberTips value={data?.myStaked} toolTipProps={{ isDisabled: false }} />
                  ) : (
                    '--'
                  )}{' '}
                  {type.toUpperCase()} (
                  {isLogin && data?.poolStaked ? (
                    <NumberTips
                      value={
                        new BigNumber(data?.poolStaked).gt(0)
                          ? new BigNumber(data?.myStaked).div(data?.poolStaked).toString()
                          : 0
                      }
                      isRatio={true}
                    />
                  ) : (
                    '--'
                  )}
                </Text>
              }
              afterText={{ children: ')', fontWeight: 'normal' }}
            >
              {t('Staked Percent')}
            </BaseTooltip>
          </Flex>
          {type !== StakeType.lp && countdownTime ? (
            <Flex
              alignItems="center"
              justifyContent="space-between"
              mb={{ base: px2vw(15), xl: '15px' }}
            >
              <Text as="label">{t('Unlocked Time')}:</Text>
              <Text fontWeight="normal">{countdownTime}</Text>
            </Flex>
          ) : null}
          <Flex
            alignItems="center"
            justifyContent="space-between"
            mb={{ base: px2vw(15), xl: '15px' }}
          >
            <Text as="label">{t('Earned')}:</Text>
            <Text fontWeight="normal">
              {unclaimedFluxAtStake.length ? (
                <NumberTips
                  value={
                    unclaimedFluxAtStake?.find((it) => it.address === data?.recipientAddress)
                      ?.unclaimed
                  }
                  toolTipProps={{ isDisabled: false }}
                />
              ) : (
                '--'
              )}
              &nbsp; {type.toUpperCase()}
            </Text>
          </Flex>
        </Flex>
        {/* inpurt area */}
        {status === 2 || status === 3 ? (
          <Flex
            direction="column"
            w="full"
            mb={{ base: px2vw(12), xl: '12px' }}
            borderRadius="12px"
          >
            <Flex
              alignItems="center"
              justifyContent="space-between"
              p={{ base: `${px2vw(7)} ${px2vw(10)} ${px2vw(6)}`, xl: '7px 10px 6px' }}
              bg="gray.100"
              borderRadius="12px 12px 0 0"
            >
              <Text>{t(status === 2 ? 'Available to stake' : 'Available to unStake')}:</Text>
              <Flex alignItems="center">
                {status === 2 && isLogin && data?.myWalletBalance ? (
                  <NumberTips value={data?.myWalletBalance} toolTipProps={{ isDisabled: false }} />
                ) : data?.myStaked ? (
                  <NumberTips value={data?.myStaked} toolTipProps={{ isDisabled: false }} />
                ) : (
                  '--'
                )}
                <Text>{type === StakeType.lp ? 'LP' : type.toUpperCase()}</Text>
              </Flex>
            </Flex>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              p={{
                base: `${px2vw(10)} ${px2vw(10)} ${px2vw(10)} ${px2vw(17)}`,
                xl: '10px 10px 10px 17px',
              }}
              bg="gray.400"
              borderRadius="0 0 12px 12px"
            >
              <BaseInput
                maxW={{ base: px2vw(222), xl: '222px' }}
                fontSize={{ base: px2vw(18), xl: '18px' }}
                fontWeight="bold"
                bg="transparent"
                value={amount}
                valChange={(val) => setAmount(val.toString())}
              />
              <BaseButton
                text="MAX"
                minW={{ base: px2vw(50), xl: '50px' }}
                w={{ base: px2vw(50), xl: '50px' }}
                h={{ base: px2vw(20), xl: '20px' }}
                bgColor="purple.300"
                textStyle={{
                  textStyle: '12',
                  fontWeight: 'bold',
                }}
                fontWeight="bold"
                buttonClick={() => setAmount(status === 2 ? data?.myWalletBalance : data?.myStaked)}
              />
            </Flex>
          </Flex>
        ) : null}
        {/* error */}
        <Text color="red.200" fontWeight="normal">
          {errMsg}
        </Text>
        {/* buttons */}
        <Flex
          alignItems="center"
          justifyContent={{
            base: 'space-between',
            xl:
              (status === 0 && data?.myStaked && new BigNumber(data?.myStaked).eq(0)) ||
              (status === 0 && Boolean(countdownTime))
                ? 'center'
                : 'space-between',
          }}
          w="full"
          mt={{ base: px2vw(12), xl: '12px' }}
          textStyle="16"
          fontWeight="bold"
        >
          {(status === 1 || (status === 2 && type !== StakeType.lp) || status === 3) && (
            <BaseButton
              buttonType="close"
              needVerify={false}
              w={{ base: px2vw(100), xl: '100px' }}
              h={{ base: px2vw(40), xl: '40px' }}
              bgColor="purple.700"
              iconStyle={{ w: { base: px2vw(17), xl: '17px' }, h: { base: px2vw(17), xl: '17px' } }}
              buttonClick={() => {
                setStatus(0)
                setAmount('')
              }}
            />
          )}
          {status === 2 && type === StakeType.lp && (
            <BaseButton
              buttonType="close"
              needVerify={false}
              minW={{ base: px2vw(40), xl: '40px' }}
              w={{ base: px2vw(40), xl: '40px' }}
              h={{ base: px2vw(40), xl: '40px' }}
              bgColor="purple.700"
              iconStyle={{ w: { base: px2vw(17), xl: '17px' }, h: { base: px2vw(17), xl: '17px' } }}
              buttonClick={() => {
                setStatus(0)
                setAmount('')
              }}
            />
          )}
          {status === 2 && type === StakeType.lp && (
            <BaseButton
              text={t('Get LP')}
              needVerify={false}
              w={{ base: px2vw(100), xl: '100px' }}
              h={{ base: px2vw(40), xl: '40px' }}
              bgColor="transparent"
              border="1px solid"
              borderColor="purple.300"
              boxSizing="border-box"
              textStyle={{
                color: 'purple.300',
              }}
              buttonClick={() => window.open(data?.liquidityLink, '_blank')}
            />
          )}
          {(status === 0 || status === 3) &&
            !countdownTime &&
            (data?.myStaked ? new BigNumber(data?.myStaked).gt(0) : true) && (
              <BaseButton
                isLoading={status === 3 && loading}
                disabled={
                  Boolean(countdownTime) ||
                  !data?.myStaked ||
                  new BigNumber(data?.myStaked).eq(0) ||
                  (status === 3 && !new BigNumber(amount).gt(0)) ||
                  Boolean(errMsg && status === 3)
                }
                text={t(data?.type !== StakeType.lp ? 'Unlock' : 'Unstake')}
                w={{ base: px2vw(100), xl: '100px' }}
                h={{ base: px2vw(40), xl: '40px' }}
                bgColor="purple.700"
                buttonClick={() => unStakeClick()}
              />
            )}
          {(status === 0 || status === 2) && (
            <BaseButton
              isLoading={status === 2 && loading}
              disabled={
                !(
                  data?.token?.toUpperCase() ===
                    fluxJson?.[connectNet as string]?.contracts?.['ZO']?.toUpperCase() ||
                  data?.swapdex?.token0?.address?.toUpperCase() ===
                    fluxJson?.[connectNet as string]?.contracts?.['ZO']?.toUpperCase() ||
                  data?.swapdex?.token1?.address?.toUpperCase() ===
                    fluxJson?.[connectNet as string]?.contracts?.['ZO']?.toUpperCase()
                ) ||
                // !new BigNumber(data?.stakedAPY).gt(0) ||
                (status === 2 && !new BigNumber(amount).gt(0)) ||
                Boolean(errMsg && status === 2)
              }
              text={t(data?.type !== StakeType.lp ? 'Lock' : 'Stake')}
              w={{ base: px2vw(100), xl: '100px' }}
              h={{ base: px2vw(40), xl: '40px' }}
              bgColor="purple.300"
              buttonClick={() => stakeClick()}
            />
          )}
          {status === 1 && (
            <BaseButton
              isLoading={status === 1 && loading}
              text={t(loading ? 'Approving' : 'Approve')}
              w={{ base: px2vw(100), xl: '100px' }}
              h={{ base: px2vw(40), xl: '40px' }}
              bgColor="purple.300"
              buttonClick={() => approveClick()}
            />
          )}
          <BaseButton
            display={{ base: 'flex', xl: 'none' }}
            buttonType="closeUp"
            needVerify={false}
            minW={px2vw(40)}
            w={px2vw(40)}
            h={px2vw(40)}
            bgColor="purple.700"
            buttonClick={() => setOpen(false)}
          />
        </Flex>
      </Flex>
      <Flex
        display={{ base: isOpen ? 'none' : 'flex', xl: 'none' }}
        alignItems="center"
        justifyContent="center"
        pos="relative"
        w="full"
        onClick={() => setOpen(true)}
      >
        <Text>{t('Earned')}:&nbsp;</Text>
        <Text fontWeight="normal">
          {unclaimedFluxAtStake.length ? (
            <NumberTips
              value={
                unclaimedFluxAtStake?.find((it) => it.address === data?.recipientAddress)?.unclaimed
              }
              toolTipProps={{ isDisabled: false }}
            />
          ) : (
            '--'
          )}
          &nbsp;ZO
        </Text>
        <ChevronDownIcon pos="absolute" right="0" w={px2vw(24)} h={px2vw(24)} />
      </Flex>
    </Flex>
  )
}

export default React.memo(StakeCard)
