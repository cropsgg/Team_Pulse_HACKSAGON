// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "../interfaces/IImpactChainCore.sol";

interface INGORegistry {
    function canReceiveDonations(uint256 _ngoId) external view returns (bool);
    function getNGOProfile(uint256 _ngoId) external view returns (IImpactChainCore.NGOProfile memory);
    function updateFinancials(uint256 _ngoId, uint256 _receivedAmount, uint256 _releasedAmount) external;
}

/**
 * @title CSRManager
 * @dev UUPS upgradeable contract for Corporate Social Responsibility grant management
 * @notice Handles CSR grants, tax documentation, and corporate impact tracking
 */
contract CSRManager is 
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    IImpactChainCore
{
    // =============================================================
    //                        CONSTANTS
    // =============================================================

    /// @dev Role for CSR administrators
    bytes32 public constant CSR_ADMIN_ROLE = keccak256("CSR_ADMIN_ROLE");
    
    /// @dev Role for corporate representatives
    bytes32 public constant CORPORATE_ROLE = keccak256("CORPORATE_ROLE");
    
    /// @dev Role for governance operations
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @dev Role for tax auditors
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    /// @dev Minimum CSR grant amount
    uint256 public constant MIN_CSR_GRANT = 1 ether;

    /// @dev Maximum CSR grant amount per transaction
    uint256 public constant MAX_CSR_GRANT = 1000 ether;

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Counter for CSR grant IDs
    uint256 private _grantIdCounter;

    /// @dev NGO Registry contract
    INGORegistry public ngoRegistry;

    /// @dev Mapping from grant ID to CSR grant
    mapping(uint256 => CSRGrant) private _csrGrants;

    /// @dev Mapping from company address to grant IDs
    mapping(address => uint256[]) private _companyGrants;

    /// @dev Mapping from NGO ID to received grant IDs
    mapping(uint256 => uint256[]) private _ngoReceivedGrants;

    /// @dev Mapping from company to total granted amount
    mapping(address => uint256) public companyTotalGranted;

    /// @dev Mapping from company to verification status
    mapping(address => bool) public verifiedCompanies;

    /// @dev Mapping from company to tax year contributions
    mapping(address => mapping(uint256 => uint256)) public annualContributions;

    /// @dev Mapping from company to corporate profile
    mapping(address => CorporateProfile) private _corporateProfiles;

    /// @dev Total CSR grants processed
    uint256 public totalCSRGrants;

    /// @dev Total CSR amount processed
    uint256 public totalCSRAmount;

    /// @dev CSR fee percentage in basis points (default 1%)
    uint256 public csrFeeBps;

    /// @dev Treasury address for CSR fees
    address payable public csrTreasury;

    // =============================================================
    //                      ADDITIONAL STRUCTS
    // =============================================================

    /// @dev Corporate profile information
    struct CorporateProfile {
        string companyName;         // Company name
        string registrationNumber;  // Business registration number
        string profileHash;         // IPFS hash of company details
        string taxId;              // Tax identification number
        uint256 registrationTime;  // Registration timestamp
        bool isVerified;           // Verification status
        string industry;           // Industry sector
        uint256 employeeCount;     // Number of employees
    }

    /// @dev Tax report information
    struct TaxReport {
        uint256 year;              // Tax year
        uint256 totalContributions; // Total contributions for the year
        string reportHash;         // IPFS hash of tax report
        uint256 generatedTime;     // When report was generated
        address auditor;           // Auditor who verified the report
    }

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when a company registers
    event CompanyRegistered(
        address indexed company,
        string companyName,
        string registrationNumber
    );

    /// @dev Emitted when a company is verified
    event CompanyVerified(
        address indexed company,
        address indexed verifier
    );

    /// @dev Emitted when CSR initiative is created
    event CSRInitiativeCreated(
        uint256 indexed grantId,
        address indexed company,
        uint256 indexed ngoId,
        string initiative
    );

    /// @dev Emitted when tax report is generated
    event TaxReportGenerated(
        address indexed company,
        uint256 indexed year,
        uint256 totalAmount,
        string reportHash
    );

    /// @dev Emitted when CSR fee is updated
    event CSRFeeUpdated(
        uint256 oldFeeBps,
        uint256 newFeeBps
    );

    // =============================================================
    //                        ERRORS
    // =============================================================

    error CompanyNotRegistered();
    error CompanyNotVerified();
    error CompanyAlreadyRegistered();
    error GrantNotFound();
    error InvalidGrantAmount();
    error InvalidTaxYear();
    error InsufficientCSRFunds();
    error InvalidCompanyData();

    // =============================================================
    //                      CONSTRUCTOR
    // =============================================================

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // =============================================================
    //                      INITIALIZER
    // =============================================================

    /**
     * @dev Initializes the CSR Manager
     * @param _admin Initial admin address
     * @param _governance Governance contract address
     * @param _ngoRegistry NGO Registry contract address
     * @param _csrTreasury Treasury address for CSR fees
     * @param _initialFeeBps Initial CSR fee in basis points
     */
    function initialize(
        address _admin,
        address _governance,
        address _ngoRegistry,
        address payable _csrTreasury,
        uint256 _initialFeeBps
    ) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _governance);
        _grantRole(CSR_ADMIN_ROLE, _admin);
        _grantRole(AUDITOR_ROLE, _admin);

        ngoRegistry = INGORegistry(_ngoRegistry);
        csrTreasury = _csrTreasury;
        csrFeeBps = _initialFeeBps;

        _grantIdCounter = 1;
    }

    // =============================================================
    //                    COMPANY FUNCTIONS
    // =============================================================

    /**
     * @dev Registers a company for CSR participation
     * @param _companyName Company name
     * @param _registrationNumber Business registration number
     * @param _profileHash IPFS hash of company profile
     * @param _taxId Tax identification number
     * @param _industry Industry sector
     * @param _employeeCount Number of employees
     */
    function registerCompany(
        string calldata _companyName,
        string calldata _registrationNumber,
        string calldata _profileHash,
        string calldata _taxId,
        string calldata _industry,
        uint256 _employeeCount
    ) external whenNotPaused {
        if (_corporateProfiles[msg.sender].registrationTime != 0) {
            revert CompanyAlreadyRegistered();
        }
        if (bytes(_companyName).length == 0 || bytes(_registrationNumber).length == 0) {
            revert InvalidCompanyData();
        }

        _corporateProfiles[msg.sender] = CorporateProfile({
            companyName: _companyName,
            registrationNumber: _registrationNumber,
            profileHash: _profileHash,
            taxId: _taxId,
            registrationTime: block.timestamp,
            isVerified: false,
            industry: _industry,
            employeeCount: _employeeCount
        });

        emit CompanyRegistered(msg.sender, _companyName, _registrationNumber);
    }

    /**
     * @dev Verifies a company for CSR participation
     * @param _company Company address
     */
    function verifyCompany(address _company) external onlyRole(CSR_ADMIN_ROLE) whenNotPaused {
        CorporateProfile storage profile = _corporateProfiles[_company];
        if (profile.registrationTime == 0) revert CompanyNotRegistered();

        profile.isVerified = true;
        verifiedCompanies[_company] = true;
        _grantRole(CORPORATE_ROLE, _company);

        emit CompanyVerified(_company, msg.sender);
    }

    // =============================================================
    //                    CSR GRANT FUNCTIONS
    // =============================================================

    /**
     * @dev Records a CSR grant to an NGO
     * @param _ngoId Target NGO ID
     * @param _amount Grant amount
     * @param _taxDocHash IPFS hash of tax documentation
     * @param _description Grant description
     * @return grantId The assigned grant ID
     */
    function recordCSRGrant(
        uint256 _ngoId,
        uint256 _amount,
        string calldata _taxDocHash,
        string calldata _description
    ) external payable onlyRole(CORPORATE_ROLE) whenNotPaused nonReentrant returns (uint256) {
        if (!verifiedCompanies[msg.sender]) revert CompanyNotVerified();
        if (_amount < MIN_CSR_GRANT || _amount > MAX_CSR_GRANT) revert InvalidGrantAmount();
        if (!ngoRegistry.canReceiveDonations(_ngoId)) revert NGONotVerified();
        if (msg.value != _amount) revert InvalidAmount();

        // Calculate CSR fee
        uint256 feeAmount = (_amount * csrFeeBps) / 10000;
        uint256 netAmount = _amount - feeAmount;

        uint256 grantId = _grantIdCounter++;

        _csrGrants[grantId] = CSRGrant({
            company: msg.sender,
            ngoId: _ngoId,
            amount: netAmount,
            taxDocHash: _taxDocHash,
            timestamp: block.timestamp,
            description: _description
        });

        // Update tracking
        _companyGrants[msg.sender].push(grantId);
        _ngoReceivedGrants[_ngoId].push(grantId);
        companyTotalGranted[msg.sender] += netAmount;
        totalCSRGrants++;
        totalCSRAmount += netAmount;

        // Update annual contributions for tax reporting
        uint256 currentYear = getCurrentTaxYear();
        annualContributions[msg.sender][currentYear] += netAmount;

        // Transfer fee to treasury
        if (feeAmount > 0) {
            csrTreasury.transfer(feeAmount);
        }

        // Transfer net amount to NGO
        IImpactChainCore.NGOProfile memory ngoProfile = ngoRegistry.getNGOProfile(_ngoId);
        ngoProfile.ngoAddress.transfer(netAmount);

        // Update NGO financials
        ngoRegistry.updateFinancials(_ngoId, netAmount, netAmount);

        emit CSRGrantRecorded(grantId, msg.sender, _ngoId, netAmount);

        return grantId;
    }

    /**
     * @dev Batch records multiple CSR grants
     * @param _ngoIds Array of NGO IDs
     * @param _amounts Array of grant amounts
     * @param _taxDocHashes Array of tax document hashes
     * @param _descriptions Array of descriptions
     * @return grantIds Array of grant IDs
     */
    function batchRecordCSRGrants(
        uint256[] calldata _ngoIds,
        uint256[] calldata _amounts,
        string[] calldata _taxDocHashes,
        string[] calldata _descriptions
    ) external payable onlyRole(CORPORATE_ROLE) whenNotPaused returns (uint256[] memory) {
        if (_ngoIds.length != _amounts.length || 
            _ngoIds.length != _taxDocHashes.length || 
            _ngoIds.length != _descriptions.length) {
            revert InvalidAmount();
        }

        uint256 totalRequired = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalRequired += _amounts[i];
        }
        if (msg.value != totalRequired) revert InvalidAmount();

        uint256[] memory grantIds = new uint256[](_ngoIds.length);
        uint256 processedAmount = 0;

        for (uint256 i = 0; i < _ngoIds.length; i++) {
            // Note: This is a simplified implementation
            // In practice, you'd need to handle ETH distribution more carefully
            grantIds[i] = _grantIdCounter++;
            
            _csrGrants[grantIds[i]] = CSRGrant({
                company: msg.sender,
                ngoId: _ngoIds[i],
                amount: _amounts[i],
                taxDocHash: _taxDocHashes[i],
                timestamp: block.timestamp,
                description: _descriptions[i]
            });

            _companyGrants[msg.sender].push(grantIds[i]);
            _ngoReceivedGrants[_ngoIds[i]].push(grantIds[i]);

            emit CSRGrantRecorded(grantIds[i], msg.sender, _ngoIds[i], _amounts[i]);
        }

        return grantIds;
    }

    // =============================================================
    //                    TAX REPORTING FUNCTIONS
    // =============================================================

    /**
     * @dev Generates annual tax report for a company
     * @param _year Tax year
     * @return reportHash IPFS hash of the generated report
     */
    function generateTaxReport(uint256 _year) external view returns (string memory reportHash) {
        if (_corporateProfiles[msg.sender].registrationTime == 0) revert CompanyNotRegistered();
        if (_year > getCurrentTaxYear()) revert InvalidTaxYear();

        uint256 totalContributions = annualContributions[msg.sender][_year];
        
        // In a real implementation, this would generate and upload a detailed report to IPFS
        // For now, we return a placeholder hash
        reportHash = "QmTaxReportPlaceholder";
        
        // Emit event for off-chain processing
        emit TaxReportGenerated(msg.sender, _year, totalContributions, reportHash);
    }

    /**
     * @dev Gets annual contributions for a company
     * @param _company Company address
     * @param _year Tax year
     * @return contributions Total contributions for the year
     */
    function getAnnualContributions(address _company, uint256 _year) 
        external 
        view 
        returns (uint256) 
    {
        return annualContributions[_company][_year];
    }

    /**
     * @dev Gets current tax year
     * @return year Current tax year
     */
    function getCurrentTaxYear() public view returns (uint256) {
        // Simplified: using calendar year
        return (block.timestamp / 365 days) + 1970;
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns CSR grant information
     * @param _grantId Grant ID
     * @return grant The CSR grant
     */
    function getCSRGrant(uint256 _grantId) external view returns (CSRGrant memory) {
        return _csrGrants[_grantId];
    }

    /**
     * @dev Returns company profile
     * @param _company Company address
     * @return profile The corporate profile
     */
    function getCorporateProfile(address _company) external view returns (CorporateProfile memory) {
        return _corporateProfiles[_company];
    }

    /**
     * @dev Returns company's grant history
     * @param _company Company address
     * @return grantIds Array of grant IDs
     */
    function getCompanyGrants(address _company) external view returns (uint256[] memory) {
        return _companyGrants[_company];
    }

    /**
     * @dev Returns NGO's received CSR grants
     * @param _ngoId NGO ID
     * @return grantIds Array of grant IDs
     */
    function getNGOCSRGrants(uint256 _ngoId) external view returns (uint256[] memory) {
        return _ngoReceivedGrants[_ngoId];
    }

    /**
     * @dev Returns CSR impact metrics for a company
     * @param _company Company address
     * @return metrics CSR impact metrics
     */
    function getCSRMetrics(address _company) external view returns (
        uint256 totalGranted,
        uint256 grantCount,
        uint256 currentYearContributions,
        uint256 beneficiaryNGOCount
    ) {
        totalGranted = companyTotalGranted[_company];
        grantCount = _companyGrants[_company].length;
        currentYearContributions = annualContributions[_company][getCurrentTaxYear()];
        
        // Calculate unique beneficiary NGOs
        uint256[] memory grants = _companyGrants[_company];
        uint256[] memory uniqueNGOs = new uint256[](grants.length);
        uint256 uniqueCount = 0;
        
        for (uint256 i = 0; i < grants.length; i++) {
            uint256 ngoId = _csrGrants[grants[i]].ngoId;
            bool found = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (uniqueNGOs[j] == ngoId) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniqueNGOs[uniqueCount] = ngoId;
                uniqueCount++;
            }
        }
        
        beneficiaryNGOCount = uniqueCount;
    }

    // =============================================================
    //                    ADMIN FUNCTIONS
    // =============================================================

    /**
     * @dev Updates CSR fee percentage
     * @param _newFeeBps New fee in basis points
     */
    function updateCSRFee(uint256 _newFeeBps) external onlyRole(GOVERNANCE_ROLE) {
        if (_newFeeBps > 1000) revert InvalidAmount(); // Max 10%
        uint256 oldFee = csrFeeBps;
        csrFeeBps = _newFeeBps;
        emit CSRFeeUpdated(oldFee, _newFeeBps);
    }

    /**
     * @dev Updates CSR treasury address
     * @param _newTreasury New treasury address
     */
    function updateCSRTreasury(address payable _newTreasury) external onlyRole(GOVERNANCE_ROLE) {
        if (_newTreasury == address(0)) revert InvalidAddress();
        csrTreasury = _newTreasury;
    }

    /**
     * @dev Pauses all CSR operations
     */
    function pause() external onlyRole(GOVERNANCE_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all CSR operations
     */
    function unpause() external onlyRole(GOVERNANCE_ROLE) {
        _unpause();
    }

    // =============================================================
    //                    UPGRADE FUNCTIONS
    // =============================================================

    /**
     * @dev Authorizes contract upgrades
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(GOVERNANCE_ROLE)
    {}

    /**
     * @dev Returns the current implementation version
     * @return version The version string
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    // =============================================================
    //                    RECEIVE FUNCTION
    // =============================================================

    /**
     * @dev Fallback function to reject direct ETH transfers
     */
    receive() external payable {
        revert("Use recordCSRGrant() function");
    }
} 