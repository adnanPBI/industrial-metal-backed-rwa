// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReserveChainAssetToken} from "./ReserveChainAssetToken.sol";

contract ReserveChainTokenFactory is AccessControl {
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");
    mapping(bytes32 => address) public tokenByProgram;

    event ProgramTokenCreated(bytes32 indexed programId, address indexed token, string name, string symbol, uint256 cap);

    constructor(address issuerAdmin) {
        require(issuerAdmin != address(0), "issuer admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, issuerAdmin);
        _grantRole(DEPLOYER_ROLE, issuerAdmin);
    }

    function createProgramToken(bytes32 programId, string calldata name, string calldata symbol, uint256 cap, address issuerAdmin)
        external onlyRole(DEPLOYER_ROLE) returns (address)
    {
        require(tokenByProgram[programId] == address(0), "program already configured");
        ReserveChainAssetToken token = new ReserveChainAssetToken(name, symbol, cap, programId, issuerAdmin);
        tokenByProgram[programId] = address(token);
        emit ProgramTokenCreated(programId, address(token), name, symbol, cap);
        return address(token);
    }
}
