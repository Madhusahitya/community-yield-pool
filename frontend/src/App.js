import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import './App.css';
import ConnectPage from './pages/ConnectPage';
import DepositPage from './pages/DepositPage';
import StatsPage from './pages/StatsPage';

function App() {
  const { isConnected, chainId, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [currentPage, setCurrentPage] = useState('connect'); // 'connect', 'deposit', 'stats'
  const [demoMode, setDemoMode] = useState(false); // Demo mode for testing
  const [demoDaiBalance, setDemoDaiBalance] = useState('10.0000'); // Simulated DAI balance for demo
  const isSepolia = chainId === 11155111;

  const handleConnectWallet = async () => {
    try {
      await open();
        } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setCurrentPage('connect');
  };
  
  // Debug: Log page changes
  React.useEffect(() => {
    console.log('Current page changed to:', currentPage);
  }, [currentPage]);

  // Don't auto-navigate - let user control navigation
  // Removed auto-navigation to prevent conflicts with manual page changes

  const handleConnect = () => {
    setCurrentPage('deposit');
  };

  const handleDepositSuccess = React.useCallback(() => {
    console.log('handleDepositSuccess called in App.js, changing page to stats');
    // Use functional update to ensure we're setting the correct value
    setCurrentPage(prevPage => {
      if (prevPage !== 'stats') {
        console.log('Changing page from', prevPage, 'to stats');
        return 'stats';
      }
      console.log('Page is already stats, not changing');
      return prevPage;
    });
  }, []);

  const handleBackToDeposit = () => {
    setCurrentPage('deposit');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 style={{ 
              fontSize: '2.8rem',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E0F7FA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 20px rgba(255, 255, 255, 0.3)',
              fontWeight: '800'
            }}>Community Yield Pool</h1>
            <p className="tagline" style={{ fontSize: '1.3rem', fontWeight: '500', textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)' }}>
              Dive into DeFi • Earn Yield • Support Public Goods
            </p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {!isConnected ? (
                <button 
                  onClick={handleConnectWallet} 
                  className="pixel-button"
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    background: 'rgba(68, 160, 141, 0.8)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '700',
                    borderRadius: '0',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(68, 160, 141, 1)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(68, 160, 141, 0.8)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  CONNECT WALLET
                </button>
              ) : (
                <>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem',
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '8px 16px', 
                    borderRadius: '0',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}>
                    <button
                      onClick={() => setCurrentPage('connect')}
                      className="pixel-button"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: currentPage === 'connect' ? 'rgba(255,255,255,0.3)' : 'transparent',
                        border: '2px solid rgba(255,255,255,0.5)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '700',
                        borderRadius: '0'
                      }}
                    >
                      CONNECT
                    </button>
                    <button 
                      onClick={() => setCurrentPage('deposit')}
                      className="pixel-button"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: currentPage === 'deposit' ? 'rgba(255,255,255,0.3)' : 'transparent',
                        border: '2px solid rgba(255,255,255,0.5)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '700',
                        borderRadius: '0'
                      }}
                    >
                      DEPOSIT
                    </button>
                    <button 
                      onClick={() => setCurrentPage('stats')}
                      className="pixel-button"
                      style={{ 
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: currentPage === 'stats' ? 'rgba(255,255,255,0.3)' : 'transparent',
                        border: '2px solid rgba(255,255,255,0.5)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '700',
                        borderRadius: '0'
                      }}
                    >
                      STATS
                    </button>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.15)',
                    padding: '6px 12px',
                    borderRadius: '0',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}>
                    <span style={{ 
                      fontSize: '11px', 
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                    <button
                      onClick={handleDisconnect}
                      className="pixel-button"
                      style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        background: 'rgba(220, 53, 69, 0.7)',
                        border: '2px solid rgba(255,255,255,0.5)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '700',
                        borderRadius: '0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 53, 69, 0.9)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 53, 69, 0.7)';
                      }}
                    >
                      DISCONNECT
                </button>
              </div>
              <button 
                    onClick={() => setDemoMode(!demoMode)}
                    className="pixel-button"
                style={{ 
                      padding: '6px 12px',
                      fontSize: '11px',
                      background: demoMode ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255,255,255,0.2)',
                      border: '2px solid rgba(255,255,255,0.5)',
                  color: 'white',
                  cursor: 'pointer',
                      fontWeight: '700',
                      borderRadius: '0'
                }}
              >
                    {demoMode ? 'DEMO: ON' : 'DEMO: OFF'}
              </button>
                </>
            )}
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{ 
        minHeight: 'calc(100vh - 200px)',
        position: 'relative'
      }}>
        {/* Progress Indicator */}
        {isConnected && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
            borderRadius: '0',
            border: '2px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: currentPage === 'connect' ? 'rgba(255,255,255,0.3)' : 'transparent',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '0',
              fontWeight: '700',
              fontSize: '0.9rem',
              color: 'white'
            }}>
              <span>1</span>
              <span>CONNECT</span>
            </div>
            <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.5)' }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: currentPage === 'deposit' ? 'rgba(255,255,255,0.3)' : 'transparent',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '0',
              fontWeight: '700',
              fontSize: '0.9rem',
              color: 'white'
            }}>
              <span>2</span>
              <span>DEPOSIT</span>
            </div>
            <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.5)' }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: currentPage === 'stats' ? 'rgba(255,255,255,0.3)' : 'transparent',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '0',
              fontWeight: '700',
              fontSize: '0.9rem',
              color: 'white'
            }}>
              <span>3</span>
              <span>STATS</span>
            </div>
          </div>
        )}

        <div style={{
          animation: currentPage === 'connect' ? 'slideInFromLeft 0.4s ease-out' : 
                     currentPage === 'deposit' ? 'slideInFromRight 0.4s ease-out' :
                     'fadeIn 0.4s ease-out',
          position: 'relative',
          width: '100%'
        }}>
          {currentPage === 'connect' && (
            <ConnectPage onConnect={handleConnect} />
          )}
          {currentPage === 'deposit' && (
            <DepositPage 
              onDepositSuccess={handleDepositSuccess} 
              demoMode={demoMode}
              demoDaiBalance={demoDaiBalance}
            />
          )}
          {currentPage === 'stats' && (
            <StatsPage onBack={handleBackToDeposit} />
          )}
        </div>
      </main>

      <footer>
        <p style={{ margin: '0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
          Community Yield Pool - ERC-4626 Vault with Aave v3 Integration
        </p>
        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
          Built for Octant v2 DeFi Hackathon
        </p>
        <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', opacity: 0.8 }}>
          Vault Address: <a href={`https://sepolia.etherscan.io/address/${'0x2e51Df93631499E9503151e3E7195bD4cb04B682'}`} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
            {`0x2e51...B682`}
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
