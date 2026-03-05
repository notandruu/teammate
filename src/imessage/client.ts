import { IMessageSDK } from '@photon-ai/imessage-kit'
import { parseMessage } from '../ai/parser'
import { routeCommand } from './router'
import { logger } from '../utils/logger'

export async function startWatcher(): Promise<void> {
  const sdk = new IMessageSDK({
    watcher: {
      pollInterval: 2000,
      unreadOnly: false,
      excludeOwnMessages: true
    }
  })

  logger.info('starting imessage watcher...')

  await sdk.startWatching({
    onGroupMessage: async (message) => {
      if (!message.text || message.isFromMe) return

      logger.debug(`[${message.chatId}] ${message.sender}: ${message.text}`)

      const parsed = await parseMessage(message.text)
      if (parsed.command === 'none') return

      logger.info(`command: ${parsed.command} from ${message.senderName ?? message.sender}`)

      await routeCommand(sdk, {
        text: message.text,
        sender: message.sender,
        senderName: message.senderName,
        chatId: message.chatId
      }, parsed)
    },
    onError: (error) => {
      logger.error('watcher error', error)
    }
  })
}
