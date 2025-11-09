// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockAToken
 * @notice Mock Aave aToken for testing purposes
 */
contract MockAToken is ERC20 {
    IERC20 public underlying;
    address public pool;

    constructor(address _underlying, address _pool) ERC20("Mock aToken", "maToken") {
        underlying = IERC20(_underlying);
        pool = _pool;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == pool, "Only pool");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == pool, "Only pool");
        _burn(from, amount);
    }

    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }
}

