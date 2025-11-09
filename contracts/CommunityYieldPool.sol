// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IAToken} from "@aave/core-v3/contracts/interfaces/IAToken.sol";

/**
 * @title CommunityYieldPool
 * @notice ERC-4626 vault that automatically donates a percentage of generated yield to public goods
 * @dev This vault implements yield donation mechanics compatible with Octant v2 protocol
 * 
 * OCTANT V2 COMPATIBILITY:
 * This vault is designed to work with Octant v2's yield donation infrastructure:
 * - The vault generates yield through Aave v3 lending protocol
 * - Assets are automatically deposited to Aave to earn interest
 * - A configurable percentage of generated yield is automatically donated to public goods
 * - The donation recipient can be set to Octant v2's donation pool or any public goods address
 * - YieldDonated events can be tracked by Octant v2's indexing system to measure impact
 * - The vault maintains ERC-4626 standard compliance, making it compatible with DeFi protocols
 *   that integrate with Octant v2's yield donation ecosystem
 * 
 * To integrate with Octant v2:
 * 1. Set the donation recipient to Octant v2's donation pool address
 * 2. The vault will automatically donate yield on each deposit/withdraw operation
 * 3. Octant v2 can track donations via YieldDonated events
 * 4. Users can see their contribution to public goods through the vault's yield generation
 */
