// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "../interfaces/IImpactChainCore.sol";

/**
 * @title StartupRegistry
 * @dev UUPS upgradeable contract for startup registration and funding rounds
 * @notice Manages startup profiles, VC voting, and funding round management
 */
contract StartupRegistry is 
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

    /// @dev Role for VC participants
    bytes32 public constant VC_ROLE = keccak256("VC_ROLE");
    
    /// @dev Role for governance operations
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @dev Required percentage of VC votes to pass (40%)
    uint256 public constant REQUIRED_VC_VOTE_PERCENTAGE = 40;

    /// @dev Voting period duration (7 days)
    uint256 public constant VOTING_PERIOD = 7 days;

    /// @dev Maximum funding round duration (90 days)
    uint256 public constant MAX_FUNDING_DURATION = 90 days;

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Counter for startup IDs
    uint256 private _startupIdCounter;

    /// @dev Counter for funding round IDs
    uint256 private _roundIdCounter;

    /// @dev Mapping from startup ID to startup profile
    mapping(uint256 => StartupProfile) private _startupProfiles;

    /// @dev Mapping from founder address to startup ID
    mapping(address => uint256) private _founderToStartupId;

    /// @dev Array of all registered startup IDs
    uint256[] private _allStartupIds;

    /// @dev Mapping from startup ID to funding round IDs
    mapping(uint256 => uint256[]) private _startupFundingRounds;

    /// @dev Mapping from round ID to funding round data
    mapping(uint256 => FundingRound) private _fundingRounds;

    /// @dev Mapping from round ID to VC votes
    mapping(uint256 => mapping(address => VCVote)) private _vcVotes;

    /// @dev Mapping from round ID to vote counts
    mapping(uint256 => VoteCounts) private _voteCounts;

    /// @dev Total number of registered VCs
    uint256 public totalVCs;

    /// @dev Minimum stake required to become a VC
    uint256 public minimumVCStake;

    /// @dev Mapping to track VC stakes
    mapping(address => uint256) public vcStakes;

    // =============================================================
    //                        STRUCTS
    // =============================================================

    /// @dev Funding round information
    struct FundingRound {
        uint256 startupId;          // Associated startup ID
        uint256 targetAmount;       // Target funding amount
        uint256 raisedAmount;       // Amount raised so far
        uint256 votingEndTime;      // When voting ends
        uint256 fundingEndTime;     // When funding round ends
        RoundStatus status;         // Current status
        bool vcVotePassed;          // Whether 40% VC vote passed
        uint256 valuation;          // Company valuation
        string terms;               // IPFS hash of funding terms
    }

    /// @dev VC vote information
    struct VCVote {
        bool hasVoted;              // Whether VC has voted
        bool support;               // Vote decision (support/against)
        uint256 weight;             // Vote weight based on stake
        string reason;              // Reason for vote
    }

    /// @dev Vote counting structure
    struct VoteCounts {
        uint256 totalVotes;         // Total votes cast
        uint256 supportVotes;       // Votes in support
        uint256 againstVotes;       // Votes against
        uint256 totalWeight;        // Total voting weight
        uint256 supportWeight;      // Weight of support votes
    }

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when VC votes on a funding round
    event VCVoteCast(
        uint256 indexed roundId,
        address indexed vc,
        bool support,
        uint256 weight,
        string reason
    );

    /// @dev Emitted when funding round voting concludes
    event VotingConcluded(
        uint256 indexed roundId,
        bool passed,
        uint256 supportPercentage
    );

    /// @dev Emitted when VC joins platform
    event VCRegistered(
        address indexed vc,
        uint256 stake
    );

    /// @dev Emitted when funding is received
    event FundingReceived(
        uint256 indexed roundId,
        address indexed investor,
        uint256 amount
    );

    // =============================================================
    //                        ERRORS
    // =============================================================

    error StartupAlreadyRegistered();
    error StartupNotFound();
    error FundingRoundNotFound();
    error VotingPeriodEnded();
    error VotingStillActive();
    error AlreadyVoted();
    error NotAuthorizedVC();
    error InsufficientStake();
    error InvalidValuation();
    error RoundNotActive();

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
     * @dev Initializes the Startup Registry
     * @param _admin Initial admin address
     * @param _governance Governance contract address
     * @param _minimumVCStake Minimum stake required for VC role
     */
    function initialize(
        address _admin,
        address _governance,
        uint256 _minimumVCStake
    ) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _governance);
        _grantRole(VC_ROLE, _admin);

        minimumVCStake = _minimumVCStake;
        _startupIdCounter = 1;
        _roundIdCounter = 1;
    }

    // =============================================================
    //                    STARTUP FUNCTIONS
    // =============================================================

    /**
     * @dev Registers a new startup
     * @param _founder Founder's address
     * @param _valuationHash IPFS hash of valuation documents
     * @param _equityToken Token contract for equity distribution
     * @param _targetFunding Initial target funding amount
     * @return startupId The assigned startup ID
     */
    function registerStartup(
        address _founder,
        string calldata _valuationHash,
        address _equityToken,
        uint256 _targetFunding
    ) external whenNotPaused returns (uint256) {
        if (_founder == address(0)) revert InvalidAddress();
        if (_founderToStartupId[_founder] != 0) revert StartupAlreadyRegistered();
        if (bytes(_valuationHash).length == 0) revert InvalidValuation();
        if (_targetFunding == 0) revert InvalidAmount();

        uint256 startupId = _startupIdCounter++;

        _startupProfiles[startupId] = StartupProfile({
            founder: _founder,
            valuationHash: _valuationHash,
            equityToken: _equityToken,
            targetFunding: _targetFunding,
            currentFunding: 0,
            isAccepted: false,
            votingEndTime: 0
        });

        _founderToStartupId[_founder] = startupId;
        _allStartupIds.push(startupId);

        emit StartupListed(startupId, _founder, _valuationHash);
        
        return startupId;
    }

    /**
     * @dev Creates a funding round for a startup
     * @param _startupId Startup ID
     * @param _targetAmount Target funding amount
     * @param _valuation Company valuation
     * @param _terms IPFS hash of funding terms
     * @return roundId The assigned round ID
     */
    function createFundingRound(
        uint256 _startupId,
        uint256 _targetAmount,
        uint256 _valuation,
        string calldata _terms
    ) external whenNotPaused returns (uint256) {
        StartupProfile storage startup = _startupProfiles[_startupId];
        if (startup.founder == address(0)) revert StartupNotFound();
        if (msg.sender != startup.founder && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedAccess();
        }

        uint256 roundId = _roundIdCounter++;
        uint256 votingEndTime = block.timestamp + VOTING_PERIOD;
        uint256 fundingEndTime = votingEndTime + MAX_FUNDING_DURATION;

        _fundingRounds[roundId] = FundingRound({
            startupId: _startupId,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            votingEndTime: votingEndTime,
            fundingEndTime: fundingEndTime,
            status: RoundStatus.Pending,
            vcVotePassed: false,
            valuation: _valuation,
            terms: _terms
        });

        _startupFundingRounds[_startupId].push(roundId);

        // Update startup voting end time
        startup.votingEndTime = votingEndTime;

        emit FundingRoundOpened(_startupId, roundId, _targetAmount);
        
        return roundId;
    }

    // =============================================================
    //                    VC FUNCTIONS
    // =============================================================

    /**
     * @dev Registers as a VC with stake
     */
    function registerAsVC() external payable whenNotPaused {
        if (msg.value < minimumVCStake) revert InsufficientStake();
        if (hasRole(VC_ROLE, msg.sender)) revert("Already registered as VC");

        vcStakes[msg.sender] = msg.value;
        _grantRole(VC_ROLE, msg.sender);
        totalVCs++;

        emit VCRegistered(msg.sender, msg.value);
    }

    /**
     * @dev Casts VC vote on a funding round
     * @param _roundId Funding round ID
     * @param _support Whether to support the round
     * @param _reason Reason for the vote
     */
    function castVCVote(
        uint256 _roundId,
        bool _support,
        string calldata _reason
    ) external onlyRole(VC_ROLE) whenNotPaused {
        FundingRound storage round = _fundingRounds[_roundId];
        if (round.startupId == 0) revert FundingRoundNotFound();
        if (block.timestamp > round.votingEndTime) revert VotingPeriodEnded();
        if (_vcVotes[_roundId][msg.sender].hasVoted) revert AlreadyVoted();

        uint256 voteWeight = vcStakes[msg.sender];

        _vcVotes[_roundId][msg.sender] = VCVote({
            hasVoted: true,
            support: _support,
            weight: voteWeight,
            reason: _reason
        });

        VoteCounts storage counts = _voteCounts[_roundId];
        counts.totalVotes++;
        counts.totalWeight += voteWeight;

        if (_support) {
            counts.supportVotes++;
            counts.supportWeight += voteWeight;
        } else {
            counts.againstVotes++;
        }

        emit VCVoteCast(_roundId, msg.sender, _support, voteWeight, _reason);

        // Check if voting threshold reached
        _checkVotingThreshold(_roundId);
    }

    /**
     * @dev Concludes voting for a funding round
     * @param _roundId Funding round ID
     */
    function concludeVoting(uint256 _roundId) external whenNotPaused {
        FundingRound storage round = _fundingRounds[_roundId];
        if (round.startupId == 0) revert FundingRoundNotFound();
        if (block.timestamp <= round.votingEndTime) revert VotingStillActive();

        _processVotingResults(_roundId);
    }

    // =============================================================
    //                    FUNDING FUNCTIONS
    // =============================================================

    /**
     * @dev Invests in an active funding round
     * @param _roundId Funding round ID
     */
    function investInRound(uint256 _roundId) external payable whenNotPaused nonReentrant {
        FundingRound storage round = _fundingRounds[_roundId];
        if (round.status != RoundStatus.Active) revert RoundNotActive();
        if (block.timestamp > round.fundingEndTime) revert DeadlineExceeded();
        if (msg.value == 0) revert InvalidAmount();

        round.raisedAmount += msg.value;

        // Update startup current funding
        _startupProfiles[round.startupId].currentFunding += msg.value;

        emit FundingReceived(_roundId, msg.sender, msg.value);

        // Check if target reached
        if (round.raisedAmount >= round.targetAmount) {
            round.status = RoundStatus.Successful;
            _startupProfiles[round.startupId].isAccepted = true;
        }
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns startup profile
     * @param _startupId Startup ID
     * @return profile The startup profile
     */
    function getStartupProfile(uint256 _startupId) external view returns (StartupProfile memory) {
        return _startupProfiles[_startupId];
    }

    /**
     * @dev Returns funding round information
     * @param _roundId Round ID
     * @return round The funding round data
     */
    function getFundingRound(uint256 _roundId) external view returns (FundingRound memory) {
        return _fundingRounds[_roundId];
    }

    /**
     * @dev Returns vote counts for a round
     * @param _roundId Round ID
     * @return counts The vote counts
     */
    function getVoteCounts(uint256 _roundId) external view returns (VoteCounts memory) {
        return _voteCounts[_roundId];
    }

    /**
     * @dev Returns VC vote for a round
     * @param _roundId Round ID
     * @param _vc VC address
     * @return vote The VC vote
     */
    function getVCVote(uint256 _roundId, address _vc) external view returns (VCVote memory) {
        return _vcVotes[_roundId][_vc];
    }

    // =============================================================
    //                    INTERNAL FUNCTIONS
    // =============================================================

    /**
     * @dev Checks if voting threshold is reached
     * @param _roundId Round ID
     */
    function _checkVotingThreshold(uint256 _roundId) internal {
        VoteCounts memory counts = _voteCounts[_roundId];
        
        // If all VCs have voted or 40% support reached, conclude early
        if (counts.totalVotes >= totalVCs || 
            (counts.supportWeight * 100) >= (counts.totalWeight * REQUIRED_VC_VOTE_PERCENTAGE)) {
            _processVotingResults(_roundId);
        }
    }

    /**
     * @dev Processes voting results
     * @param _roundId Round ID
     */
    function _processVotingResults(uint256 _roundId) internal {
        FundingRound storage round = _fundingRounds[_roundId];
        VoteCounts memory counts = _voteCounts[_roundId];

        uint256 supportPercentage = counts.totalWeight > 0 ? 
            (counts.supportWeight * 100) / counts.totalWeight : 0;

        bool passed = supportPercentage >= REQUIRED_VC_VOTE_PERCENTAGE;

        round.vcVotePassed = passed;
        round.status = passed ? RoundStatus.Active : RoundStatus.Failed;

        if (passed) {
            _startupProfiles[round.startupId].isAccepted = true;
        }

        emit VotingConcluded(_roundId, passed, supportPercentage);
    }

    // =============================================================
    //                    ADMIN FUNCTIONS
    // =============================================================

    /**
     * @dev Updates minimum VC stake requirement
     * @param _newStake New minimum stake
     */
    function updateMinimumVCStake(uint256 _newStake) external onlyRole(GOVERNANCE_ROLE) {
        minimumVCStake = _newStake;
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
}
