// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IImpactChainCore.sol";

/**
 * @title Router
 * @dev Central router providing single address UX for all ImpactChain modules
 */
contract Router is AccessControl, Pausable, ReentrancyGuard, IImpactChainCore {
    // =============================================================
    //                        CONSTANTS
    // =============================================================

    /// @dev Role for updating module addresses
    bytes32 public constant MODULE_ADMIN_ROLE = keccak256("MODULE_ADMIN_ROLE");
    
    /// @dev Role for governance operations
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Module proxy addresses
    mapping(string => address) public moduleAddresses;

    /// @dev Module names for enumeration
    string[] public moduleNames;

    /// @dev Mapping to track if module exists
    mapping(string => bool) public moduleExists;

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when module address is updated
    event ModuleUpdated(
        string indexed moduleName,
        address indexed newAddress
    );

    /// @dev Emitted when call is routed to module
    event CallRouted(
        string indexed moduleName,
        address indexed caller,
        bool success
    );

    // =============================================================
    //                        ERRORS
    // =============================================================

    error ModuleNotFound(string moduleName);
    error InvalidModuleAddress();
    error CallFailed(string moduleName);
    error ModuleAlreadyExists(string moduleName);

    // =============================================================
    //                      CONSTRUCTOR
    // =============================================================

    /**
     * @dev Initializes the router with admin permissions
     * @param _admin Initial admin address
     */
    constructor(address _admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MODULE_ADMIN_ROLE, _admin);
    }

    // =============================================================
    //                    MODULE MANAGEMENT
    // =============================================================

    /**
     * @dev Registers or updates a module proxy address
     * @param _moduleName Name of the module
     * @param _moduleAddress Address of the module proxy
     */
    function updateModule(
        string calldata _moduleName,
        address _moduleAddress
    ) public onlyRole(MODULE_ADMIN_ROLE) {
        if (_moduleAddress == address(0)) revert InvalidModuleAddress();

        address oldAddress = moduleAddresses[_moduleName];
        moduleAddresses[_moduleName] = _moduleAddress;

        if (!moduleExists[_moduleName]) {
            moduleNames.push(_moduleName);
            moduleExists[_moduleName] = true;
        }

        emit ModuleUpdated(_moduleName, _moduleAddress);
    }

    /**
     * @dev Batch updates multiple module addresses
     * @param _moduleNames Array of module names
     * @param _moduleAddresses Array of module addresses
     */
    function batchUpdateModules(
        string[] calldata _moduleNames,
        address[] calldata _moduleAddresses
    ) external onlyRole(MODULE_ADMIN_ROLE) {
        if (_moduleNames.length != _moduleAddresses.length) revert InvalidAmount();

        for (uint256 i = 0; i < _moduleNames.length; i++) {
            updateModule(_moduleNames[i], _moduleAddresses[i]);
        }
    }

    // =============================================================
    //                    NGO REGISTRY ROUTES
    // =============================================================

    /**
     * @dev Routes NGO registration to NGORegistry module
     * @param _profileHash IPFS hash of NGO profile
     * @param _ngoAddress NGO wallet address
     * @return ngoId Assigned NGO ID
     */
    function registerNGO(
        string calldata _profileHash,
        address payable _ngoAddress
    ) external whenNotPaused returns (uint256 ngoId) {
        bytes memory data = abi.encodeWithSignature(
            "registerNGO(string,address)",
            _profileHash,
            _ngoAddress
        );
        
        bytes memory result = _routeCall("NGORegistry", data);
        return abi.decode(result, (uint256));
    }

    /**
     * @dev Routes NGO verification to NGORegistry module
     * @param _ngoId NGO ID to verify
     * @param _status New verification status
     * @param _initialReputation Initial reputation score
     */
    function verifyNGO(
        uint256 _ngoId,
        NGOStatus _status,
        uint256 _initialReputation
    ) external whenNotPaused {
        bytes memory data = abi.encodeWithSignature(
            "verifyNGO(uint256,uint8,uint256)",
            _ngoId,
            _status,
            _initialReputation
        );
        
        _routeCall("NGORegistry", data);
    }

    /**
     * @dev Routes getting NGO profile
     * @param _ngoId NGO ID
     * @return profile NGO profile data
     */
    function getNGOProfile(uint256 _ngoId) external view returns (NGOProfile memory profile) {
        bytes memory data = abi.encodeWithSignature("getNGOProfile(uint256)", _ngoId);
        bytes memory result = _routeStaticCall("NGORegistry", data);
        return abi.decode(result, (NGOProfile));
    }

    // =============================================================
    //                    DONATION MANAGER ROUTES
    // =============================================================

    /**
     * @dev Routes donation to DonationManager module
     * @param _ngoId Target NGO ID
     * @param _message Optional donation message
     * @return donationId Assigned donation ID
     */
    function donate(
        uint256 _ngoId,
        string calldata _message
    ) external payable whenNotPaused nonReentrant returns (uint256 donationId) {
        bytes memory data = abi.encodeWithSignature(
            "donate(uint256,string)",
            _ngoId,
            _message
        );
        
        bytes memory result = _routeCallWithValue("DonationManager", data, msg.value);
        return abi.decode(result, (uint256));
    }

    /**
     * @dev Routes fund release to DonationManager module
     * @param _ngoId NGO ID
     * @param _amount Amount to release
     * @param _reason Reason for release
     */
    function releaseFunds(
        uint256 _ngoId,
        uint256 _amount,
        string calldata _reason
    ) external whenNotPaused {
        bytes memory data = abi.encodeWithSignature(
            "releaseFunds(uint256,uint256,string)",
            _ngoId,
            _amount,
            _reason
        );
        
        _routeCall("DonationManager", data);
    }

    // =============================================================
    //                    STARTUP REGISTRY ROUTES
    // =============================================================

    /**
     * @dev Routes startup registration to StartupRegistry module
     * @param _founder Founder address
     * @param _valuationHash IPFS hash of valuation docs
     * @param _equityToken Equity token address
     * @param _targetFunding Target funding amount
     * @return startupId Assigned startup ID
     */
    function registerStartup(
        address _founder,
        string calldata _valuationHash,
        address _equityToken,
        uint256 _targetFunding
    ) external whenNotPaused returns (uint256 startupId) {
        bytes memory data = abi.encodeWithSignature(
            "registerStartup(address,string,address,uint256)",
            _founder,
            _valuationHash,
            _equityToken,
            _targetFunding
        );
        
        bytes memory result = _routeCall("StartupRegistry", data);
        return abi.decode(result, (uint256));
    }

    /**
     * @dev Routes VC voting to StartupRegistry module
     * @param _roundId Funding round ID
     * @param _support Vote decision
     * @param _reason Vote reason
     */
    function castVCVote(
        uint256 _roundId,
        bool _support,
        string calldata _reason
    ) external whenNotPaused {
        bytes memory data = abi.encodeWithSignature(
            "castVCVote(uint256,bool,string)",
            _roundId,
            _support,
            _reason
        );
        
        _routeCall("StartupRegistry", data);
    }

    // =============================================================
    //                    MILESTONE MANAGER ROUTES
    // =============================================================

    /**
     * @dev Routes milestone creation to MilestoneManager module
     * @param _parentId Parent NGO/project ID
     * @param _goal Milestone description hash
     * @param _requiredAmount Required amount
     * @param _deadline Deadline timestamp
     * @param _verifier Verifier address
     * @param _verificationsNeeded Number of verifications needed
     * @return milestoneId Assigned milestone ID
     */
    function createMilestone(
        uint256 _parentId,
        string calldata _goal,
        uint256 _requiredAmount,
        uint256 _deadline,
        address _verifier,
        uint256 _verificationsNeeded
    ) external whenNotPaused returns (uint256 milestoneId) {
        bytes memory data = abi.encodeWithSignature(
            "createMilestone(uint256,string,uint256,uint256,address,uint256)",
            _parentId,
            _goal,
            _requiredAmount,
            _deadline,
            _verifier,
            _verificationsNeeded
        );
        
        bytes memory result = _routeCall("MilestoneManager", data);
        return abi.decode(result, (uint256));
    }

    /**
     * @dev Routes milestone verification to MilestoneManager module
     * @param _milestoneId Milestone ID
     * @param _approved Approval decision
     * @param _reason Verification reason
     */
    function verifyMilestone(
        uint256 _milestoneId,
        bool _approved,
        string calldata _reason
    ) external whenNotPaused {
        bytes memory data = abi.encodeWithSignature(
            "verifyMilestone(uint256,bool,string)",
            _milestoneId,
            _approved,
            _reason
        );
        
        _routeCall("MilestoneManager", data);
    }

    // =============================================================
    //                    CSR MANAGER ROUTES
    // =============================================================

    /**
     * @dev Routes CSR grant recording to CSRManager module
     * @param _ngoId Target NGO ID
     * @param _amount Grant amount
     * @param _taxDocHash Tax document hash
     * @param _description Grant description
     * @return grantId Assigned grant ID
     */
    function recordCSRGrant(
        uint256 _ngoId,
        uint256 _amount,
        string calldata _taxDocHash,
        string calldata _description
    ) external payable whenNotPaused returns (uint256 grantId) {
        bytes memory data = abi.encodeWithSignature(
            "recordCSRGrant(uint256,uint256,string,string,string,string[],uint256,uint256)",
            _ngoId,
            _amount,
            _taxDocHash,
            _description,
            _description, // initiative name
            new string[](0), // empty sustainability goals
            100, // default expected impact
            12 // default duration
        );
        
        bytes memory result = _routeCallWithValue("CSRManager", data, msg.value);
        return abi.decode(result, (uint256));
    }

    // =============================================================
    //                    EQUITY ALLOCATOR ROUTES
    // =============================================================

    /**
     * @dev Routes equity allocation to EquityAllocator module
     * @param _vc VC address
     * @param _roundId Round ID
     * @param _investmentAmount Investment amount
     * @param _cliffPeriod Cliff period
     * @param _vestingPeriod Vesting period
     * @return allocationId Assigned allocation ID
     */
    function allocateEquity(
        address _vc,
        uint256 _roundId,
        uint256 _investmentAmount,
        uint256 _cliffPeriod,
        uint256 _vestingPeriod
    ) external whenNotPaused returns (uint256 allocationId) {
        bytes memory data = abi.encodeWithSignature(
            "allocateEquity(address,uint256,uint256,uint256,uint256)",
            _vc,
            _roundId,
            _investmentAmount,
            _cliffPeriod,
            _vestingPeriod
        );
        
        bytes memory result = _routeCall("EquityAllocator", data);
        return abi.decode(result, (uint256));
    }

    // =============================================================
    //                    FEE MANAGER ROUTES
    // =============================================================

    /**
     * @dev Routes fee collection to FeeManager module
     * @param _user User address
     * @param _amount Transaction amount
     * @param _category Fee category
     * @return feeAmount Collected fee amount
     */
    function collectFee(
        address _user,
        uint256 _amount,
        string calldata _category
    ) external payable whenNotPaused returns (uint256 feeAmount) {
        bytes memory data = abi.encodeWithSignature(
            "collectFee(address,uint256,string)",
            _user,
            _amount,
            _category
        );
        
        bytes memory result = _routeCallWithValue("FeeManager", data, msg.value);
        return abi.decode(result, (uint256));
    }

    // =============================================================
    //                    QA MEMORY ROUTES
    // =============================================================

    /**
     * @dev Routes QA storage to QAMemory module
     * @param _contentHash Content hash
     * @param _cid IPFS CID
     * @param _language Language code
     * @return qaId Assigned QA ID
     */
    function storeQA(
        string calldata _contentHash,
        string calldata _cid,
        string calldata _language
    ) external whenNotPaused returns (uint256 qaId) {
        bytes memory data = abi.encodeWithSignature(
            "storeQA(string,string,string)",
            _contentHash,
            _cid,
            _language
        );
        
        bytes memory result = _routeCall("QAMemory", data);
        return abi.decode(result, (uint256));
    }

    // =============================================================
    //                    INTERNAL ROUTING FUNCTIONS
    // =============================================================

    /**
     * @dev Routes a call to specified module
     * @param _moduleName Module name
     * @param _data Call data
     * @return result Call result
     */
    function _routeCall(string memory _moduleName, bytes memory _data) internal returns (bytes memory result) {
        address moduleAddress = moduleAddresses[_moduleName];
        if (moduleAddress == address(0)) revert ModuleNotFound(_moduleName);

        (bool success, bytes memory returnData) = moduleAddress.call(_data);
        
        emit CallRouted(_moduleName, msg.sender, success);
        
        if (!success) {
            revert CallFailed(_moduleName);
        }
        
        return returnData;
    }

    /**
     * @dev Routes a call with value to specified module
     * @param _moduleName Module name
     * @param _data Call data
     * @param _value ETH value to send
     * @return result Call result
     */
    function _routeCallWithValue(
        string memory _moduleName,
        bytes memory _data,
        uint256 _value
    ) internal returns (bytes memory result) {
        address moduleAddress = moduleAddresses[_moduleName];
        if (moduleAddress == address(0)) revert ModuleNotFound(_moduleName);

        (bool success, bytes memory returnData) = moduleAddress.call{value: _value}(_data);
        
        emit CallRouted(_moduleName, msg.sender, success);
        
        if (!success) {
            revert CallFailed(_moduleName);
        }
        
        return returnData;
    }

    /**
     * @dev Routes a static call to specified module
     * @param _moduleName Module name
     * @param _data Call data
     * @return result Call result
     */
    function _routeStaticCall(string memory _moduleName, bytes memory _data) internal view returns (bytes memory result) {
        address moduleAddress = moduleAddresses[_moduleName];
        if (moduleAddress == address(0)) revert ModuleNotFound(_moduleName);

        (bool success, bytes memory returnData) = moduleAddress.staticcall(_data);
        
        if (!success) {
            revert CallFailed(_moduleName);
        }
        
        return returnData;
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns all registered modules
     * @return names Array of module names
     * @param addresses Array of module addresses
     */
    function getAllModules() external view returns (string[] memory names, address[] memory addresses) {
        names = moduleNames;
        addresses = new address[](moduleNames.length);
        
        for (uint256 i = 0; i < moduleNames.length; i++) {
            addresses[i] = moduleAddresses[moduleNames[i]];
        }
    }

    /**
     * @dev Checks if module is registered
     * @param _moduleName Module name
     * @return exists True if module exists
     */
    function moduleIsRegistered(string calldata _moduleName) external view returns (bool exists) {
        return moduleExists[_moduleName] && moduleAddresses[_moduleName] != address(0);
    }

    // =============================================================
    //                    ADMIN FUNCTIONS
    // =============================================================

    /**
     * @dev Pauses all router operations
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all router operations
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Emergency function to rescue stuck ETH
     * @param _to Recipient address
     * @param _amount Amount to rescue
     */
    function rescueETH(address payable _to, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_to == address(0)) revert InvalidAddress();
        if (_amount > address(this).balance) revert InsufficientFunds();
        
        _to.transfer(_amount);
    }

    // =============================================================
    //                    RECEIVE FUNCTION
    // =============================================================

    /**
     * @dev Receives ETH for routing to modules
     */
    receive() external payable {
        // Allow receiving ETH for routing purposes
    }
} 