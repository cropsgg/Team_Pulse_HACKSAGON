// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ImpactToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18;
    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 1e18;
    
    bool public mintingDisabled;

    event MintingDisabled();
    event CommunityRewardMinted(address indexed recipient, uint256 amount);

    error MintingPermanentlyDisabled();
    error ExceedsMaxSupply();
    error InvalidAmount();

    constructor(address _initialOwner) 
        ERC20("Impact Token", "IMPACT") 
        ERC20Permit("Impact Token")
        Ownable(_initialOwner)
    {
        _mint(_initialOwner, INITIAL_SUPPLY);
    }

    function mint(address _to, uint256 _amount) external onlyOwner {
        if (mintingDisabled) revert MintingPermanentlyDisabled();
        if (_amount == 0) revert InvalidAmount();
        if (totalSupply() + _amount > MAX_SUPPLY) revert ExceedsMaxSupply();

        _mint(_to, _amount);
        emit CommunityRewardMinted(_to, _amount);
    }

    function disableMinting() external onlyOwner {
        mintingDisabled = true;
        emit MintingDisabled();
    }

    function remainingMintableSupply() external view returns (uint256) {
        if (mintingDisabled) return 0;
        return MAX_SUPPLY - totalSupply();
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
} 