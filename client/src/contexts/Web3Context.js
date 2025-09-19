import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Finance from '../artifacts/contracts/Finance.sol/Finance.json';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Replace with your deployed Finance contract address
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  // Supported network - only localhost
  const supportedNetworkId = 31337; // Hardhat network ID
  const supportedNetworkName = "Localhost";

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Get provider and network
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          // Get network ID
          const network = await provider.getNetwork();
          setChainId(network.chainId);
          
          // Check if network is localhost
          if (network.chainId !== supportedNetworkId) {
            setIsCorrectNetwork(false);
            console.error("Please connect to Localhost (Hardhat) network");
            return;
          }
          
          setIsCorrectNetwork(true);
          
          // Request account access
          const accounts = await provider.send("eth_requestAccounts", []);
          setAccount(accounts[0]);
          
          // Get signer and contract
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, Finance.abi, signer);
          setContract(contract);
          
          // Fetch initial data
          await fetchUserData(contract, accounts[0]);
          
          // Setup event listeners
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
          
          // Listen for contract events
          setupContractListeners(contract);
          
        } catch (error) {
          console.error("Error connecting to Web3:", error);
        }
      } else {
        console.error("MetaMask is not installed");
      }
    };

    initWeb3();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const setupContractListeners = (contract) => {
    // Listen for Deposit events
    contract.on("Deposit", (user, amount, timestamp) => {
      console.log(`Deposit event: ${user} deposited ${ethers.formatEther(amount)} ETH at ${timestamp}`);
      refreshData();
    });
    
    // Listen for Withdrawal events
    contract.on("Withdrawal", (user, amount, timestamp) => {
      console.log(`Withdrawal event: ${user} withdrew ${ethers.formatEther(amount)} ETH at ${timestamp}`);
      refreshData();
    });
    
    // Listen for LoanTaken events
    contract.on("LoanTaken", (borrower, amount, interestRate, duration) => {
      console.log(`LoanTaken event: ${borrower} took a loan of ${ethers.formatEther(amount)} ETH`);
      refreshData();
    });
    
    // Listen for LoanRepaid events
    contract.on("LoanRepaid", (borrower, amount) => {
      console.log(`LoanRepaid event: ${borrower} repaid ${ethers.formatEther(amount)} ETH`);
      refreshData();
    });
    
    // Listen for InvestmentMade events
    contract.on("InvestmentMade", (investor, amount, investmentType) => {
      console.log(`InvestmentMade event: ${investor} invested ${ethers.formatEther(amount)} ETH in ${investmentType}`);
      refreshData();
    });
    
    // Listen for InvestmentWithdrawn events
    contract.on("InvestmentWithdrawn", (investor, amount, investmentType) => {
      console.log(`InvestmentWithdrawn event: ${investor} withdrew ${ethers.formatEther(amount)} ETH from ${investmentType}`);
      refreshData();
    });
    
    // Listen for ExpenseAdded events
    contract.on("ExpenseAdded", (user, amount, category, description) => {
      console.log(`ExpenseAdded event: ${user} added expense of ${ethers.formatEther(amount)} ETH for ${category}`);
      refreshData();
    });
    
    // Listen for BudgetSet events
    contract.on("BudgetSet", (user, category, amount, month, year) => {
      console.log(`BudgetSet event: ${user} set budget of ${ethers.formatEther(amount)} ETH for ${category}`);
      refreshData();
    });
    
    // Listen for SavingsGoalCreated events
    contract.on("SavingsGoalCreated", (user, name, targetAmount, deadline) => {
      console.log(`SavingsGoalCreated event: ${user} created savings goal ${name} with target ${ethers.formatEther(targetAmount)} ETH`);
      refreshData();
    });
    
    // Listen for SavingsGoalContributed events
    contract.on("SavingsGoalContributed", (user, name, amount) => {
      console.log(`SavingsGoalContributed event: ${user} contributed ${ethers.formatEther(amount)} ETH to ${name}`);
      refreshData();
    });
    
    // Listen for SavingsGoalCompleted events
    contract.on("SavingsGoalCompleted", (user, name) => {
      console.log(`SavingsGoalCompleted event: ${user} completed savings goal ${name}`);
      refreshData();
    });
  };

  const refreshData = async () => {
    if (contract && account) {
      await fetchUserData(contract, account);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      if (contract) {
        fetchUserData(contract, accounts[0]);
      }
    } else {
      setAccount(null);
    }
  };

  const handleChainChanged = (chainId) => {
    // Convert chainId from hex to decimal
    const decimalChainId = parseInt(chainId, 16);
    setChainId(decimalChainId);
    
    // Check if network is localhost
    setIsCorrectNetwork(decimalChainId === supportedNetworkId);
    
    // Reload the page to ensure everything is properly initialized with the new network
    window.location.reload();
  };

  const fetchUserData = async (contract, account) => {
    try {
      setLoading(true);
      
      // Fetch balance
      const balance = await contract.getBalance();
      setBalance(ethers.formatEther(balance));
      
      // Fetch transactions
      const transactions = await contract.getTransactions();
      setTransactions(transactions);
      
      // Fetch loans
      const loans = await contract.getLoans();
      setLoans(loans);
      
      // Fetch investments
      const investments = await contract.getInvestments();
      setInvestments(investments);
      
      // Fetch expenses
      const expenses = await contract.getExpenses();
      setExpenses(expenses);
      
      // Fetch budgets
      const budgets = await contract.getBudgets();
      setBudgets(budgets);
      
      // Fetch savings goals
      const savingsGoals = await contract.getSavingsGoals();
      setSavingsGoals(savingsGoals);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        // Get provider and network
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        const network = await provider.getNetwork();
        setChainId(network.chainId);
        
        // Check if network is localhost
        if (network.chainId !== supportedNetworkId) {
          setIsCorrectNetwork(false);
          console.error("Please connect to Localhost (Hardhat) network");
          return;
        }
        
        setIsCorrectNetwork(true);
        
        // Get signer and contract
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, Finance.abi, signer);
        setContract(contract);
        
        // Fetch user data
        await fetchUserData(contract, accounts[0]);
        
        // Setup contract event listeners
        setupContractListeners(contract);
        
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      console.error("MetaMask is not installed");
      // You might want to show a message to the user to install MetaMask
    }
  };

  const switchToLocalhost = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${supportedNetworkId.toString(16)}` }],
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        if (error.code === 4902) {
          // Add the localhost network to MetaMask
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${supportedNetworkId.toString(16)}`,
                  chainName: 'Localhost',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['http://127.0.0.1:8545'],
                },
              ],
            });
          } catch (addError) {
            console.error("Error adding localhost network to MetaMask:", addError);
          }
        } else {
          console.error("Error switching to localhost network:", error);
        }
      }
    }
  };

  const deposit = async (amount) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const tx = await contract.deposit({ value: ethers.parseEther(amount) });
      await tx.wait();
      await fetchUserData(contract, account);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error depositing:", error);
      setLoading(false);
      return false;
    }
  };

  const withdraw = async (amount) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // Parse the amount to wei before sending to the contract
      const amountInWei = ethers.parseEther(amount);
      const tx = await contract.withdraw(amountInWei);
      await tx.wait();
      await fetchUserData(contract, account);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error withdrawing:", error);
      setLoading(false);
      return false;
    }
  };

  const takeLoan = async (amount, interestRate, duration) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // Parse the amount to wei before sending to the contract
      const amountInWei = ethers.parseEther(amount);
      const tx = await contract.takeLoan(amountInWei, interestRate, duration);
      await tx.wait();
      await fetchUserData(contract, account);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error taking loan:", error);
      setLoading(false);
      return false;
    }
  };

  const repayLoan = async (loanIndex, amount) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // Parse the amount to wei before sending to the contract
      const amountInWei = ethers.parseEther(amount);
      const tx = await contract.repayLoan(loanIndex, { value: amountInWei });
      await tx.wait();
      await fetchUserData(contract, account);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error repaying loan:", error);
      setLoading(false);
      return false;
    }
  };

  const makeInvestment = async (amount, investmentType) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // Parse the amount to wei before sending to the contract
      const amountInWei = ethers.parseEther(amount);
      const tx = await contract.makeInvestment(investmentType, { value: amountInWei });
      await tx.wait();
      await fetchUserData(contract, account);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error making investment:", error);
      setLoading(false);
      return false;
    }
  };

  const withdrawInvestment = async (investmentIndex) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const tx = await contract.withdrawInvestment(investmentIndex);
      await tx.wait();
      await fetchUserData(contract, account);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error withdrawing investment:", error);
      setLoading(false);
      return false;
    }
  };

  const addExpense = async (amount, category, description) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // Parse the amount to wei before sending to the contract
      const amountInWei = ethers.parseEther(amount);
      const tx = await contract.addExpense(category, description, { value: amountInWei });
      await tx.wait();
      await fetchUserData(contract, account);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error adding expense:", error);
      setLoading(false);
      return false;
    }
  };

  const setBudget = async (category, amount, month, year) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // Parse the amount to wei before sending to the contract
      const amountInWei = ethers.parseEther(amount);
      const tx = await contract.setBudget(category, amountInWei, month, year);
      await tx.wait();
      await fetchUserData(contract, account);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error setting budget:", error);
      setLoading(false);
      return false;
    }
  };

  const createSavingsGoal = async (name, description, targetAmount, deadline) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // Parse the amount to wei before sending to the contract
      const targetAmountInWei = ethers.parseEther(targetAmount);
      const tx = await contract.createSavingsGoal(
        name,
        description,
        targetAmountInWei,
        deadline
      );
      await tx.wait();
      await fetchUserData(contract, account);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error creating savings goal:", error);
      setLoading(false);
      return false;
    }
  };

  const contributeToSavingsGoal = async (goalIndex, amount) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // Parse the amount to wei before sending to the contract
      const amountInWei = ethers.parseEther(amount);
      const tx = await contract.contributeToSavingsGoal(goalIndex, { value: amountInWei });
      await tx.wait();
      await fetchUserData(contract, account);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error contributing to savings goal:", error);
      setLoading(false);
      return false;
    }
  };

  const getCurrentMonthExpenses = async (category) => {
    if (!contract) return 0;
    
    try {
      const expenses = await contract.getCurrentMonthExpenses(category);
      return parseFloat(ethers.formatEther(expenses));
    } catch (error) {
      console.error("Error getting current month expenses:", error);
      return 0;
    }
  };

  const value = {
    account,
    contract,
    provider,
    balance,
    transactions,
    loans,
    investments,
    expenses,
    budgets,
    savingsGoals,
    loading,
    chainId,
    isCorrectNetwork,
    supportedNetworkName,
    connectWallet,
    switchToLocalhost,
    deposit,
    withdraw,
    takeLoan,
    repayLoan,
    makeInvestment,
    withdrawInvestment,
    addExpense,
    setBudget,
    createSavingsGoal,
    contributeToSavingsGoal,
    getCurrentMonthExpenses,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
