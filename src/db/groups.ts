import { getDb } from './index'

export interface Group {
  chat_id: string
  wallet_address: string
  wallet_index: number
  created_at: number
}

export function getGroup(chatId: string): Group | null {
  const db = getDb()
  return db.query<Group, [string]>('SELECT * FROM groups WHERE chat_id = ?').get(chatId)
}

export function createGroup(chatId: string, walletAddress: string, walletIndex: number): Group {
  const db = getDb()
  const now = Date.now()
  db.run(
    'INSERT INTO groups (chat_id, wallet_address, wallet_index, created_at) VALUES (?, ?, ?, ?)',
    [chatId, walletAddress, walletIndex, now]
  )
  return { chat_id: chatId, wallet_address: walletAddress, wallet_index: walletIndex, created_at: now }
}

export function getOrCreateGroup(chatId: string, getWallet: (index: number) => { address: string }): Group {
  const existing = getGroup(chatId)
  if (existing) return existing
  const db = getDb()
  const row = db.query<{ max_index: number | null }, []>('SELECT MAX(wallet_index) as max_index FROM groups').get()
  const nextIndex = (row?.max_index ?? -1) + 1
  const wallet = getWallet(nextIndex)
  return createGroup(chatId, wallet.address, nextIndex)
}
