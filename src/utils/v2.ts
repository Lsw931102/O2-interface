import globalStore from '@/stores/global'
import { ethers, BigNumber, BigNumberish } from 'ethers'

function strategyEncodeData(address: string, exeABIs: string[] = [], exeArgs: any[] = []): Buffer {
  const coder = new ethers.utils.AbiCoder()
  const exeData = coder.encode(exeABIs, exeArgs)
  const extData = coder.encode(['address', 'bytes'], [address, exeData])
  return Buffer.from(extData.slice(2), 'hex')
}

export function strategyAddTwoData(minLPAmount: BigNumberish): Buffer {
  const { fluxJson, connectNet } = globalStore.getState()
  return strategyEncodeData(
    fluxJson?.[connectNet as string]?.farm?.PancakeStrategyAddOptimal,
    ['uint256'],
    [minLPAmount]
  )
}

// export function strategyLiquidateData(): Buffer {
//   return strategyEncodeData(contracts.strategyLiquidate.address)
// }

export function strategyClosePartData(returnLpToken: BigNumberish): Buffer {
  const { fluxJson, connectNet } = globalStore.getState()
  return strategyEncodeData(
    fluxJson?.[connectNet as string]?.farm?.PancakeStrategyPartialCloseLiquidate,
    ['uint256'],
    [returnLpToken]
  )
}

export function strategyWithdrawData(minTokenA: BigNumberish, minTokenB: BigNumberish): Buffer {
  const { fluxJson, connectNet } = globalStore.getState()
  return strategyEncodeData(
    fluxJson?.[connectNet as string]?.farm?.PancakeStrategyWithdrawMinimizeTrading,
    ['uint256', 'uint256'],
    [minTokenA, minTokenB]
  )
}

function sqrt(x: BigNumber): BigNumber {
  if (x.eq(0)) return ZERO
  let xx = BigNumber.from(x)
  let r = BigNumber.from(1)

  if (xx.gte('0x100000000000000000000000000000000')) {
    xx = xx.shr(128)
    r = r.shl(64)
  }

  if (xx.gte('0x10000000000000000')) {
    xx = xx.shr(64)
    r = r.shl(32)
  }
  if (xx.gte('0x100000000')) {
    xx = xx.shr(32)
    r = r.shl(16)
  }
  if (xx.gte('0x10000')) {
    xx = xx.shr(16)
    r = r.shl(8)
  }
  if (xx.gte('0x100')) {
    xx = xx.shr(8)
    r = r.shl(4)
  }
  if (xx.gte('0x10')) {
    xx = xx.shr(4)
    r = r.shl(2)
  }
  if (xx.gte('0x8')) {
    r = r.shl(1)
  }

  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1) // Seven iterations should be enough
  const r1 = x.div(r)
  return r.lt(r1) ? r : r1
}

function _optimalDepositA(
  amtA: BigNumber,
  amtB: BigNumber,
  resA: BigNumber,
  resB: BigNumber
): BigNumber {
  if (!amtA.mul(resB).gte(amtB.mul(resA))) throw 'Reserved'
  const fee = 25
  const a = BigNumber.from(10000).sub(fee)
  const b = BigNumber.from(20000).sub(fee).mul(resA)
  const _c = amtA.mul(resB).sub(amtB.mul(resA))
  const c = _c.mul(10000).div(amtB.add(resB)).mul(resA)

  const d = a.mul(c).mul(4)
  const e = sqrt(b.mul(b).add(d))

  const numerator = e.sub(b)
  const denominator = a.mul(2)

  return numerator.div(denominator)
}
const ZERO = ethers.constants.Zero
export function optimalDepositA(
  amtA: BigNumber,
  amtB: BigNumber,
  resA: BigNumber,
  resB: BigNumber
): [BigNumber, boolean] {
  if (amtA.mul(resB).gte(amtB.mul(resA))) return [_optimalDepositA(amtA, amtB, resA, resB), false]
  return [_optimalDepositA(amtB, amtA, resB, resA), true]
}

const FEE = 9975
const FEE_DENOM = 10000
export function getMktSellAmount(aIn: BigNumber, rIn: BigNumber, rOut: BigNumber): BigNumber {
  if (aIn.eq(0)) return ZERO
  if (!(rIn.gt(0) && rOut.gt(0))) throw 'MdexWorkerV2::getMktSellAmount:: bad reserve values'
  const aInWithFee = aIn.mul(FEE)
  const numerator = aInWithFee.mul(rOut)
  const denominator = rIn.mul(FEE_DENOM).add(aInWithFee)
  return numerator.div(denominator)
}

