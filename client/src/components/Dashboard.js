import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { formatEther } from '../utils/ethers';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const { 
    balance, 
    transactions, 
    expenses, 
    investments, 
    loans, 
    budgets, 
    savingsGoals 
  } = useWeb3();
  const [expenseData, setExpenseData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);

  useEffect(() => {
    // Process expense data for pie chart
    if (expenses && expenses.length > 0) {
      const categories = {};
      
      expenses.forEach(expense => {
        const amount = parseFloat(formatEther(expense.amount));
        if (categories[expense.category]) {
          categories[expense.category] += amount;
        } else {
          categories[expense.category] = amount;
        }
      });

      const data = {
        labels: Object.keys(categories),
        datasets: [
          {
            label: 'Expenses by Category',
            data: Object.values(categories),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };

      setExpenseData(data);
    }

    // Process transaction data for bar chart
    if (transactions && transactions.length > 0) {
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
      }

      const dailyTransactions = {};
      last7Days.forEach(day => {
        dailyTransactions[day] = 0;
      });

      transactions.forEach(tx => {
        const txDate = new Date(tx.timestamp * 1000).toISOString().split('T')[0];
        if (dailyTransactions.hasOwnProperty(txDate)) {
          dailyTransactions[txDate] += parseFloat(formatEther(tx.amount));
        }
      });

      const data = {
        labels: last7Days.map(day => new Date(day).toLocaleDateString('en-US', { weekday: 'short' })),
        datasets: [
          {
            label: 'Transaction Amount (ETH)',
            data: Object.values(dailyTransactions),
            backgroundColor: 'rgba(53, 162, 235, 0.8)',
          },
        ],
      };

      setTransactionData(data);
    }

    // Process budget data for bar chart
    if (budgets && budgets.length > 0) {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const currentMonthBudgets = budgets.filter(
        budget => budget.month === currentMonth && budget.year === currentYear
      );
      
      if (currentMonthBudgets.length > 0) {
        // Calculate expenses for current month by category
        const currentMonthExpenses = {};
        
        if (expenses && expenses.length > 0) {
          expenses.forEach(expense => {
            const expenseDate = new Date(expense.timestamp * 1000);
            const expenseMonth = expenseDate.getMonth() + 1;
            const expenseYear = expenseDate.getFullYear();
            
            if (expenseMonth === currentMonth && expenseYear === currentYear) {
              const amount = parseFloat(formatEther(expense.amount));
              if (currentMonthExpenses[expense.category]) {
                currentMonthExpenses[expense.category] += amount;
              } else {
                currentMonthExpenses[expense.category] = amount;
              }
            }
          });
        }
        
        const budgetLabels = [];
        const budgetAmounts = [];
        const expenseAmounts = [];
        
        currentMonthBudgets.forEach(budget => {
          budgetLabels.push(budget.category);
          budgetAmounts.push(parseFloat(formatEther(budget.amount)));
          expenseAmounts.push(currentMonthExpenses[budget.category] || 0);
        });
        
        const data = {
          labels: budgetLabels,
          datasets: [
            {
              label: 'Budget',
              data: budgetAmounts,
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
            },
            {
              label: 'Expenses',
              data: expenseAmounts,
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
            },
          ],
        };
        
        setBudgetData(data);
      }
    }
  }, [expenses, transactions, budgets]);

  const totalInvestments = investments && investments.length > 0
    ? investments.reduce((sum, investment) => sum + parseFloat(formatEther(investment.amount)), 0)
    : 0;

  const activeLoans = loans && loans.length > 0
    ? loans.filter(loan => loan.active && !loan.repaid)
    : [];

  const totalLoanAmount = activeLoans.length > 0
    ? activeLoans.reduce((sum, loan) => sum + parseFloat(formatEther(loan.amount)), 0)
    : 0;

  const activeSavingsGoals = savingsGoals && savingsGoals.length > 0
    ? savingsGoals.filter(goal => !goal.completed)
    : [];

  const totalSavings = activeSavingsGoals.length > 0
    ? activeSavingsGoals.reduce((sum, goal) => sum + parseFloat(formatEther(goal.currentAmount)), 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Balance</h3>
            <p className="text-3xl font-bold text-primary-600">{balance} ETH</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Investments</h3>
            <p className="text-3xl font-bold text-green-600">{totalInvestments.toFixed(4)} ETH</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Loans</h3>
            <p className="text-3xl font-bold text-red-600">{totalLoanAmount.toFixed(4)} ETH</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Savings Goals</h3>
            <p className="text-3xl font-bold text-yellow-600">{totalSavings.toFixed(4)} ETH</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Expenses by Category</h3>
          </div>
          <div className="card-body">
            {expenseData ? (
              <Pie data={expenseData} />
            ) : (
              <p className="text-gray-500 text-center py-8">No expense data available</p>
            )}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Last 7 Days Transactions</h3>
          </div>
          <div className="card-body">
            {transactionData ? (
              <Bar data={transactionData} />
            ) : (
              <p className="text-gray-500 text-center py-8">No transaction data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Budget vs Expenses</h3>
        </div>
        <div className="card-body">
          {budgetData ? (
            <Bar data={budgetData} />
          ) : (
            <p className="text-gray-500 text-center py-8">No budget data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;