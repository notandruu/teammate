import { getDb } from './db/index'
import { startWatcher } from './imessage/client'
import { config } from './config'
import { logger } from './utils/logger'
import { getOpenPositions, resolvePosition } from './db/bets'
import { getMarketByConditionId } from './polymarket/gamma'
import { updateBalance, getTotalPool } from './db/members'
import { formatUsd } from './utils/format'

if (!config.anthropicApiKey) {
  logger.error('ANTHROPIC_API_KEY is required')
  process.exit(1)
}

async function checkPositions(): Promise<void> {
  const db = getDb()
  const chats = db.query<{ chat_id: string }, [string]>('SELECT DISTINCT chat_id FROM positions WHERE status = ?').all('open')

  for (const { chat_id } of chats) {
    const positions = getOpenPositions(chat_id)
    for (const position of positions) {
      try {
        const market = await getMarketByConditionId(position.condition_id)
        if (!market || market.active) continue

        const won = false
        const payout = won ? position.num_shares : 0
        resolvePosition(position.id, won ? 'won' : 'lost', payout)

        if (won) {
          const profit = payout - position.amount_usdc
          const total = getTotalPool(chat_id)
          if (total > 0) {
            logger.info(`position resolved: won ${formatUsd(payout)} on ${position.market_question}`)
          }
        }
      } catch (err) {
        logger.error(`position check failed for ${position.id}`, err)
      }
    }
  }
}

async function main(): Promise<void> {
  logger.info('sideline starting...')

  getDb()

  setInterval(() => {
    checkPositions().catch(err => logger.error('position checker failed', err))
  }, config.positionCheckIntervalMs)

  await startWatcher()
}

main().catch(err => {
  logger.error('fatal error', err)
  process.exit(1)
})
