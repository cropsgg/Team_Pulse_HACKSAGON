// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "../interfaces/IImpactChainCore.sol";

/**
 * @title QAMemory
 * @dev UUPS upgradeable contract for storing AI multilingual support knowledge base
 * @notice Manages Q&A content, multilingual support, and knowledge base for AI assistance
 */
contract QAMemory is 
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

    /// @dev Role for contributing knowledge
    bytes32 public constant CONTRIBUTOR_ROLE = keccak256("CONTRIBUTOR_ROLE");
    
    /// @dev Role for validating content
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    /// @dev Role for governance operations
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @dev Role for AI systems
    bytes32 public constant AI_ROLE = keccak256("AI_ROLE");

    /// @dev Maximum content size limit (to prevent gas issues)
    uint256 public constant MAX_CONTENT_SIZE = 1024;

    // =============================================================
    //                        STORAGE
    // =============================================================

    /// @dev Counter for QA IDs
    uint256 private _qaIdCounter;

    /// @dev Mapping from QA ID to QA memory
    mapping(uint256 => QAMemory) private _qaMemories;

    /// @dev Mapping from language to QA IDs for quick lookup
    mapping(string => uint256[]) private _languageQAs;

    /// @dev Mapping from contributor to their QA IDs
    mapping(address => uint256[]) private _contributorQAs;

    /// @dev Mapping to track content validation status
    mapping(uint256 => ValidationStatus) private _validationStatus;

    /// @dev Mapping for content categorization
    mapping(uint256 => string[]) private _contentTags;

    /// @dev Mapping for content voting/rating
    mapping(uint256 => ContentRating) private _contentRatings;

    /// @dev Mapping for user ratings on content
    mapping(uint256 => mapping(address => uint8)) private _userRatings;

    /// @dev Supported languages
    string[] private _supportedLanguages;

    /// @dev Language support status
    mapping(string => bool) public isLanguageSupported;

    /// @dev Total QA entries
    uint256 public totalQAEntries;

    /// @dev Quality threshold for content acceptance
    uint256 public qualityThreshold;

    // =============================================================
    //                        STRUCTS
    // =============================================================

    /// @dev Content validation status
    struct ValidationStatus {
        bool isValidated;           // Whether content is validated
        address validator;          // Who validated the content
        uint256 validationTime;     // When it was validated
        string validationNotes;     // Validation notes
    }

    /// @dev Content rating system
    struct ContentRating {
        uint256 totalRatings;       // Total number of ratings
        uint256 sumRatings;         // Sum of all ratings
        uint256 averageRating;      // Average rating (calculated)
        uint256 helpfulCount;       // Number of "helpful" votes
    }

    // =============================================================
    //                        EVENTS
    // =============================================================

    /// @dev Emitted when content is validated
    event ContentValidated(
        uint256 indexed qaId,
        address indexed validator,
        bool approved,
        string notes
    );

    /// @dev Emitted when content is rated
    event ContentRated(
        uint256 indexed qaId,
        address indexed rater,
        uint8 rating,
        uint256 newAverage
    );

    /// @dev Emitted when language support is added
    event LanguageAdded(
        string indexed language,
        address indexed admin
    );

    /// @dev Emitted when content is tagged
    event ContentTagged(
        uint256 indexed qaId,
        string[] tags,
        address indexed tagger
    );

    /// @dev Emitted when content is updated
    event ContentUpdated(
        uint256 indexed qaId,
        string newContentHash,
        address indexed updater
    );

    // =============================================================
    //                        ERRORS
    // =============================================================

    error QANotFound();
    error InvalidContentSize();
    error LanguageNotSupported();
    error ContentAlreadyValidated();
    error InvalidRating();
    error UnauthorizedUpdate();
    error InvalidLanguageCode();

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
     * @dev Initializes the QA Memory system
     * @param _admin Initial admin address
     * @param _governance Governance contract address
     * @param _qualityThreshold Quality threshold for content acceptance
     */
    function initialize(
        address _admin,
        address _governance,
        uint256 _qualityThreshold
    ) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _governance);
        _grantRole(CONTRIBUTOR_ROLE, _admin);
        _grantRole(VALIDATOR_ROLE, _admin);
        _grantRole(AI_ROLE, _admin);

        qualityThreshold = _qualityThreshold;
        _qaIdCounter = 1;

        // Add default supported languages
        _addLanguageSupport("en"); // English
        _addLanguageSupport("es"); // Spanish
        _addLanguageSupport("fr"); // French
        _addLanguageSupport("de"); // German
        _addLanguageSupport("zh"); // Chinese
        _addLanguageSupport("ja"); // Japanese
        _addLanguageSupport("ko"); // Korean
        _addLanguageSupport("ar"); // Arabic
        _addLanguageSupport("hi"); // Hindi
        _addLanguageSupport("pt"); // Portuguese
    }

    // =============================================================
    //                    CONTENT FUNCTIONS
    // =============================================================

    /**
     * @dev Stores Q&A content in the knowledge base
     * @param _contentHash IPFS hash of Q&A content
     * @param _cid IPFS CID for direct access
     * @param _language Language code (en, es, fr, etc.)
     * @param _tags Content categorization tags
     * @return qaId The assigned QA ID
     */
    function storeQAContent(
        string calldata _contentHash,
        string calldata _cid,
        string calldata _language,
        string[] calldata _tags
    ) public onlyRole(CONTRIBUTOR_ROLE) whenNotPaused returns (uint256) {
        if (bytes(_contentHash).length == 0 || bytes(_contentHash).length > MAX_CONTENT_SIZE) {
            revert InvalidContentSize();
        }
        if (!isLanguageSupported[_language]) revert LanguageNotSupported();

        uint256 qaId = _qaIdCounter++;

        _qaMemories[qaId] = QAMemory({
            contentHash: _contentHash,
            cid: _cid,
            language: _language,
            timestamp: block.timestamp,
            contributor: msg.sender
        });

        // Update indexes
        _languageQAs[_language].push(qaId);
        _contributorQAs[msg.sender].push(qaId);
        
        // Add tags
        if (_tags.length > 0) {
            _contentTags[qaId] = _tags;
            emit ContentTagged(qaId, _tags, msg.sender);
        }

        totalQAEntries++;

        emit QAStored(qaId, _contentHash, _language, msg.sender);
        
        return qaId;
    }

    /**
     * @dev Updates existing Q&A content
     * @param _qaId QA ID to update
     * @param _newContentHash New IPFS hash
     * @param _newCid New IPFS CID
     */
    function updateQAContent(
        uint256 _qaId,
        string calldata _newContentHash,
        string calldata _newCid
    ) external whenNotPaused {
        QAMemory storage qa = _qaMemories[_qaId];
        if (qa.contributor == address(0)) revert QANotFound();
        
        // Only contributor or admin can update
        if (msg.sender != qa.contributor && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedUpdate();
        }

        if (bytes(_newContentHash).length == 0 || bytes(_newContentHash).length > MAX_CONTENT_SIZE) {
            revert InvalidContentSize();
        }

        qa.contentHash = _newContentHash;
        qa.cid = _newCid;

        emit ContentUpdated(_qaId, _newContentHash, msg.sender);
    }

    /**
     * @dev Batch stores multiple Q&A entries
     * @param _contentHashes Array of content hashes
     * @param _cids Array of CIDs
     * @param _languages Array of language codes
     * @param _tagArrays Array of tag arrays
     * @return qaIds Array of assigned QA IDs
     */
    function batchStoreQAContent(
        string[] calldata _contentHashes,
        string[] calldata _cids,
        string[] calldata _languages,
        string[][] calldata _tagArrays
    ) external onlyRole(CONTRIBUTOR_ROLE) whenNotPaused returns (uint256[] memory) {
        if (_contentHashes.length != _cids.length || 
            _contentHashes.length != _languages.length ||
            _contentHashes.length != _tagArrays.length) {
            revert InvalidAmount();
        }

        uint256[] memory qaIds = new uint256[](_contentHashes.length);

        for (uint256 i = 0; i < _contentHashes.length; i++) {
            qaIds[i] = storeQAContent(
                _contentHashes[i],
                _cids[i],
                _languages[i],
                _tagArrays[i]
            );
        }

        return qaIds;
    }

    // =============================================================
    //                    VALIDATION FUNCTIONS
    // =============================================================

    /**
     * @dev Validates Q&A content
     * @param _qaId QA ID to validate
     * @param _approved Whether to approve the content
     * @param _notes Validation notes
     */
    function validateContent(
        uint256 _qaId,
        bool _approved,
        string calldata _notes
    ) public onlyRole(VALIDATOR_ROLE) whenNotPaused {
        QAMemory storage qa = _qaMemories[_qaId];
        if (qa.contributor == address(0)) revert QANotFound();
        if (_validationStatus[_qaId].isValidated) revert ContentAlreadyValidated();

        _validationStatus[_qaId] = ValidationStatus({
            isValidated: _approved,
            validator: msg.sender,
            validationTime: block.timestamp,
            validationNotes: _notes
        });

        emit ContentValidated(_qaId, msg.sender, _approved, _notes);
    }

    /**
     * @dev Batch validates multiple content entries
     * @param _qaIds Array of QA IDs
     * @param _approvals Array of approval decisions
     * @param _notes Validation notes
     */
    function batchValidateContent(
        uint256[] calldata _qaIds,
        bool[] calldata _approvals,
        string calldata _notes
    ) external onlyRole(VALIDATOR_ROLE) whenNotPaused {
        if (_qaIds.length != _approvals.length) revert InvalidAmount();

        for (uint256 i = 0; i < _qaIds.length; i++) {
            validateContent(_qaIds[i], _approvals[i], _notes);
        }
    }

    // =============================================================
    //                    RATING FUNCTIONS
    // =============================================================

    /**
     * @dev Rates Q&A content quality
     * @param _qaId QA ID to rate
     * @param _rating Rating from 1-5
     */
    function rateContent(
        uint256 _qaId,
        uint8 _rating
    ) external whenNotPaused {
        if (_rating < 1 || _rating > 5) revert InvalidRating();
        
        QAMemory storage qa = _qaMemories[_qaId];
        if (qa.contributor == address(0)) revert QANotFound();

        // Update user rating (allow re-rating)
        uint8 oldRating = _userRatings[_qaId][msg.sender];
        _userRatings[_qaId][msg.sender] = _rating;

        ContentRating storage rating = _contentRatings[_qaId];

        if (oldRating == 0) {
            // New rating
            rating.totalRatings++;
            rating.sumRatings += _rating;
        } else {
            // Update existing rating
            rating.sumRatings = rating.sumRatings - oldRating + _rating;
        }

        // Calculate new average
        rating.averageRating = rating.sumRatings / rating.totalRatings;

        emit ContentRated(_qaId, msg.sender, _rating, rating.averageRating);
    }

    /**
     * @dev Marks content as helpful
     * @param _qaId QA ID
     */
    function markAsHelpful(uint256 _qaId) external whenNotPaused {
        QAMemory storage qa = _qaMemories[_qaId];
        if (qa.contributor == address(0)) revert QANotFound();

        _contentRatings[_qaId].helpfulCount++;
    }

    // =============================================================
    //                    LANGUAGE FUNCTIONS
    // =============================================================

    /**
     * @dev Adds support for a new language
     * @param _languageCode Language code (e.g., "en", "es")
     */
    function addLanguageSupport(
        string calldata _languageCode
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (bytes(_languageCode).length == 0 || bytes(_languageCode).length > 5) {
            revert InvalidLanguageCode();
        }

        _addLanguageSupport(_languageCode);
    }

    /**
     * @dev Removes support for a language
     * @param _languageCode Language code to remove
     */
    function removeLanguageSupport(
        string calldata _languageCode
    ) external onlyRole(GOVERNANCE_ROLE) {
        isLanguageSupported[_languageCode] = false;

        // Remove from supported languages array
        for (uint256 i = 0; i < _supportedLanguages.length; i++) {
            if (keccak256(bytes(_supportedLanguages[i])) == keccak256(bytes(_languageCode))) {
                _supportedLanguages[i] = _supportedLanguages[_supportedLanguages.length - 1];
                _supportedLanguages.pop();
                break;
            }
        }
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    /**
     * @dev Returns Q&A memory information
     * @param _qaId QA ID
     * @return qa The QA memory data
     */
    function getQAMemory(uint256 _qaId) external view returns (QAMemory memory) {
        return _qaMemories[_qaId];
    }

    /**
     * @dev Returns Q&A entries for a specific language
     * @param _language Language code
     * @return qaIds Array of QA IDs for the language
     */
    function getQAsByLanguage(string calldata _language) external view returns (uint256[] memory) {
        return _languageQAs[_language];
    }

    /**
     * @dev Returns Q&A entries by a contributor
     * @param _contributor Contributor address
     * @return qaIds Array of QA IDs by the contributor
     */
    function getQAsByContributor(address _contributor) external view returns (uint256[] memory) {
        return _contributorQAs[_contributor];
    }

    /**
     * @dev Returns content tags for a QA
     * @param _qaId QA ID
     * @return tags Array of content tags
     */
    function getContentTags(uint256 _qaId) external view returns (string[] memory) {
        return _contentTags[_qaId];
    }

    /**
     * @dev Returns content rating information
     * @param _qaId QA ID
     * @return rating Content rating data
     */
    function getContentRating(uint256 _qaId) external view returns (ContentRating memory) {
        return _contentRatings[_qaId];
    }

    /**
     * @dev Returns validation status for content
     * @param _qaId QA ID
     * @return status Validation status
     */
    function getValidationStatus(uint256 _qaId) external view returns (ValidationStatus memory) {
        return _validationStatus[_qaId];
    }

    /**
     * @dev Returns all supported languages
     * @return languages Array of supported language codes
     */
    function getSupportedLanguages() external view returns (string[] memory) {
        return _supportedLanguages;
    }

    /**
     * @dev Returns high-quality content for AI training
     * @param _language Language filter
     * @param _minRating Minimum average rating
     * @return qaIds Array of high-quality QA IDs
     */
    function getHighQualityContent(
        string calldata _language,
        uint256 _minRating
    ) external view returns (uint256[] memory) {
        uint256[] memory languageQAs = _languageQAs[_language];
        uint256[] memory temp = new uint256[](languageQAs.length);
        uint256 count = 0;

        for (uint256 i = 0; i < languageQAs.length; i++) {
            uint256 qaId = languageQAs[i];
            ContentRating memory rating = _contentRatings[qaId];
            ValidationStatus memory validation = _validationStatus[qaId];
            
            if (validation.isValidated && rating.averageRating >= _minRating) {
                temp[count] = qaId;
                count++;
            }
        }

        // Create result array with exact size
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }

        return result;
    }

    // =============================================================
    //                    INTERNAL FUNCTIONS
    // =============================================================

    /**
     * @dev Internal function to add language support
     * @param _languageCode Language code to add
     */
    function _addLanguageSupport(string memory _languageCode) internal {
        if (!isLanguageSupported[_languageCode]) {
            isLanguageSupported[_languageCode] = true;
            _supportedLanguages.push(_languageCode);
            emit LanguageAdded(_languageCode, msg.sender);
        }
    }

    // =============================================================
    //                    ADMIN FUNCTIONS
    // =============================================================

    /**
     * @dev Updates quality threshold
     * @param _newThreshold New quality threshold
     */
    function updateQualityThreshold(
        uint256 _newThreshold
    ) external onlyRole(GOVERNANCE_ROLE) {
        qualityThreshold = _newThreshold;
    }

    /**
     * @dev Pauses all operations
     */
    function pause() external onlyRole(GOVERNANCE_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all operations
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
} 