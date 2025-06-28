// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../interfaces/IImpactChainCore.sol";

interface INGORegistry {
    function canReceiveDonations(uint256 _ngoId) external view returns (bool);
    function getNGOProfile(uint256 _ngoId) external view returns (IImpactChainCore.NGOProfile memory);
    function updateFinancials(uint256 _ngoId, uint256 _receivedAmount, uint256 _releasedAmount) external;
}

/**
 * @title DonationManager
 * @dev UUPS upgradeable contract for managing donations to verified NGOs
 * @notice Handles donation processing, escrow, and fund releases
 */
contract DonationManager is 
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    IImpactChainCore
{
    // =============================================================
    //                        CONSTANTS
    // =============================================================

    /// @dev Role for managing fund releases
    bytes32 public constant FUND_MANAGER_ROLE = keccak256("FUND_MANAGER_ROLE");
    
    /// @dev Role for governance operations
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @dev Role for emergency operations
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    /// @dev Maximum donation amount per transaction (in ETH)
    uint256 public constant MAX_DONATION_AMOUNT = 100 ether;

    /// @dev Minimum donation amount (in wei)
    uint256 public constant MIN_DONATION_AMOUNT = 0.001 ether;

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Counter for donation IDs
    uint256 private _donationIdCounter;

    /// @dev NGO Registry contract
    INGORegistry public ngoRegistry;

    /// @dev Chainlink ETH/USD price feed
    AggregatorV3Interface public priceFeed;

    /// @dev Fee Manager contract
    address public feeManager;

    /// @dev Mapping from donation ID to donation record
    mapping(uint256 => Donation) private _donations;

    /// @dev Mapping from NGO ID to total escrowed amount
    mapping(uint256 => uint256) public escrowedFunds;

    /// @dev Mapping from NGO ID to total released amount
    mapping(uint256 => uint256) public releasedFunds;

    /// @dev Mapping from donor to total donated amount
    mapping(address => uint256) public donorTotalDonated;

    /// @dev Mapping from donor to array of donation IDs
    mapping(address => uint256[]) private _donorDonations;

    /// @dev Mapping from NGO ID to array of donation IDs
    mapping(uint256 => uint256[]) private _ngoDonations;

    /// @dev Total platform donations
    uint256 public totalDonations;

    /// @dev Platform fee in basis points (100 = 1%)
    uint256 public platformFeeBps;

    /// @dev Treasury address for collecting fees
    address payable public treasury;

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when funds are released to an NGO
    event FundsReleased(
        uint256 indexed ngoId,
        uint256 amount,
        address indexed recipient,
        address indexed releaser
    );

    /// @dev Emitted when emergency withdrawal occurs
    event EmergencyWithdrawal(
        uint256 indexed ngoId,
        uint256 amount,
        address indexed recipient,
        string reason
    );

    /// @dev Emitted when fee is collected
    event FeeCollected(
        uint256 indexed donationId,
        uint256 feeAmount,
        address indexed treasury
    );

    /// @dev Emitted when price feed is updated
    event PriceFeedUpdated(
        address indexed oldFeed,
        address indexed newFeed
    );

    // =============================================================
    //                        ERRORS
    // =============================================================

    error DonationTooSmall();
    error DonationTooLarge();
    error InvalidPriceFeed();
    error InvalidTreasuryAddress();
    error InvalidFeeAmount();
    error DonationNotFound();
    error InsufficientEscrowBalance();

    // =============================================================
    //                      CONSTRUCTOR
    // =============================================================

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // =============================================================
    //                      INITIALIZER
    // =============================================================

    /**
     * @dev Initializes the Donation Manager
     * @param _admin Initial admin address
     * @param _governance Governance contract address
     * @param _ngoRegistry NGO Registry contract address
     * @param _priceFeed Chainlink ETH/USD price feed address
     * @param _treasury Treasury address for fees
     * @param _initialFeeBps Initial platform fee in basis points
     */
    function initialize(
        address _admin,
        address _governance,
        address _ngoRegistry,
        address _priceFeed,
        address payable _treasury,
        uint256 _initialFeeBps
    ) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _governance);
        _grantRole(FUND_MANAGER_ROLE, _admin);
        _grantRole(EMERGENCY_ROLE, _admin);

        ngoRegistry = INGORegistry(_ngoRegistry);
        priceFeed = AggregatorV3Interface(_priceFeed);
        treasury = _treasury;
        platformFeeBps = _initialFeeBps;

        _donationIdCounter = 1; // Start from 1
    }

    // =============================================================
    //                    DONATION FUNCTIONS
    // =============================================================

    /**
     * @dev Makes a donation to a verified NGO
     * @param _ngoId Target NGO ID
     * @param _message Optional message from donor
     * @return donationId The assigned donation ID
     */
    function donate(
        uint256 _ngoId,
        string calldata _message
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        uint256 amount = msg.value;
        
        if (amount < MIN_DONATION_AMOUNT) revert DonationTooSmall();
        if (amount > MAX_DONATION_AMOUNT) revert DonationTooLarge();
        if (!ngoRegistry.canReceiveDonations(_ngoId)) revert NGONotVerified();

        // Calculate platform fee
        uint256 feeAmount = (amount * platformFeeBps) / 10000;
        uint256 netAmount = amount - feeAmount;

        // Get USD value at time of donation
        uint256 usdValue = _getUSDValue(amount);

        uint256 donationId = _donationIdCounter++;

        // Store donation record
        _donations[donationId] = Donation({
            donor: msg.sender,
            ngoId: _ngoId,
            amount: netAmount,
            timestamp: block.timestamp,
            usdValueAtTime: usdValue,
            message: _message
        });

        // Update tracking
        escrowedFunds[_ngoId] += netAmount;
        donorTotalDonated[msg.sender] += netAmount;
        totalDonations += netAmount;
        
        _donorDonations[msg.sender].push(donationId);
        _ngoDonations[_ngoId].push(donationId);

        // Transfer fee to treasury
        if (feeAmount > 0) {
            treasury.transfer(feeAmount);
            emit FeeCollected(donationId, feeAmount, treasury);
        }

        // Update NGO financials
        ngoRegistry.updateFinancials(_ngoId, netAmount, 0);

        emit DonationIn(donationId, msg.sender, _ngoId, netAmount, usdValue);
        
        return donationId;
    }

    /**
     * @dev Releases escrowed funds to an NGO
     * @param _ngoId NGO ID
     * @param _amount Amount to release
     * @param _reason Reason for release
     */
    function releaseFunds(
        uint256 _ngoId,
        uint256 _amount,
        string calldata _reason
    ) public onlyRole(FUND_MANAGER_ROLE) whenNotPaused nonReentrant {
        if (_amount == 0) revert InvalidAmount();
        if (escrowedFunds[_ngoId] < _amount) revert InsufficientEscrowBalance();
        if (!ngoRegistry.canReceiveDonations(_ngoId)) revert NGONotVerified();

        IImpactChainCore.NGOProfile memory ngoProfile = ngoRegistry.getNGOProfile(_ngoId);
        
        // Update balances
        escrowedFunds[_ngoId] -= _amount;
        releasedFunds[_ngoId] += _amount;

        // Transfer funds to NGO
        ngoProfile.ngoAddress.transfer(_amount);

        // Update NGO financials
        ngoRegistry.updateFinancials(_ngoId, 0, _amount);

        emit FundsReleased(_ngoId, _amount, ngoProfile.ngoAddress, msg.sender);
    }

    /**
     * @dev Batch release funds to multiple NGOs
     * @param _ngoIds Array of NGO IDs
     * @param _amounts Array of amounts to release
     * @param _reason Reason for releases
     */
    function batchReleaseFunds(
        uint256[] calldata _ngoIds,
        uint256[] calldata _amounts,
        string calldata _reason
    ) external onlyRole(FUND_MANAGER_ROLE) whenNotPaused {
        if (_ngoIds.length != _amounts.length) revert InvalidAmount();

        for (uint256 i = 0; i < _ngoIds.length; i++) {
            releaseFunds(_ngoIds[i], _amounts[i], _reason);
        }
    }

    /**
     * @dev Emergency withdrawal of funds
     * @param _ngoId NGO ID
     * @param _amount Amount to withdraw
     * @param _recipient Recipient address
     * @param _reason Emergency reason
     */
    function emergencyWithdraw(
        uint256 _ngoId,
        uint256 _amount,
        address payable _recipient,
        string calldata _reason
    ) external onlyRole(EMERGENCY_ROLE) {
        if (_amount == 0) revert InvalidAmount();
        if (_recipient == address(0)) revert InvalidAddress();
        if (escrowedFunds[_ngoId] < _amount) revert InsufficientEscrowBalance();

        // Update balances
        escrowedFunds[_ngoId] -= _amount;

        // Transfer funds
        _recipient.transfer(_amount);

        emit EmergencyWithdrawal(_ngoId, _amount, _recipient, _reason);
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns donation information
     * @param _donationId Donation ID
     * @return donation The donation record
     */
    function getDonation(uint256 _donationId) external view returns (Donation memory) {
        return _donations[_donationId];
    }

    /**
     * @dev Returns donor's donation history
     * @param _donor Donor address
     * @return donationIds Array of donation IDs
     */
    function getDonorHistory(address _donor) external view returns (uint256[] memory) {
        return _donorDonations[_donor];
    }

    /**
     * @dev Returns NGO's donation history
     * @param _ngoId NGO ID
     * @return donationIds Array of donation IDs
     */
    function getNGODonations(uint256 _ngoId) external view returns (uint256[] memory) {
        return _ngoDonations[_ngoId];
    }

    /**
     * @dev Returns current ETH/USD price from Chainlink
     * @return price Current price with 8 decimals
     */
    function getCurrentPrice() external view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price);
    }

    /**
     * @dev Returns total escrowed funds for an NGO
     * @param _ngoId NGO ID
     * @return amount Total escrowed amount
     */
    function getEscrowedFunds(uint256 _ngoId) external view returns (uint256) {
        return escrowedFunds[_ngoId];
    }

    // =============================================================
    //                    INTERNAL FUNCTIONS
    // =============================================================

    /**
     * @dev Gets USD value of ETH amount using Chainlink price feed
     * @param _ethAmount ETH amount in wei
     * @return usdValue USD value with 8 decimals
     */
    function _getUSDValue(uint256 _ethAmount) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price data");
        
        // ETH amount (18 decimals) * Price (8 decimals) / 1e18 = USD value (8 decimals)
        return (_ethAmount * uint256(price)) / 1e18;
    }

    // =============================================================
    //                    ADMIN FUNCTIONS
    // =============================================================

    /**
     * @dev Updates platform fee
     * @param _newFeeBps New fee in basis points
     */
    function updatePlatformFee(uint256 _newFeeBps) external onlyRole(GOVERNANCE_ROLE) {
        if (_newFeeBps > 1000) revert InvalidFeeAmount(); // Max 10%
        platformFeeBps = _newFeeBps;
        emit FeeUpdated(platformFeeBps, _newFeeBps, treasury);
    }

    /**
     * @dev Updates treasury address
     * @param _newTreasury New treasury address
     */
    function updateTreasury(address payable _newTreasury) external onlyRole(GOVERNANCE_ROLE) {
        if (_newTreasury == address(0)) revert InvalidTreasuryAddress();
        treasury = _newTreasury;
    }

    /**
     * @dev Updates price feed address
     * @param _newPriceFeed New price feed address
     */
    function updatePriceFeed(address _newPriceFeed) external onlyRole(GOVERNANCE_ROLE) {
        if (_newPriceFeed == address(0)) revert InvalidPriceFeed();
        address oldFeed = address(priceFeed);
        priceFeed = AggregatorV3Interface(_newPriceFeed);
        emit PriceFeedUpdated(oldFeed, _newPriceFeed);
    }

    /**
     * @dev Pauses all donation operations
     */
    function pause() external onlyRole(GOVERNANCE_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all donation operations
     */
    function unpause() external onlyRole(GOVERNANCE_ROLE) {
        _unpause();
    }

    // =============================================================
    //                    UPGRADE FUNCTIONS
    // =============================================================

    /**
     * @dev Authorizes contract upgrades
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(GOVERNANCE_ROLE)
    {}

    /**
     * @dev Returns the current implementation version
     * @return version The version string
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    // =============================================================
    //                    RECEIVE FUNCTION
    // =============================================================

    /**
     * @dev Fallback function to reject direct ETH transfers
     */
    receive() external payable {
        revert("Use donate() function");
    }
}
