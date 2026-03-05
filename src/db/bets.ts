import { getDb } from './index'

export interface Proposal {
  id: number
  chat_id: string
  proposer: string
  market_question: string
  market_slug: string
  condition_id: string
  token_id: string
  side: 'yes' | 'no'
  price: number
  amount_usdc: number
  num_shares: number | null
  status: 'active' | 'passed' | 'failed' | 'executed' | 'expired'
  total_weight_yes: number
  total_weight_no: number
  created_at: number
  expires_at: number
  executed_at: number | null
  order_id: string | null
}

export interface Vote {
  id: number
  proposal_id: number
  voter: string
  vote: 'yes' | 'no'
  weight: number
  created_at: number
}

export interface Position {
  id: number
  chat_id: string
  proposal_id: number
  condition_id: string
  token_id: string
  market_question: string
  side: string
  entry_price: number
  num_shares: number
  amount_usdc: number
  status: 'open' | 'won' | 'lost' | 'sold'
  payout: number | null
  created_at: number
  resolved_at: number | null
}

export function createProposal(data: Omit<Proposal, 'id' | 'status' | 'total_weight_yes' | 'total_weight_no' | 'executed_at' | 'order_id'>): Proposal {
  const db = getDb()
  const result = db.run(
    `INSERT INTO proposals
     (chat_id, proposer, market_question, market_slug, condition_id, token_id, side, price, amount_usdc, num_shares, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.chat_id, data.proposer, data.market_question, data.market_slug, data.condition_id,
     data.token_id, data.side, data.price, data.amount_usdc, data.num_shares ?? null,
     data.created_at, data.expires_at]
  )
  return getProposal(Number(result.lastInsertRowid))!
}

export function getProposal(id: number): Proposal | null {
  const db = getDb()
  return db.query<Proposal, [number]>('SELECT * FROM proposals WHERE id = ?').get(id)
}

export function getActiveProposals(chatId: string): Proposal[] {
  const db = getDb()
  return db.query<Proposal, [string, number]>(
    "SELECT * FROM proposals WHERE chat_id = ? AND status = 'active' AND expires_at > ? ORDER BY created_at DESC"
  ).all(chatId, Date.now())
}

export function updateProposalStatus(id: number, status: Proposal['status'], orderId?: string): void {
  const db = getDb()
  db.run(
    'UPDATE proposals SET status = ?, order_id = COALESCE(?, order_id), executed_at = CASE WHEN ? = ? THEN ? ELSE executed_at END WHERE id = ?',
    [status, orderId ?? null, status, 'executed', Date.now(), id]
  )
}

export function updateProposalWeights(id: number, weightYes: number, weightNo: number): void {
  const db = getDb()
  db.run(
    'UPDATE proposals SET total_weight_yes = ?, total_weight_no = ? WHERE id = ?',
    [weightYes, weightNo, id]
  )
}

export function addVote(proposalId: number, voter: string, vote: 'yes' | 'no', weight: number): void {
  const db = getDb()
  db.run(
    'INSERT INTO votes (proposal_id, voter, vote, weight, created_at) VALUES (?, ?, ?, ?, ?)',
    [proposalId, voter, vote, weight, Date.now()]
  )
}

export function getVote(proposalId: number, voter: string): Vote | null {
  const db = getDb()
  return db.query<Vote, [number, string]>(
    'SELECT * FROM votes WHERE proposal_id = ? AND voter = ?'
  ).get(proposalId, voter)
}

export function getVotes(proposalId: number): Vote[] {
  const db = getDb()
  return db.query<Vote, [number]>(
    'SELECT * FROM votes WHERE proposal_id = ? ORDER BY created_at ASC'
  ).all(proposalId)
}

export function expireOldProposals(chatId: string): Proposal[] {
  const db = getDb()
  const expired = db.query<Proposal, [string, number]>(
    "SELECT * FROM proposals WHERE chat_id = ? AND status = 'active' AND expires_at <= ?"
  ).all(chatId, Date.now())
  if (expired.length > 0) {
    db.run(
      "UPDATE proposals SET status = 'expired' WHERE chat_id = ? AND status = 'active' AND expires_at <= ?",
      [chatId, Date.now()]
    )
  }
  return expired
}

export function createPosition(data: Omit<Position, 'id' | 'status' | 'payout' | 'resolved_at'>): Position {
  const db = getDb()
  const result = db.run(
    `INSERT INTO positions
     (chat_id, proposal_id, condition_id, token_id, market_question, side, entry_price, num_shares, amount_usdc, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.chat_id, data.proposal_id, data.condition_id, data.token_id, data.market_question,
     data.side, data.entry_price, data.num_shares, data.amount_usdc, data.created_at]
  )
  return db.query<Position, [number]>('SELECT * FROM positions WHERE id = ?').get(Number(result.lastInsertRowid))!
}

export function getOpenPositions(chatId: string): Position[] {
  const db = getDb()
  return db.query<Position, [string]>(
    "SELECT * FROM positions WHERE chat_id = ? AND status = 'open' ORDER BY created_at DESC"
  ).all(chatId)
}

export function resolvePosition(id: number, status: 'won' | 'lost', payout: number): void {
  const db = getDb()
  db.run(
    'UPDATE positions SET status = ?, payout = ?, resolved_at = ? WHERE id = ?',
    [status, payout, Date.now(), id]
  )
}
