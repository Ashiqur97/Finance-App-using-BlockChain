import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import WalletConnect from './components/WalletConnect';
import Dashboard from './components/Dashboard';

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
                    <a
                      href="/"
                      className="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Dashboard
                    </a>
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
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;