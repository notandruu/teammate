import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config'

const client = new Anthropic({ apiKey: config.anthropicApiKey })

const SYSTEM_PROMPT = `you are the command parser for SIDELINE, a group chat sports betting bot on imessage.
the group bets on real sports markets through polymarket.

parse messages into one of these commands:

1. deposit: user wants to add money to the pool
   extract: {amount: number}

2. withdraw: user wants to take money out
   extract: {amount: number | 'all'}

3. browse: user wants to see available sports markets
   extract: {query?: string}
   examples: "what games are on", "any nba markets", "show me lakers bets", "what can we bet on"

4. propose_bet: user wants to bet on a specific market
   extract: {query: string, side: 'yes' | 'no', amount: number}
   examples: "bet $50 on lakers winning", "$20 on yes for warriors game", "put $30 against the celtics"

5. vote: user is voting on an active proposal
   extract: {vote: 'yes' | 'no', proposal_id?: number}
   examples: "yes", "i'm in", "nah", "no way", "lfg", "down"

6. status: user wants to check balances or active bets
   extract: {query: 'balance' | 'positions' | 'proposals'}
   examples: "status", "how much do we have", "what bets are open", "show positions"

7. help: user wants to know what sideline can do
   extract: {}

8. none: not a command, just normal chat
   extract: {}

IMPORTANT:
- if message is normal conversation ("lol", "haha", "nice", "ok"), return none
- only parse messages with betting/financial intent or that seem directed at the bot
- for the side field: "lakers winning" = yes, "against the lakers" = no, "lakers losing" = no
- be lenient with vote parsing: "yes", "yea", "yeah", "y", "yep", "lets go", "lfg", "im in", "down", "bet" = yes
- "no", "nah", "nope", "pass", "im out" = no`

const tools: Anthropic.Tool[] = [
  {
    name: 'deposit',
    description: 'user wants to deposit money into the group pool',
    input_schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'dollar amount to deposit' }
      },
      required: ['amount']
    }
  },
  {
    name: 'withdraw',
    description: 'user wants to withdraw money from the group pool',
    input_schema: {
      type: 'object',
      properties: {
        amount: { type: 'string', description: 'dollar amount or "all"' }
      },
      required: ['amount']
    }
  },
  {
    name: 'browse',
    description: 'user wants to see available sports betting markets',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'optional search term like team name or sport' }
      }
    }
  },
  {
    name: 'propose_bet',
    description: 'user wants to place a bet on a sports market',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'what they want to bet on, e.g. lakers winning' },
        side: { type: 'string', enum: ['yes', 'no'], description: 'which side to bet on' },
        amount: { type: 'number', description: 'dollar amount to bet' }
      },
      required: ['query', 'side', 'amount']
    }
  },
  {
    name: 'vote',
    description: 'user is voting yes or no on an active bet proposal',
    input_schema: {
      type: 'object',
      properties: {
        vote: { type: 'string', enum: ['yes', 'no'], description: 'their vote' },
        proposal_id: { type: 'number', description: 'specific proposal id if mentioned' }
      },
      required: ['vote']
    }
  },
  {
    name: 'status',
    description: 'user wants to check pool balance, positions, or active proposals',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', enum: ['balance', 'positions', 'proposals'], description: 'what to show' }
      },
      required: ['query']
    }
  },
  {
    name: 'help',
    description: 'user wants to know what sideline can do',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'none',
    description: 'message is normal chat, not a sideline command',
    input_schema: { type: 'object', properties: {} }
  }
]

export type ParsedCommand =
  | { command: 'deposit'; data: { amount: number } }
  | { command: 'withdraw'; data: { amount: number | 'all' } }
  | { command: 'browse'; data: { query?: string } }
  | { command: 'propose_bet'; data: { query: string; side: 'yes' | 'no'; amount: number } }
  | { command: 'vote'; data: { vote: 'yes' | 'no'; proposal_id?: number } }
  | { command: 'status'; data: { query: 'balance' | 'positions' | 'proposals' } }
  | { command: 'help'; data: Record<string, never> }
  | { command: 'none'; data: Record<string, never> }

export async function parseMessage(text: string): Promise<ParsedCommand> {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      tools,
      tool_choice: { type: 'any' },
      messages: [{ role: 'user', content: text }]
    })

    const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    if (!toolUse) return { command: 'none', data: {} }

    const name = toolUse.name as ParsedCommand['command']
    const input = toolUse.input as Record<string, unknown>

    if (name === 'deposit') {
      return { command: 'deposit', data: { amount: Number(input.amount) } }
    }
    if (name === 'withdraw') {
      const raw = String(input.amount)
      return { command: 'withdraw', data: { amount: raw === 'all' ? 'all' : Number(raw) } }
    }
    if (name === 'browse') {
      return { command: 'browse', data: { query: input.query as string | undefined } }
    }
    if (name === 'propose_bet') {
      return {
        command: 'propose_bet',
        data: {
          query: input.query as string,
          side: input.side as 'yes' | 'no',
          amount: Number(input.amount)
        }
      }
    }
    if (name === 'vote') {
      return {
        command: 'vote',
        data: {
          vote: input.vote as 'yes' | 'no',
          proposal_id: input.proposal_id != null ? Number(input.proposal_id) : undefined
        }
      }
    }
    if (name === 'status') {
      return { command: 'status', data: { query: (input.query as string || 'balance') as 'balance' | 'positions' | 'proposals' } }
    }
    if (name === 'help') return { command: 'help', data: {} }
    return { command: 'none', data: {} }
  } catch {
    return { command: 'none', data: {} }
  }
}
