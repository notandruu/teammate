export const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  polygonRpcUrl: process.env.POLYGON_RPC_URL ?? 'https://polygon-rpc.com',
  masterPrivateKey: process.env.MASTER_PRIVATE_KEY ?? '',
  polymarketClobUrl: 'https://clob.polymarket.com',
  polymarketGammaUrl: 'https://gamma-api.polymarket.com',
  polygonChainId: 137,
  proposalExpiryMs: 60 * 60 * 1000,
  supermajorityThreshold: 2 / 3,
  positionCheckIntervalMs: 5 * 60 * 1000,
}
