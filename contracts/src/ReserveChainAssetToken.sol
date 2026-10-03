// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * TESTNET / AUDIT CANDIDATE ONLY.
 * Production deployment requires owner-approved token terms, independent audit,
 * issuer-controlled multisig administration and written launch authorization.
 */
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract ReserveChainAssetToken is ERC20Capped, ERC20Pausable, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant REDEMPTION_BURNER_ROLE = keccak256("REDEMPTION_BURNER_ROLE");

    bytes32 public immutable programId;

    event ReserveChainMint(address indexed to, uint256 amount, bytes32 indexed programId, bytes32 reference);
    event RedemptionBurn(address indexed from, uint256 amount, bytes32 indexed programId, bytes32 redemptionReference);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 cap_,
        bytes32 programId_,
        address issuerAdmin
    ) ERC20(name_, symbol_) ERC20Capped(cap_) {
        require(issuerAdmin != address(0), "issuer admin required");
        require(programId_ != bytes32(0), "program id required");
        programId = programId_;
        _grantRole(DEFAULT_ADMIN_ROLE, issuerAdmin);
        _grantRole(ISSUER_ROLE, issuerAdmin);
        _grantRole(PAUSER_ROLE, issuerAdmin);
        _grantRole(REDEMPTION_BURNER_ROLE, issuerAdmin);
    }

    function mint(address to, uint256 amount, bytes32 sourceReference) external onlyRole(ISSUER_ROLE) {
        require(to != address(0), "invalid recipient");
        _mint(to, amount);
        emit ReserveChainMint(to, amount, programId, sourceReference);
    }

    function redemptionBurnFrom(address holder, uint256 amount, bytes32 redemptionReference)
        external
        onlyRole(REDEMPTION_BURNER_ROLE)
    {
        _spendAllowance(holder, _msgSender(), amount);
        _burn(holder, amount);
        emit RedemptionBurn(holder, amount, programId, redemptionReference);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Capped, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
