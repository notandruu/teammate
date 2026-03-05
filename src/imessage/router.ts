import { ParsedCommand } from '../ai/parser'
import { helpMessage } from '../handlers/help'
import { handleDeposit } from '../handlers/deposit'
import { handleWithdraw } from '../handlers/withdraw'
import { handleBrowse } from '../handlers/browse'
import { handlePropose } from '../handlers/propose'
import { handleVote } from '../handlers/vote'
import { handleStatus } from '../handlers/status'
import { expireOldProposals } from '../db/bets'
import { logger } from '../utils/logger'

interface Message {
  text: string | null
  sender: string
  senderName: string | null
  chatId: string
}

interface Sdk {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send: (chatId: string, text: string) => Promise<any>
}

export async function routeCommand(sdk: Sdk, message: Message, parsed: ParsedCommand): Promise<void> {
  const { chatId, sender, senderName } = message

  expireOldProposals(chatId)

  let reply: string | null = null

  try {
    switch (parsed.command) {
      case 'help':
        reply = helpMessage()
        break

      case 'deposit':
        reply = await handleDeposit(chatId, sender, senderName, parsed.data.amount)
        break

      case 'withdraw':
        reply = await handleWithdraw(chatId, sender, senderName, parsed.data.amount)
        break

      case 'browse':
        reply = await handleBrowse(parsed.data.query)
        break

      case 'propose_bet':
        reply = await handlePropose(
          chatId, sender, senderName,
          parsed.data.query, parsed.data.side, parsed.data.amount
        )
        break

      case 'vote':
        reply = await handleVote(chatId, sender, senderName, parsed.data.vote, parsed.data.proposal_id)
        break

      case 'status':
        reply = await handleStatus(chatId, parsed.data.query)
        break

      case 'none':
        return
    }
  } catch (err) {
    logger.error(`handler error for ${parsed.command}`, err)
    reply = 'something went wrong. try again.'
  }

  if (reply) {
    await sdk.send(chatId, reply)
  }
}
