// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FinanceCore is Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {}
    
    mapping(address => uint256) public balances;
    
    struct Transaction {
        address user;
        uint256 amount;
        string transactionType;
        uint256 timestamp;
        string details;
    }
    
    mapping(address => Transaction[]) public transactions;
    
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    
    function deposit() external payable {
        require(msg.value > 0, ">0");
        balances[msg.sender] += msg.value;
        
        transactions[msg.sender].push(Transaction({
            user: msg.sender,
            amount: msg.value,
            transactionType: "Deposit",
            timestamp: block.timestamp,
            details: "ETH deposit"
        }));
        
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
    
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient");
        require(amount > 0, ">0");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        
        transactions[msg.sender].push(Transaction({
            user: msg.sender,
            amount: amount,
            transactionType: "Withdrawal",
            timestamp: block.timestamp,
            details: "ETH withdrawal"
        }));
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
    
    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
    
    function getTransactions() external view returns (Transaction[] memory) {
        return transactions[msg.sender];
    }
}
