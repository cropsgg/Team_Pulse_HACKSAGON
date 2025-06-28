// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "../interfaces/IImpactChainCore.sol";

/**
 * @title NGORegistry
 * @dev UUPS upgradeable contract for NGO registration and verification
 * @notice Manages NGO profiles, verification status, and reputation scores
 */
contract NGORegistry is 
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

    /// @dev Role for verifying NGOs
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    /// @dev Role for updating reputation scores
    bytes32 public constant REPUTATION_MANAGER_ROLE = keccak256("REPUTATION_MANAGER_ROLE");
    
    /// @dev Role for governance operations
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @dev Maximum reputation score
    uint256 public constant MAX_REPUTATION_SCORE = 1000;

    /// @dev Minimum reputation score required for donations
    uint256 public constant MIN_REPUTATION_FOR_DONATIONS = 100;

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Counter for NGO IDs
    uint256 private _ngoIdCounter;

    /// @dev Mapping from NGO ID to NGO profile
    mapping(uint256 => NGOProfile) private _ngoProfiles;

    /// @dev Mapping from NGO address to NGO ID
    mapping(address => uint256) private _ngoAddressToId;

    /// @dev Array of all registered NGO IDs for enumeration
    uint256[] private _allNgoIds;

    /// @dev Mapping to track NGO verification history
    mapping(uint256 => mapping(address => bool)) private _verificationHistory;

    /// @dev Mapping to track NGO KYC documents
    mapping(uint256 => string[]) private _kycDocuments;

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when NGO reputation is updated
    event ReputationUpdated(
        uint256 indexed ngoId,
        uint256 oldScore,
        uint256 newScore,
        address indexed updater
    );

    /// @dev Emitted when NGO status is updated
    event NGOStatusUpdated(
        uint256 indexed ngoId,
        NGOStatus oldStatus,
        NGOStatus newStatus,
        address indexed updater
    );

    /// @dev Emitted when KYC documents are added
    event KYCDocumentAdded(
        uint256 indexed ngoId,
        string documentHash,
        address indexed verifier
    );

    // =============================================================
    //                        ERRORS
    // =============================================================

    error NGOAlreadyRegistered();
    error InvalidReputationScore();
    error NGONotFound();
    error InsufficientReputation();
    error InvalidDocumentHash();

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
     * @dev Initializes the NGO Registry
     * @param _admin Initial admin address
     * @param _governance Governance contract address
     */
    function initialize(
        address _admin,
        address _governance
    ) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _governance);
        _grantRole(VERIFIER_ROLE, _admin);
        _grantRole(REPUTATION_MANAGER_ROLE, _admin);

        _ngoIdCounter = 1; // Start from 1
    }

    // =============================================================
    //                    REGISTRATION FUNCTIONS
    // =============================================================

    /**
     * @dev Registers a new NGO
     * @param _profileHash IPFS hash of NGO profile details
     * @param _ngoAddress NGO's wallet address
     * @return ngoId The assigned NGO ID
     */
    function registerNGO(
        string calldata _profileHash,
        address payable _ngoAddress
    ) external whenNotPaused nonReentrant returns (uint256) {
        if (_ngoAddress == address(0)) revert InvalidAddress();
        if (_ngoAddressToId[_ngoAddress] != 0) revert NGOAlreadyRegistered();
        if (bytes(_profileHash).length == 0) revert InvalidDocumentHash();

        uint256 ngoId = _ngoIdCounter++;
        
        _ngoProfiles[ngoId] = NGOProfile({
            profileHash: _profileHash,
            status: NGOStatus.Pending,
            reputationScore: 0,
            registrationTime: block.timestamp,
            ngoAddress: _ngoAddress,
            totalReceived: 0,
            totalReleased: 0
        });

        _ngoAddressToId[_ngoAddress] = ngoId;
        _allNgoIds.push(ngoId);

        emit NGORegistered(ngoId, _ngoAddress, _profileHash);
        
        return ngoId;
    }

    /**
     * @dev Verifies an NGO and sets initial reputation
     * @param _ngoId NGO ID to verify
     * @param _status New verification status
     * @param _initialReputation Initial reputation score
     */
    function verifyNGO(
        uint256 _ngoId,
        NGOStatus _status,
        uint256 _initialReputation
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        NGOProfile storage ngo = _ngoProfiles[_ngoId];
        if (ngo.ngoAddress == address(0)) revert NGONotFound();
        if (_initialReputation > MAX_REPUTATION_SCORE) revert InvalidReputationScore();

        NGOStatus oldStatus = ngo.status;
        ngo.status = _status;
        
        if (_status == NGOStatus.Verified && ngo.reputationScore == 0) {
            ngo.reputationScore = _initialReputation;
        }

        _verificationHistory[_ngoId][msg.sender] = true;

        emit NGOVerified(_ngoId, _status, ngo.reputationScore);
        emit NGOStatusUpdated(_ngoId, oldStatus, _status, msg.sender);
    }

    /**
     * @dev Updates NGO reputation score
     * @param _ngoId NGO ID
     * @param _newScore New reputation score
     */
    function updateReputation(
        uint256 _ngoId,
        uint256 _newScore
    ) external onlyRole(REPUTATION_MANAGER_ROLE) whenNotPaused {
        NGOProfile storage ngo = _ngoProfiles[_ngoId];
        if (ngo.ngoAddress == address(0)) revert NGONotFound();
        if (_newScore > MAX_REPUTATION_SCORE) revert InvalidReputationScore();

        uint256 oldScore = ngo.reputationScore;
        ngo.reputationScore = _newScore;

        emit ReputationUpdated(_ngoId, oldScore, _newScore, msg.sender);
    }

    /**
     * @dev Updates financial tracking for an NGO
     * @param _ngoId NGO ID
     * @param _receivedAmount Amount received
     * @param _releasedAmount Amount released
     */
    function updateFinancials(
        uint256 _ngoId,
        uint256 _receivedAmount,
        uint256 _releasedAmount
    ) external onlyRole(REPUTATION_MANAGER_ROLE) whenNotPaused {
        NGOProfile storage ngo = _ngoProfiles[_ngoId];
        if (ngo.ngoAddress == address(0)) revert NGONotFound();

        ngo.totalReceived += _receivedAmount;
        ngo.totalReleased += _releasedAmount;
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns NGO profile information
     * @param _ngoId NGO ID
     * @return profile The NGO profile
     */
    function getNGOProfile(uint256 _ngoId) external view returns (NGOProfile memory) {
        return _ngoProfiles[_ngoId];
    }

    /**
     * @dev Returns NGO ID for a given address
     * @param _ngoAddress NGO address
     * @return ngoId The NGO ID (0 if not found)
     */
    function getNGOIdByAddress(address _ngoAddress) external view returns (uint256) {
        return _ngoAddressToId[_ngoAddress];
    }

    /**
     * @dev Returns whether an NGO can receive donations
     * @param _ngoId NGO ID
     * @return canReceive True if NGO can receive donations
     */
    function canReceiveDonations(uint256 _ngoId) external view returns (bool) {
        NGOProfile memory ngo = _ngoProfiles[_ngoId];
        return ngo.status == NGOStatus.Verified && 
               ngo.reputationScore >= MIN_REPUTATION_FOR_DONATIONS;
    }

    /**
     * @dev Returns total number of registered NGOs
     * @return count Total NGO count
     */
    function getTotalNGOCount() external view returns (uint256) {
        return _allNgoIds.length;
    }

    // =============================================================
    //                    ADMIN FUNCTIONS
    // =============================================================

    /**
     * @dev Pauses all registry operations
     */
    function pause() external onlyRole(GOVERNANCE_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all registry operations
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
}
