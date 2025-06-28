// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IImpactChainCore
 * @dev Core interface defining shared data structures and events for ImpactChain & CharityChain
 */
interface IImpactChainCore {
    // =============================================================
    //                          STRUCTS
    // =============================================================

    /// @dev NGO profile information
    struct NGOProfile {
        string profileHash;         // IPFS hash of NGO details
        NGOStatus status;          // Current verification status
        uint256 reputationScore;   // Reputation score (0-1000)
        uint256 registrationTime; // Block timestamp of registration
        address payable ngoAddress; // NGO's wallet address
        uint256 totalReceived;     // Total donations received
        uint256 totalReleased;     // Total funds released to NGO
    }

    /// @dev Startup profile information
    struct StartupProfile {
        address founder;           // Founder's address
        string valuationHash;      // IPFS hash of valuation docs
        address equityToken;       // ERC-20 token for equity
        uint256 targetFunding;     // Target funding amount in wei
        uint256 currentFunding;    // Current funding raised
        bool isAccepted;          // Whether VC vote passed
        uint256 votingEndTime;    // When voting period ends
    }

    /// @dev Donation record
    struct Donation {
        address donor;            // Donor's address
        uint256 ngoId;           // Target NGO ID
        uint256 amount;          // Donation amount in wei
        uint256 timestamp;       // Block timestamp
        uint256 usdValueAtTime;  // USD value when donated
        string message;          // Optional message from donor
    }

    /// @dev Milestone information
    struct Milestone {
        uint256 parentId;        // Parent campaign/project ID
        string goal;             // IPFS hash of milestone description
        uint256 requiredAmount;  // Amount needed to release
        uint256 releasedAmount;  // Amount already released
        bool isCompleted;        // Whether milestone is completed
        uint256 deadline;        // Deadline for completion
        address verifier;        // Address that can verify completion
    }

    /// @dev Equity allocation record
    struct EquityAllocation {
        address vc;              // VC's address
        uint256 roundId;         // Funding round ID
        uint256 shares;          // Number of shares allocated
        uint256 cliffPeriod;     // Cliff period in seconds
        uint256 vestingPeriod;   // Total vesting period in seconds
        uint256 startTime;       // When vesting starts
    }

    /// @dev Q&A memory for AI bot
    struct QAMemory {
        string contentHash;      // IPFS hash of Q&A content
        string cid;             // IPFS CID for direct access
        string language;        // Language code (en, es, fr, etc.)
        uint256 timestamp;      // When added
        address contributor;    // Who added this knowledge
    }

    /// @dev CSR grant record
    struct CSRGrant {
        address company;        // Company providing CSR funding
        uint256 ngoId;         // Beneficiary NGO ID
        uint256 amount;        // Grant amount
        string taxDocHash;     // IPFS hash of tax documentation
        uint256 timestamp;     // When grant was made
        string description;    // Grant description
    }

    // =============================================================
    //                          ENUMS
    // =============================================================

    /// @dev NGO verification status
    enum NGOStatus {
        Pending,      // Newly registered, awaiting verification
        Verified,     // Verified and can receive donations
        Suspended,    // Temporarily suspended
        Rejected      // Rejected and cannot receive donations
    }

    /// @dev Funding round status
    enum RoundStatus {
        Pending,      // Awaiting VC votes
        Active,       // Currently accepting investments
        Successful,   // Target reached
        Failed,       // Target not reached by deadline
        Cancelled     // Cancelled by founder or governance
    }

    // =============================================================
    //                          EVENTS
    // =============================================================

    /// @dev Emitted when an NGO registers
    event NGORegistered(
        uint256 indexed ngoId,
        address indexed ngoAddress,
        string profileHash
    );

    /// @dev Emitted when an NGO is verified
    event NGOVerified(
        uint256 indexed ngoId,
        NGOStatus indexed newStatus,
        uint256 reputationScore
    );

    /// @dev Emitted when a startup is listed
    event StartupListed(
        uint256 indexed startupId,
        address indexed founder,
        string valuationHash
    );

    /// @dev Emitted when a funding round opens
    event FundingRoundOpened(
        uint256 indexed startupId,
        uint256 indexed roundId,
        uint256 targetAmount
    );

    /// @dev Emitted when a donation is made
    event DonationIn(
        uint256 indexed donationId,
        address indexed donor,
        uint256 indexed ngoId,
        uint256 amount,
        uint256 usdValue
    );

    /// @dev Emitted when milestone funds are released
    event MilestoneReleased(
        uint256 indexed milestoneId,
        uint256 indexed parentId,
        uint256 amount,
        address indexed recipient
    );

    /// @dev Emitted when equity is assigned
    event EquityAssigned(
        uint256 indexed roundId,
        address indexed vc,
        uint256 shares,
        uint256 cliffPeriod
    );

    /// @dev Emitted when Q&A knowledge is stored
    event QAStored(
        uint256 indexed qaId,
        string contentHash,
        string language,
        address indexed contributor
    );

    /// @dev Emitted when fees are updated
    event FeeUpdated(
        uint256 indexed oldFee,
        uint256 indexed newFee,
        address indexed treasury
    );

    /// @dev Emitted when CSR grant is recorded
    event CSRGrantRecorded(
        uint256 indexed grantId,
        address indexed company,
        uint256 indexed ngoId,
        uint256 amount
    );

    /// @dev Emitted when milestone check is requested
    event MilestoneCheckRequested(
        uint256 indexed milestoneId,
        address indexed verifier,
        string proofHash
    );

    // =============================================================
    //                        ERROR TYPES
    // =============================================================

    error UnauthorizedAccess();
    error InvalidAmount();
    error InvalidAddress();
    error InvalidNGOId();
    error InvalidStartupId();
    error NGONotVerified();
    error InsufficientFunds();
    error MilestoneNotCompleted();
    error DeadlineExceeded();
    error AlreadyCompleted();
    error VotingStillActive();
    error InvalidStatus();
}
