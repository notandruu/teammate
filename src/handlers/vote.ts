import { getActiveProposals, getVote, addVote, getProposal, updateProposalStatus, createPosition } from '../db/bets'
import { updateBalance, getMembers } from '../db/members'
import { getMemberWeight, tallyVotes } from '../engine/voting'
import { getOrCreateGroup } from '../db/groups'
import { getWalletForGroup, getGroupWallet } from '../polymarket/wallet'
import { initClobClient, placeBet } from '../polymarket/clob'
import { formatPercent, formatUsd, formatCents } from '../utils/format'
import { logger } from '../utils/logger'

export async function handleVote(
  chatId: string,
  voter: string,
  displayName: string | null,
  vote: 'yes' | 'no',
  proposalId?: number
): Promise<string> {
  const proposals = getActiveProposals(chatId)
  if (proposals.length === 0) return 'no active proposals to vote on.'

  const proposal = proposalId
    ? proposals.find(p => p.id === proposalId)
    : proposals[0]

  if (!proposal) return `proposal #${proposalId} not found or expired.`

  const existing = getVote(proposal.id, voter)
  if (existing) return `you already voted ${existing.vote} on proposal #${proposal.id}`

  const weight = getMemberWeight(chatId, voter)
  if (weight === 0) return "you're not in this pool. deposit first."

  addVote(proposal.id, voter, vote, weight)

  const { weightYes, weightNo, result } = tallyVotes(proposal)
  const name = displayName ?? voter

  if (result === 'passed') {
    updateProposalStatus(proposal.id, 'passed')
    const executionMsg = await executeProposal(chatId, proposal.id)
    return `${name} voted yes (${formatPercent(weight)} weight). PASSED with ${formatPercent(weightYes)}.\n${executionMsg}`
  }

  if (result === 'failed') {
    updateProposalStatus(proposal.id, 'failed')
    return `${name} voted no (${formatPercent(weight)} weight). proposal #${proposal.id} failed.`
  }

  const needed = Math.max(0, 2 / 3 - weightYes)
  if (vote === 'yes') {
    return `${name} voted yes (${formatPercent(weight)} weight). need ${formatPercent(needed)} more.`
  } else {
    return `${name} voted no (${formatPercent(weight)} weight). ${formatPercent(weightYes)} yes so far.`
  }
}

async function executeProposal(chatId: string, proposalId: number): Promise<string> {
  const proposal = getProposal(proposalId)
  if (!proposal) return 'execution failed: proposal not found'

  try {
    const group = getOrCreateGroup(chatId, (index) => getWalletForGroup(index))
    const wallet = getGroupWallet(group.wallet_index)
    const client = await initClobClient(wallet.privateKey, group.wallet_address)

    const orderId = await placeBet(client, proposal.token_id, proposal.price, proposal.amount_usdc)

    updateProposalStatus(proposal.id, 'executed', orderId)

    const members = getMembers(chatId)
    const total = members.reduce((s, m) => s + m.balance_usdc, 0)
    if (total > 0) {
      for (const m of members) {
        const share = (m.balance_usdc / total) * proposal.amount_usdc
        updateBalance(chatId, m.sender, -share)
      }
    }

    createPosition({
      chat_id: chatId,
      proposal_id: proposal.id,
      condition_id: proposal.condition_id,
      token_id: proposal.token_id,
      market_question: proposal.market_question,
      side: proposal.side,
      entry_price: proposal.price,
      num_shares: proposal.num_shares ?? proposal.amount_usdc / proposal.price,
      amount_usdc: proposal.amount_usdc,
      created_at: Date.now()
    })

    const numShares = proposal.num_shares ?? proposal.amount_usdc / proposal.price
    const payout = numShares * 1.0

    return `BET PLACED
${formatUsd(proposal.amount_usdc)} on ${proposal.side.toUpperCase()} @ ${formatCents(proposal.price)}
potential payout: ${formatUsd(payout)}`
  } catch (err) {
    logger.error('execution failed', err)
    updateProposalStatus(proposal.id, 'passed')
    return `bet passed but execution failed. check logs. (order not placed)`
  }
}
