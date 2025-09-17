// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FinanceCore.sol";

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
    
    function createSavingsGoal(string memory name, string memory description, uint256 targetAmount, uint256 deadline) external {
        require(targetAmount > 0, ">0");
        require(deadline > block.timestamp, "Future");
        
        savingsGoals[msg.sender].push(SavingsGoal({
            user: msg.sender,
            name: name,
            description: description,
            targetAmount: targetAmount,
            currentAmount: 0,
            deadline: deadline,
            completed: false
        }));
        
        emit SavingsGoalCreated(msg.sender, name, targetAmount, deadline);
    }
    
    function contributeToSavingsGoal(uint256 goalIndex) external payable {
        require(goalIndex < savingsGoals[msg.sender].length, "Invalid");
        require(msg.value > 0, ">0");
        
        SavingsGoal storage goal = savingsGoals[msg.sender][goalIndex];
        require(!goal.completed, "Completed");
        require(block.timestamp <= goal.deadline, "Expired");
        
        goal.currentAmount += msg.value;
        
        transactions[msg.sender].push(Transaction({
            user: msg.sender,
            amount: msg.value,
            transactionType: "Savings",
            timestamp: block.timestamp,
            details: string(abi.encodePacked("Contribution to savings goal: ", goal.name))
        }));
        
        if (goal.currentAmount >= goal.targetAmount) {
            goal.completed = true;
            emit SavingsGoalCompleted(msg.sender, goal.name);
        }
        
        emit SavingsGoalContributed(msg.sender, goal.name, msg.value);
    }
    
    function getSavingsGoals() external view returns (SavingsGoal[] memory) {
        return savingsGoals[msg.sender];
    }
}