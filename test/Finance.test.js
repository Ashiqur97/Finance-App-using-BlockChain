const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Finance", function () {
  let Finance;
  let finance;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    Finance = await ethers.getContractFactory("Finance");
    finance = await Finance.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await finance.owner()).to.equal(owner.address);
    });
  });

  describe("Core Functions", function () {
    it("Should deposit ETH", async function () {
      await finance.connect(addr1).deposit({ value: ethers.parseEther("1") });
      expect(await finance.connect(addr1).getBalance()).to.equal(ethers.parseEther("1"));
    });

    it("Should withdraw ETH", async function () {
      await finance.connect(addr1).deposit({ value: ethers.parseEther("1") });
      await finance.connect(addr1).withdraw(ethers.parseEther("0.5")); // Fixed: removed extra }
      expect(await finance.connect(addr1).getBalance()).to.equal(ethers.parseEther("0.5"));
    });

    it("Should fail to withdraw more than balance", async function () {
      await finance.connect(addr1).deposit({ value: ethers.parseEther("1") });
      await expect(finance.connect(addr1).withdraw(ethers.parseEther("2"))).to.be.revertedWith("Insufficient");
    });
  });

  describe("Transactions", function () {
    it("Should record transactions", async function () {
      await finance.connect(addr1).deposit({ value: ethers.parseEther("1") });
      await finance.connect(addr1).withdraw(ethers.parseEther("0.5")); // Fixed: removed extra }
      
      const transactions = await finance.connect(addr1).getTransactions();
      expect(transactions.length).to.equal(2);
      expect(transactions[0].transactionType).to.equal("Deposit");
      expect(transactions[1].transactionType).to.equal("Withdrawal");
    });
  });

  describe("Loans", function () {
    it("Should take a loan", async function () {
      await finance.connect(addr1).takeLoan(ethers.parseEther("1"), 10, 365);
      const loans = await finance.connect(addr1).getLoans();
      expect(loans.length).to.equal(1);
      expect(loans[0].amount).to.equal(ethers.parseEther("1"));
      expect(loans[0].interestRate).to.equal(10);
      expect(loans[0].duration).to.equal(365);
      expect(loans[0].active).to.equal(true);
      expect(loans[0].repaid).to.equal(false);
    });

    it("Should repay a loan", async function () {
      await finance.connect(addr1).takeLoan(ethers.parseEther("1"), 10, 365);
      const repaymentAmount = ethers.parseEther("1.1"); // 1 ETH + 10% interest
      await finance.connect(addr1).repayLoan(0, { value: repaymentAmount });
      const loans = await finance.connect(addr1).getLoans();
      expect(loans[0].active).to.equal(false);
      expect(loans[0].repaid).to.equal(true);
    });
  });

  describe("Investments", function () {
    it("Should make an investment", async function () {
      await finance.connect(addr1).makeInvestment("Stocks", { value: ethers.parseEther("1") });
      const investments = await finance.connect(addr1).getInvestments();
      expect(investments.length).to.equal(1);
      expect(investments[0].amount).to.equal(ethers.parseEther("1"));
      expect(investments[0].investmentType).to.equal("Stocks");
      expect(investments[0].active).to.equal(true);
    });

    it("Should withdraw an investment", async function () {
      await finance.connect(addr1).makeInvestment("Stocks", { value: ethers.parseEther("1") });
      await finance.connect(addr1).withdrawInvestment(0);
      const investments = await finance.connect(addr1).getInvestments();
      expect(investments[0].active).to.equal(false);
      expect(await finance.connect(addr1).getBalance()).to.equal(ethers.parseEther("1.1"));
    });
  });

  describe("Expenses", function () {
    it("Should add an expense", async function () {
      await finance.connect(addr1).addExpense("Food", "Lunch", { value: ethers.parseEther("0.1") });
      const expenses = await finance.connect(addr1).getExpenses();
      expect(expenses.length).to.equal(1);
      expect(expenses[0].amount).to.equal(ethers.parseEther("0.1"));
      expect(expenses[0].category).to.equal("Food");
      expect(expenses[0].description).to.equal("Lunch");
    });
  });

  describe("Budgets", function () {
    it("Should set a budget", async function () {
      await finance.connect(addr1).setBudget("Food", ethers.parseEther("1"), 6, 2023);
      const budgets = await finance.connect(addr1).getBudgets();
      expect(budgets.length).to.equal(1);
      expect(budgets[0].category).to.equal("Food");
      expect(budgets[0].amount).to.equal(ethers.parseEther("1"));
      expect(budgets[0].month).to.equal(6);
      expect(budgets[0].year).to.equal(2023);
    });

    it("Should update an existing budget", async function () {
      await finance.connect(addr1).setBudget("Food", ethers.parseEther("1"), 6, 2023);
      await finance.connect(addr1).setBudget("Food", ethers.parseEther("2"), 6, 2023);
      const budgets = await finance.connect(addr1).getBudgets();
      expect(budgets.length).to.equal(1);
      expect(budgets[0].amount).to.equal(ethers.parseEther("2"));
    });
  });

  describe("Savings Goals", function () {
    it("Should create a savings goal", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      await finance.connect(addr1).createSavingsGoal("Car", "Save for a car", ethers.parseEther("10"), deadline);
      const goals = await finance.connect(addr1).getSavingsGoals();
      expect(goals.length).to.equal(1);
      expect(goals[0].name).to.equal("Car");
      expect(goals[0].targetAmount).to.equal(ethers.parseEther("10"));
      expect(goals[0].currentAmount).to.equal(0);
      expect(goals[0].deadline).to.equal(deadline);
      expect(goals[0].completed).to.equal(false);
    });

    it("Should contribute to a savings goal", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      await finance.connect(addr1).createSavingsGoal("Car", "Save for a car", ethers.parseEther("10"), deadline);
      await finance.connect(addr1).contributeToSavingsGoal(0, { value: ethers.parseEther("5") });
      const goals = await finance.connect(addr1).getSavingsGoals();
      expect(goals[0].currentAmount).to.equal(ethers.parseEther("5"));
      expect(goals[0].completed).to.equal(false);
    });

    it("Should complete a savings goal when target is reached", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      await finance.connect(addr1).createSavingsGoal("Car", "Save for a car", ethers.parseEther("10"), deadline);
      await finance.connect(addr1).contributeToSavingsGoal(0, { value: ethers.parseEther("10") });
      const goals = await finance.connect(addr1).getSavingsGoals();
      expect(goals[0].completed).to.equal(true);
    });
  });
});