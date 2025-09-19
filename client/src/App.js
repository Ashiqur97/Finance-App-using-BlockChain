import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import WalletConnect from './components/WalletConnect';
import Dashboard from './components/Dashboard';
import Loans from './components/Loans';
import Expenses from './components/Expenses';
import Investments from './components/Investments';
import TransactionHistory from './components/TransactionHistory';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-primary-600">Finance App</h1>
                  </div>
                  <nav className="ml-6 flex space-x-8">
                    <Link
                      to="/"
                      className="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/loans"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Loans
                    </Link>
                    <Link
                      to="/expenses"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Expenses
                    </Link>
                    <Link
                      to="/investments"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Investments
                    </Link>
                    <Link
                      to="/transactions"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Transactions
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center">
                  <WalletConnect />
                </div>
              </div>
            </div>
          </header>

          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/transactions" element={<TransactionHistory />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
