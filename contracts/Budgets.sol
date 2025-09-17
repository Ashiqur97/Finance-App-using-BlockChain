// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FinanceCore.sol";

contract Budgets is FinanceCore {
    struct Budget {
        address user;
        string category;
        uint256 amount;
        uint256 month;
        uint256 year;
    }
    
    mapping(address => Budget[]) public budgets;
    
    event BudgetSet(address indexed user, string category, uint256 amount, uint256 month, uint256 year);
    
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