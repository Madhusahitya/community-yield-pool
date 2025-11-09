// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockPoolAddressesProvider
 * @notice Mock Aave PoolAddressesProvider for testing
 */
contract MockPoolAddressesProvider {
    address public immutable pool;

    constructor(address _pool) {
        pool = _pool;
    }

    function getPool() external view returns (address) {
        return pool;
    }
}

