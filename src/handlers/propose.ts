import { searchSportsMarkets, MarketData } from '../polymarket/gamma'
import { getMember, getTotalPool } from '../db/members'
import { createProposal, getActiveProposals } from '../db/bets'
import { config } from '../config'
import { formatUsd, formatCents, formatPayout } from '../utils/format'

export async function handlePropose(
  chatId: string,
  proposer: string,
  displayName: string | null,
  query: string,
  side: 'yes' | 'no',
  amount: number
): Promise<string> {
  const member = getMember(chatId, proposer)
  if (!member) return "you're not in this pool. deposit first."
  if (member.balance_usdc <= 0) return 'your balance is $0. deposit to bet.'

  const total = getTotalPool(chatId)
  if (amount > total) return `pool only has ${formatUsd(total)}. lower the amount.`

  let events
  try {
    events = await searchSportsMarkets(query)
  } catch {
    return 'could not fetch markets. try again.'
  }

  let bestMarket: MarketData | null = null
  for (const event of events) {
    for (const market of event.markets) {
      if (!bestMarket || market.volume > bestMarket.volume) {
        bestMarket = market
      }
    }
  }

  if (!bestMarket) return `no markets found for "${query}". try a different search.`

  const price = side === 'yes' ? bestMarket.priceYes : bestMarket.priceNo
  const tokenId = side === 'yes' ? bestMarket.tokenIdYes : bestMarket.tokenIdNo
  const numShares = amount / price
  const now = Date.now()

  const proposal = createProposal({
    chat_id: chatId,
    proposer,
    market_question: bestMarket.question,
    market_slug: bestMarket.slug,
    condition_id: bestMarket.conditionId,
    token_id: tokenId,
    side,
    price,
    amount_usdc: amount,
    num_shares: numShares,
    created_at: now,
    expires_at: now + config.proposalExpiryMs
  })

  const name = displayName ?? proposer
  const payout = formatPayout(amount, price)

  return `BET PROPOSAL #${proposal.id}
${name} wants to bet ${formatUsd(amount)} on "${bestMarket.question}" (${side.toUpperCase()} at ${formatCents(price)})
if right, payout: ${payout}

vote "yes" to approve, "no" to reject
need 2/3 majority. expires in 1h.`
}
