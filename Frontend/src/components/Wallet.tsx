import React, { useState } from 'react';
import { useAccount, useSendTransaction, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConnect, useDisconnect } from 'wagmi';
import { parseEther, isAddress } from 'viem';
import { basicWalletAbi, CONTRACT_ADDRESS } from '../config/wagmi';
import { injected } from 'wagmi/connectors';

const Wallet: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // --- State Hooks ---
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>('');
  
  const { data: contractOwner, refetch: refetchOwner } = useReadContract({
    abi: basicWalletAbi,
    address: CONTRACT_ADDRESS,
    functionName: 'owner',
  });

  // Read the contract's ETH balance
  const { data: contractBalance, refetch: refetchBalance } = useBalance({
    address: CONTRACT_ADDRESS,
    unit: 'ether',
  });
  
  // Check if the connected user is the owner
  const isUserOwner = isConnected && address === contractOwner;

  // 1. Deposit (send ETH to contract's receive function)
  const { data: depositTxHash, sendTransaction: sendDeposit, isPending: isDepositing } = useSendTransaction();
  const { isLoading: isDepositConfirming } = useWaitForTransactionReceipt({ hash: depositTxHash });

  const handleDeposit = () => {
    if (depositAmount && isConnected) {
      try {
        sendDeposit({
          to: CONTRACT_ADDRESS,
          value: parseEther(depositAmount)
        });
      } catch (e) {
        console.error("Deposit failed:", e);
      }
    }
  };

  // 2. Withdraw (calls withdraw function)
  const { data: withdrawTxHash, writeContract: writeWithdraw, isPending: isWithdrawing } = useWriteContract();
  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({ hash: withdrawTxHash, confirmations: 2 });
  
  const handleWithdraw = () => {
    if (withdrawAmount && isUserOwner) {
      writeWithdraw({
        abi: basicWalletAbi,
        address: CONTRACT_ADDRESS,
        functionName: 'withdraw',
        args: [parseEther(withdrawAmount)],
      });
    }
  };

  // 3. Change Owner (calls changeOwner function)
  const { data: changeOwnerTxHash, writeContract: writeChangeOwner, isPending: isChangingOwner } = useWriteContract();
  const { isLoading: isChangeOwnerConfirming } = useWaitForTransactionReceipt({ hash: changeOwnerTxHash });

  const handleChangeOwner = () => {
    if (isAddress(newOwnerAddress) && isUserOwner) {
      writeChangeOwner({
        abi: basicWalletAbi,
        address: CONTRACT_ADDRESS,
        functionName: 'changeOwner',
        args: [newOwnerAddress as `0x${string}`],
      });
      setNewOwnerAddress('');
    }
  };

  // --- UI Logic ---

  if (!isConnected) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Connect Wallet</h2>
        <button onClick={() => connect({ connector: injected() })}>
          Connect MetaMask
        </button>
        <p>Please connect your wallet to interact with the BasicWallet contract.</p>
      </div>
    );
  }

  // Effect to refetch data after transactions
  React.useEffect(() => {
    if (!isDepositConfirming && depositTxHash) {
      refetchBalance();
    }
    if (!isWithdrawConfirming && withdrawTxHash) {
      refetchBalance();
    }
    if (!isChangeOwnerConfirming && changeOwnerTxHash) {
      refetchOwner();
    }
  }, [isDepositConfirming, isWithdrawConfirming, isChangeOwnerConfirming]);


  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>BasicWallet DApp</h1>
      <button onClick={() => disconnect()} style={{ float: 'right' }}>Disconnect</button>
      
      {/* Wallet and Contract Status */}
      <section style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <p><strong>Connected Address:</strong> {address}</p>
        <p><strong>Network:</strong> {chain?.name}</p>
        <p><strong>Contract Address:</strong> {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</p>
        <p><strong>Contract Owner:</strong> {contractOwner || 'Loading...'}</p>
        <p><strong>User Status:</strong> {isUserOwner ? <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Owner</span> : '👤 User'}</p>
        <p><strong>Wallet Balance:</strong> {contractBalance?.formatted} {contractBalance?.symbol || 'ETH'}</p>
      </section>

      {/* Deposit Functionality */}
      <section style={{ marginBottom: '20px', padding: '15px', border: '1px solid #c9e0ff' }}>
        <h2>Deposit ETH</h2>
        <input 
          type="number" 
          value={depositAmount} 
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Amount in ETH" 
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button 
          onClick={handleDeposit} 
          disabled={isDepositing || isDepositConfirming || !depositAmount}
        >
          {isDepositing ? 'Waiting for approval...' : isDepositConfirming ? 'Depositing...' : 'Deposit'}
        </button>
        {depositTxHash && (
          <p style={{ marginTop: '10px', fontSize: '12px' }}>Tx sent: {depositTxHash.slice(0, 10)}...</p>
        )}
      </section>

      {/* Owner-Only Functions */}
      {isUserOwner && (
        <>
          {/* Withdraw Functionality */}
          <section style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ffc9c9' }}>
            <h2>Withdraw ETH (Owner Only)</h2>
            <input 
              type="number" 
              value={withdrawAmount} 
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount in ETH" 
              style={{ padding: '8px', marginRight: '10px' }}
            />
            <button 
              onClick={handleWithdraw} 
              disabled={isWithdrawing || isWithdrawConfirming || !withdrawAmount}
            >
              {isWithdrawing ? 'Waiting for approval...' : isWithdrawConfirming ? 'Withdrawing...' : 'Withdraw'}
            </button>
            {withdrawTxHash && (
              <p style={{ marginTop: '10px', fontSize: '12px' }}>Tx sent: {withdrawTxHash.slice(0, 10)}...</p>
            )}
          </section>

          {/* Change Owner Functionality */}
          <section style={{ marginBottom: '20px', padding: '15px', border: '1px solid #c9ffc9' }}>
            <h2>Change Owner (Owner Only)</h2>
            <input 
              type="text" 
              value={newOwnerAddress} 
              onChange={(e) => setNewOwnerAddress(e.target.value)}
              placeholder="New Owner Address (0x...)" 
              style={{ padding: '8px', marginRight: '10px', width: '300px' }}
            />
            <button 
              onClick={handleChangeOwner} 
              disabled={isChangingOwner || isChangeOwnerConfirming || !isAddress(newOwnerAddress)}
            >
              {isChangingOwner ? 'Waiting for approval...' : isChangeOwnerConfirming ? 'Changing...' : 'Change Owner'}
            </button>
            {!isAddress(newOwnerAddress) && newOwnerAddress && (
              <p style={{ color: 'red', marginTop: '5px' }}>Invalid address format.</p>
            )}
            {changeOwnerTxHash && (
              <p style={{ marginTop: '10px', fontSize: '12px' }}>Tx sent: {changeOwnerTxHash.slice(0, 10)}...</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Wallet;
