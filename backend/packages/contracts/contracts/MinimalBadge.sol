// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MinimalBadge
 * @dev Simple NFT badge for testing
 */
contract MinimalBadge is ERC721, Ownable {
    uint256 private _tokenIds;
    
    enum BadgeType { DONOR, CREATOR, GOVERNANCE }
    
    struct Badge {
        BadgeType badgeType;
        uint256 value;
        string metadataURI;
    }
    
    mapping(uint256 => Badge) public badges;
    mapping(address => uint256[]) public userBadges;
    
    event BadgeEarned(address indexed user, uint256 indexed tokenId, BadgeType badgeType);
    
    constructor(address initialOwner) ERC721("ImpactChain Badge", "ICB") Ownable(initialOwner) {}
    
    function mintBadge(
        address to,
        BadgeType badgeType,
        uint256 value,
        string memory metadataURI
    ) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = _tokenIds++;
        
        badges[tokenId] = Badge({
            badgeType: badgeType,
            value: value,
            metadataURI: metadataURI
        });
        
        userBadges[to].push(tokenId);
        
        _safeMint(to, tokenId);
        
        emit BadgeEarned(to, tokenId, badgeType);
    }
    
    function getUserBadges(address user) external view returns (uint256[] memory) {
        return userBadges[user];
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Badge does not exist");
        return badges[tokenId].metadataURI;
    }
} 