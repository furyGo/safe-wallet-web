import { useEffect } from 'react'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import { logError, Errors } from '@/services/exceptions'
import { RPC_AUTHENTICATION } from '@safe-global/safe-gateway-typescript-sdk'

const getConfigs = async (): Promise<ChainInfo[]> => {
  const data = await getChainsConfig()
  return data.results || []
}

async function getChainsConfig(): Promise<{ results: ChainInfo[] }> {
  return {
    results: [
      {
        chainId: '42069',
        chainName: 'Optopia',
        description: 'Ethereum Optopia Testnet',
        chainLogoUri: 'http://localhost:8000/cfg/media/chains/42069/chain_logo_0DhJjcf.png',
        l2: true,
        isTestnet: true,
        nativeCurrency: {
          name: 'ETH-OPT',
          symbol: 'OPT',
          decimals: 18,
          logoUri: 'http://localhost:8000/cfg/media/chains/42069/currency_logo_GQZN6g9.png',
        },
        transactionService: 'http://nginx:8000/txs',
        blockExplorerUriTemplate: {
          address: 'https://scan-testnet.optopia.ai/address/{{address}}',
          txHash: 'https://scan-testnet.optopia.ai/tx/{{txHash}}',
          api: 'https://scan-testnet.optopia.ai/api?module={{module}}&action={{action}}&address={{address}}&apiKey={{apiKey}}',
        },
        disabledWallets: [],
        features: [],
        gasPrice: [],
        publicRpcUri: {
          authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
          value: 'https://rpc-testnet.optopia.ai/',
        },
        rpcUri: {
          authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
          value: 'https://rpc-testnet.optopia.ai/',
        },
        safeAppsRpcUri: {
          authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
          value: 'https://rpc-testnet.optopia.ai/',
        },
        shortName: 'optopia',
        theme: {
          textColor: '#ffffff',
          backgroundColor: '#000000',
        },
      },
    ],
  }
}

export const useLoadChains = (): AsyncResult<ChainInfo[]> => {
  const [data, error, loading] = useAsync<ChainInfo[]>(getConfigs, [])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._620, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadChains
