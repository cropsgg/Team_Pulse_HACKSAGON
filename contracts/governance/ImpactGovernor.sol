// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title ImpactGovernor
 * @dev Governor contract for ImpactChain & CharityChain DAO
 * @notice Handles proposals, voting, and execution with timelock delays
 */
contract ImpactGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // =============================================================
    //                        CONSTANTS
    // =============================================================

    /// @dev Voting delay in blocks (1 day on Base ~= 43,200 blocks at 2s/block)
    uint256 private constant VOTING_DELAY = 43_200;

    /// @dev Voting period in blocks (7 days on Base ~= 302,400 blocks)
    uint256 private constant VOTING_PERIOD = 302_400;

    /// @dev Proposal threshold (0.5% of total supply)
    uint256 private constant PROPOSAL_THRESHOLD = 50_000 * 1e18; // 50k IMPACT tokens

    /// @dev Initial quorum fraction (4% for operational decisions)
    uint256 private constant INITIAL_QUORUM_NUMERATOR = 4;

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Different quorum requirements for different proposal types
    mapping(bytes32 => uint256) public customQuorums;

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when custom quorum is set for a proposal type
    event CustomQuorumSet(bytes32 indexed proposalType, uint256 quorumFraction);

    // =============================================================
    //                        ERRORS
    // =============================================================

    error InvalidQuorumFraction();
    error UnauthorizedQuorumUpdate();

    // =============================================================
    //                      CONSTRUCTOR
    // =============================================================

    /**
     * @dev Initializes the Governor with the IMPACT token and timelock
     * @param _token The IMPACT governance token
     * @param _timelock The TimelockController contract
     */
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("ImpactGovernor")
        GovernorSettings(
            VOTING_DELAY,
            VOTING_PERIOD,
            PROPOSAL_THRESHOLD
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(INITIAL_QUORUM_NUMERATOR)
        GovernorTimelockControl(_timelock)
    {
        // Set custom quorums for different proposal types
        customQuorums[keccak256("TREASURY")] = 10; // 10% for treasury operations
        customQuorums[keccak256("UPGRADE")] = 6;   // 6% for contract upgrades
        customQuorums[keccak256("EMERGENCY")] = 15; // 15% for emergency actions
    }

    // =============================================================
    //                    GOVERNANCE FUNCTIONS
    // =============================================================

    /**
     * @dev Sets custom quorum for specific proposal types
     * @param _proposalType Hash of the proposal type (e.g., keccak256("TREASURY"))
     * @param _quorumFraction The quorum fraction (percentage)
     * @notice Only callable through governance process
     */
    function setCustomQuorum(
        bytes32 _proposalType,
        uint256 _quorumFraction
    ) external onlyGovernance {
        if (_quorumFraction == 0 || _quorumFraction > 50) {
            revert InvalidQuorumFraction();
        }
        
        customQuorums[_proposalType] = _quorumFraction;
        emit CustomQuorumSet(_proposalType, _quorumFraction);
    }

    /**
     * @dev Emergency proposal for critical situations
     * @param targets Array of target addresses
     * @param values Array of ETH values
     * @param calldatas Array of calldata
     * @param description Proposal description
     * @return proposalId The ID of the created proposal
     */
    function proposeEmergency(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public returns (uint256) {
        // Add EMERGENCY tag to description for custom quorum
        string memory taggedDescription = string(
            abi.encodePacked("[EMERGENCY] ", description)
        );
        
        return propose(targets, values, calldatas, taggedDescription);
    }

    /**
     * @dev Treasury proposal for financial operations
     * @param targets Array of target addresses
     * @param values Array of ETH values
     * @param calldatas Array of calldata
     * @param description Proposal description
     * @return proposalId The ID of the created proposal
     */
    function proposeTreasury(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public returns (uint256) {
        // Add TREASURY tag to description for custom quorum
        string memory taggedDescription = string(
            abi.encodePacked("[TREASURY] ", description)
        );
        
        return propose(targets, values, calldatas, taggedDescription);
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns quorum for a specific proposal based on its type
     * @param proposalId The proposal ID
     * @param timepoint The timepoint for vote counting
     * @return The required quorum
     */
    function quorum(uint256 proposalId)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        // Get proposal description
        (,,,, string memory description) = proposalDetails(proposalId);
        
        // Check for custom quorum based on proposal type
        if (bytes(description).length > 0) {
            if (_contains(description, "[TREASURY]")) {
                return (token().getPastTotalSupply(proposalSnapshot(proposalId)) 
                       * customQuorums[keccak256("TREASURY")]) / 100;
            }
            if (_contains(description, "[UPGRADE]")) {
                return (token().getPastTotalSupply(proposalSnapshot(proposalId)) 
                       * customQuorums[keccak256("UPGRADE")]) / 100;
            }
            if (_contains(description, "[EMERGENCY]")) {
                return (token().getPastTotalSupply(proposalSnapshot(proposalId)) 
                       * customQuorums[keccak256("EMERGENCY")]) / 100;
            }
        }
        
        // Default quorum
        return super.quorum(proposalId);
    }

    /**
     * @dev Returns voting statistics for a proposal
     * @param proposalId The proposal ID
     * @return againstVotes Number of against votes
     * @return forVotes Number of for votes
     * @return abstainVotes Number of abstain votes
     */
    function proposalVotes(uint256 proposalId)
        public
        view
        returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)
    {
        return super.proposalVotes(proposalId);
    }

    // =============================================================
    //                    INTERNAL FUNCTIONS
    // =============================================================

    /**
     * @dev Checks if a string contains a substring
     * @param _string The string to search in
     * @param _substring The substring to search for
     * @return True if substring is found
     */
    function _contains(string memory _string, string memory _substring) 
        internal 
        pure 
        returns (bool) 
    {
        bytes memory stringBytes = bytes(_string);
        bytes memory substringBytes = bytes(_substring);
        
        if (substringBytes.length > stringBytes.length) {
            return false;
        }
        
        for (uint256 i = 0; i <= stringBytes.length - substringBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < substringBytes.length; j++) {
                if (stringBytes[i + j] != substringBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }
        
        return false;
    }

    // =============================================================
    //                    REQUIRED OVERRIDES
    // =============================================================

    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 