import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatEther } from '../utils/ethers';

const Loans = () => {
  const { loans, takeLoan, repayLoan, loading } = useWeb3();
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [repaymentAmount, setRepaymentAmount] = useState({});
  const [selectedLoan, setSelectedLoan] = useState(null);

  const handleTakeLoan = async (e) => {
    e.preventDefault();
    if (!loanAmount || !interestRate || !duration) return;
    
    const success = await takeLoan(loanAmount, interestRate, duration);
    if (success) {
      setLoanAmount('');
      setInterestRate('');
      setDuration('');
    }
  };

  const handleRepayLoan = async (loanIndex) => {
    if (!repaymentAmount[loanIndex]) return;
    
    const success = await repayLoan(loanIndex, repaymentAmount[loanIndex]);
    if (success) {
      const newRepaymentAmount = { ...repaymentAmount };
      delete newRepaymentAmount[loanIndex];
      setRepaymentAmount(newRepaymentAmount);
      setSelectedLoan(null);
    }
  };

  const calculateRepaymentAmount = (loan) => {
    const amount = parseFloat(formatEther(loan.amount));
    const interest = amount * (loan.interestRate / 100);
    return (amount + interest).toFixed(4);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getLoanStatus = (loan) => {
    if (loan.repaid) return 'Repaid';
    if (loan.active) return 'Active';
    return 'Completed';
  };

  const getLoanStatusColor = (loan) => {
    if (loan.repaid) return 'text-green-600';
    if (loan.active) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const activeLoans = loans ? loans.filter(loan => loan.active && !loan.repaid) : [];
  const completedLoans = loans ? loans.filter(loan => !loan.active || loan.repaid) : [];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Take a Loan</h3>
          <form onSubmit={handleTakeLoan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  id="loanAmount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  step="0.0001"
                  min="0"
                  className="form-input mt-1"
                  placeholder="0.0000"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  id="interestRate"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  step="0.1"
                  min="0"
                  max="100"
                  className="form-input mt-1"
                  placeholder="5.0"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (days)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  className="form-input mt-1"
                  placeholder="30"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : 'Take Loan'}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Active Loans</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activeLoans.length > 0 ? (
              activeLoans.map((loan, index) => (
                <div key={index} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {parseFloat(formatEther(loan.amount)).toFixed(4)} ETH
                      </p>
                      <p className="text-sm text-gray-500">
                        Interest: {loan.interestRate}% | Duration: {loan.duration} days
                      </p>
                      <p className="text-sm text-gray-500">
                        Taken: {formatTimestamp(loan.startTime)}
                      </p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLoanStatusColor(loan)}`}>
                      {getLoanStatus(loan)}
                    </span>
                  </div>
                  
                  {selectedLoan === index ? (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Repayment Amount (ETH)
                        </label>
                        <input
                          type="number"
                          value={repaymentAmount[index] || calculateRepaymentAmount(loan)}
                          onChange={(e) => setRepaymentAmount({...repaymentAmount, [index]: e.target.value})}
                          step="0.0001"
                          min={calculateRepaymentAmount(loan)}
                          className="form-input mt-1 w-full"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Minimum repayment: {calculateRepaymentAmount(loan)} ETH
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRepayLoan(index)}
                          disabled={loading}
                          className="btn-success flex-1"
                        >
                          {loading ? 'Processing...' : 'Repay Loan'}
                        </button>
                        <button
                          onClick={() => setSelectedLoan(null)}
                          className="btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedLoan(index)}
                      className="btn-primary mt-4 w-full"
                    >
                      Repay Loan
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">No active loans</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Loan History</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {completedLoans.length > 0 ? (
              completedLoans.map((loan, index) => (
                <div key={index} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {parseFloat(formatEther(loan.amount)).toFixed(4)} ETH
                      </p>
                      <p className="text-sm text-gray-500">
                        Interest: {loan.interestRate}% | Duration: {loan.duration} days
                      </p>
                      <p className="text-sm text-gray-500">
                        Taken: {formatTimestamp(loan.startTime)}
                      </p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLoanStatusColor(loan)}`}>
                      {getLoanStatus(loan)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">No loan history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loans;