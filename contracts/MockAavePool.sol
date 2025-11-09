// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockAavePool
 * @notice Mock Aave Pool for testing purposes
 */
contract MockAavePool {
    struct ReserveData {
        address aTokenAddress;
        uint128 liquidityIndex;
    }

    mapping(address => ReserveData) public reserves;
    mapping(address => address) public aTokens; // asset => aToken
    mapping(address => uint256) public liquidityIndices; // asset => liquidityIndex (1e27)

    address public owner;

    constructor() {
        owner = msg.sender;
        // Initialize liquidity index at 1e27 (1.0)
        liquidityIndices[address(0)] = 1e27;
    }

    function setReserveData(address asset, address aToken) external {
        require(msg.sender == owner, "Only owner");
        reserves[asset] = ReserveData({
            aTokenAddress: aToken,
            liquidityIndex: uint128(1e27) // Start at 1.0
        });
        aTokens[asset] = aToken;
        liquidityIndices[asset] = 1e27;
    }

    function getReserveData(address asset) external view returns (ReserveData memory) {
        return reserves[asset];
    }

    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external {
        // Transfer asset from caller
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        
        // Mint aToken to onBehalfOf (simplified - in real Aave, this uses scaled balances)
        address aToken = aTokens[asset];
        if (aToken != address(0)) {
            // For testing, we'll just transfer the aToken 1:1
            // In production, Aave uses scaled balances with liquidity index
            IERC20(aToken).transfer(onBehalfOf, amount);
        }
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        address aToken = aTokens[asset];
        require(aToken != address(0), "Asset not supported");
        
        // Burn aToken from caller
        IERC20(aToken).transferFrom(msg.sender, address(this), amount);
        
        // Transfer underlying asset
        IERC20(asset).transfer(to, amount);
        
        return amount;
    }

    // Simulate yield by increasing liquidity index
    function accrueYield(address asset, uint256 yieldAmount) external {
        require(msg.sender == owner, "Only owner");
        // Increase liquidity index to simulate yield
        // This is simplified - real Aave uses more complex calculations
        uint256 currentIndex = liquidityIndices[asset];
        if (currentIndex == 0) currentIndex = 1e27;
        
        // Increase index by yield percentage (simplified)
        liquidityIndices[asset] = currentIndex + (yieldAmount * 1e27) / 1000000; // Small increment
        reserves[asset].liquidityIndex = uint128(liquidityIndices[asset]);
    }
}

