// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FinanceCore.sol";

contract Expenses is FinanceCore {
    struct Expense {
        address user;
        uint256 amount;
        string category;
        uint256 timestamp;
        string description;
    }
    
    mapping(address => Expense[]) public expenses;
    
    event ExpenseAdded(address indexed user, uint256 amount, string category, string description);
    
    function addExpense(string memory category, string memory description) external payable {
        require(msg.value > 0, ">0");
        
        expenses[msg.sender].push(Expense({
            user: msg.sender,
            amount: msg.value,
            category: category,
            timestamp: block.timestamp,
            description: description
        }));
        
        transactions[msg.sender].push(Transaction({
            user: msg.sender,
            amount: msg.value,
            transactionType: "Expense",
            timestamp: block.timestamp,
            details: string(abi.encodePacked(category, ": ", description))
        }));
        
        emit ExpenseAdded(msg.sender, msg.value, category, description);
    }
    
    function getExpenses() external view returns (Expense[] memory) {
        return expenses[msg.sender];
    }
}