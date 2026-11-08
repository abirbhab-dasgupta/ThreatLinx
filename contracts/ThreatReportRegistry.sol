
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

   
                                                                                  
                                                          
   
contract ThreatReportRegistry is AccessControl {
    bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER_ROLE");
    mapping(bytes32 => mapping(uint256 => bytes32)) private _commitments;

    event EvidenceRegistered(bytes32 indexed reportKey, uint256 indexed version, bytes32 commitment, address indexed publisher);

    constructor(address initialPublisher) {
        require(initialPublisher != address(0), "Invalid publisher");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PUBLISHER_ROLE, initialPublisher);
    }

    function publish(bytes32 reportKey, uint256 version, bytes32 commitment) external onlyRole(PUBLISHER_ROLE) {
        require(reportKey != bytes32(0) && commitment != bytes32(0) && version > 0, "Invalid commitment");
        require(_commitments[reportKey][version] == bytes32(0), "Version already registered");
        _commitments[reportKey][version] = commitment;
        emit EvidenceRegistered(reportKey, version, commitment, msg.sender);
    }

    function getCommitment(bytes32 reportKey, uint256 version) external view returns (bytes32) {
        return _commitments[reportKey][version];
    }
}
