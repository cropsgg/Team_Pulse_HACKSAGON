// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/NoncesUpgradeable.sol";

/**
 * @title GovernanceToken
 * @dev ERC-20 token with governance features, minted on donations
 * @notice Token is minted at 1:1 ratio with MATIC equivalent donations
 */
contract GovernanceToken is
    Initializable,
    ERC20Upgradeable,
    ERC20VotesUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @dev Maximum supply of 1 billion tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    /// @dev Mapping to track donation amounts per address
    mapping(address => uint256) public donationAmounts;

    /// @dev Total donations received
    uint256 public totalDonations;

    event TokensMinted(address indexed to, uint256 amount, uint256 donationAmount);
    event DonationRecorded(address indexed donor, uint256 amount);

    error ExceedsMaxSupply();
    error InvalidDonationAmount();
    error InsufficientDonation();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the governance token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _admin Admin address with all roles
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        address _admin
    ) public initializer {
        __ERC20_init(_name, _symbol);
        __ERC20Votes_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);
    }

    /**
     * @dev Mint tokens based on donation amount (1 token per MATIC equivalent)
     * @param to Address to receive tokens
     * @param donationAmountInWei Donation amount in wei
     */
    function mintOnDonation(
        address to,
        uint256 donationAmountInWei
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        if (donationAmountInWei == 0) revert InvalidDonationAmount();
        
        // Convert wei to tokens (1:1 ratio with MATIC)
        uint256 tokensToMint = donationAmountInWei;
        
        if (totalSupply() + tokensToMint > MAX_SUPPLY) revert ExceedsMaxSupply();

        donationAmounts[to] += donationAmountInWei;
        totalDonations += donationAmountInWei;

        _mint(to, tokensToMint);
        
        emit TokensMinted(to, tokensToMint, donationAmountInWei);
        emit DonationRecorded(to, donationAmountInWei);
    }

    /**
     * @dev Batch mint tokens for multiple addresses
     * @param recipients Array of recipient addresses
     * @param amounts Array of donation amounts
     */
    function batchMintOnDonation(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        if (recipients.length != amounts.length) revert InvalidDonationAmount();
        
        uint256 totalToMint = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalToMint += amounts[i];
        }
        
        if (totalSupply() + totalToMint > MAX_SUPPLY) revert ExceedsMaxSupply();

        for (uint256 i = 0; i < recipients.length; i++) {
            if (amounts[i] == 0) revert InvalidDonationAmount();
            
            donationAmounts[recipients[i]] += amounts[i];
            totalDonations += amounts[i];
            
            _mint(recipients[i], amounts[i]);
            
            emit TokensMinted(recipients[i], amounts[i], amounts[i]);
            emit DonationRecorded(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Get donation amount for an address
     * @param donor Address to check
     * @return Amount donated by address
     */
    function getDonationAmount(address donor) external view returns (uint256) {
        return donationAmounts[donor];
    }

    /**
     * @dev Pause token transfers
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Required override for UUPS upgradeable pattern
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

    // Required overrides for multiple inheritance
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) whenNotPaused {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20VotesUpgradeable, NoncesUpgradeable)
        returns (uint256)
    {
        return super.nonces(owner);
    }
} 