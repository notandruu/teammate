import { upsertMember, updateBalance, getMember } from '../db/members'
import { getOrCreateGroup } from '../db/groups'
import { getWalletForGroup } from '../polymarket/wallet'
import { formatUsd } from '../utils/format'

export async function handleDeposit(
  chatId: string,
  sender: string,
  displayName: string | null,
  amount: number
): Promise<string> {
  if (amount <= 0) return 'deposit amount must be greater than $0'
  if (amount > 10000) return 'max deposit is $10,000'

  getOrCreateGroup(chatId, (index) => getWalletForGroup(index))
  upsertMember(chatId, sender, displayName ?? undefined)
  updateBalance(chatId, sender, amount)

  const member = getMember(chatId, sender)!
  const name = displayName ?? sender

  return `${name} deposited ${formatUsd(amount)}. your balance: ${formatUsd(member.balance_usdc)}`
}
