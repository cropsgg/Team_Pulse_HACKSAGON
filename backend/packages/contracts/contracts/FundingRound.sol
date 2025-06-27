// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FundingRound
 * @dev Milestone-based funding round with escrow functionality
 */
contract FundingRound is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    enum RoundStatus {
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    enum MilestoneStatus {
        PENDING,
        SUBMITTED,
        APPROVED,
        REJECTED
    }

    struct Milestone {
        string title;
        string description;
        uint256 targetAmount;
        uint256 deadline;
        MilestoneStatus status;
        string proofURI; // IPFS hash for proof of completion
        uint256 approvedAt;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        address token; // Address(0) for ETH/MATIC
    }

    // Campaign details
    string public title;
    string public description;
    string public metadataURI;
    address public creator;
    uint256 public targetAmount;
    uint256 public deadline;
    RoundStatus public status;
    
    // Financial tracking
    uint256 public totalRaised;
    uint256 public totalWithdrawn;
    mapping(address => uint256) public donorContributions;
    Donation[] public donations;
    
    // Milestones
    Milestone[] public milestones;
    uint256 public currentMilestone;
    
    // Supported tokens (address(0) = native token)
    mapping(address => bool) public supportedTokens;
    
    // Platform fee (in basis points, 250 = 2.5%)
    uint256 public platformFee;
    address public platformFeeRecipient;

    // Events
    event DonationReceived(address indexed donor, uint256 amount, address token);
    event MilestoneSubmitted(uint256 indexed milestoneId, string proofURI);
    event MilestoneApproved(uint256 indexed milestoneId, uint256 amountReleased);
    event MilestoneRejected(uint256 indexed milestoneId, string reason);
    event FundsWithdrawn(uint256 amount, uint256 milestoneId);
    event RefundIssued(address indexed donor, uint256 amount);
    event RoundStatusChanged(RoundStatus newStatus);

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this function");
        _;
    }

    modifier onlyActiveRound() {
        require(status == RoundStatus.ACTIVE, "Round is not active");
        require(block.timestamp <= deadline, "Round has expired");
        _;
    }

    constructor(
        string memory _title,
        string memory _description,
        string memory _metadataURI,
        address _creator,
        uint256 _targetAmount,
        uint256 _deadline,
        uint256 _platformFee,
        address _platformFeeRecipient,
        address _owner
    ) Ownable(_owner) {
        require(_creator != address(0), "Invalid creator address");
        require(_targetAmount > 0, "Target amount must be positive");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_platformFee <= 1000, "Platform fee too high"); // Max 10%

        title = _title;
        description = _description;
        metadataURI = _metadataURI;
        creator = _creator;
        targetAmount = _targetAmount;
        deadline = _deadline;
        status = RoundStatus.ACTIVE;
        platformFee = _platformFee;
        platformFeeRecipient = _platformFeeRecipient;

        // Enable native token by default
        supportedTokens[address(0)] = true;
    }

    /**
     * @dev Add milestone to the funding round
     */
    function addMilestone(
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline
    ) external onlyCreator {
        require(status == RoundStatus.ACTIVE, "Round not active");
        require(_deadline > block.timestamp, "Milestone deadline must be in future");

        milestones.push(Milestone({
            title: _title,
            description: _description,
            targetAmount: _targetAmount,
            deadline: _deadline,
            status: MilestoneStatus.PENDING,
            proofURI: "",
            approvedAt: 0
        }));
    }

    /**
     * @dev Donate native tokens (ETH/MATIC)
     */
    function donate() external payable onlyActiveRound nonReentrant {
        require(msg.value > 0, "Donation amount must be positive");
        
        _processDonation(msg.sender, msg.value, address(0));
    }

    /**
     * @dev Donate ERC20 tokens
     */
    function donateToken(address token, uint256 amount) 
        external 
        onlyActiveRound 
        nonReentrant 
    {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Donation amount must be positive");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        _processDonation(msg.sender, amount, token);
    }

    /**
     * @dev Internal function to process donations
     */
    function _processDonation(address donor, uint256 amount, address token) internal {
        donorContributions[donor] += amount;
        totalRaised += amount;
        
        donations.push(Donation({
            donor: donor,
            amount: amount,
            timestamp: block.timestamp,
            token: token
        }));

        emit DonationReceived(donor, amount, token);
    }

    /**
     * @dev Submit proof for milestone completion
     */
    function submitMilestoneProof(uint256 milestoneId, string memory proofURI) 
        external 
        onlyCreator 
    {
        require(milestoneId < milestones.length, "Invalid milestone ID");
        require(milestoneId == currentMilestone, "Can only submit current milestone");
        
        Milestone storage milestone = milestones[milestoneId];
        require(milestone.status == MilestoneStatus.PENDING, "Milestone not pending");
        require(block.timestamp <= milestone.deadline, "Milestone deadline passed");

        milestone.status = MilestoneStatus.SUBMITTED;
        milestone.proofURI = proofURI;

        emit MilestoneSubmitted(milestoneId, proofURI);
    }

    /**
     * @dev Approve milestone completion (only owner/DAO)
     */
    function approveMilestone(uint256 milestoneId) external onlyOwner {
        require(milestoneId < milestones.length, "Invalid milestone ID");
        
        Milestone storage milestone = milestones[milestoneId];
        require(milestone.status == MilestoneStatus.SUBMITTED, "Milestone not submitted");

        milestone.status = MilestoneStatus.APPROVED;
        milestone.approvedAt = block.timestamp;

        // Calculate amount to release
        uint256 releaseAmount = _calculateReleaseAmount(milestoneId);
        
        if (releaseAmount > 0) {
            totalWithdrawn += releaseAmount;
            _transferToCreator(releaseAmount);
        }

        // Move to next milestone
        currentMilestone++;

        emit MilestoneApproved(milestoneId, releaseAmount);
    }

    /**
     * @dev Reject milestone submission
     */
    function rejectMilestone(uint256 milestoneId, string memory reason) 
        external 
        onlyOwner 
    {
        require(milestoneId < milestones.length, "Invalid milestone ID");
        
        Milestone storage milestone = milestones[milestoneId];
        require(milestone.status == MilestoneStatus.SUBMITTED, "Milestone not submitted");

        milestone.status = MilestoneStatus.REJECTED;

        emit MilestoneRejected(milestoneId, reason);
    }

    /**
     * @dev Calculate amount to release for milestone
     */
    function _calculateReleaseAmount(uint256 milestoneId) internal view returns (uint256) {
        Milestone storage milestone = milestones[milestoneId];
        uint256 availableAmount = totalRaised - totalWithdrawn;
        
        // Release up to milestone target or available amount
        return milestone.targetAmount > availableAmount ? availableAmount : milestone.targetAmount;
    }

    /**
     * @dev Transfer funds to creator (minus platform fee)
     */
    function _transferToCreator(uint256 amount) internal {
        uint256 fee = (amount * platformFee) / 10000;
        uint256 creatorAmount = amount - fee;

        if (fee > 0) {
            payable(platformFeeRecipient).transfer(fee);
        }
        
        payable(creator).transfer(creatorAmount);
        
        emit FundsWithdrawn(creatorAmount, currentMilestone);
    }

    /**
     * @dev Enable refunds if campaign fails or is cancelled
     */
    function requestRefund() external nonReentrant {
        require(
            status == RoundStatus.CANCELLED || 
            (block.timestamp > deadline && totalRaised < targetAmount),
            "Refunds not available"
        );
        
        uint256 contribution = donorContributions[msg.sender];
        require(contribution > 0, "No contribution to refund");

        donorContributions[msg.sender] = 0;
        payable(msg.sender).transfer(contribution);

        emit RefundIssued(msg.sender, contribution);
    }

    /**
     * @dev Add supported token
     */
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    /**
     * @dev Remove supported token
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    /**
     * @dev Change round status
     */
    function setRoundStatus(RoundStatus newStatus) external onlyOwner {
        status = newStatus;
        emit RoundStatusChanged(newStatus);
    }

    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 milestoneId) 
        external 
        view 
        returns (Milestone memory) 
    {
        require(milestoneId < milestones.length, "Invalid milestone ID");
        return milestones[milestoneId];
    }

    /**
     * @dev Get total number of milestones
     */
    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    /**
     * @dev Get total number of donations
     */
    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }

    /**
     * @dev Get donation details
     */
    function getDonation(uint256 index) external view returns (Donation memory) {
        require(index < donations.length, "Invalid donation index");
        return donations[index];
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
} 