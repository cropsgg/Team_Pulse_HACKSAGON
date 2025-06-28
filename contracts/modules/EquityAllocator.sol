// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IImpactChainCore.sol";

interface IEquityToken {
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title EquityAllocator
 * @dev UUPS upgradeable contract for equity allocation and vesting management
 * @notice Handles equity token distribution with cliff and vesting periods
 */
contract EquityAllocator is 
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    IImpactChainCore
{
    using SafeERC20 for IERC20;

    // =============================================================
    //                        CONSTANTS
    // =============================================================

    /// @dev Role for managing equity allocations
    bytes32 public constant EQUITY_MANAGER_ROLE = keccak256("EQUITY_MANAGER_ROLE");
    
    /// @dev Role for governance operations
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @dev Maximum cliff period (2 years)
    uint256 public constant MAX_CLIFF_PERIOD = 730 days;

    /// @dev Maximum vesting period (4 years)
    uint256 public constant MAX_VESTING_PERIOD = 1460 days;

    /// @dev Basis points for percentage calculations
    uint256 public constant BASIS_POINTS = 10000;

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Counter for allocation IDs
    uint256 private _allocationIdCounter;

    /// @dev Mapping from allocation ID to equity allocation
    mapping(uint256 => EquityAllocation) private _allocations;

    /// @dev Mapping from round ID to escrowed ETH amount
    mapping(uint256 => uint256) public escrowedETH;

    /// @dev Mapping from round ID to total shares allocated
    mapping(uint256 => uint256) public totalSharesAllocated;

    /// @dev Mapping from round ID to valuation
    mapping(uint256 => uint256) public roundValuations;

    /// @dev Mapping from VC address to their allocations
    mapping(address => uint256[]) private _vcAllocations;

    /// @dev Mapping from round ID to allocation IDs
    mapping(uint256 => uint256[]) private _roundAllocations;

    /// @dev Mapping from allocation ID to vested amount claimed
    mapping(uint256 => uint256) public claimedAmounts;

    /// @dev Total allocations created
    uint256 public totalAllocations;

    /// @dev Default cliff period (12 months)
    uint256 public defaultCliffPeriod;

    /// @dev Default vesting period (48 months)
    uint256 public defaultVestingPeriod;

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when ETH is escrowed for a round
    event ETHEscrowed(
        uint256 indexed roundId,
        address indexed investor,
        uint256 amount
    );

    /// @dev Emitted when vested equity is claimed
    event VestedEquityClaimed(
        uint256 indexed allocationId,
        address indexed vc,
        uint256 amount
    );

    /// @dev Emitted when vesting schedule is updated
    event VestingScheduleUpdated(
        uint256 indexed allocationId,
        uint256 newCliffPeriod,
        uint256 newVestingPeriod
    );

    /// @dev Emitted when emergency equity transfer occurs
    event EmergencyEquityTransfer(
        uint256 indexed allocationId,
        address indexed from,
        address indexed to,
        uint256 amount
    );

    // =============================================================
    //                        ERRORS
    // =============================================================

    error AllocationNotFound();
    error InvalidVestingPeriod();
    error InvalidCliffPeriod();
    error CliffPeriodNotMet();
    error NoVestedAmount();
    error InsufficientEscrowedETH();
    error InvalidValuation();
    error AllocationAlreadyExists();

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
     * @dev Initializes the Equity Allocator
     * @param _admin Initial admin address
     * @param _governance Governance contract address
     * @param _defaultCliffPeriod Default cliff period in seconds
     * @param _defaultVestingPeriod Default vesting period in seconds
     */
    function initialize(
        address _admin,
        address _governance,
        uint256 _defaultCliffPeriod,
        uint256 _defaultVestingPeriod
    ) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _governance);
        _grantRole(EQUITY_MANAGER_ROLE, _admin);

        defaultCliffPeriod = _defaultCliffPeriod;
        defaultVestingPeriod = _defaultVestingPeriod;

