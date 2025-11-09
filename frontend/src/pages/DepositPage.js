import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';

// Contract addresses
const VAULT_ADDRESS = '0x2e51Df93631499E9503151e3E7195bD4cb04B682';
const DAI_ADDRESS = '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357';
const STANDARD_WETH_ADDRESS = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';

// ERC20 ABI
const ERC20_ABI = [
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Vault ABI
const VAULT_ABI = [
  {
    inputs: [{ name: 'assets', type: 'uint256' }, { name: 'receiver', type: 'address' }],
    name: 'deposit',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable',
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

function DepositPage({ onDepositSuccess, demoMode = false, demoDaiBalance = '10.0000' }) {
  // Debug: Log props on mount
  React.useEffect(() => {
    console.log('DepositPage mounted with props:', { 
      hasOnDepositSuccess: !!onDepositSuccess, 
      demoMode, 
      demoDaiBalance 
    });
  }, [onDepositSuccess, demoMode, demoDaiBalance]);
  const { address, isConnected, chainId } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [error, setError] = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [approvalHash, setApprovalHash] = useState(null);
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);

  const shouldFetch = isConnected && chainId === 11155111 && !!address && !demoMode;

  // Read DAI balance
  const { data: daiBalanceData, refetch: refetchDaiBalance } = useReadContract({
    address: shouldFetch ? DAI_ADDRESS : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: shouldFetch && address ? [address] : undefined,
    query: { enabled: shouldFetch, retry: false },
  });

  // Read vault shares
  const { data: sharesData, refetch: refetchShares } = useReadContract({
    address: shouldFetch ? VAULT_ADDRESS : undefined,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: shouldFetch && address ? [address] : undefined,
    query: { enabled: shouldFetch, retry: false },
  });

  // Read allowance
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: shouldFetch ? DAI_ADDRESS : undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: shouldFetch && address ? [address, VAULT_ADDRESS] : undefined,
    query: { enabled: shouldFetch, retry: false },
  });

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWriteContract } = useWriteContract({
    mutation: {
      onError: (error) => {
        console.error('WriteContract error:', error);
        setError(`Transaction failed: ${error.message || 'Unknown error'}`);
        setTransactionType(null);
      },
      onSuccess: (txHash) => {
        console.log('Transaction submitted:', txHash);
        setError(null);
      }
    }
  });
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
    query: { enabled: !!hash },
  });

  // Wait for approval confirmation
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash,
    query: { enabled: !!approvalHash },
  });

  // Reset state when switching between demo and normal mode
  useEffect(() => {
    if (demoMode) {
      // In demo mode, clear any transaction states
      setApprovalHash(null);
      setApprovalConfirmed(false);
      setError(null);
      setTransactionType(null);
    }
  }, [demoMode]);

  // Track approval hash when approve transaction is submitted
  useEffect(() => {
    if (hash && transactionType === 'approve') {
      setApprovalHash(hash);
    }
  }, [hash, transactionType]);

  useEffect(() => {
    if (isApprovalConfirmed && approvalHash) {
      setApprovalConfirmed(true);
      refetchAllowance();
      setTimeout(() => {
        setApprovalHash(null);
        setApprovalConfirmed(false);
      }, 5000);
    }
  }, [isApprovalConfirmed, approvalHash, refetchAllowance]);

  useEffect(() => {
    // Only handle real transaction confirmations (not demo mode)
    if (!demoMode && isConfirmed && hash) {
      refetchDaiBalance();
      refetchShares();
      refetchAllowance();
      
      if (transactionType === 'deposit') {
        setTimeout(() => {
          onDepositSuccess();
        }, 2000);
      }
      
      setTimeout(() => {
        resetWriteContract();
        setTransactionType(null);
      }, 5000);
    }
  }, [isConfirmed, hash, transactionType, refetchDaiBalance, refetchShares, refetchAllowance, resetWriteContract, onDepositSuccess, demoMode]);

  // Use demo balance if demo mode is enabled, otherwise use real balance
  const daiBalance = demoMode ? demoDaiBalance : (daiBalanceData ? formatEther(daiBalanceData) : '0');
  const shares = sharesData ? formatEther(sharesData) : '0';
  const approvalAmount = allowanceData ? formatEther(allowanceData) : '0';
  
  // In demo mode, always show as approved (for UI purposes only)
  // In normal mode, check if approval amount is sufficient
  const isApproved = demoMode ? true : (depositAmount && parseFloat(approvalAmount) >= parseFloat(depositAmount) && parseFloat(approvalAmount) > 0);
  
  // Helper to check if deposit button should be enabled
  const canDeposit = !!(
    depositAmount && 
    parseFloat(depositAmount) > 0 && 
    parseFloat(depositAmount) <= parseFloat(daiBalance || '0') &&
    parseFloat(daiBalance || '0') > 0 &&
    (demoMode || isApproved) &&
    !isPending && 
    !isConfirming && 
    transactionType !== 'deposit'
  );
  
  // Debug: Log canDeposit calculation
  React.useEffect(() => {
    console.log('canDeposit calculation:', {
      depositAmount,
      depositAmountValid: depositAmount && parseFloat(depositAmount) > 0,
      amountWithinBalance: parseFloat(depositAmount) <= parseFloat(daiBalance || '0'),
      daiBalanceValid: parseFloat(daiBalance || '0') > 0,
      demoMode,
      isApproved,
      approvedOrDemo: (demoMode || isApproved),
      isPending,
      isConfirming,
      transactionType,
      canDeposit
    });
  }, [depositAmount, daiBalance, demoMode, isApproved, isPending, isConfirming, transactionType, canDeposit]);

  const handleApprove = () => {
    if (demoMode) {
      // In demo mode, simulate approval
      setApprovalConfirmed(true);
      setTimeout(() => {
        setApprovalConfirmed(false);
      }, 3000);
      return;
    }
    if (!address || !depositAmount) {
      setError('Please enter an amount');
      return;
    }
    setError(null);
    setTransactionType('approve');
    try {
      const amount = parseEther(depositAmount);
      writeContract({
        address: DAI_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [VAULT_ADDRESS, amount],
      });
    } catch (error) {
      console.error('Approve error:', error);
      setError(`Approve failed: ${error.message || 'Unknown error'}`);
      setTransactionType(null);
    }
  };

  const handleDeposit = async () => {
    console.log('=== handleDeposit START ===');
    console.log('handleDeposit called', { demoMode, depositAmount, canDeposit, isApproved });
    console.log('demoMode value:', demoMode, 'type:', typeof demoMode);
    
    if (demoMode === true) {
      console.log('✅ Entering demo mode branch');
      // In demo mode, simulate successful deposit (no MetaMask needed)
      setError(null);
      setTransactionType('deposit');
      console.log('✅ Set transaction type to deposit');
      
      // Simulate success and redirect after short delay
      console.log('✅ Setting up redirect timeout (1.5 seconds)...');
      const timeoutId = setTimeout(() => {
        console.log('✅ Timeout fired!');
        console.log('onDepositSuccess type:', typeof onDepositSuccess);
        console.log('onDepositSuccess value:', onDepositSuccess);
        
        if (onDepositSuccess && typeof onDepositSuccess === 'function') {
          console.log('✅ Calling onDepositSuccess callback...');
          try {
            // Clear transaction type before redirecting to prevent any side effects
            setTransactionType(null);
            onDepositSuccess();
            console.log('✅ onDepositSuccess called successfully!');
          } catch (error) {
            console.error('❌ Error in onDepositSuccess:', error);
          }
        } else {
          console.error('❌ onDepositSuccess is not a function!', onDepositSuccess);
        }
        console.log('=== handleDeposit END (demo mode) ===');
      }, 1500);
      console.log('Timeout ID:', timeoutId);
      return;
    } else {
      console.log('❌ NOT in demo mode, demoMode =', demoMode);
    }
    
    // Validation
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(depositAmount) > parseFloat(daiBalance)) {
      setError('Amount exceeds balance');
      return;
    }
    
    if (!isApproved) {
      setError('Please approve tokens first');
      return;
    }
    
    setError(null);
    setTransactionType('deposit');
    
    try {
      const amount = parseEther(depositAmount);
      console.log('Attempting deposit (REAL TRANSACTION):', {
        vaultAddress: VAULT_ADDRESS,
        amount: depositAmount,
        amountWei: amount.toString(),
        receiver: address,
        demoMode: demoMode,
        isApproved: isApproved
      });
      
      // This will trigger MetaMask to open
      writeContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: [amount, address],
      });
      
      console.log('writeContract called - MetaMask should open now');
    } catch (error) {
      console.error('Deposit error:', error);
      setError(`Deposit failed: ${error.message || 'Unknown error'}`);
      setTransactionType(null);
    }
  };

  const handleMax = () => {
    if (daiBalance && parseFloat(daiBalance) > 0) {
      // Round to 4 decimal places to avoid precision issues
      const maxAmount = parseFloat(daiBalance).toFixed(4);
      setDepositAmount(maxAmount);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        padding: '3rem',
        borderRadius: '0',
        boxShadow: '0 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: '3px solid rgba(68, 160, 141, 0.4)',
        maxWidth: '700px',
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
          marginBottom: '1rem',
          fontWeight: '800',
          textAlign: 'center'
        }}>
          DEPOSIT TOKENS
        </h1>

        {demoMode && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 193, 7, 0.3) 100%)',
            padding: '1rem',
            borderRadius: '0',
            border: '3px solid rgba(255, 193, 7, 0.8)',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#856404', fontSize: '1rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
              ⚠️ DEMO MODE ACTIVE
            </p>
            <p style={{ color: '#856404', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>
              Transactions are simulated. Turn OFF demo mode in the header to make real transactions.
            </p>
          </div>
        )}

        <div style={{
          background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(68, 160, 141, 0.1) 100%)',
          padding: '1.5rem',
          borderRadius: '0',
          border: '3px solid rgba(68, 160, 141, 0.3)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#5A4A3A', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
            Your Token Balance
          </p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#44A08D' }}>
            {parseFloat(daiBalance).toFixed(4)} Tokens
          </p>
          {!demoMode && parseFloat(daiBalance) === 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(255, 193, 7, 0.1)',
              border: '2px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '0'
            }}>
              <p style={{ color: '#856404', fontSize: '0.85rem', margin: 0 }}>
                💡 <strong>Need testnet tokens?</strong> Use <strong>Demo Mode</strong> (toggle in header) or get tokens from{' '}
                <a 
                  href="https://staging.aave.com/faucet/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#44A08D', textDecoration: 'underline', fontWeight: '700' }}
                >
                  Aave Testnet Faucet
                </a>
              </p>
            </div>
          )}
        </div>

        {(error || writeError) && (
          <div className="warning" style={{ marginBottom: '1.5rem', background: '#f8d7da', borderColor: '#dc3545', color: '#721c24' }}>
            {error || (writeError?.message || 'Transaction failed')}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: '#333', marginBottom: '0.5rem', fontWeight: '600' }}>
            Amount to Deposit
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              placeholder="0.0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              step="0.001"
              min="0"
              max={daiBalance}
              style={{
                flex: 1,
                padding: '1rem',
                fontSize: '1.2rem',
                border: '3px solid rgba(68, 160, 141, 0.3)',
                borderRadius: '0',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={handleMax}
              className="btn btn-secondary pixel-button"
              style={{
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                borderRadius: '0'
              }}
            >
              MAX
            </button>
          </div>
        </div>

        {approvalHash && !approvalConfirmed && (
          <div className="success" style={{ marginBottom: '1.5rem' }}>
            <strong>Approval Transaction Pending...</strong>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Hash: {approvalHash.slice(0, 10)}...{approvalHash.slice(-8)}
            </p>
          </div>
        )}

        {approvalConfirmed && (
          <div className="success" style={{ marginBottom: '1.5rem' }}>
            <strong>Approval Successful!</strong>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              You can now deposit tokens
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          {!demoMode && !isApproved && (
            <button
              onClick={handleApprove}
              disabled={
                !depositAmount || 
                parseFloat(depositAmount) <= 0 || 
                isPending || 
                isConfirming || 
                transactionType === 'approve' || 
                parseFloat(depositAmount) > parseFloat(daiBalance) ||
                parseFloat(daiBalance) <= 0
              }
              className="btn btn-primary pixel-button"
              style={{
                padding: '1.2rem',
                fontSize: '1.1rem',
                fontWeight: '700',
                borderRadius: '0',
                width: '100%',
                opacity: (
                  !depositAmount || 
                  parseFloat(depositAmount) <= 0 || 
                  isPending || 
                  isConfirming || 
                  transactionType === 'approve' || 
                  parseFloat(depositAmount) > parseFloat(daiBalance) ||
                  parseFloat(daiBalance) <= 0
                ) ? 0.5 : 1,
                cursor: (
                  !depositAmount || 
                  parseFloat(depositAmount) <= 0 || 
                  isPending || 
                  isConfirming || 
                  transactionType === 'approve' || 
                  parseFloat(depositAmount) > parseFloat(daiBalance) ||
                  parseFloat(daiBalance) <= 0
                ) ? 'not-allowed' : 'pointer'
              }}
            >
              {transactionType === 'approve' && (isPending || isApprovalConfirming) ? 'APPROVING...' : 'APPROVE TOKENS'}
            </button>
          )}

          <button
            onClick={(e) => {
              console.log('Button clicked!', { canDeposit, demoMode, depositAmount });
              e.preventDefault();
              e.stopPropagation();
              if (canDeposit) {
                handleDeposit();
              } else {
                console.log('Button is disabled, cannot deposit');
              }
            }}
            disabled={!canDeposit}
            className="btn btn-success pixel-button"
            style={{
              padding: '1.2rem',
              fontSize: '1.1rem',
              fontWeight: '700',
              borderRadius: '0',
              width: '100%',
              opacity: !canDeposit ? 0.5 : 1,
              cursor: !canDeposit ? 'not-allowed' : 'pointer',
              pointerEvents: !canDeposit ? 'none' : 'auto'
            }}
          >
            {transactionType === 'deposit' && (isPending || isConfirming) ? 'DEPOSITING...' : 
             (!demoMode && !isApproved) ? 'APPROVE FIRST' : 'DEPOSIT'}
          </button>
        </div>

        {hash && transactionType === 'deposit' && (
          <div className="success" style={{ marginTop: '1.5rem' }}>
            {isPending && !isConfirmed && (
              <div>
                <strong>Transaction Submitted!</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Waiting for confirmation...
                </p>
              </div>
            )}
            {isConfirmed && (
              <div>
                <strong>Deposit Successful!</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Redirecting to stats page...
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '2px solid rgba(68, 160, 141, 0.2)',
          textAlign: 'center'
        }}>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            <strong>10%</strong> of generated yield will be automatically donated to public goods
          </p>
        </div>
      </div>
    </div>
  );
}

export default DepositPage;

