import { getMembers, getTotalPool } from '../db/members'
import { getOpenPositions, getActiveProposals } from '../db/bets'
import { formatUsd, formatPercent, formatCents } from '../utils/format'

export async function handleStatus(
  chatId: string,
  query: 'balance' | 'positions' | 'proposals'
): Promise<string> {
  if (query === 'balance' || query === 'positions') {
    const members = getMembers(chatId)
    const total = getTotalPool(chatId)
    const positions = getOpenPositions(chatId)

    if (members.length === 0) return 'pool is empty. deposit to get started.'

    const lines: string[] = ['SIDELINE POOL\n']
    lines.push(`pool: ${formatUsd(total)}`)
    for (const m of members) {
      const pct = total > 0 ? formatPercent(m.balance_usdc / total) : '0%'
      const name = m.display_name ?? m.sender
      lines.push(`  ${name}: ${formatUsd(m.balance_usdc)} (${pct})`)
    }

    if (positions.length > 0) {
      lines.push('\nactive bets:')
      for (const p of positions) {
        lines.push(`  ${p.market_question} — ${p.side.toUpperCase()} ${formatUsd(p.amount_usdc)} @ ${formatCents(p.entry_price)}`)
      }
    }

    return lines.join('\n')
  }

  if (query === 'proposals') {
    const proposals = getActiveProposals(chatId)
    if (proposals.length === 0) return 'no active proposals. propose a bet with "bet $X on [team]"'

    const lines: string[] = ['active proposals:\n']
    for (const p of proposals) {
      const yesVotes = formatPercent(p.total_weight_yes)
      const timeLeft = Math.max(0, Math.round((p.expires_at - Date.now()) / 60000))
      lines.push(`#${p.id}: ${p.market_question}`)
      lines.push(`  ${p.side.toUpperCase()} ${formatUsd(p.amount_usdc)} | ${yesVotes} yes | ${timeLeft}m left\n`)
    }
    return lines.join('\n')
  }

  return 'status'
}