const sol_require = (cond: boolean, msg = '') => {
  if (!cond) throw msg
}
// given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
export function quote(amountA: BigNumber, reserveA: BigNumber, reserveB: BigNumber) {
  if (amountA.lte(0)) return ZERO
  sol_require(reserveA.gt(0) && reserveB.gt(0), 'PancakeLibrary: INSUFFICIENT_LIQUIDITY')
  return amountA.mul(reserveB).div(reserveA)
}

// given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
export function getAmountOut(amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber) {
  if (amountIn.lte(0)) return ZERO
  sol_require(reserveIn.gt(0) && reserveOut.gt(0), 'PancakeLibrary: INSUFFICIENT_LIQUIDITY')
  const amountInWithFee = amountIn.mul(FEE)
  const numerator = amountInWithFee.mul(reserveOut)
  const denominator = reserveIn.mul(FEE_DENOM).add(amountInWithFee)
  return numerator.div(denominator)
}

// given an output amount of an asset and pair reserves, returns a sol_required input amount of the other asset
export function getAmountIn(amountOut: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber) {
  if (amountOut.lte(0)) return ZERO
  sol_require(reserveIn.gt(0) && reserveOut.gt(0), 'PancakeLibrary: INSUFFICIENT_LIQUIDITY')
  const numerator = reserveIn.mul(amountOut).mul(FEE_DENOM)
  const denominator = reserveOut.sub(amountOut).mul(FEE)
  return numerator.div(denominator).add(1)
}

export function deLpAmount(lpAmount: BigNumber, totalLp: BigNumber, r0: BigNumber, r1: BigNumber) {
  return [lpAmount.mul(r0).div(totalLp), lpAmount.mul(r1).div(totalLp)]
}

export function addLp(
  in0: BigNumber,
  in1: BigNumber,
  totalLp: BigNumber,
  r0: BigNumber,
  r1: BigNumber
) {
  if (in0.mul(r1).gt(in1.mul(r0))) {
    return in1.mul(totalLp).div(r1)
  }
  return in0.mul(totalLp).div(r0)
}

export function health(
  debt0: BigNumber,
  debt1: BigNumber,
  lpAmount: BigNumber,
  totalLp: BigNumber,
  r0: BigNumber,
  r1: BigNumber
) {
  const [posA, posB] = deLpAmount(lpAmount, totalLp, r0, r1)
  const r1Predict = r1.sub(posB)
  const r0Predict = r0.sub(posA)
  const sellPart = posA.gt(debt0) ? getAmountOut(posA.sub(debt0), r0Predict, r1Predict) : ZERO
  const equiDebtB = getAmountIn(debt0, r1Predict, r0Predict)
  const debtPart = debt0.gt(posA) ? getAmountIn(posA, r1Predict, r0Predict) : equiDebtB
  const valueDebt = equiDebtB.add(debt1)
  const valueHealth = sellPart.add(debtPart).add(posB)
  return [valueDebt, valueHealth]
}

export type OrderData = {
  debt0: BigNumber
  debt1: BigNumber
  lpAmount: BigNumber
}

export type LpInfo = {
  lpTotalSupply: BigNumber
  r0: BigNumber
  r1: BigNumber
}

export type BaseParam = {
  amount: BigNumber
  debt: BigNumber
  maxReturn: BigNumber
}

export type SimuResult = {
  ratio: number // ?????????(0-100)
  debt0: BigNumber // ??????(token0)
  debt1: BigNumber // ??????(token1)
  pos0: BigNumber // ??????(token0)
  pos1: BigNumber // ??????(token1)
  lpAmount: BigNumber // ??????(lp)
  swapAmt: BigNumber // ????????????
  reverse: boolean // ???????????? false: token0->token1 true: token1->token0
  back0: BigNumber // ????????????(token0)
  back1: BigNumber // ????????????(token1)
}

