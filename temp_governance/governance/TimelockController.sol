// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title ImpactChainTimelock
 * @dev TimelockController for ImpactChain governance with 24-hour delays
 * @notice Provides security delays for all governance operations
 */
contract ImpactChainTimelock is TimelockController {
    /**
     * @dev Constructor for the timelock controller
     * @param minDelay Minimum delay for operations (24 hours = 86400 seconds)
     * @param proposers List of addresses that can propose operations
     * @param executors List of addresses that can execute operations
     * @param admin Optional admin address (use zero address for no admin)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {
        // Constructor handles all initialization through parent
    }
} 