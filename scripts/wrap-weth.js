// scripts/wrap-weth.js
const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Wrapping ETH to WETH with account:", signer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), "ETH");

  // WETH address on Sepolia
  const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
  const WRAP_AMOUNT = hre.ethers.parseEther("0.1"); // 0.1 ETH

  // WETH ABI (minimal - just deposit and balanceOf)
  const WETH_ABI = [
    "function deposit() payable",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const weth = new hre.ethers.Contract(WETH_ADDRESS, WETH_ABI, signer);

  // Check current WETH balance
  const balanceBefore = await weth.balanceOf(signer.address);
  console.log("\nWETH balance before:", hre.ethers.formatEther(balanceBefore), "WETH");

  // Wrap ETH to WETH
  console.log(`\nWrapping ${hre.ethers.formatEther(WRAP_AMOUNT)} ETH to WETH...`);
  const tx = await weth.deposit({ value: WRAP_AMOUNT });
  console.log("Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ Transaction confirmed!");

  // Check WETH balance after
  const balanceAfter = await weth.balanceOf(signer.address);
  console.log("WETH balance after:", hre.ethers.formatEther(balanceAfter), "WETH");
  console.log("WETH received:", hre.ethers.formatEther(balanceAfter - balanceBefore), "WETH");

  console.log("\n✅ WETH wrapping complete!");
  console.log("You can now deposit WETH to the CommunityYieldPool vault.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

