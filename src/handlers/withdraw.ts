import { getMember, updateBalance, getTotalPool } from '../db/members'
import { getOpenPositions } from '../db/bets'
import { formatUsd } from '../utils/format'

export async function handleWithdraw(
  chatId: string,
  sender: string,
  displayName: string | null,
  amount: number | 'all'
): Promise<string> {
  const member = getMember(chatId, sender)
  if (!member) return "you're not in this pool yet. deposit first."
  if (member.balance_usdc <= 0) return 'your balance is $0.'

  const positions = getOpenPositions(chatId)
  const totalPool = getTotalPool(chatId)
  const lockedRatio = totalPool > 0 ? member.balance_usdc / totalPool : 0
  const lockedAmount = positions.reduce((sum, p) => sum + p.amount_usdc * lockedRatio, 0)
  const available = Math.max(0, member.balance_usdc - lockedAmount)

  const withdrawAmount = amount === 'all' ? available : amount

  if (withdrawAmount <= 0) return `you have no available balance (${formatUsd(lockedAmount)} is locked in active bets)`
  if (withdrawAmount > available) {
    return `you can only withdraw ${formatUsd(available)} (${formatUsd(lockedAmount)} locked in active bets)`
  }

  updateBalance(chatId, sender, -withdrawAmount)
  const name = displayName ?? sender
  const remaining = member.balance_usdc - withdrawAmount
  return `${name} withdrew ${formatUsd(withdrawAmount)}. remaining balance: ${formatUsd(remaining)}`
}
