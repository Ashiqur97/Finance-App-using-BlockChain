// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FinanceCore is Ownable,ReentrancyGuard {
    constructor() Ownable(msg.sender) {}

    mapping (address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount,uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);

    function deposit() external payable {
        require(msg.value > 0, ">0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender,msg.value,block.timestamp);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, ">0");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
}

contract Loans is FinanceCore {
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        bool active;
        bool repaid;
    }

    mapping (address => Loan[]) public loans;

    event LoanTaken(address indexed borrower,uint256 amount,uint256 interestRate,uint256 duration);
    event LoanRepaid(address indexed borrower,uint256 amount);

        function takeLoan(uint256 amount, uint256 interestRate, uint256 duration) external nonReentrant {
        require(amount > 0, ">0");
        require(interestRate > 0 && interestRate <= 100, "Rate 1-100");
        require(duration > 0, ">0");
        
        loans[msg.sender].push(Loan({
            borrower: msg.sender,
            amount: amount,
            interestRate: interestRate,
            duration: duration,
            startTime: block.timestamp,
            active: true,
            repaid: false
        }));
        
        balances[msg.sender] += amount;
        emit LoanTaken(msg.sender, amount, interestRate, duration);
    }

      function repayLoan(uint256 loanIndex) external payable nonReentrant {
        require(loanIndex < loans[msg.sender].length, "Invalid");
        Loan storage loan = loans[msg.sender][loanIndex];
        require(loan.active && !loan.repaid, "Not active");
        
        uint256 repaymentAmount = loan.amount + (loan.amount * loan.interestRate / 100);
        require(msg.value >= repaymentAmount, "Insufficient");
        
        loan.repaid = true;
        loan.active = false;
        
        if (msg.value > repaymentAmount) {
            payable(msg.sender).transfer(msg.value - repaymentAmount);
        }
        
        emit LoanRepaid(msg.sender, repaymentAmount);
    }

    function getLoans() external view returns (Loan[] memory) {
        return loans[msg.sender];
    } 
}

contract Investments is FinanceCore {

    struct Investment {
        address investor;
        uint256 amount;
        string investmentType;
        uint256 startTime;
        bool active;
    }

    mapping (address => Investment[]) public investments;

    event InvestmentMade(address indexed investor, uint256 amount, string investmentType);
    event InvestmentWithdrawn(address indexed investor, uint256 amount, string investmentType);

        function makeInvestment(string memory investmentType) external payable {
        require(msg.value > 0, ">0");
        
        investments[msg.sender].push(Investment({
            investor: msg.sender,
            amount: msg.value,
            investmentType: investmentType,
            startTime: block.timestamp,
            active: true
        }));
        
        emit InvestmentMade(msg.sender, msg.value, investmentType);
    }

        function withdrawInvestment(uint256 investmentIndex) external nonReentrant {
        require(investmentIndex < investments[msg.sender].length, "Invalid");
        Investment storage investment = investments[msg.sender][investmentIndex];
        require(investment.active, "Not active");
        
        uint256 returnAmount = investment.amount * 110 / 100; // 10% return
        investment.active = false;
        balances[msg.sender] += returnAmount;
        
        emit InvestmentWithdrawn(msg.sender, returnAmount, investment.investmentType);
    }

        function getInvestments() external view returns (Investment[] memory) {
        return investments[msg.sender];
    }
}

contract Expenses is FinanceCore {
    struct Expense {
        address user;
        uint256 amount;
        string category;
        uint256 timestamp;
        string description;
    }

    mapping(address => Expense[]) public expenses;

    event ExpenseAdded(address indexed user,uint256 amount,string category,string description);

    function addExpense(string memory category, string memory description) external payable {
        require(msg.value > 0, "0");

        expenses[msg.sender].push(Expense({
            user: msg.sender,
            amount: msg.value,
            category: category,
            timestamp: block.timestamp,
            description: description
        }));

        emit ExpenseAdded(msg.sender,msg.value,category,description);
    }

        function getExpenses() external view returns (Expense[] memory) {
        return expenses[msg.sender];
    }
}

contract Budgets is FinanceCore {
    struct Budget {
        address user;
        string category;
        uint256 amount;
        uint256 month;
        uint256 year;
    }

    mapping (address => Budget[]) public budgets;

    event BudgetSet(address indexed user,string category, uint256 amount, uint256 month, uint256 year);

       function setBudget(string memory category, uint256 amount, uint256 month, uint256 year) external {
        require(amount > 0, ">0");
        require(month > 0 && month <= 12, "Invalid month");
        require(year >= 2023, "Year >= 2023");
        
        bool budgetExists = false;
        for (uint256 i = 0; i < budgets[msg.sender].length; i++) {
            if (keccak256(abi.encodePacked(budgets[msg.sender][i].category)) == keccak256(abi.encodePacked(category)) &&
                budgets[msg.sender][i].month == month &&
                budgets[msg.sender][i].year == year) {
                budgets[msg.sender][i].amount = amount;
                budgetExists = true;
                break;
            }
        }
        
        if (!budgetExists) {
            budgets[msg.sender].push(Budget({
                user: msg.sender,
                category: category,
                amount: amount,
                month: month,
                year: year
            }));
        }
        
        emit BudgetSet(msg.sender, category, amount, month, year);
    }

        function getBudgets() external view returns (Budget[] memory) {
        return budgets[msg.sender];
    }
}

contract SavingsGoals is FinanceCore {
    struct SavingsGoal {
        address user;
        string name;
        string description;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        bool completed;
    }

    mapping(address => SavingsGoal[]) public savingsGoals;

    event SavingsGoalCreated(address indexed user, string name, uint256 targetAmount, uint256 deadline);
    event SavingsGoalContributed(address indexed user, string name, uint256 amount);
    event SavingsGoalCompleted(address indexed user, string name);



}