        _allocationIdCounter = 1;
    }

    // =============================================================
    //                    ESCROW FUNCTIONS
    // =============================================================

    /**
     * @dev Escrows ETH for a funding round
     * @param _roundId Funding round ID
     */
    function escrowETH(uint256 _roundId) external payable whenNotPaused nonReentrant {
        if (msg.value == 0) revert InvalidAmount();

        escrowedETH[_roundId] += msg.value;

        emit ETHEscrowed(_roundId, msg.sender, msg.value);
    }

    /**
     * @dev Sets valuation for a funding round
     * @param _roundId Funding round ID
     * @param _valuation Company valuation
     */
    function setRoundValuation(
        uint256 _roundId,
        uint256 _valuation
    ) external onlyRole(EQUITY_MANAGER_ROLE) whenNotPaused {
        if (_valuation == 0) revert InvalidValuation();
        
        roundValuations[_roundId] = _valuation;
    }

    // =============================================================
    //                    ALLOCATION FUNCTIONS
    // =============================================================

    /**
     * @dev Allocates equity shares to a VC
     * @param _vc VC address
     * @param _roundId Funding round ID
     * @param _investmentAmount ETH investment amount
     * @param _cliffPeriod Cliff period in seconds (0 for default)
     * @param _vestingPeriod Vesting period in seconds (0 for default)
     * @return allocationId The assigned allocation ID
     */
    function allocateEquity(
        address _vc,
        uint256 _roundId,
        uint256 _investmentAmount,
        uint256 _cliffPeriod,
        uint256 _vestingPeriod
    ) external onlyRole(EQUITY_MANAGER_ROLE) whenNotPaused returns (uint256) {
        if (_vc == address(0)) revert InvalidAddress();
        if (_investmentAmount == 0) revert InvalidAmount();
        if (escrowedETH[_roundId] < _investmentAmount) revert InsufficientEscrowedETH();
        if (roundValuations[_roundId] == 0) revert InvalidValuation();

        // Use default periods if not specified
        if (_cliffPeriod == 0) _cliffPeriod = defaultCliffPeriod;
        if (_vestingPeriod == 0) _vestingPeriod = defaultVestingPeriod;

        if (_cliffPeriod > MAX_CLIFF_PERIOD) revert InvalidCliffPeriod();
        if (_vestingPeriod > MAX_VESTING_PERIOD) revert InvalidVestingPeriod();

        // Calculate shares based on investment and valuation
        uint256 shares = (_investmentAmount * BASIS_POINTS) / roundValuations[_roundId];

        uint256 allocationId = _allocationIdCounter++;

        _allocations[allocationId] = EquityAllocation({
            vc: _vc,
            roundId: _roundId,
            shares: shares,
            cliffPeriod: _cliffPeriod,
            vestingPeriod: _vestingPeriod,
            startTime: block.timestamp
        });

        // Update tracking
        totalSharesAllocated[_roundId] += shares;
        escrowedETH[_roundId] -= _investmentAmount;
        totalAllocations++;

        _vcAllocations[_vc].push(allocationId);
        _roundAllocations[_roundId].push(allocationId);

        emit EquityAssigned(_roundId, _vc, shares, _cliffPeriod);

        return allocationId;
    }

    /**
     * @dev Batch allocates equity to multiple VCs
     * @param _vcs Array of VC addresses
     * @param _roundId Funding round ID
     * @param _investmentAmounts Array of investment amounts
     * @param _cliffPeriods Array of cliff periods
     * @param _vestingPeriods Array of vesting periods
     * @return allocationIds Array of allocation IDs
     */
    function batchAllocateEquity(
        address[] calldata _vcs,
        uint256 _roundId,
        uint256[] calldata _investmentAmounts,
        uint256[] calldata _cliffPeriods,
        uint256[] calldata _vestingPeriods
    ) external onlyRole(EQUITY_MANAGER_ROLE) whenNotPaused returns (uint256[] memory) {
        if (_vcs.length != _investmentAmounts.length || 
            _vcs.length != _cliffPeriods.length || 
            _vcs.length != _vestingPeriods.length) {
            revert InvalidAmount();
        }

        uint256[] memory allocationIds = new uint256[](_vcs.length);

        for (uint256 i = 0; i < _vcs.length; i++) {
            allocationIds[i] = allocateEquity(
                _vcs[i],
                _roundId,
                _investmentAmounts[i],
                _cliffPeriods[i],
                _vestingPeriods[i]
            );
        }

        return allocationIds;
    }

    // =============================================================
    //                    VESTING FUNCTIONS
    // =============================================================

    /**
     * @dev Claims vested equity tokens
     * @param _allocationId Allocation ID
     * @return claimedAmount Amount of shares claimed
     */
    function claimVestedEquity(uint256 _allocationId) external whenNotPaused nonReentrant returns (uint256) {
        EquityAllocation memory allocation = _allocations[_allocationId];
        if (allocation.vc == address(0)) revert AllocationNotFound();
        if (msg.sender != allocation.vc) revert UnauthorizedAccess();

        uint256 vestedAmount = calculateVestedAmount(_allocationId);
        uint256 claimableAmount = vestedAmount - claimedAmounts[_allocationId];

        if (claimableAmount == 0) revert NoVestedAmount();

        claimedAmounts[_allocationId] += claimableAmount;

        // Note: In a real implementation, you would mint or transfer equity tokens here
        // For this example, we just emit the event
        emit VestedEquityClaimed(_allocationId, allocation.vc, claimableAmount);

        return claimableAmount;
    }

    /**
     * @dev Calculates vested amount for an allocation
     * @param _allocationId Allocation ID
     * @return vestedAmount Amount of shares vested
     */
    function calculateVestedAmount(uint256 _allocationId) public view returns (uint256) {
        EquityAllocation memory allocation = _allocations[_allocationId];
        if (allocation.vc == address(0)) return 0;

        uint256 elapsedTime = block.timestamp - allocation.startTime;

        // If cliff period not met, no vesting
        if (elapsedTime < allocation.cliffPeriod) {
            return 0;
        }

        // If fully vested
        if (elapsedTime >= allocation.vestingPeriod) {
            return allocation.shares;
        }

        // Linear vesting after cliff
        uint256 vestingElapsed = elapsedTime - allocation.cliffPeriod;
        uint256 vestingRemaining = allocation.vestingPeriod - allocation.cliffPeriod;
        
        return (allocation.shares * vestingElapsed) / vestingRemaining;
    }

    /**
     * @dev Returns claimable amount for an allocation
     * @param _allocationId Allocation ID
     * @return claimableAmount Amount that can be claimed now
     */
    function getClaimableAmount(uint256 _allocationId) external view returns (uint256) {
        uint256 vestedAmount = calculateVestedAmount(_allocationId);
        return vestedAmount - claimedAmounts[_allocationId];
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns equity allocation information
     * @param _allocationId Allocation ID
     * @return allocation The equity allocation
     */
    function getAllocation(uint256 _allocationId) external view returns (EquityAllocation memory) {
        return _allocations[_allocationId];
    }

    /**
     * @dev Returns VC's allocations
     * @param _vc VC address
     * @return allocationIds Array of allocation IDs
     */
    function getVCAllocations(address _vc) external view returns (uint256[] memory) {
        return _vcAllocations[_vc];
    }

    /**
     * @dev Returns round's allocations
     * @param _roundId Round ID
     * @return allocationIds Array of allocation IDs
     */
    function getRoundAllocations(uint256 _roundId) external view returns (uint256[] memory) {
        return _roundAllocations[_roundId];
    }

    /**
     * @dev Returns total value locked in escrow
     * @return totalETH Total ETH locked in escrow
     */
    function getTotalValueLocked() external view returns (uint256) {
        // Sum all escrowed ETH across all rounds
        // Note: In a real implementation, you'd track this more efficiently
        return address(this).balance;
    }

    /**
     * @dev Returns vesting status for an allocation
     * @param _allocationId Allocation ID
     * @return status Vesting status information
     */
    function getVestingStatus(uint256 _allocationId) external view returns (
        uint256 totalShares,
        uint256 vestedShares,
        uint256 claimedShares,
        uint256 claimableShares,
        bool cliffMet,
        uint256 nextVestingTime
    ) {
        EquityAllocation memory allocation = _allocations[_allocationId];
        
        totalShares = allocation.shares;
        vestedShares = calculateVestedAmount(_allocationId);
        claimedShares = claimedAmounts[_allocationId];
        claimableShares = vestedShares - claimedShares;
        
        uint256 elapsedTime = block.timestamp - allocation.startTime;
        cliffMet = elapsedTime >= allocation.cliffPeriod;
        
        if (!cliffMet) {
            nextVestingTime = allocation.startTime + allocation.cliffPeriod;
        } else if (elapsedTime < allocation.vestingPeriod) {
            nextVestingTime = block.timestamp + 30 days; // Next monthly vesting
        } else {
            nextVestingTime = 0; // Fully vested
        }
    }

    // =============================================================
    //                    ADMIN FUNCTIONS
    // =============================================================

    /**
     * @dev Updates vesting schedule for an allocation
     * @param _allocationId Allocation ID
     * @param _newCliffPeriod New cliff period
     * @param _newVestingPeriod New vesting period
     */
    function updateVestingSchedule(
        uint256 _allocationId,
        uint256 _newCliffPeriod,
        uint256 _newVestingPeriod
    ) external onlyRole(GOVERNANCE_ROLE) {
        EquityAllocation storage allocation = _allocations[_allocationId];
        if (allocation.vc == address(0)) revert AllocationNotFound();
        if (_newCliffPeriod > MAX_CLIFF_PERIOD) revert InvalidCliffPeriod();
        if (_newVestingPeriod > MAX_VESTING_PERIOD) revert InvalidVestingPeriod();

        allocation.cliffPeriod = _newCliffPeriod;
        allocation.vestingPeriod = _newVestingPeriod;

        emit VestingScheduleUpdated(_allocationId, _newCliffPeriod, _newVestingPeriod);
    }

    /**
     * @dev Updates default vesting parameters
     * @param _newCliffPeriod New default cliff period
     * @param _newVestingPeriod New default vesting period
     */
    function updateDefaultVestingPeriods(
        uint256 _newCliffPeriod,
        uint256 _newVestingPeriod
    ) external onlyRole(GOVERNANCE_ROLE) {
        if (_newCliffPeriod > MAX_CLIFF_PERIOD) revert InvalidCliffPeriod();
        if (_newVestingPeriod > MAX_VESTING_PERIOD) revert InvalidVestingPeriod();

        defaultCliffPeriod = _newCliffPeriod;
        defaultVestingPeriod = _newVestingPeriod;
    }

    /**
     * @dev Emergency withdrawal of ETH
     * @param _amount Amount to withdraw
     * @param _recipient Recipient address
     */
    function emergencyWithdrawETH(
        uint256 _amount,
        address payable _recipient
    ) external onlyRole(GOVERNANCE_ROLE) {
        if (_recipient == address(0)) revert InvalidAddress();
        if (_amount > address(this).balance) revert InsufficientFunds();

        _recipient.transfer(_amount);
    }

    /**
     * @dev Pauses all operations
     */
    function pause() external onlyRole(GOVERNANCE_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all operations
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
     * @dev Receives ETH for escrow
     */
    receive() external payable {
        // Allow direct ETH deposits for escrow
    }
}
