// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MinimalToken
 * @dev Simple ERC-20 token for testing
 */
contract MinimalToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    mapping(address => uint256) public donationAmounts;
    uint256 public totalDonations;

    event TokensMinted(address indexed to, uint256 amount);
    event DonationRecorded(address indexed donor, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {}

    function mintOnDonation(address to, uint256 donationAmountInWei) 
        external 
        onlyOwner 
    {
        require(donationAmountInWei > 0, "Invalid donation amount");
        require(totalSupply() + donationAmountInWei <= MAX_SUPPLY, "Exceeds max supply");

        donationAmounts[to] += donationAmountInWei;
        totalDonations += donationAmountInWei;

        _mint(to, donationAmountInWei);
        
        emit TokensMinted(to, donationAmountInWei);
        emit DonationRecorded(to, donationAmountInWei);
    }

    function getDonationAmount(address donor) external view returns (uint256) {
        return donationAmounts[donor];
    }
} 