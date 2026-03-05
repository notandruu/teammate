import { getDb } from './index'

export interface Member {
  id: number
  chat_id: string
  sender: string
  display_name: string | null
  balance_usdc: number
  joined_at: number
}

export function getMember(chatId: string, sender: string): Member | null {
  const db = getDb()
  return db.query<Member, [string, string]>(
    'SELECT * FROM members WHERE chat_id = ? AND sender = ?'
  ).get(chatId, sender)
}

export function getMembers(chatId: string): Member[] {
  const db = getDb()
  return db.query<Member, [string]>(
    'SELECT * FROM members WHERE chat_id = ? ORDER BY balance_usdc DESC'
  ).all(chatId)
}

export function upsertMember(chatId: string, sender: string, displayName?: string): Member {
  const db = getDb()
  const now = Date.now()
  db.run(
    `INSERT INTO members (chat_id, sender, display_name, balance_usdc, joined_at)
     VALUES (?, ?, ?, 0, ?)
     ON CONFLICT(chat_id, sender) DO UPDATE SET display_name = COALESCE(?, display_name)`,
    [chatId, sender, displayName ?? null, now, displayName ?? null]
  )
  return getMember(chatId, sender)!
}

export function updateBalance(chatId: string, sender: string, delta: number): void {
  const db = getDb()
  db.run(
    'UPDATE members SET balance_usdc = balance_usdc + ? WHERE chat_id = ? AND sender = ?',
    [delta, chatId, sender]
  )
}

export function getTotalPool(chatId: string): number {
  const db = getDb()
  const row = db.query<{ total: number | null }, [string]>(
    'SELECT SUM(balance_usdc) as total FROM members WHERE chat_id = ?'
  ).get(chatId)
  return row?.total ?? 0
}
