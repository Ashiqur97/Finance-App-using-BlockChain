// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FinanceCore.sol";
import "./Loans.sol";
import "./Investments.sol";
import "./Expenses.sol";
import "./Budgets.sol";
import "./SavingsGoals.sol";

contract Finance is FinanceCore, Loans, Investments, Expenses, Budgets, SavingsGoals {
    constructor() FinanceCore() {}
}
