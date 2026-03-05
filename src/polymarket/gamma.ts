import { config } from '../config'
import { formatCents } from '../utils/format'

export interface MarketData {
  question: string
  slug: string
  conditionId: string
  tokenIdYes: string
  tokenIdNo: string
  priceYes: number
  priceNo: number
  volume: number
  active: boolean
}

export interface SportEvent {
  title: string
  markets: MarketData[]
}

interface GammaEvent {
  id: string
  title: string
  slug: string
  markets: GammaMarket[]
}

interface GammaMarket {
  id: string
  question: string
  conditionId: string
  clobTokenIds: string
  outcomePrices: string
  outcomes: string
  active: boolean
  closed: boolean
  volume: string
}

function parseGammaMarket(m: GammaMarket): MarketData | null {
  try {
    const tokenIds: string[] = JSON.parse(m.clobTokenIds)
    const prices: string[] = JSON.parse(m.outcomePrices)
    if (tokenIds.length < 2 || prices.length < 2) return null
    return {
      question: m.question,
      slug: m.conditionId,
      conditionId: m.conditionId,
      tokenIdYes: tokenIds[0],
      tokenIdNo: tokenIds[1],
      priceYes: parseFloat(prices[0]),
      priceNo: parseFloat(prices[1]),
      volume: parseFloat(m.volume || '0'),
      active: m.active && !m.closed
    }
  } catch {
    return null
  }
}

export async function searchSportsMarkets(query?: string): Promise<SportEvent[]> {
  const params = new URLSearchParams({
    tag: 'sports',
    active: 'true',
    closed: 'false',
    limit: '15'
  })
  if (query) params.set('title', query)

  const res = await fetch(`${config.polymarketGammaUrl}/events?${params}`)
  if (!res.ok) throw new Error(`gamma api error: ${res.status}`)

  const events: GammaEvent[] = await res.json()
  return events
    .map(event => ({
      title: event.title,
      markets: event.markets
        .map(parseGammaMarket)
        .filter((m): m is MarketData => m !== null && m.active)
    }))
    .filter(e => e.markets.length > 0)
}

export async function getMarketByConditionId(conditionId: string): Promise<MarketData | null> {
  const res = await fetch(`${config.polymarketGammaUrl}/markets?id=${conditionId}`)
  if (!res.ok) return null
  const markets: GammaMarket[] = await res.json()
  if (!markets.length) return null
  return parseGammaMarket(markets[0])
}

export function formatMarketsForChat(events: SportEvent[]): string {
  if (events.length === 0) return 'no active sports markets right now.'

  const lines: string[] = ['live sports markets on polymarket:\n']
  let idx = 1
  for (const event of events.slice(0, 5)) {
    for (const market of event.markets.slice(0, 2)) {
      lines.push(`${idx}. ${market.question}`)
      lines.push(`   YES: ${formatCents(market.priceYes)} | NO: ${formatCents(market.priceNo)}\n`)
      idx++
    }
  }
  lines.push('text "bet $50 on [team] winning" to propose')
  return lines.join('\n')
}
