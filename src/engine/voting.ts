import { getMembers, getTotalPool } from '../db/members'
import { getVotes, updateProposalWeights, updateProposalStatus, Proposal } from '../db/bets'
import { config } from '../config'

export type VoteResult = 'passed' | 'failed' | 'pending'

export function getMemberWeight(chatId: string, sender: string): number {
  const members = getMembers(chatId)
  const total = getTotalPool(chatId)

  if (total <= 0) {
    const n = members.length
    return n > 0 ? 1 / n : 1
  }

  const member = members.find(m => m.sender === sender)
  return member ? member.balance_usdc / total : 0
}

export function checkVoteResult(proposal: Proposal): VoteResult {
  const votes = getVotes(proposal.id)
  let weightYes = 0
  let weightNo = 0

  for (const v of votes) {
    if (v.vote === 'yes') weightYes += v.weight
    else weightNo += v.weight
  }

  updateProposalWeights(proposal.id, weightYes, weightNo)

  if (weightYes >= config.supermajorityThreshold) return 'passed'
  if (weightNo > 1 - config.supermajorityThreshold) return 'failed'
  return 'pending'
}

export function tallyVotes(proposal: Proposal): { weightYes: number; weightNo: number; result: VoteResult } {
  const votes = getVotes(proposal.id)
  let weightYes = 0
  let weightNo = 0

  for (const v of votes) {
    if (v.vote === 'yes') weightYes += v.weight
    else weightNo += v.weight
  }

  let result: VoteResult = 'pending'
  if (weightYes >= config.supermajorityThreshold) result = 'passed'
  else if (weightNo > 1 - config.supermajorityThreshold) result = 'failed'

  return { weightYes, weightNo, result }
}

export function failProposal(proposalId: number): void {
  updateProposalStatus(proposalId, 'failed')
}
