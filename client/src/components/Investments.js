import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatEther } from '../utils/ethers';

const Investments = () => {
  const { investments, makeInvestment, withdrawInvestment, loading } = useWeb3();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentType, setInvestmentType] = useState('Stocks');

  const handleMakeInvestment = async (e) => {
    e.preventDefault();
    if (!investmentAmount) return;
    
    const success = await makeInvestment(investmentAmount, investmentType);
    if (success) {
      setInvestmentAmount('');
    }
  };

  const handleWithdrawInvestment = async (index) => {
    const success = await withdrawInvestment(index);
    if (success) {
      // Investment data will be refreshed automatically
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const calculateReturn = (investment) => {
    const amount = parseFloat(formatEther(investment.amount));
    return (amount * 0.1).toFixed(4); // 10% return
  };

  const calculateCurrentValue = (investment) => {
    const amount = parseFloat(formatEther(investment.amount));
    const returns = amount * 0.1; // 10% return
    return (amount + returns).toFixed(4);
  };

  const activeInvestments = investments ? investments.filter(inv => inv.active) : [];
  const completedInvestments = investments ? investments.filter(inv => !inv.active) : [];

  const investmentOptions = [
    'Stocks',
    'Bonds',
    'Real Estate',
    'Cryptocurrency',
    'Commodities',
    'Mutual Funds'
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Make an Investment</h3>
          <form onSubmit={handleMakeInvestment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  id="investmentAmount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  step="0.0001"
                  min="0"
                  className="form-input mt-1"
                  placeholder="0.0000"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="investmentType" className="block text-sm font-medium text-gray-700">
                  Investment Type
                </label>
                <select
                  id="investmentType"
                  value={investmentType}
                  onChange={(e) => setInvestmentType(e.target.value)}
                  className="form-select mt-1"
                >
                  {investmentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : 'Invest'}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Active Investments</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activeInvestments.length > 0 ? (
              activeInvestments.map((investment, index) => (
                <div key={index} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {investment.investmentType}
                      </p>
                      <p className="text-sm text-gray-500">
                        Invested: {parseFloat(formatEther(investment.amount)).toFixed(4)} ETH
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {formatTimestamp(investment.startTime)}
                      </p>
                      <p className="text-sm text-green-600">
                        Est. Return: +{calculateReturn(investment)} ETH
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {calculateCurrentValue(investment)} ETH
                      </p>
                      <button
                        onClick={() => handleWithdrawInvestment(index)}
                        disabled={loading}
                        className="btn-success mt-2"
                      >
                        {loading ? 'Processing...' : 'Withdraw'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">No active investments</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Investment History</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {completedInvestments.length > 0 ? (
              completedInvestments.map((investment, index) => (
                <div key={index} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {investment.investmentType}
                      </p>
                      <p className="text-sm text-gray-500">
                        Invested: {parseFloat(formatEther(investment.amount)).toFixed(4)} ETH
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {formatTimestamp(investment.startTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        +{calculateReturn(investment)} ETH
                      </p>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">No investment history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investments;