contract CommunityYieldPool is ERC4626, Ownable {
    /// @notice Percentage of yield to donate (in basis points, e.g., 1000 = 10%)
    uint256 public donationPercent; // Stored in basis points (10000 = 100%)
    
    /// @notice Address that receives the donated yield
    address public donationRecipient;
    
    /// @notice Total amount of yield donated to public goods (cumulative)
    uint256 public totalDonated;
    
    /// @notice Aave Pool contract
    IPool public immutable aavePool;
    
    /// @notice Aave aToken for the underlying asset
    IAToken public immutable aToken;
    
    /// @notice Tracks the last known total assets for yield calculation
    uint256 private lastTotalAssets;
    
    /// @notice Event emitted when yield is donated
    /// @param amount The amount of yield donated
    /// @param recipient The address receiving the donation
    event YieldDonated(uint256 amount, address recipient);
    
    /// @notice Event emitted when donation percentage is updated
    /// @param oldPercent Previous donation percentage (basis points)
    /// @param newPercent New donation percentage (basis points)
    event DonationPercentUpdated(uint256 oldPercent, uint256 newPercent);
    
    /// @notice Event emitted when donation recipient is updated
    /// @param oldRecipient Previous donation recipient
    /// @param newRecipient New donation recipient
    event DonationRecipientUpdated(address oldRecipient, address newRecipient);
    
    /**
     * @notice Constructor initializes the ERC-4626 vault with Aave integration
     * @param asset The underlying ERC20 token (USDC)
     * @param _donationRecipient Initial address to receive donations (e.g., Gitcoin multisig)
     * @param _donationPercent Initial donation percentage in basis points (e.g., 1000 = 10%)
     * @param _poolAddressesProvider Aave PoolAddressesProvider address
     */
    constructor(
        IERC20 asset,
        address _donationRecipient,
        uint256 _donationPercent,
        address _poolAddressesProvider
    ) ERC4626(asset) ERC20("Community Yield Pool", "CYP") Ownable(msg.sender) {
        require(_donationRecipient != address(0), "Invalid donation recipient");
        require(_donationPercent <= 10000, "Donation percent cannot exceed 100%");
        require(_poolAddressesProvider != address(0), "Invalid pool addresses provider");
        
        donationRecipient = _donationRecipient;
        donationPercent = _donationPercent;
        lastTotalAssets = 0;
        
        // Initialize Aave Pool
        IPoolAddressesProvider addressesProvider = IPoolAddressesProvider(_poolAddressesProvider);
        aavePool = IPool(addressesProvider.getPool());
        
        // Get the aToken address for the underlying asset
        address aTokenAddress = aavePool.getReserveData(address(asset)).aTokenAddress;
        require(aTokenAddress != address(0), "Invalid aToken address");
        aToken = IAToken(aTokenAddress);
        
        // Approve Aave Pool to spend underlying asset
        asset.approve(address(aavePool), type(uint256).max);
    }
    
    /**
     * @notice Override totalAssets to include Aave yield accrual
     * @dev Returns the total amount of underlying assets managed by the vault
     * This includes assets deposited in Aave (aToken balance converted to underlying) plus any idle assets
     * @return The total amount of underlying assets managed by the vault
     */
    function totalAssets() public view virtual override returns (uint256) {
        // Get idle assets in the vault
        uint256 idleAssets = IERC20(asset()).balanceOf(address(this));
        
        // Get assets deposited in Aave (convert aToken scaled balance to underlying)
        uint256 aTokenBalance = aToken.balanceOf(address(this));
        uint256 aaveAssets = 0;
        
        if (aTokenBalance > 0) {
            // In Aave v3, aToken.balanceOf() returns the scaled balance
            // We need to convert it to underlying using the liquidity index
            // Formula: underlying = scaledBalance * liquidityIndex / 1e27
            address assetAddress = address(asset());
            uint256 liquidityIndex = aavePool.getReserveData(assetAddress).liquidityIndex;
            // liquidityIndex is in ray (1e27), so we divide by 1e27
            aaveAssets = (aTokenBalance * liquidityIndex) / 1e27;
        }
        
        return idleAssets + aaveAssets;
    }
    
    /**
     * @notice Override deposit to harvest and donate yield, then deposit to Aave
     * @param assets The amount of assets to deposit
     * @param receiver The address to receive the shares
     * @return shares The amount of shares minted
     */
    function deposit(uint256 assets, address receiver) public virtual override returns (uint256 shares) {
        // Harvest yield before deposit
        _harvestAndDonate();
        
        // Call parent deposit which will transfer assets to vault
        shares = super.deposit(assets, receiver);
        
        // Deposit idle assets to Aave
        _accrueYield();
        
        return shares;
    }
    
    /**
     * @notice Override withdraw to harvest and donate yield, withdraw from Aave if needed
     * @param assets The amount of assets to withdraw
     * @param receiver The address to receive the assets
     * @param owner The owner of the shares
     * @return shares The amount of shares burned
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public virtual override returns (uint256 shares) {
        // Harvest yield before withdrawal
        _harvestAndDonate();
        
        // Ensure we have enough assets by withdrawing from Aave if needed
        uint256 idleAssets = IERC20(asset()).balanceOf(address(this));
        if (idleAssets < assets) {
            uint256 needed = assets - idleAssets;
            _withdrawFromAave(needed);
        }
        
        return super.withdraw(assets, receiver, owner);
    }
    
    /**
     * @notice Override redeem to harvest and donate yield, withdraw from Aave if needed
     * @param shares The amount of shares to redeem
     * @param receiver The address to receive the assets
     * @param owner The owner of the shares
     * @return assets The amount of assets withdrawn
     */
    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) public virtual override returns (uint256 assets) {
        // Harvest yield before redemption
        _harvestAndDonate();
        
        // Calculate assets needed
        assets = convertToAssets(shares);
        
        // Ensure we have enough assets by withdrawing from Aave if needed
        uint256 idleAssets = IERC20(asset()).balanceOf(address(this));
        if (idleAssets < assets) {
            uint256 needed = assets - idleAssets;
            _withdrawFromAave(needed);
        }
        
        return super.redeem(shares, receiver, owner);
    }
    
    /**
     * @notice Internal function to deposit idle assets to Aave to earn yield
     * @dev Deposits any idle assets in the vault to Aave Pool
     */
    function _accrueYield() internal {
        uint256 idleAssets = IERC20(asset()).balanceOf(address(this));
        
        if (idleAssets > 0) {
            // Deposit to Aave Pool
            aavePool.supply(address(asset()), idleAssets, address(this), 0);
        }
    }
    
    /**
     * @notice Internal function to withdraw assets from Aave
     * @param amount The amount of underlying assets to withdraw
     */
    function _withdrawFromAave(uint256 amount) internal {
        uint256 aTokenBalance = aToken.balanceOf(address(this));
        
        if (aTokenBalance > 0) {
            // Withdraw from Aave Pool (withdraws underlying asset)
            aavePool.withdraw(address(asset()), amount, address(this));
        }
    }
    
    /**
     * @notice Internal function to harvest yield and donate the configured percentage
     * @dev Calculates yield generated since last harvest from Aave and donates the configured percentage
     */
    function _harvestAndDonate() internal {
        uint256 currentTotalAssets = totalAssets();
        
        // Calculate yield generated since last harvest
        uint256 yieldGenerated = 0;
        if (lastTotalAssets > 0 && currentTotalAssets > lastTotalAssets) {
            yieldGenerated = currentTotalAssets - lastTotalAssets;
        }
        
        // Donate the configured percentage of yield
        if (yieldGenerated > 0 && donationPercent > 0) {
            uint256 donationAmount = (yieldGenerated * donationPercent) / 10000;
            
            if (donationAmount > 0 && donationRecipient != address(0)) {
                // Ensure we have enough idle assets, withdraw from Aave if needed
                uint256 idleAssets = IERC20(asset()).balanceOf(address(this));
                if (idleAssets < donationAmount) {
                    uint256 needed = donationAmount - idleAssets;
                    _withdrawFromAave(needed);
                }
                
                // Transfer donation to recipient
                IERC20(asset()).transfer(donationRecipient, donationAmount);
                
                // Update total donated tracker
                totalDonated += donationAmount;
                
                // Emit event for tracking
                emit YieldDonated(donationAmount, donationRecipient);
            }
        }
        
        // Update last known total assets for next harvest
        lastTotalAssets = currentTotalAssets;
    }
    
    /**
     * @notice Set the donation percentage (only owner)
     * @param _donationPercent New donation percentage in basis points (e.g., 1000 = 10%)
     */
    function setDonationPercent(uint256 _donationPercent) external onlyOwner {
        require(_donationPercent <= 10000, "Donation percent cannot exceed 100%");
        
        uint256 oldPercent = donationPercent;
        donationPercent = _donationPercent;
        
        emit DonationPercentUpdated(oldPercent, _donationPercent);
    }
    
    /**
     * @notice Set the donation recipient address (only owner)
     * @param _donationRecipient New address to receive donations
     * @dev Can be set to Octant v2 donation pool or any public goods address
     */
    function setDonationRecipient(address _donationRecipient) external onlyOwner {
        require(_donationRecipient != address(0), "Invalid donation recipient");
        
        address oldRecipient = donationRecipient;
        donationRecipient = _donationRecipient;
        
        emit DonationRecipientUpdated(oldRecipient, _donationRecipient);
    }
    
    /**
     * @notice Manual harvest function to trigger yield donation (only owner)
     * @dev Can be called to manually trigger harvest and donation
     */
    function harvest() external onlyOwner {
        _harvestAndDonate();
    }
    
    /**
     * @notice Get the current donation percentage as a readable percentage
     * @return The donation percentage (e.g., 10 for 10%)
     */
    function getDonationPercent() external view returns (uint256) {
        return donationPercent / 100; // Convert basis points to percentage
    }
}

