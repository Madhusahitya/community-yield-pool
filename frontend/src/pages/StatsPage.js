import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';

const VAULT_ADDRESS = '0x2e51Df93631499E9503151e3E7195bD4cb04B682';
const DAI_ADDRESS = '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357';

const VAULT_ABI = [
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalDonated',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'donationPercent',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

function StatsPage({ onBack }) {
  console.log('StatsPage component rendering!');
  const { address, chainId } = useAccount();
  const shouldFetch = !!address && chainId === 11155111;

  const { data: totalAssetsData } = useReadContract({
    address: shouldFetch ? VAULT_ADDRESS : undefined,
    abi: VAULT_ABI,
    functionName: 'totalAssets',
    query: { enabled: shouldFetch, retry: false },
  });

  const { data: totalDonatedData } = useReadContract({
    address: shouldFetch ? VAULT_ADDRESS : undefined,
    abi: VAULT_ABI,
    functionName: 'totalDonated',
    query: { enabled: shouldFetch, retry: false },
  });

  const { data: donationPercentData } = useReadContract({
    address: shouldFetch ? VAULT_ADDRESS : undefined,
    abi: VAULT_ABI,
    functionName: 'donationPercent',
    query: { enabled: shouldFetch, retry: false },
  });

  const { data: sharesData } = useReadContract({
    address: shouldFetch ? VAULT_ADDRESS : undefined,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: shouldFetch && address ? [address] : undefined,
    query: { enabled: shouldFetch, retry: false },
  });

  const totalAssets = totalAssetsData ? formatEther(totalAssetsData) : '0';
  const totalDonated = totalDonatedData ? formatEther(totalDonatedData) : '0';
  const donationPercent = donationPercentData ? Number(donationPercentData) / 100 : 10;
  const userShares = sharesData ? formatEther(sharesData) : '0';

  return (
    <div style={{
      minHeight: '80vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        padding: '3rem',
        borderRadius: '0',
        boxShadow: '0 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: '3px solid rgba(68, 160, 141, 0.4)',
        maxWidth: '900px',
        width: '100%',
        imageRendering: 'pixelated',
        imageRendering: '-moz-crisp-edges',
        imageRendering: 'crisp-edges'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #44A08D 0%, #4ECDC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '2rem',
          fontWeight: '800',
          textAlign: 'center'
        }}>
          YOUR IMPACT
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div className="pixel-card" style={{
            background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.15) 0%, rgba(68, 160, 141, 0.1) 100%)',
            padding: '2rem',
            borderRadius: '0',
            border: '3px solid rgba(68, 160, 141, 0.5)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Your Vault Shares
            </h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#44A08D', marginBottom: '0.5rem' }}>
              {parseFloat(userShares).toFixed(4)}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>CYP Tokens</p>
          </div>

          <div className="pixel-card" style={{
            background: 'linear-gradient(135deg, rgba(244, 228, 188, 0.3) 0%, rgba(232, 213, 163, 0.2) 100%)',
            padding: '2rem',
            borderRadius: '0',
            border: '3px solid rgba(244, 228, 188, 0.6)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total Assets in Vault
            </h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#8B7355', marginBottom: '0.5rem' }}>
              {parseFloat(totalAssets).toFixed(4)}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>Tokens</p>
          </div>

          <div className="pixel-card" style={{
            background: 'linear-gradient(135deg, rgba(68, 160, 141, 0.2) 0%, rgba(78, 205, 196, 0.15) 100%)',
            padding: '2rem',
            borderRadius: '0',
            border: '3px solid rgba(68, 160, 141, 0.5)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total Donated
            </h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#44A08D', marginBottom: '0.5rem' }}>
              {parseFloat(totalDonated).toFixed(4)}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>Tokens to Public Goods</p>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(68, 160, 141, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)',
          padding: '2rem',
          borderRadius: '0',
          border: '3px solid rgba(68, 160, 141, 0.3)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: '#44A08D',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            textAlign: 'center',
            fontWeight: '700'
          }}>
            WHERE YOUR YIELD GOES
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#44A08D', marginBottom: '0.5rem' }}>
                {donationPercent}%
              </div>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Donated to Public Goods</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#4ECDC4', marginBottom: '0.5rem' }}>
                {100 - donationPercent}%
              </div>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Your Yield Return</p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(244, 228, 188, 0.2) 0%, rgba(232, 213, 163, 0.15) 100%)',
          padding: '2rem',
          borderRadius: '0',
          border: '3px solid rgba(244, 228, 188, 0.5)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#5A4A3A', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: '700' }}>
            HOW IT WORKS
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, color: '#666', lineHeight: '2' }}>
            <li style={{ marginBottom: '0.5rem' }}>• Your DAI is deposited into an ERC-4626 vault</li>
            <li style={{ marginBottom: '0.5rem' }}>• Assets are automatically deployed to Aave v3 to earn yield</li>
            <li style={{ marginBottom: '0.5rem' }}>• {donationPercent}% of generated yield is donated to public goods</li>
            <li style={{ marginBottom: '0.5rem' }}>• You receive {100 - donationPercent}% of the yield as your return</li>
            <li>• All donations are tracked on-chain and transparent</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onBack}
            className="btn btn-secondary pixel-button"
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '0'
            }}
          >
            DEPOSIT MORE
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;

