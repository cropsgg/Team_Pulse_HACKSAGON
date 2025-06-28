// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "../interfaces/IImpactChainCore.sol";

interface IDonationManager {
    function releaseFunds(uint256 _ngoId, uint256 _amount, string calldata _reason) external;
    function getEscrowedFunds(uint256 _ngoId) external view returns (uint256);
}

interface INGORegistry {
    function getNGOProfile(uint256 _ngoId) external view returns (IImpactChainCore.NGOProfile memory);
    function incrementReputation(uint256 _ngoId, uint256 _increment) external;
}

/**
 * @title MilestoneManager
 * @dev UUPS upgradeable contract for managing project milestones and fund releases
 * @notice Handles milestone creation, verification, and automated fund releases
 */
contract MilestoneManager is 
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

    /// @dev Role for verifying milestones
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    /// @dev Role for AI verification systems
    bytes32 public constant AI_VERIFIER_ROLE = keccak256("AI_VERIFIER_ROLE");
    
    /// @dev Role for governance operations
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @dev Role for emergency operations
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    /// @dev Reputation increment for successful milestone completion
    uint256 public constant REPUTATION_INCREMENT = 10;

    /// @dev Maximum milestone duration (90 days)
    uint256 public constant MAX_MILESTONE_DURATION = 90 days;

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Counter for milestone IDs
    uint256 private _milestoneIdCounter;

    /// @dev Donation Manager contract
    IDonationManager public donationManager;

    /// @dev NGO Registry contract
    INGORegistry public ngoRegistry;

    /// @dev Mapping from milestone ID to milestone data
    mapping(uint256 => Milestone) private _milestones;

    /// @dev Mapping from parent ID (NGO/Project) to milestone IDs
    mapping(uint256 => uint256[]) private _parentMilestones;

    /// @dev Mapping from milestone ID to verification proofs
    mapping(uint256 => string[]) private _verificationProofs;

    /// @dev Mapping from milestone ID to verifier votes
    mapping(uint256 => mapping(address => bool)) private _verifierVotes;

    /// @dev Mapping from milestone ID to number of verifications needed
    mapping(uint256 => uint256) public verificationsRequired;

    /// @dev Mapping from milestone ID to current verification count
    mapping(uint256 => uint256) public currentVerifications;

    /// @dev Total milestones created
    uint256 public totalMilestones;

    /// @dev Total milestones completed
    uint256 public completedMilestones;

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when a milestone is created
    event MilestoneCreated(
        uint256 indexed milestoneId,
        uint256 indexed parentId,
        uint256 requiredAmount,
        uint256 deadline
    );

    /// @dev Emitted when verification proof is submitted
    event VerificationProofSubmitted(
        uint256 indexed milestoneId,
        address indexed verifier,
        string proofHash
    );

    /// @dev Emitted when milestone is verified by a verifier
    event MilestoneVerified(
        uint256 indexed milestoneId,
        address indexed verifier,
        uint256 currentVerifications,
        uint256 requiredVerifications
    );

    /// @dev Emitted when milestone completion status changes
    event MilestoneCompleted(
        uint256 indexed milestoneId,
        uint256 indexed parentId,
        uint256 releasedAmount,
        address indexed ngoAddress
    );

    /// @dev Emitted when milestone is rejected
    event MilestoneRejected(
        uint256 indexed milestoneId,
        address indexed verifier,
        string reason
    );

    // =============================================================
    //                        ERRORS
    // =============================================================

    error MilestoneNotFound();
    error MilestoneAlreadyCompleted();
    error MilestoneDeadlineExceeded();
    error InvalidDeadline();
    error InsufficientVerifications();
    error AlreadyVerified();
    error VerificationNotAllowed();
    error InvalidProofHash();

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
     * @dev Initializes the Milestone Manager
     * @param _admin Initial admin address
     * @param _governance Governance contract address
     * @param _donationManager Donation Manager contract address
     * @param _ngoRegistry NGO Registry contract address
     */
    function initialize(
        address _admin,
        address _governance,
        address _donationManager,
        address _ngoRegistry
    ) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _governance);
        _grantRole(VERIFIER_ROLE, _admin);
        _grantRole(AI_VERIFIER_ROLE, _admin);
        _grantRole(EMERGENCY_ROLE, _admin);

        donationManager = IDonationManager(_donationManager);
        ngoRegistry = INGORegistry(_ngoRegistry);

        _milestoneIdCounter = 1; // Start from 1
    }

    // =============================================================
    //                    MILESTONE FUNCTIONS
    // =============================================================

    /**
     * @dev Creates a new milestone for an NGO/project
     * @param _parentId Parent NGO/project ID
     * @param _goal IPFS hash of milestone description
     * @param _requiredAmount Amount needed to complete milestone
     * @param _deadline Deadline for milestone completion
     * @param _verifier Address that can verify this milestone
     * @param _verificationsNeeded Number of verifications required
     * @return milestoneId The assigned milestone ID
     */
    function createMilestone(
        uint256 _parentId,
        string calldata _goal,
        uint256 _requiredAmount,
        uint256 _deadline,
        address _verifier,
        uint256 _verificationsNeeded
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused returns (uint256) {
        if (_deadline <= block.timestamp) revert InvalidDeadline();
        if (_deadline > block.timestamp + MAX_MILESTONE_DURATION) revert InvalidDeadline();
        if (bytes(_goal).length == 0) revert InvalidProofHash();
        if (_requiredAmount == 0) revert InvalidAmount();
        if (_verificationsNeeded == 0) _verificationsNeeded = 1;

        uint256 milestoneId = _milestoneIdCounter++;

        _milestones[milestoneId] = Milestone({
            parentId: _parentId,
            goal: _goal,
            requiredAmount: _requiredAmount,
            releasedAmount: 0,
            isCompleted: false,
            deadline: _deadline,
            verifier: _verifier
        });

        verificationsRequired[milestoneId] = _verificationsNeeded;
        _parentMilestones[_parentId].push(milestoneId);
        totalMilestones++;

        emit MilestoneCreated(milestoneId, _parentId, _requiredAmount, _deadline);
        
        return milestoneId;
    }

    /**
     * @dev Submits verification proof for a milestone
     * @param _milestoneId Milestone ID
     * @param _proofHash IPFS hash of verification proof
     */
    function submitVerificationProof(
        uint256 _milestoneId,
        string calldata _proofHash
    ) external whenNotPaused {
        Milestone storage milestone = _milestones[_milestoneId];
        if (milestone.verifier == address(0)) revert MilestoneNotFound();
        if (milestone.isCompleted) revert MilestoneAlreadyCompleted();
        if (block.timestamp > milestone.deadline) revert MilestoneDeadlineExceeded();
        if (bytes(_proofHash).length == 0) revert InvalidProofHash();

        // Allow milestone verifier or any verifier role
        if (msg.sender != milestone.verifier && 
            !hasRole(VERIFIER_ROLE, msg.sender) && 
            !hasRole(AI_VERIFIER_ROLE, msg.sender)) {
            revert VerificationNotAllowed();
        }

        _verificationProofs[_milestoneId].push(_proofHash);

        emit VerificationProofSubmitted(_milestoneId, msg.sender, _proofHash);
        emit MilestoneCheckRequested(_milestoneId, msg.sender, _proofHash);
    }

    /**
     * @dev Verifies a milestone completion
     * @param _milestoneId Milestone ID
     * @param _approved Whether to approve the milestone
     * @param _reason Reason for approval/rejection
     */
    function verifyMilestone(
        uint256 _milestoneId,
        bool _approved,
        string calldata _reason
    ) external whenNotPaused {
        Milestone storage milestone = _milestones[_milestoneId];
        if (milestone.verifier == address(0)) revert MilestoneNotFound();
        if (milestone.isCompleted) revert MilestoneAlreadyCompleted();
        if (_verifierVotes[_milestoneId][msg.sender]) revert AlreadyVerified();

        // Allow milestone verifier, verifier role, or AI verifier role
        if (msg.sender != milestone.verifier && 
            !hasRole(VERIFIER_ROLE, msg.sender) && 
            !hasRole(AI_VERIFIER_ROLE, msg.sender)) {
            revert VerificationNotAllowed();
        }

        if (_approved) {
            _verifierVotes[_milestoneId][msg.sender] = true;
            currentVerifications[_milestoneId]++;

            emit MilestoneVerified(
                _milestoneId, 
                msg.sender, 
                currentVerifications[_milestoneId],
                verificationsRequired[_milestoneId]
            );

            // Check if enough verifications to complete milestone
            if (currentVerifications[_milestoneId] >= verificationsRequired[_milestoneId]) {
                _completeMilestone(_milestoneId);
            }
        } else {
            emit MilestoneRejected(_milestoneId, msg.sender, _reason);
        }
    }

    /**
     * @dev Batch verify multiple milestones
     * @param _milestoneIds Array of milestone IDs
     * @param _approvals Array of approval decisions
     * @param _reason Reason for batch operation
     */
    function batchVerifyMilestones(
        uint256[] calldata _milestoneIds,
        bool[] calldata _approvals,
        string calldata _reason
    ) external whenNotPaused {
        if (_milestoneIds.length != _approvals.length) revert InvalidAmount();

        for (uint256 i = 0; i < _milestoneIds.length; i++) {
            verifyMilestone(_milestoneIds[i], _approvals[i], _reason);
        }
    }

    /**
     * @dev Manually completes a milestone (emergency use)
     * @param _milestoneId Milestone ID
     * @param _reason Emergency reason
     */
    function emergencyCompleteMilestone(
        uint256 _milestoneId,
        string calldata _reason
    ) external onlyRole(EMERGENCY_ROLE) {
        _completeMilestone(_milestoneId);
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns milestone information
     * @param _milestoneId Milestone ID
     * @return milestone The milestone data
     */
    function getMilestone(uint256 _milestoneId) external view returns (Milestone memory) {
        return _milestones[_milestoneId];
    }

    /**
     * @dev Returns milestones for a parent (NGO/project)
     * @param _parentId Parent ID
     * @return milestoneIds Array of milestone IDs
     */
    function getMilestonesForParent(uint256 _parentId) external view returns (uint256[] memory) {
        return _parentMilestones[_parentId];
    }

    /**
     * @dev Returns verification proofs for a milestone
     * @param _milestoneId Milestone ID
     * @return proofs Array of proof hashes
     */
    function getVerificationProofs(uint256 _milestoneId) external view returns (string[] memory) {
        return _verificationProofs[_milestoneId];
    }

    /**
     * @dev Checks if an address has verified a milestone
     * @param _milestoneId Milestone ID
     * @param _verifier Verifier address
     * @return verified True if already verified
     */
    function hasVerified(uint256 _milestoneId, address _verifier) external view returns (bool) {
        return _verifierVotes[_milestoneId][_verifier];
    }

    /**
     * @dev Returns milestone completion rate for a parent
     * @param _parentId Parent ID
     * @return completionRate Completion rate in basis points (10000 = 100%)
     */
    function getCompletionRate(uint256 _parentId) external view returns (uint256) {
        uint256[] memory milestones = _parentMilestones[_parentId];
        if (milestones.length == 0) return 0;

        uint256 completed = 0;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (_milestones[milestones[i]].isCompleted) {
                completed++;
            }
        }

        return (completed * 10000) / milestones.length;
    }

    // =============================================================
    //                    INTERNAL FUNCTIONS
    // =============================================================

    /**
     * @dev Internal function to complete a milestone
     * @param _milestoneId Milestone ID
     */
    function _completeMilestone(uint256 _milestoneId) internal nonReentrant {
        Milestone storage milestone = _milestones[_milestoneId];
        if (milestone.isCompleted) revert MilestoneAlreadyCompleted();

        // Mark as completed
        milestone.isCompleted = true;
        milestone.releasedAmount = milestone.requiredAmount;
        completedMilestones++;

        // Get NGO profile
        IImpactChainCore.NGOProfile memory ngoProfile = ngoRegistry.getNGOProfile(milestone.parentId);

        // Release funds through donation manager
        donationManager.releaseFunds(
            milestone.parentId,
            milestone.requiredAmount,
            string(abi.encodePacked("Milestone ", _milestoneId, " completed"))
        );

        // Increment NGO reputation
        ngoRegistry.incrementReputation(milestone.parentId, REPUTATION_INCREMENT);

        emit MilestoneReleased(_milestoneId, milestone.parentId, milestone.requiredAmount, ngoProfile.ngoAddress);
        emit MilestoneCompleted(_milestoneId, milestone.parentId, milestone.requiredAmount, ngoProfile.ngoAddress);
    }

    // =============================================================
    //                    ADMIN FUNCTIONS
    // =============================================================

    /**
     * @dev Updates required verifications for future milestones
     * @param _milestoneId Milestone ID
     * @param _newRequirement New verification requirement
     */
    function updateVerificationRequirement(
        uint256 _milestoneId,
        uint256 _newRequirement
    ) external onlyRole(GOVERNANCE_ROLE) {
        if (_newRequirement == 0) revert InvalidAmount();
        verificationsRequired[_milestoneId] = _newRequirement;
    }

    /**
     * @dev Pauses all milestone operations
     */
    function pause() external onlyRole(GOVERNANCE_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all milestone operations
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
