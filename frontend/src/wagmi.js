import { createConfig, http, fallback } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

// Get project ID from environment
// Note: WalletConnect is optional - MetaMask (injected) works without it
// If you want to use WalletConnect, get a free project ID from https://cloud.walletconnect.com
export const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || '';

// Get RPC URL from environment or use fallback endpoints
// Multiple public Sepolia RPC endpoints for better reliability (no API key required)
// When wallet is connected via injected connector, wagmi uses window.ethereum directly
const sepoliaRpcUrl = process.env.REACT_APP_SEPOLIA_RPC_URL;

// Create multiple HTTP transports with fallback support
// IMPORTANT: This is ONLY used as fallback when injected provider is not available
// When using injected connector, wagmi uses window.ethereum (MetaMask's provider) directly
// This transport should NOT be used when wallet is connected
const createTransport = (url) => http(url, {
  timeout: 5000, // 5 second timeout
  retryCount: 1, // Retry once
  retryDelay: 500, // Wait 500ms before retry
});

// Use custom RPC if provided, otherwise use fallback chain of public endpoints
// These are reliable public RPC endpoints that don't require API keys
const sepoliaTransport = sepoliaRpcUrl 
  ? createTransport(sepoliaRpcUrl)
  : fallback([
      // Try multiple public RPC endpoints in order
      // PublicNode - reliable public RPC
      createTransport('https://ethereum-sepolia-rpc.publicnode.com'),
      // Ethereum Foundation public endpoint
      createTransport('https://rpc.sepolia.org'),
      // Tenderly public gateway
      createTransport('https://sepolia.gateway.tenderly.co'),
      // Ankr public endpoint
      createTransport('https://rpc.ankr.com/eth_sepolia'),
    ], {
      rank: false, // Don't rank by speed, just try in order
      retryCount: 1,
    });

// Only add WalletConnect if project ID is provided
const connectors = [
  // CRITICAL: injected connector MUST be first to use wallet's provider
  // When injected is active, wagmi uses window.ethereum directly (MetaMask's RPC)
  // This bypasses the HTTP transport completely
  injected({ 
    shimDisconnect: true, // Re-enable to allow proper connection state
  }),
];

// Only add WalletConnect connector if project ID is provided
if (projectId && projectId !== 'YOUR_PROJECT_ID' && projectId !== '') {
  connectors.push(walletConnect({ projectId }));
}

export const config = createConfig({
  chains: [sepolia],
  connectors,
  // Transport configuration
  // When injected connector is used, it uses window.ethereum directly
  // This HTTP transport is only used as fallback for WalletConnect or when no wallet is connected
  transports: {
    [sepolia.id]: sepoliaTransport,
  },
  ssr: false,
  // Disable auto-fetching to prevent RPC calls before wallet is connected
  batch: {
    multicall: false, // Disable multicall to prevent auto-fetching
  },
});

