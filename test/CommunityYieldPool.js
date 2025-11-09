const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("CommunityYieldPool", function () {
  // Fixture to deploy contracts and set up test environment
  async function deployCommunityYieldPoolFixture() {
    const [owner, user1, user2, donationRecipient] = await ethers.getSigners();

    // Deploy mock WETH token (18 decimals)
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockWETH = await MockERC20.deploy("Mock WETH", "mWETH");

    // Deploy mock Aave Pool and aToken
    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    const mockAavePool = await MockAavePool.deploy();

    const MockAToken = await ethers.getContractFactory("MockAToken");
    const mockAToken = await MockAToken.deploy(await mockWETH.getAddress(), await mockAavePool.getAddress());

    // Set up Aave Pool with reserve data
    await mockAavePool.setReserveData(await mockWETH.getAddress(), await mockAToken.getAddress());

    // Deploy mock PoolAddressesProvider
    // For testing, we'll use a simple contract that returns the mock pool
    const MockPoolAddressesProvider = await ethers.getContractFactory("MockPoolAddressesProvider");
    const mockProvider = await MockPoolAddressesProvider.deploy(await mockAavePool.getAddress());

    // Deploy CommunityYieldPool with 10% donation (1000 basis points)
    const donationPercent = 1000; // 10%
    const CommunityYieldPool = await ethers.getContractFactory("CommunityYieldPool");
    const vault = await CommunityYieldPool.deploy(
      await mockWETH.getAddress(),
      donationRecipient.address,
      donationPercent,
      await mockProvider.getAddress() // Aave PoolAddressesProvider
    );

    // Mint tokens to users for testing (WETH uses 18 decimals)
    const depositAmount = ethers.parseEther("10"); // 10 WETH
    await mockWETH.mint(user1.address, depositAmount);
    await mockWETH.mint(user2.address, depositAmount);
    await mockWETH.mint(owner.address, depositAmount);

    return {
      vault,
      mockWETH,
      mockAavePool,
      mockAToken,
      owner,
      user1,
      user2,
      donationRecipient,
      donationPercent,
      depositAmount,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct donation recipient", async function () {
      const { vault, donationRecipient } = await loadFixture(deployCommunityYieldPoolFixture);
      expect(await vault.donationRecipient()).to.equal(donationRecipient.address);
    });

    it("Should set the correct donation percentage", async function () {
      const { vault, donationPercent } = await loadFixture(deployCommunityYieldPoolFixture);
      expect(await vault.donationPercent()).to.equal(donationPercent);
    });

    it("Should set the correct owner", async function () {
      const { vault, owner } = await loadFixture(deployCommunityYieldPoolFixture);
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should have correct asset address", async function () {
      const { vault, mockWETH } = await loadFixture(deployCommunityYieldPoolFixture);
      expect(await vault.asset()).to.equal(await mockWETH.getAddress());
    });
  });

  describe("Deposit", function () {
    it("Should allow users to deposit assets", async function () {
      const { vault, mockWETH, user1, depositAmount } = await loadFixture(
        deployCommunityYieldPoolFixture
      );

      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);

      expect(await vault.balanceOf(user1.address)).to.be.gt(0);
    });

    it("Should mint shares on deposit", async function () {
      const { vault, mockWETH, user1, depositAmount } = await loadFixture(
        deployCommunityYieldPoolFixture
      );

      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount);
      const tx = await vault.connect(user1).deposit(depositAmount, user1.address);
      const receipt = await tx.wait();

      const shares = await vault.balanceOf(user1.address);
      expect(shares).to.be.gt(0);
      expect(shares).to.equal(depositAmount); // 1:1 ratio initially
    });

    it("Should emit Deposit event", async function () {
      const { vault, mockWETH, user1, depositAmount } = await loadFixture(
        deployCommunityYieldPoolFixture
      );

      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount);

      await expect(vault.connect(user1).deposit(depositAmount, user1.address))
        .to.emit(vault, "Deposit")
        .withArgs(user1.address, user1.address, depositAmount, anyValue);
    });
  });

  describe("Withdraw", function () {
    it("Should allow users to withdraw assets", async function () {
      const { vault, mockWETH, user1, depositAmount } = await loadFixture(
        deployCommunityYieldPoolFixture
      );

      // Deposit first
      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);

      const withdrawAmount = depositAmount / 2n;

      // Withdraw
      await vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address);

      expect(await mockWETH.balanceOf(user1.address)).to.be.gt(0);
    });

    it("Should emit Withdraw event", async function () {
      const { vault, mockWETH, user1, depositAmount } = await loadFixture(
        deployCommunityYieldPoolFixture
      );

      // Deposit first
      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);

      const withdrawAmount = depositAmount / 2n;

      await expect(
        vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address)
      )
        .to.emit(vault, "Withdraw")
        .withArgs(user1.address, user1.address, user1.address, withdrawAmount, anyValue);
    });
  });

  describe("Donation Transfer", function () {
    it("Should donate yield when deposit is made", async function () {
      const { vault, mockWETH, mockAavePool, user1, donationRecipient, owner, depositAmount } = await loadFixture(
        deployCommunityYieldPoolFixture
      );

      // First deposit to establish baseline
      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);

      // Simulate yield by minting tokens directly to vault (simulating Aave returns)
      const yieldAmount = ethers.parseEther("0.1"); // 0.1 WETH yield
      await mockWETH.mint(await vault.getAddress(), yieldAmount);

      // Manually trigger harvest to update lastTotalAssets
      await vault.connect(owner).harvest();

      // Second deposit to trigger another harvest
      const depositAmount2 = ethers.parseEther("1");
      await mockWETH.mint(user1.address, depositAmount2);
      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount2);

      // Add more yield before second deposit
      const yieldAmount2 = ethers.parseEther("0.05");
      await mockWETH.mint(await vault.getAddress(), yieldAmount2);

      const recipientBalanceBefore = await mockWETH.balanceOf(donationRecipient.address);
      await vault.connect(user1).deposit(depositAmount2, user1.address);
      const recipientBalanceAfter = await mockWETH.balanceOf(donationRecipient.address);

      // Should have donated 10% of the new yield (0.05 WETH * 10% = 0.005 WETH)
      const expectedDonation = (yieldAmount2 * 1000n) / 10000n;
      const actualDonation = recipientBalanceAfter - recipientBalanceBefore;
      expect(actualDonation).to.be.gte(expectedDonation);
    });

    it("Should emit YieldDonated event when donation occurs", async function () {
      const { vault, mockWETH, user1, donationRecipient, owner, depositAmount } = await loadFixture(
        deployCommunityYieldPoolFixture
      );

      // First deposit
      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);

      // Simulate yield
      const yieldAmount = ethers.parseEther("0.1");
      await mockWETH.mint(await vault.getAddress(), yieldAmount);

      // Manually harvest
      await vault.connect(owner).harvest();

      // Add more yield
      const yieldAmount2 = ethers.parseEther("0.05");
      await mockWETH.mint(await vault.getAddress(), yieldAmount2);

      // Second deposit
      const depositAmount2 = ethers.parseEther("1");
      await mockWETH.mint(user1.address, depositAmount2);
      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount2);

      await expect(vault.connect(user1).deposit(depositAmount2, user1.address))
        .to.emit(vault, "YieldDonated")
        .withArgs(anyValue, donationRecipient.address);
    });
  });

  describe("Edge Cases - Zero Donation", function () {
    it("Should not donate when donation percent is zero", async function () {
      const [owner, user1, donationRecipient] = await ethers.getSigners();
      
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const mockWETH = await MockERC20.deploy("Mock WETH", "mWETH");

      const MockAavePool = await ethers.getContractFactory("MockAavePool");
      const mockAavePool = await MockAavePool.deploy();

      const MockAToken = await ethers.getContractFactory("MockAToken");
      const mockAToken = await MockAToken.deploy(await mockWETH.getAddress(), await mockAavePool.getAddress());
      await mockAavePool.setReserveData(await mockWETH.getAddress(), await mockAToken.getAddress());

      const MockPoolAddressesProvider = await ethers.getContractFactory("MockPoolAddressesProvider");
      const mockProvider = await MockPoolAddressesProvider.deploy(await mockAavePool.getAddress());

      const CommunityYieldPool = await ethers.getContractFactory("CommunityYieldPool");
      const vault = await CommunityYieldPool.deploy(
        await mockWETH.getAddress(),
        donationRecipient.address,
        0, // 0% donation
        await mockProvider.getAddress()
      );

      const depositAmount = ethers.parseEther("10");
      await mockWETH.mint(user1.address, depositAmount);
      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);

      // Simulate yield
      const yieldAmount = ethers.parseEther("0.1");
      await mockWETH.mint(await vault.getAddress(), yieldAmount);

      // Second deposit
      const depositAmount2 = ethers.parseEther("1");
      await mockWETH.mint(user1.address, depositAmount2);
      await mockWETH.connect(user1).approve(await vault.getAddress(), depositAmount2);

      const recipientBalanceBefore = await mockWETH.balanceOf(donationRecipient.address);
      await vault.connect(user1).deposit(depositAmount2, user1.address);
      const recipientBalanceAfter = await mockWETH.balanceOf(donationRecipient.address);

      // Should not have donated anything
      expect(recipientBalanceAfter).to.equal(recipientBalanceBefore);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to set donation percent", async function () {
      const { vault, owner } = await loadFixture(deployCommunityYieldPoolFixture);

      const newPercent = 2000; // 20%
      await vault.connect(owner).setDonationPercent(newPercent);

      expect(await vault.donationPercent()).to.equal(newPercent);
    });

    it("Should emit DonationPercentUpdated event", async function () {
      const { vault, owner } = await loadFixture(deployCommunityYieldPoolFixture);

      const oldPercent = await vault.donationPercent();
      const newPercent = 2000;

      await expect(vault.connect(owner).setDonationPercent(newPercent))
        .to.emit(vault, "DonationPercentUpdated")
        .withArgs(oldPercent, newPercent);
    });

    it("Should allow owner to set donation recipient", async function () {
      const { vault, owner, user1 } = await loadFixture(deployCommunityYieldPoolFixture);

      await vault.connect(owner).setDonationRecipient(user1.address);

      expect(await vault.donationRecipient()).to.equal(user1.address);
    });
  });
});
