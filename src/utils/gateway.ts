import type { JsonRpcSigner } from 'ethers'
import { type ChainInfo, deleteTransaction } from '@safe-global/safe-gateway-typescript-sdk'
import { WC_APP_PROD, WC_APP_DEV } from '@/config/constants'
import { adjustVInSignature } from 'optopiasepoliaprotocolkit/dist/src/utils/signatures'
import { SigningMethod } from 'optopiasepoliaprotocolkit'

export const _replaceTemplate = (uri: string, data: Record<string, string>): string => {
  // Template syntax returned from gateway is {{this}}
  const TEMPLATE_REGEX = /\{\{([^}]+)\}\}/g

  return uri.replace(TEMPLATE_REGEX, (_, key: string) => data[key])
}

export const getHashedExplorerUrl = (
  hash: string,
  blockExplorerUriTemplate: ChainInfo['blockExplorerUriTemplate'],
): string => {
  const isTx = hash.length > 42
  const param = isTx ? 'txHash' : 'address'

  return _replaceTemplate(blockExplorerUriTemplate[param], { [param]: hash })
}

export const getExplorerLink = (
  hash: string,
  blockExplorerUriTemplate: ChainInfo['blockExplorerUriTemplate'],
): { href: string; title: string } => {
  const href = getHashedExplorerUrl(hash, blockExplorerUriTemplate)
  const title = `View on ${new URL(href).hostname}`

  return { href, title }
}

export const isWalletConnectSafeApp = (url: string): boolean => {
  return url === WC_APP_PROD.url || url === WC_APP_DEV.url
}

const signTxServiceMessage = async (
  chainId: string,
  safeAddress: string,
  safeTxHash: string,
  signer: JsonRpcSigner,
): Promise<string> => {
  const domain = {
    name: 'Safe Transaction Service',
    version: '1.0',
    chainId: chainId,
    verifyingContract: safeAddress,
  }
  const types = {
    DeleteRequest: [
      { name: 'safeTxHash', type: 'bytes32' },
      { name: 'totp', type: 'uint256' },
    ],
  }
  const message = {
    safeTxHash: safeTxHash,
    totp: Math.floor(Date.now() / 3600e3),
  }

  const signature = await signer.signTypedData(domain, types, message)
  return adjustVInSignature(SigningMethod.ETH_SIGN_TYPED_DATA, signature)
}

export const deleteTx = async ({
  chainId,
  safeAddress,
  safeTxHash,
  signer,
}: {
  chainId: string
  safeAddress: string
  safeTxHash: string
  signer: JsonRpcSigner
}) => {
  const signature = await signTxServiceMessage(chainId, safeAddress, safeTxHash, signer)
  return await deleteTransaction(chainId, safeTxHash, signature)
}
