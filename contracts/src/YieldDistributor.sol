// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {RENT} from "./RENT.sol";

/// @title YieldDistributor — rentas proporcionales a RENT (dividend-per-token)
/// @notice depositYield y claim son públicos (sin super-admin).
contract YieldDistributor {
    using SafeERC20 for IERC20;

    uint256 private constant MAGNITUDE = 1e18;

    RENT public immutable rent;
    IERC20 public immutable copw;

    uint256 public dividendPerToken;
    uint256 public epochId;
    uint256 public totalDeposited;

    /// @dev Deuda ya “contabilizada” (incluye correcciones por mint/transfer)
    mapping(address => uint256) public mantissa;
    mapping(address => uint256) public withdrawn;

    address public sale;

    event YieldDeposited(uint256 indexed epochId, address indexed depositor, uint256 amount);
    event YieldClaimed(address indexed account, uint256 amount);
    event SaleUpdated(address indexed sale);

    error NoSupply();
    error NothingToClaim();
    error ZeroAmount();
    error OnlySale();

    constructor(RENT rent_, IERC20 copw_) {
        rent = rent_;
        copw = copw_;
    }

    function setSale(address sale_) external {
        // Solo una vez desde deploy (sale == 0) o desde la sale actual
        if (sale != address(0) && msg.sender != sale) revert OnlySale();
        sale = sale_;
        emit SaleUpdated(sale_);
    }

    /// @notice Llamado por PropertySale tras mint para que tokens nuevos no cobren renta pasada.
    function onMint(address account, uint256 amount) external {
        if (msg.sender != sale) revert OnlySale();
        mantissa[account] += (amount * dividendPerToken) / MAGNITUDE;
    }

    /// @notice Deposita renta en COPW. Cualquiera puede fondear el “mes”.
    function depositYield(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        uint256 supply = rent.totalSupply();
        if (supply == 0) revert NoSupply();

        copw.safeTransferFrom(msg.sender, address(this), amount);
        dividendPerToken += (amount * MAGNITUDE) / supply;
        totalDeposited += amount;
        unchecked {
            ++epochId;
        }

        emit YieldDeposited(epochId, msg.sender, amount);
    }

    function accumulativeDividend(address account) public view returns (uint256) {
        return (rent.balanceOf(account) * dividendPerToken) / MAGNITUDE;
    }

    function pendingYield(address account) public view returns (uint256) {
        uint256 accumulative = accumulativeDividend(account);
        uint256 already = mantissa[account] + withdrawn[account];
        if (accumulative <= already) return 0;
        return accumulative - already;
    }

    /// @notice Retira todo el yield pendiente de `msg.sender`.
    function claim() external returns (uint256 amount) {
        amount = pendingYield(msg.sender);
        if (amount == 0) revert NothingToClaim();

        withdrawn[msg.sender] += amount;
        copw.safeTransfer(msg.sender, amount);

        emit YieldClaimed(msg.sender, amount);
    }
}
