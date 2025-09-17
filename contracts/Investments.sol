// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FinanceCore.sol";

contract Investments is FinanceCore {
    struct Investment {
        address investor;
        uint256 amount;
        string investmentType;
        uint256 startTime;
        bool active;
    }
    
    mapping(address => Investment[]) public investments;
    
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
        
        transactions[msg.sender].push(Transaction({
            user: msg.sender,
            amount: msg.value,
            transactionType: "Investment",
            timestamp: block.timestamp,
            details: string(abi.encodePacked("Investment in ", investmentType))
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
        
        transactions[msg.sender].push(Transaction({
            user: msg.sender,
            amount: returnAmount,
            transactionType: "Investment Return",
            timestamp: block.timestamp,
            details: string(abi.encodePacked("Return from ", investment.investmentType))
        }));
        
        emit InvestmentWithdrawn(msg.sender, returnAmount, investment.investmentType);
    }
    
    function getInvestments() external view returns (Investment[] memory) {
        return investments[msg.sender];
    }
}