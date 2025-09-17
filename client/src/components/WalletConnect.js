import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatAddress } from '../utils/ethers';

const WalletConnect = () => {
  const { 
    account, 
    connectWallet, 
    switchToLocalhost, 
    chainId, 
    isCorrectNetwork,
    supportedNetworkName,
    loading 
  } = useWeb3();

  const handleConnectWallet = async () => {
    await connectWallet();
  };

  const handleSwitchNetwork = async () => {
    await switchToLocalhost();
  };

  return (
    <div className="flex items-center space-x-4">
      {account ? (
        <>
          {!isCorrectNetwork ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-red-600">
                Wrong Network
              </span>
              <button
                onClick={handleSwitchNetwork}
                className="btn-primary text-sm"
              >
                Switch to {supportedNetworkName}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">
                {supportedNetworkName}
              </span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700">
              {formatAddress(account)}
            </span>
          </div>
        </>
      ) : (
        <button
          onClick={handleConnectWallet}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;