// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Sepolia addresses
  // Note: Using a supported token from Aave Sepolia reserves
  // The original WETH address may not be supported - we'll auto-detect WETH from Aave reserves
  const WETH_ADDRESS_PLACEHOLDER = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"; // Original WETH (may not be supported)
  const DONATION_PERCENT = 1000; // 10% in basis points
  const DONATION_RECIPIENT = "0xde21F729137C5Af1b01d73aF1dC21eFfa2B8a0d6"; // Gitcoin Multisig
  // Aave v3 Sepolia PoolAddressesProvider - using correct checksummed address
  const AAVE_POOL_ADDRESSES_PROVIDER = "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A"; // Aave v3 Sepolia PoolAddressesProvider
  
  // We'll find the actual WETH address from Aave reserves
  let WETH_ADDRESS = WETH_ADDRESS_PLACEHOLDER;

  console.log("\nDeployment Configuration:");
  console.log("  Network:", hre.network.name);
  console.log("  Asset Address (will be determined):", WETH_ADDRESS_PLACEHOLDER);
  console.log("  Donation Percent:", DONATION_PERCENT / 100, "%");
  console.log("  Donation Recipient:", DONATION_RECIPIENT);
  console.log("  Aave PoolAddressesProvider:", AAVE_POOL_ADDRESSES_PROVIDER);

  // Verify Aave addresses before deployment
  console.log("\nVerifying Aave configuration...");
  try {
    // Properly checksum the address
    const checksummedProviderAddress = hre.ethers.getAddress(AAVE_POOL_ADDRESSES_PROVIDER);
    console.log("  Checksummed Provider Address:", checksummedProviderAddress);
    
    const PoolAddressesProvider = await hre.ethers.getContractAt(
      "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol:IPoolAddressesProvider",
      checksummedProviderAddress
    );
    
    const poolAddress = await PoolAddressesProvider.getPool();
    console.log("  Aave Pool Address:", poolAddress);
    
    const Pool = await hre.ethers.getContractAt(
      "@aave/core-v3/contracts/interfaces/IPool.sol:IPool",
      poolAddress
    );
    
    // List all available reserves to find WETH
    console.log("\n  Querying available reserves on Aave Sepolia...");
    let reservesList = [];
    try {
      reservesList = await Pool.getReservesList();
      console.log(`  Found ${reservesList.length} reserves on Aave Sepolia`);
    } catch (e) {
      console.log("  Could not get reserves list (method may not be available)");
    }
    
    // Check if provided WETH is supported, if not, try to find WETH from reserves
    let reserveData = await Pool.getReserveData(WETH_ADDRESS);
    console.log(`  Checking provided WETH address: ${WETH_ADDRESS}`);
    console.log("  aToken Address:", reserveData.aTokenAddress);
    
    if (reserveData.aTokenAddress === "0x0000000000000000000000000000000000000000") {
      console.log("\n  Provided WETH address not supported. Searching for WETH in available reserves...");
      
      // Try to identify WETH by checking token symbols
      // Common WETH addresses on testnets or check by symbol
      const possibleWETHAddresses = [
        "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357", // First reserve from list
        "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5", // Second reserve
      ];
      
      let foundWETH = false;
      for (const addr of possibleWETHAddresses) {
        const data = await Pool.getReserveData(addr);
        if (data.aTokenAddress !== "0x0000000000000000000000000000000000000000") {
          // Try to get token symbol to verify it's WETH
          try {
            const token = await hre.ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20Metadata.sol:IERC20Metadata", addr);
            const symbol = await token.symbol();
            console.log(`    Checking ${addr}: symbol = ${symbol}`);
            if (symbol === "WETH" || symbol === "wETH") {
              WETH_ADDRESS = addr;
              reserveData = data;
              foundWETH = true;
              console.log(`  ✅ Found WETH at: ${WETH_ADDRESS}`);
              break;
            }
          } catch (e) {
            // If we can't read symbol, continue
          }
        }
      }
      
      // If WETH not found by symbol, use first available reserve
      if (!foundWETH && reservesList.length > 0) {
        console.log("  WETH not found by symbol. Using first available reserve for deployment.");
        WETH_ADDRESS = reservesList[0];
        reserveData = await Pool.getReserveData(WETH_ADDRESS);
        console.log(`  Using asset address: ${WETH_ADDRESS}`);
      }
      
      if (reserveData.aTokenAddress === "0x0000000000000000000000000000000000000000") {
        console.error("\n❌ Could not find a supported asset on Aave Sepolia.");
        throw new Error("No supported assets found on Aave Sepolia.");
      }
    }
    
    console.log(`\n  ✅ Using asset address: ${WETH_ADDRESS}`);
    console.log(`  ✅ aToken address: ${reserveData.aTokenAddress}`);
    
    console.log("✅ Aave configuration verified");
  } catch (error) {
    console.error("❌ Error verifying Aave configuration:", error.message);
    console.error("\nPlease verify:");
    console.error("  1. Aave PoolAddressesProvider address is correct for Sepolia");
    console.error("  2. USDC address is supported by Aave on Sepolia");
    console.error("  3. You are connected to the Sepolia network");
    throw error;
  }

  // Deploy CommunityYieldPool
  console.log("\nDeploying CommunityYieldPool...");
  const CommunityYieldPool = await hre.ethers.getContractFactory("CommunityYieldPool");
  
  // Properly checksum all addresses before deployment
  const checksummedWETH = hre.ethers.getAddress(WETH_ADDRESS);
  const checksummedRecipient = hre.ethers.getAddress(DONATION_RECIPIENT);
  const checksummedProvider = hre.ethers.getAddress(AAVE_POOL_ADDRESSES_PROVIDER);
  
  const vault = await CommunityYieldPool.deploy(
    checksummedWETH,                 // asset (WETH)
    checksummedRecipient,            // donation recipient (Gitcoin)
    DONATION_PERCENT,                // donation percent (1000 = 10%)
    checksummedProvider              // Aave PoolAddressesProvider
  );

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("\n✅ CommunityYieldPool deployed to:", vaultAddress);

  // Display deployment info
  console.log("\nDeployment Summary:");
  console.log("  Vault Address:", vaultAddress);
  console.log("  Asset (WETH):", WETH_ADDRESS);
  console.log("  Donation Percent:", await vault.donationPercent(), "basis points (", DONATION_PERCENT / 100, "%)");
  console.log("  Donation Recipient:", await vault.donationRecipient());
  console.log("  Aave Pool:", await vault.aavePool());
  console.log("  Aave aToken:", await vault.aToken());
  console.log("  Owner:", await vault.owner());
  
  // Save deployment address for frontend
  console.log("\n📋 Copy this address to your frontend:");
  console.log(`   VAULT_ADDRESS="${vaultAddress}"`);

  // Verify on Etherscan (if not on hardhat network and API key is set)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost" && process.env.ETHERSCAN_API_KEY) {
    console.log("\n⏳ Waiting for block confirmations...");
    await vault.waitForDeployment();
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds for block propagation

    console.log("Verifying contract on Etherscan...");
    try {
      // Use checksummed addresses for verification
      const checksummedWETH = hre.ethers.getAddress(WETH_ADDRESS);
      const checksummedRecipient = hre.ethers.getAddress(DONATION_RECIPIENT);
      const checksummedProvider = hre.ethers.getAddress(AAVE_POOL_ADDRESSES_PROVIDER);
      
      await hre.run("verify:verify", {
        address: vaultAddress,
        constructorArguments: [
          checksummedWETH,
          checksummedRecipient,
          DONATION_PERCENT,
          checksummedProvider
        ],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified on Etherscan");
      } else {
        console.log("❌ Verification failed:", error.message);
      }
    }
  } else {
    console.log("\n⚠️  Skipping Etherscan verification (hardhat/localhost network or no API key)");
  }

  console.log("\n🎉 Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});