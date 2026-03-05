import { searchSportsMarkets, formatMarketsForChat } from '../polymarket/gamma'

export async function handleBrowse(query?: string): Promise<string> {
  try {
    const events = await searchSportsMarkets(query)
    return formatMarketsForChat(events)
  } catch {
    return 'could not fetch markets right now. try again in a bit.'
  }
}
