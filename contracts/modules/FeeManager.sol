// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "../interfaces/IImpactChainCore.sol";

/**
 * @title FeeManager
 * @dev UUPS upgradeable contract for dynamic fee management and distribution
 * @notice Handles platform fees, treasury management, and fee optimization across all modules
 */
contract FeeManager is 
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

    /// @dev Role for fee management operations
    bytes32 public constant FEE_ADMIN_ROLE = keccak256("FEE_ADMIN_ROLE");
    
    /// @dev Role for governance operations
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @dev Role for treasury operations
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    /// @dev Maximum platform fee (10% in basis points)
    uint256 public constant MAX_PLATFORM_FEE = 1000;

    /// @dev Basis points for percentage calculations (100% = 10000)
    uint256 public constant BASIS_POINTS = 10000;

    /// @dev Fee tier thresholds in ETH
    uint256 public constant TIER_1_THRESHOLD = 1 ether;    // Basic tier
    uint256 public constant TIER_2_THRESHOLD = 10 ether;   // Premium tier
    uint256 public constant TIER_3_THRESHOLD = 100 ether;  // Enterprise tier

    /// @dev Volume discount thresholds
    uint256 public constant VOLUME_DISCOUNT_TIER_1 = 100 ether;   // 2.5% discount
    uint256 public constant VOLUME_DISCOUNT_TIER_2 = 1000 ether;  // 5% discount

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Treasury address for collecting fees
    address payable public treasury;

    /// @dev Platform fee rates by tier (in basis points)
    mapping(uint256 => uint256) public tierFees;

    /// @dev Special fee rates for specific addresses (in basis points)
    mapping(address => uint256) public specialFeeRates;

    /// @dev Fee distribution percentages by category (in basis points)
    mapping(string => uint256) public feeDistribution;

    /// @dev Total fees collected by category
    mapping(string => uint256) public totalFeesCollected;

    /// @dev Monthly fee collection tracking
    mapping(uint256 => mapping(string => uint256)) public monthlyFees; // month => category => amount

    /// @dev Fee exemption status for addresses
    mapping(address => bool) public feeExemptions;

    /// @dev Volume-based discounts (in basis points)
    mapping(address => uint256) public volumeDiscounts;

    /// @dev User volume tracking for discount calculation
    mapping(address => uint256) public userVolumes;

    /// @dev User volume tracking by time period
    mapping(address => mapping(uint256 => uint256)) public periodicVolumes; // user => period => volume

    /// @dev Fee collection pause status by category
    mapping(string => bool) public categoryPauseStatus;

    /// @dev Platform-wide fee collection statistics
    uint256 public totalPlatformFees;
    uint256 public totalFeeTransactions;
    
    /// @dev Minimum fee amount to avoid dust transactions
    uint256 public minimumFeeAmount;

    /// @dev Dynamic fee adjustment parameters
    struct DynamicFeeParams {
        uint256 baseRate;           // Base fee rate in basis points
        uint256 demandMultiplier;   // Multiplier based on platform demand
        uint256 timeDecay;          // Time-based fee decay factor
        uint256 lastUpdateTime;     // Last time fees were updated
        bool isActive;              // Whether dynamic fees are active
    }

    /// @dev Dynamic fee parameters by category
    mapping(string => DynamicFeeParams) public dynamicFeeParams;

    /// @dev Fee beneficiaries and their allocation percentages
    struct FeeBeneficiary {
        address payable recipient;
        uint256 percentage;  // In basis points
        bool isActive;
    }

    /// @dev Array of fee beneficiaries
    FeeBeneficiary[] public feeBeneficiaries;

    /// @dev Mapping to track beneficiary indices
    mapping(address => uint256) public beneficiaryIndex;

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when fee tier is updated
    event FeeTierUpdated(
        uint256 indexed tier,
        uint256 oldFee,
        uint256 newFee,
        address indexed updater
    );

    /// @dev Emitted when special fee rate is set
    event SpecialFeeRateSet(
        address indexed account,
        uint256 oldRate,
        uint256 newRate,
        address indexed updater
    );

    /// @dev Emitted when fee exemption status changes
    event FeeExemptionUpdated(
        address indexed account,
        bool oldStatus,
        bool newStatus,
        address indexed updater
    );

    /// @dev Emitted when volume discount is updated
    event VolumeDiscountUpdated(
        address indexed account,
        uint256 oldDiscount,
        uint256 newDiscount,
        uint256 totalVolume
    );

    /// @dev Emitted when treasury address is updated
    event TreasuryUpdated(
        address indexed oldTreasury,
        address indexed newTreasury,
        address indexed updater
    );

    /// @dev Emitted when fee is collected and distributed
    event FeeCollectedAndDistributed(
        address indexed payer,
        string indexed category,
        uint256 totalAmount,
        uint256 feeAmount,
        uint256 netAmount
    );

    /// @dev Emitted when fee distribution is updated
    event FeeDistributionUpdated(
        string indexed category,
        uint256 oldPercentage,
        uint256 newPercentage,
        address indexed updater
    );

    /// @dev Emitted when volume is tracked for discount calculation
    event VolumeTracked(
        address indexed user,
        uint256 transactionAmount,
        uint256 totalVolume,
        uint256 newDiscount
    );

    /// @dev Emitted when dynamic fee parameters are updated
    event DynamicFeeParamsUpdated(
        string indexed category,
        uint256 baseRate,
        uint256 demandMultiplier,
        bool isActive
    );

    /// @dev Emitted when fee beneficiary is added or updated
    event FeeBeneficiaryUpdated(
        address indexed recipient,
        uint256 oldPercentage,
        uint256 newPercentage,
        bool isActive
    );

    /// @dev Emitted when fees are distributed to beneficiaries
    event FeesDistributedToBeneficiaries(
        uint256 totalAmount,
        uint256 beneficiaryCount
    );

    // =============================================================
    //                        ERRORS
    // =============================================================

    error InvalidFeeRate();
    error InvalidTreasuryAddress();
    error FeeCollectionPaused();
    error InvalidTier();
    error InvalidDistributionPercentage();
    error InsufficientBalance();
    error InvalidBeneficiaryAddress();
    error BeneficiaryNotFound();
    error InvalidDynamicFeeParams();
    error CategoryAlreadyPaused();
    error CategoryNotPaused();

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
     * @dev Initializes the Fee Manager with comprehensive configuration
     * @param _admin Initial admin address with full permissions
     * @param _governance Governance contract address for critical operations
     * @param _treasury Treasury address for collecting platform fees
     */
    function initialize(
        address _admin,
        address _governance,
        address payable _treasury
    ) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _governance);
        _grantRole(FEE_ADMIN_ROLE, _admin);
        _grantRole(TREASURY_ROLE, _treasury);

        treasury = _treasury;
        minimumFeeAmount = 0.001 ether;

        // Initialize tier-based fee structure (in basis points)
        tierFees[1] = 250;  // 2.5% for basic tier (< 1 ETH)
        tierFees[2] = 200;  // 2.0% for premium tier (1-10 ETH)
        tierFees[3] = 150;  // 1.5% for enterprise tier (> 10 ETH)

        // Initialize fee distribution categories
        feeDistribution["treasury"] = 5000;      // 50% to treasury operations
        feeDistribution["development"] = 2000;   // 20% to platform development
        feeDistribution["operations"] = 1500;    // 15% to operational costs
        feeDistribution["marketing"] = 1000;     // 10% to marketing and growth
        feeDistribution["reserve"] = 500;        // 5% to emergency reserve

        // Add treasury as primary beneficiary
        feeBeneficiaries.push(FeeBeneficiary({
            recipient: _treasury,
            percentage: 10000, // 100% initially
            isActive: true
        }));
        beneficiaryIndex[_treasury] = 0;
    }

    // =============================================================
    //                    FEE CALCULATION FUNCTIONS
    // =============================================================

    /**
     * @dev Calculates comprehensive fee for a transaction with all applicable discounts and modifiers
     * @param _user User address for personalized fee calculation
     * @param _amount Transaction amount in wei
     * @param _category Fee category for dynamic pricing
     * @return feeAmount Calculated fee amount after all applicable adjustments
     */
    function calculateFee(
        address _user,
        uint256 _amount,
        string calldata _category
    ) external view returns (uint256 feeAmount) {
        // Check for fee exemption
        if (feeExemptions[_user] || _amount < minimumFeeAmount) {
            return 0;
        }

        // Check if category collection is paused
        if (categoryPauseStatus[_category]) {
            return 0;
        }

        // Check for special fee rate
        if (specialFeeRates[_user] > 0) {
            feeAmount = (_amount * specialFeeRates[_user]) / BASIS_POINTS;
        } else {
            // Use tier-based fee calculation
            uint256 tierFee = _getTierFee(_amount);
            
            // Apply dynamic fee adjustment if active
            if (dynamicFeeParams[_category].isActive) {
                tierFee = _applyDynamicFeeAdjustment(tierFee, _category);
            }
            
            feeAmount = (_amount * tierFee) / BASIS_POINTS;
        }

        // Apply volume discount
        uint256 discount = _calculateVolumeDiscount(_user);
        if (discount > 0) {
            uint256 discountAmount = (feeAmount * discount) / BASIS_POINTS;
            feeAmount = feeAmount - discountAmount;
        }

        return feeAmount;
    }

    /**
     * @dev Collects fee from a transaction with comprehensive tracking and distribution
     * @param _user User address paying the fee
     * @param _amount Transaction amount
     * @param _category Fee category for proper tracking and distribution
     * @return feeAmount Actual fee amount collected
     */
    function collectFee(
        address _user,
        uint256 _amount,
        string calldata _category
    ) external payable whenNotPaused nonReentrant returns (uint256 feeAmount) {
        // Check if fee collection is paused for this category
        if (categoryPauseStatus[_category]) revert FeeCollectionPaused();

        // Calculate fee amount
        feeAmount = this.calculateFee(_user, _amount, _category);
        
        if (feeAmount > 0) {
            // Verify sufficient payment
            if (msg.value < feeAmount) revert InsufficientFunds();

            // Update comprehensive tracking
            _updateFeeTracking(_user, _amount, feeAmount, _category);

            // Distribute fee according to allocation rules
            _distributeFeeToCategories(feeAmount, _category);

            // Track user volume for future discount calculation
            _updateUserVolumeTracking(_user, _amount);

            emit FeeCollectedAndDistributed(_user, _category, _amount, feeAmount, _amount - feeAmount);
        }

        return feeAmount;
    }

    /**
     * @dev Batch collects fees for multiple transactions with gas optimization
     * @param _users Array of user addresses
     * @param _amounts Array of transaction amounts
     * @param _category Fee category for batch processing
     * @return totalFeeAmount Total fee collected from all transactions
     */
    function batchCollectFees(
        address[] calldata _users,
        uint256[] calldata _amounts,
        string calldata _category
    ) external payable whenNotPaused nonReentrant returns (uint256 totalFeeAmount) {
        if (_users.length != _amounts.length) revert InvalidAmount();
        if (categoryPauseStatus[_category]) revert FeeCollectionPaused();

        for (uint256 i = 0; i < _users.length; i++) {
            uint256 feeAmount = this.calculateFee(_users[i], _amounts[i], _category);
            totalFeeAmount += feeAmount;
            
            if (feeAmount > 0) {
                // Update tracking for each transaction
                _updateFeeTracking(_users[i], _amounts[i], feeAmount, _category);
                _updateUserVolumeTracking(_users[i], _amounts[i]);
            }
        }

        if (totalFeeAmount > 0) {
            if (msg.value < totalFeeAmount) revert InsufficientFunds();
            _distributeFeeToCategories(totalFeeAmount, _category);
        }

        return totalFeeAmount;
    }

    // =============================================================
    //                    FEE MANAGEMENT FUNCTIONS
    // =============================================================

    /**
     * @dev Updates fee rate for a specific tier with comprehensive validation
     * @param _tier Fee tier (1, 2, or 3)
     * @param _newFee New fee rate in basis points
     */
    function updateTierFee(uint256 _tier, uint256 _newFee) external onlyRole(FEE_ADMIN_ROLE) {
        if (_tier == 0 || _tier > 3) revert InvalidTier();
        if (_newFee > MAX_PLATFORM_FEE) revert InvalidFeeRate();

        uint256 oldFee = tierFees[_tier];
        tierFees[_tier] = _newFee;

        emit FeeTierUpdated(_tier, oldFee, _newFee, msg.sender);
    }

    /**
     * @dev Sets special fee rate for specific address with detailed tracking
     * @param _account Target account address
     * @param _feeRate Special fee rate in basis points
     */
    function setSpecialFeeRate(address _account, uint256 _feeRate) external onlyRole(FEE_ADMIN_ROLE) {
        if (_feeRate > MAX_PLATFORM_FEE) revert InvalidFeeRate();

        uint256 oldRate = specialFeeRates[_account];
        specialFeeRates[_account] = _feeRate;

        emit SpecialFeeRateSet(_account, oldRate, _feeRate, msg.sender);
    }

    /**
     * @dev Updates fee exemption status with detailed event logging
     * @param _account Target account address
     * @param _exempt New exemption status
     */
    function updateFeeExemption(address _account, bool _exempt) external onlyRole(FEE_ADMIN_ROLE) {
        bool oldStatus = feeExemptions[_account];
        feeExemptions[_account] = _exempt;

        emit FeeExemptionUpdated(_account, oldStatus, _exempt, msg.sender);
    }

    /**
     * @dev Manually updates volume discount for specific address
     * @param _account Target account address
     * @param _discount Discount percentage in basis points
     */
    function updateVolumeDiscount(address _account, uint256 _discount) external onlyRole(FEE_ADMIN_ROLE) {
        if (_discount > BASIS_POINTS) revert InvalidFeeRate();

        uint256 oldDiscount = volumeDiscounts[_account];
        volumeDiscounts[_account] = _discount;

        emit VolumeDiscountUpdated(_account, oldDiscount, _discount, userVolumes[_account]);
    }

    /**
     * @dev Updates fee distribution percentages with validation
     * @param _categories Array of category names
     * @param _percentages Array of percentages in basis points
     */
    function updateFeeDistribution(
        string[] calldata _categories,
        uint256[] calldata _percentages
    ) external onlyRole(GOVERNANCE_ROLE) {
        if (_categories.length != _percentages.length) revert InvalidAmount();

        // Validate total percentage equals 100%
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _percentages.length; i++) {
            totalPercentage += _percentages[i];
        }
        if (totalPercentage != BASIS_POINTS) revert InvalidDistributionPercentage();

        // Update distribution mapping
        for (uint256 i = 0; i < _categories.length; i++) {
            uint256 oldPercentage = feeDistribution[_categories[i]];
            feeDistribution[_categories[i]] = _percentages[i];
            
            emit FeeDistributionUpdated(_categories[i], oldPercentage, _percentages[i], msg.sender);
        }
    }

    /**
     * @dev Updates treasury address with comprehensive security checks
     * @param _newTreasury New treasury address
     */
    function updateTreasury(address payable _newTreasury) external onlyRole(GOVERNANCE_ROLE) {
        if (_newTreasury == address(0)) revert InvalidTreasuryAddress();

        address oldTreasury = treasury;
        treasury = _newTreasury;

        // Update treasury in beneficiaries if it was the primary beneficiary
        if (feeBeneficiaries.length > 0 && feeBeneficiaries[0].recipient == payable(oldTreasury)) {
            feeBeneficiaries[0].recipient = _newTreasury;
            delete beneficiaryIndex[oldTreasury];
            beneficiaryIndex[_newTreasury] = 0;
        }

        emit TreasuryUpdated(oldTreasury, _newTreasury, msg.sender);
    }

    /**
     * @dev Configures dynamic fee parameters for adaptive pricing
     * @param _category Fee category
     * @param _baseRate Base fee rate in basis points
     * @param _demandMultiplier Demand-based multiplier
     * @param _timeDecay Time-based decay factor
     * @param _isActive Whether dynamic fees are active for this category
     */
    function configureDynamicFees(
        string calldata _category,
        uint256 _baseRate,
        uint256 _demandMultiplier,
        uint256 _timeDecay,
        bool _isActive
    ) external onlyRole(FEE_ADMIN_ROLE) {
        if (_baseRate > MAX_PLATFORM_FEE) revert InvalidDynamicFeeParams();

        dynamicFeeParams[_category] = DynamicFeeParams({
            baseRate: _baseRate,
            demandMultiplier: _demandMultiplier,
            timeDecay: _timeDecay,
            lastUpdateTime: block.timestamp,
            isActive: _isActive
        });

        emit DynamicFeeParamsUpdated(_category, _baseRate, _demandMultiplier, _isActive);
    }

    // =============================================================
    //                    BENEFICIARY MANAGEMENT
    // =============================================================

    /**
     * @dev Adds or updates fee beneficiary with allocation percentage
     * @param _recipient Beneficiary address
     * @param _percentage Allocation percentage in basis points
     */
    function updateFeeBeneficiary(
        address payable _recipient,
        uint256 _percentage,
        bool _isActive
    ) external onlyRole(GOVERNANCE_ROLE) {
        if (_recipient == address(0)) revert InvalidBeneficiaryAddress();
        if (_percentage > BASIS_POINTS) revert InvalidDistributionPercentage();

        uint256 index = beneficiaryIndex[_recipient];
        uint256 oldPercentage = 0;

        if (index > 0 || (feeBeneficiaries.length > 0 && feeBeneficiaries[0].recipient == _recipient)) {
            // Update existing beneficiary
            if (index == 0 && feeBeneficiaries[0].recipient != _recipient) {
                revert BeneficiaryNotFound();
            }
            oldPercentage = feeBeneficiaries[index].percentage;
            feeBeneficiaries[index].percentage = _percentage;
            feeBeneficiaries[index].isActive = _isActive;
        } else {
            // Add new beneficiary
            feeBeneficiaries.push(FeeBeneficiary({
                recipient: _recipient,
                percentage: _percentage,
                isActive: _isActive
            }));
            beneficiaryIndex[_recipient] = feeBeneficiaries.length - 1;
        }

        emit FeeBeneficiaryUpdated(_recipient, oldPercentage, _percentage, _isActive);
    }

    /**
     * @dev Distributes accumulated fees to all active beneficiaries
     * @param _amount Total amount to distribute
     */
    function distributeToBeneficiaries(uint256 _amount) external onlyRole(TREASURY_ROLE) nonReentrant {
        if (_amount > address(this).balance) revert InsufficientBalance();

        uint256 totalDistributed = 0;
        uint256 activeBeneficiaries = 0;

        for (uint256 i = 0; i < feeBeneficiaries.length; i++) {
            if (feeBeneficiaries[i].isActive) {
                uint256 beneficiaryAmount = (_amount * feeBeneficiaries[i].percentage) / BASIS_POINTS;
                if (beneficiaryAmount > 0) {
                    feeBeneficiaries[i].recipient.transfer(beneficiaryAmount);
                    totalDistributed += beneficiaryAmount;
                    activeBeneficiaries++;
                }
            }
        }

        emit FeesDistributedToBeneficiaries(totalDistributed, activeBeneficiaries);
    }

    // =============================================================
    //                    PAUSE MANAGEMENT
    // =============================================================

    /**
     * @dev Pauses fee collection for specific category
     * @param _category Category to pause
     */
    function pauseCategoryFeeCollection(string calldata _category) external onlyRole(FEE_ADMIN_ROLE) {
        if (categoryPauseStatus[_category]) revert CategoryAlreadyPaused();
        categoryPauseStatus[_category] = true;
    }

    /**
     * @dev Unpauses fee collection for specific category
     * @param _category Category to unpause
     */
    function unpauseCategoryFeeCollection(string calldata _category) external onlyRole(FEE_ADMIN_ROLE) {
        if (!categoryPauseStatus[_category]) revert CategoryNotPaused();
        categoryPauseStatus[_category] = false;
    }

    /**
     * @dev Pauses all platform operations
     */
    function pause() external onlyRole(GOVERNANCE_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all platform operations
     */
    function unpause() external onlyRole(GOVERNANCE_ROLE) {
        _unpause();
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns comprehensive fee information for an address
     * @param _account Account address to query
     * @return feeRate Current effective fee rate
     * @param _exempt Whether account is fee exempt
     * @param _discount Current volume discount percentage
     * @param _volume Total volume for discount calculation
     * @param _specialRate Special fee rate if set
     */
    function getFeeInfo(address _account) external view returns (
        uint256 feeRate,
        bool _exempt,
        uint256 _discount,
        uint256 _volume,
        uint256 _specialRate
    ) {
        _exempt = feeExemptions[_account];
        _discount = volumeDiscounts[_account];
        _volume = userVolumes[_account];
        _specialRate = specialFeeRates[_account];

        if (_exempt) {
            feeRate = 0;
        } else if (_specialRate > 0) {
            feeRate = _specialRate;
        } else {
            feeRate = tierFees[1]; // Return basic tier as default
        }
    }

    /**
     * @dev Returns comprehensive platform statistics
     * @return totalFees Total fees collected across all categories
     * @param treasuryBalance Current treasury contract balance
     * @param totalTransactions Total number of fee-generating transactions
     * @param activeTiers Number of active fee tiers
     * @param activeBeneficiaries Number of active fee beneficiaries
     */
    function getPlatformStats() external view returns (
        uint256 totalFees,
        uint256 treasuryBalance,
        uint256 totalTransactions,
        uint256 activeTiers,
        uint256 activeBeneficiaries
    ) {
        totalFees = totalPlatformFees;
        treasuryBalance = address(this).balance;
        totalTransactions = totalFeeTransactions;
        activeTiers = 3; // We have 3 defined tiers

        // Count active beneficiaries
        for (uint256 i = 0; i < feeBeneficiaries.length; i++) {
            if (feeBeneficiaries[i].isActive) {
                activeBeneficiaries++;
            }
        }
    }

    /**
     * @dev Returns monthly fee statistics for analysis
     * @param _month Month identifier (timestamp / 30 days)
     * @param _category Fee category
     * @return amount Fee amount collected in specified month and category
     */
    function getMonthlyFees(uint256 _month, string calldata _category) external view returns (uint256) {
        return monthlyFees[_month][_category];
    }

    /**
     * @dev Returns all fee beneficiaries
     * @return recipients Array of beneficiary addresses
     * @param percentages Array of allocation percentages
     * @param activeStatus Array of active status flags
     */
    function getAllBeneficiaries() external view returns (
        address[] memory recipients,
        uint256[] memory percentages,
        bool[] memory activeStatus
    ) {
        recipients = new address[](feeBeneficiaries.length);
        percentages = new uint256[](feeBeneficiaries.length);
        activeStatus = new bool[](feeBeneficiaries.length);

        for (uint256 i = 0; i < feeBeneficiaries.length; i++) {
            recipients[i] = feeBeneficiaries[i].recipient;
            percentages[i] = feeBeneficiaries[i].percentage;
            activeStatus[i] = feeBeneficiaries[i].isActive;
        }
    }

    // =============================================================
    //                    INTERNAL HELPER FUNCTIONS
    // =============================================================

    /**
     * @dev Determines tier-based fee rate for transaction amount
     * @param _amount Transaction amount in wei
     * @return tierFee Applicable fee rate in basis points
     */
    function _getTierFee(uint256 _amount) internal view returns (uint256 tierFee) {
        if (_amount >= TIER_3_THRESHOLD) {
            return tierFees[3]; // Enterprise tier
        } else if (_amount >= TIER_2_THRESHOLD) {
            return tierFees[2]; // Premium tier
        } else {
            return tierFees[1]; // Basic tier
        }
    }

    /**
     * @dev Calculates volume-based discount for user
     * @param _user User address
     * @return discount Discount percentage in basis points
     */
    function _calculateVolumeDiscount(address _user) internal view returns (uint256 discount) {
        uint256 volume = userVolumes[_user];
        
        if (volume >= VOLUME_DISCOUNT_TIER_2) {
            return 500; // 5% discount for high volume
        } else if (volume >= VOLUME_DISCOUNT_TIER_1) {
            return 250; // 2.5% discount for medium volume
        }
        
        return volumeDiscounts[_user]; // Return manual discount if set
    }

    /**
     * @dev Applies dynamic fee adjustment based on platform conditions
     * @param _baseFee Base fee rate
     * @param _category Fee category
     * @return adjustedFee Fee rate after dynamic adjustments
     */
    function _applyDynamicFeeAdjustment(uint256 _baseFee, string memory _category) internal view returns (uint256) {
        DynamicFeeParams memory params = dynamicFeeParams[_category];
        
        // Simple time-based decay (more sophisticated logic can be added)
        uint256 timePassed = block.timestamp - params.lastUpdateTime;
        uint256 decayFactor = (timePassed * params.timeDecay) / 1 days;
        
        // Apply demand multiplier and time decay
        uint256 adjustedFee = (_baseFee * params.demandMultiplier) / BASIS_POINTS;
        adjustedFee = adjustedFee > decayFactor ? adjustedFee - decayFactor : _baseFee;
        
        return adjustedFee > MAX_PLATFORM_FEE ? MAX_PLATFORM_FEE : adjustedFee;
    }

    /**
     * @dev Updates comprehensive fee tracking and statistics
     * @param _user User address
     * @param _amount Transaction amount
     * @param _feeAmount Fee amount collected
     * @param _category Fee category
     */
    function _updateFeeTracking(
        address _user,
        uint256 _amount,
        uint256 _feeAmount,
        string memory _category
    ) internal {
        // Update global statistics
        totalFeesCollected[_category] += _feeAmount;
        totalPlatformFees += _feeAmount;
        totalFeeTransactions++;
        
        // Update monthly tracking
        uint256 currentMonth = block.timestamp / 30 days;
        monthlyFees[currentMonth][_category] += _feeAmount;
    }

    /**
     * @dev Updates user volume tracking for discount calculation
     * @param _user User address
     * @param _amount Transaction amount
     */
    function _updateUserVolumeTracking(address _user, uint256 _amount) internal {
        userVolumes[_user] += _amount;
        
        // Update periodic volume tracking
        uint256 currentPeriod = block.timestamp / 30 days;
        periodicVolumes[_user][currentPeriod] += _amount;

        // Auto-update volume discounts
        uint256 newDiscount = _calculateVolumeDiscount(_user);
        if (newDiscount != volumeDiscounts[_user]) {
            uint256 oldDiscount = volumeDiscounts[_user];
            volumeDiscounts[_user] = newDiscount;
            
            emit VolumeTracked(_user, _amount, userVolumes[_user], newDiscount);
            emit VolumeDiscountUpdated(_user, oldDiscount, newDiscount, userVolumes[_user]);
        }
    }

    /**
     * @dev Distributes collected fees according to category rules
     * @param _feeAmount Fee amount to distribute
     * @param _category Fee category
     */
    function _distributeFeeToCategories(uint256 _feeAmount, string memory _category) internal {
        // For now, hold in contract for later distribution to beneficiaries
        // In production, you might implement more sophisticated distribution logic
        
        emit FeeUpdated(0, _feeAmount, treasury);
    }

    // =============================================================
    //                    EMERGENCY & ADMIN FUNCTIONS
    // =============================================================

    /**
     * @dev Emergency withdrawal function for governance
     * @param _amount Amount to withdraw
     * @param _recipient Recipient address
     * @param _reason Reason for emergency withdrawal
     */
    function emergencyWithdraw(
        uint256 _amount,
        address payable _recipient,
        string calldata _reason
    ) external onlyRole(GOVERNANCE_ROLE) nonReentrant {
        if (_recipient == address(0)) revert InvalidBeneficiaryAddress();
        if (_amount > address(this).balance) revert InsufficientBalance();

        _recipient.transfer(_amount);
        
        emit FeeDistributed(_reason, _amount, _recipient);
    }

    /**
     * @dev Withdraws specific amount for treasury operations
     * @param _amount Amount to withdraw
     * @param _recipient Recipient address
     * @param _purpose Purpose of withdrawal
     */
    function withdrawForPurpose(
        uint256 _amount,
        address payable _recipient,
        string calldata _purpose
    ) external onlyRole(TREASURY_ROLE) nonReentrant {
        if (_recipient == address(0)) revert InvalidBeneficiaryAddress();
        if (_amount > address(this).balance) revert InsufficientBalance();

        _recipient.transfer(_amount);
        
        emit FeeDistributed(_purpose, _amount, _recipient);
    }

    // =============================================================
    //                    UPGRADE FUNCTIONS
    // =============================================================

    /**
     * @dev Authorizes contract upgrades through governance
     * @param newImplementation Address of new implementation contract
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(GOVERNANCE_ROLE)
    {}

    /**
     * @dev Returns current implementation version
     * @return version Version string for tracking
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    // =============================================================
    //                    RECEIVE FUNCTION
    // =============================================================

    /**
     * @dev Receives ETH for fee collection and platform operations
     */
    receive() external payable {
        // Allow direct ETH deposits for fee collection
        // Fees will be distributed according to beneficiary rules
    }
} 