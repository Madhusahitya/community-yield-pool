import React from 'react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

function ConnectPage({ onConnect }) {
  const { isConnected, address, chainId } = useAccount();
  const { open } = useWeb3Modal();
  const isSepolia = chainId === 11155111;

  const handleConnectWallet = async () => {
    try {
      await open();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };


  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        padding: '2rem 2.5rem',
        borderRadius: '0',
        boxShadow: '0 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: '3px solid rgba(68, 160, 141, 0.4)',
        maxWidth: '600px',
        width: '100%',
        imageRendering: 'pixelated',
        imageRendering: '-moz-crisp-edges',
        imageRendering: 'crisp-edges'
      }}>
        <h1 style={{
          fontSize: '2.2rem',
          background: 'linear-gradient(135deg, #44A08D 0%, #4ECDC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.75rem',
          fontWeight: '800',
          letterSpacing: '2px'
        }}>
          WELCOME
        </h1>
        
        <p style={{
          fontSize: '1rem',
          color: '#5A4A3A',
          marginBottom: '1.5rem',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          Connect your wallet to start earning yield while supporting public goods
        </p>

        {!isConnected ? (
          <>
            <button
              onClick={handleConnectWallet}
              className="btn btn-primary pixel-button"
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '700',
                borderRadius: '0',
                marginBottom: '1rem',
                width: '100%',
                maxWidth: '400px'
              }}
            >
              CONNECT WALLET
            </button>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0' }}>
              Make sure to switch to <strong>Sepolia testnet</strong> after connecting
            </p>
          </>
        ) : (
          <div>
            {!isSepolia ? (
              <div className="warning" style={{ marginBottom: '1rem', padding: '0.75rem' }}>
                Please switch to Sepolia testnet in your wallet
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, rgba(68, 160, 141, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)',
                padding: '1.25rem',
                borderRadius: '0',
                border: '3px solid rgba(68, 160, 141, 0.3)',
                marginBottom: '1rem'
              }}>
                <h2 style={{ color: '#44A08D', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: '700' }}>
                  WALLET CONNECTED
                </h2>
                <p style={{ color: '#5A4A3A', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Address: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <button
                  onClick={onConnect}
                  className="btn btn-primary pixel-button"
                  style={{
                    padding: '0.9rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    borderRadius: '0',
                    width: '100%',
                    maxWidth: '400px'
                  }}
                >
                  CONTINUE TO DEPOSIT
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '2px solid rgba(68, 160, 141, 0.2)'
        }}>
          <h3 style={{ color: '#666', fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: '600' }}>
            HOW IT WORKS
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#44A08D', marginBottom: '0.25rem' }}>1</div>
              <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: '1.3' }}>Connect wallet</p>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#44A08D', marginBottom: '0.25rem' }}>2</div>
              <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: '1.3' }}>Deposit tokens</p>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#44A08D', marginBottom: '0.25rem' }}>3</div>
              <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: '1.3' }}>Earn yield</p>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#44A08D', marginBottom: '0.25rem' }}>4</div>
              <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: '1.3' }}>10% donated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectPage;

