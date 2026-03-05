import { ethers } from 'ethers'
import { config } from '../config'

let provider: ethers.providers.JsonRpcProvider | null = null

function getProvider(): ethers.providers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(config.polygonRpcUrl)
  }
  return provider
}

export function getGroupWallet(index: number): ethers.Wallet {
  if (!config.masterPrivateKey) {
    throw new Error('MASTER_PRIVATE_KEY not set')
  }
  const seed = ethers.utils.arrayify(config.masterPrivateKey.padEnd(66, '0').slice(0, 66))
  const node = ethers.utils.HDNode.fromSeed(seed).derivePath(`m/44'/60'/0'/0/${index}`)
  return new ethers.Wallet(node.privateKey, getProvider())
}

export function getWalletForGroup(index: number): { address: string; privateKey: string } {
  const wallet = getGroupWallet(index)
  return { address: wallet.address, privateKey: wallet.privateKey }
}
