// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FinanceCore.sol";

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
    
    mapping(address => Loan[]) public loans;
    
    event LoanTaken(address indexed borrower, uint256 amount, uint256 interestRate, uint256 duration);
    event LoanRepaid(address indexed borrower, uint256 amount);
    
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
        
        transactions[msg.sender].push(Transaction({
            user: msg.sender,
            amount: amount,
            transactionType: "Loan",
            timestamp: block.timestamp,
            details: "Loan taken"
        }));
        
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
        
        transactions[msg.sender].push(Transaction({
            user: msg.sender,
            amount: repaymentAmount,
            transactionType: "Loan Repayment",
            timestamp: block.timestamp,
            details: "Loan repaid"
        }));
        
        emit LoanRepaid(msg.sender, repaymentAmount);
    }
    
    function getLoans() external view returns (Loan[] memory) {
        return loans[msg.sender];
    }
}