export function strategyAddSimu(
  order: OrderData,
  lp: LpInfo,
  params: BaseParam[]
  // minLPAmount: BigNumberish
): SimuResult {
  const param0 = params[0]
  const param1 = params[1]
  const totalA = param0.amount.add(param0.debt)
  const totalB = param1.amount.add(param1.debt)
  const [swapAmt, reverse] = optimalDepositA(totalA, totalB, lp.r0, lp.r1)
  const rx = [lp.r0, lp.r1]
  if (reverse) rx.reverse()
  const outAmt = getAmountOut(swapAmt, rx[0], rx[1])
  const deltaRx = [BigNumber.from(0).sub(swapAmt), outAmt]
  if (reverse) deltaRx.reverse()
  const r0 = lp.r0.sub(deltaRx[0])
  const r1 = lp.r1.sub(deltaRx[1])
  const deltaLP = addLp(totalA.add(deltaRx[0]), totalB.add(deltaRx[1]), lp.lpTotalSupply, r0, r1)
  const final = {
    debt0: order.debt0.add(param0.debt),
    debt1: order.debt1.add(param1.debt),
    orderLp: order.lpAmount.add(deltaLP),
    lpTotalsupply: lp.lpTotalSupply.add(deltaLP),
    r0: lp.r0.add(totalA),
    r1: lp.r1.add(totalB),
    pos0: ZERO,
    pos1: ZERO,
  }
  const [valueDebt, valueHealth] = health(
    final.debt0,
    final.debt1,
    final.orderLp,
    final.lpTotalsupply,
    final.r0,
    final.r1
  )
  const ratio = valueHealth.gt(0) ? valueDebt.mul(10000).div(valueHealth).toNumber() / 100 : 0
  ;[final.pos0, final.pos1] = deLpAmount(final.orderLp, final.lpTotalsupply, final.r0, final.r1)
  return {
    ratio: ratio,
    debt0: final.debt0,
    debt1: final.debt1,
    pos0: final.pos0,
    pos1: final.pos1,
    lpAmount: final.orderLp,
    swapAmt,
    reverse,
    back0: ZERO,
    back1: ZERO,
  }
}
export function strategyCloseSimu(
  order: OrderData,
  lp: LpInfo,
  params: BaseParam[]
  // minBack: BigNumberish[]
): SimuResult {
  const param0 = params[0]
  const param1 = params[1]
  const [pos0, pos1] = deLpAmount(order.lpAmount, lp.lpTotalSupply, lp.r0, lp.r1)
  const totalPos0 = param0.amount.add(pos0)
  const totalPos1 = param1.amount.add(pos1)
  const totalPosDebt0 = param0.debt.add(order.debt0)
  const totalPosDebt1 = param1.debt.add(order.debt1)
  let reverse = false
  let outAmt = ZERO
  if (totalPos0.lt(totalPosDebt0)) {
    reverse = true
    outAmt = totalPosDebt0.sub(totalPos0)
  } else if (totalPos1.lt(totalPosDebt1)) {
    outAmt = totalPosDebt1.sub(totalPos1)
  }

  const r0 = lp.r0.sub(totalPos0)
  const r1 = lp.r1.sub(totalPos1)
  const path = [r0, r1]
  if (reverse) path.reverse()
  const swapAmt = getAmountIn(outAmt, path[0], path[1])
  const delta = [ZERO.sub(swapAmt), outAmt]
  if (reverse) delta.reverse()
  return {
    ratio: 0,
    debt0: ZERO,
    debt1: ZERO,
    pos0: ZERO,
    pos1: ZERO,
    lpAmount: ZERO,
    swapAmt,
    reverse,
    back0: totalPos0.add(delta[0]).sub(totalPosDebt0),
    back1: totalPos1.add(delta[1]).sub(totalPosDebt1),
  }
}
export function strategyDecSimu(
  order: OrderData,
  lp: LpInfo,
  params: BaseParam[],
  lpDec: BigNumber
) {
  const param0 = params[0]
  const param1 = params[1]
  const [decA, decB] = deLpAmount(lpDec, lp.lpTotalSupply, lp.r0, lp.r1)
  const min = (a: BigNumber, b: BigNumber) => (a.lt(b) ? a : b)
  const backA = decA.add(param0.amount)
  const backB = decB.add(param1.amount)
  const posDebtA = order.debt0.add(param0.debt)
  const posDebtB = order.debt1.add(param1.debt)
  const repayA = min(min(backA, param0.maxReturn), posDebtA)
  const repayB = min(min(backB, param1.maxReturn), posDebtB)
  const final = {
    debt0: posDebtA.sub(repayA),
    debt1: posDebtB.sub(repayB),
    orderLp: order.lpAmount.sub(lpDec),
    lpTotalsupply: lp.lpTotalSupply.sub(lpDec),
    r0: lp.r0.sub(decA),
    r1: lp.r1.sub(decB),
    pos0: ZERO,
    pos1: ZERO,
  }
  const [valueDebt, valueHealth] = health(
    final.debt0,
    final.debt1,
    final.orderLp,
    final.lpTotalsupply,
    final.r0,
    final.r1
  )
  ;[final.pos0, final.pos1] = deLpAmount(final.orderLp, final.lpTotalsupply, final.r0, final.r1)
  const ratio = valueHealth.gt(0)
    ? valueDebt.mul(10000).div(valueHealth).toNumber() / 100
    : valueDebt.gt(0)
    ? 100
    : 0
  return {
    ratio: ratio,
    debt0: final.debt0,
    debt1: final.debt1,
    pos0: final.pos0,
    pos1: final.pos1,
    lpAmount: final.orderLp,
    swapAmt: ZERO,
    reverse: false,
    back0: backA.sub(repayA),
    back1: backB.sub(repayB),
  }
}
