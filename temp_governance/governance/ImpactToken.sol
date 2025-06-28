// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ImpactToken
 * @dev ERC-20 governance token for ImpactChain & CharityChain DAO
 * @notice This token enables holders to participate in governance decisions
 */
contract ImpactToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    // =============================================================
    //                        CONSTANTS
    // =============================================================

    /// @dev Maximum total supply (100 million tokens)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18;

    /// @dev Initial supply for launch (10 million tokens)
    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 1e18;

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Whether minting is permanently disabled
    bool public mintingDisabled;

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when minting is permanently disabled
    event MintingDisabled();

    /// @dev Emitted when tokens are minted for community rewards
    event CommunityRewardMinted(address indexed recipient, uint256 amount);

    // =============================================================
    //                        ERRORS
    // =============================================================

    error MintingPermanentlyDisabled();
    error ExceedsMaxSupply();
    error InvalidAmount();

    // =============================================================
    //                      CONSTRUCTOR
    // =============================================================

    /**
     * @dev Initializes the IMPACT token
     * @param _initialOwner Address that will receive initial supply and own the contract
     */
    constructor(address _initialOwner) 
        ERC20("Impact Token", "IMPACT") 
        ERC20Permit("Impact Token")
        Ownable(_initialOwner)
    {
        // Mint initial supply to the owner for distribution
        _mint(_initialOwner, INITIAL_SUPPLY);
    }

    // =============================================================
    //                    MINTING FUNCTIONS
    // =============================================================

    /**
     * @dev Mints tokens for community rewards and incentives
     * @param _to Address to receive the tokens
     * @param _amount Amount of tokens to mint
     * @notice Only callable by owner and before minting is disabled
     */
    function mint(address _to, uint256 _amount) external onlyOwner {
        if (mintingDisabled) revert MintingPermanentlyDisabled();
        if (_amount == 0) revert InvalidAmount();
        if (totalSupply() + _amount > MAX_SUPPLY) revert ExceedsMaxSupply();

        _mint(_to, _amount);
        emit CommunityRewardMinted(_to, _amount);
    }

    /**
     * @dev Permanently disables minting functionality
     * @notice This action cannot be reversed
     */
    function disableMinting() external onlyOwner {
        mintingDisabled = true;
        emit MintingDisabled();
    }

    /**
     * @dev Batch mint tokens to multiple recipients
     * @param _recipients Array of recipient addresses
     * @param _amounts Array of amounts to mint
     * @notice Arrays must be same length, only callable by owner
     */
    function batchMint(
        address[] calldata _recipients,
        uint256[] calldata _amounts
    ) external onlyOwner {
        if (mintingDisabled) revert MintingPermanentlyDisabled();
        if (_recipients.length != _amounts.length) revert InvalidAmount();

        uint256 totalToMint = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalToMint += _amounts[i];
        }

        if (totalSupply() + totalToMint > MAX_SUPPLY) revert ExceedsMaxSupply();

        for (uint256 i = 0; i < _recipients.length; i++) {
            if (_amounts[i] > 0) {
                _mint(_recipients[i], _amounts[i]);
                emit CommunityRewardMinted(_recipients[i], _amounts[i]);
            }
        }
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns the remaining mintable supply
     * @return The amount of tokens that can still be minted
     */
    function remainingMintableSupply() external view returns (uint256) {
        if (mintingDisabled) return 0;
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @dev Returns whether an address can participate in governance
     * @param _account Address to check
     * @return True if account has voting power
     */
    function canParticipateInGovernance(address _account) external view returns (bool) {
        return getVotes(_account) > 0;
    }

    // =============================================================
    //                    REQUIRED OVERRIDES
    // =============================================================

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
