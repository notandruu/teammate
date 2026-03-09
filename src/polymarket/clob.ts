import { ClobClient, Side, OrderType } from '@polymarket/clob-client'
import { Wallet } from '@ethersproject/wallet'
import { JsonRpcProvider } from '@ethersproject/providers'
import { config } from '../config'
import { logger } from '../utils/logger'

const clientCache = new Map<string, ClobClient>()

export async function initClobClient(privateKey: string, walletAddress: string): Promise<ClobClient> {
  if (clientCache.has(walletAddress)) {
    return clientCache.get(walletAddress)!
  }

  const provider = new JsonRpcProvider(config.polygonRpcUrl)
  const wallet = new Wallet(privateKey, provider)

  const tempClient = new ClobClient(config.polymarketClobUrl, config.polygonChainId, wallet)
  const creds = await tempClient.createOrDeriveApiKey()

  const client = new ClobClient(
    config.polymarketClobUrl,
    config.polygonChainId,
    wallet,
    creds,
    1,
    walletAddress
  )

  clientCache.set(walletAddress, client)
  logger.info(`clob client initialized for ${walletAddress}`)
  return client
}

export async function placeBet(
  client: ClobClient,
  tokenId: string,
  price: number,
  amountUsdc: number
): Promise<string> {
  const size = amountUsdc / price

  const order = await client.createAndPostOrder(
    {
      tokenID: tokenId,
      price,
      side: Side.BUY,
      size
    },
    { tickSize: '0.01', negRisk: false },
    OrderType.GTC
  )

  const orderId = (order as { orderID?: string; id?: string }).orderID
    ?? (order as { orderID?: string; id?: string }).id
    ?? 'unknown'
  logger.info(`order placed: ${orderId}`)
  return orderId
}

