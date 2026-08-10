// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {RENT} from "./RENT.sol";
import {YieldDistributor} from "./YieldDistributor.sol";

/// @title PropertySale — venta primaria abierta de RENT
contract PropertySale {
    using SafeERC20 for IERC20;

    RENT public immutable rent;
    IERC20 public immutable copw;
    YieldDistributor public immutable distributor;
    address public immutable treasury;

    /// @dev 100.000 COP con 2 decimals de COPW
    uint256 public constant PRICE_PER_TOKEN = 100_000 * 10 ** 2;

    event RentPurchased(address indexed buyer, uint256 amount, uint256 cost);

    error ZeroAmount();
    error CapExceeded();

    constructor(RENT rent_, IERC20 copw_, YieldDistributor distributor_, address treasury_) {
        rent = rent_;
        copw = copw_;
        distributor = distributor_;
        treasury = treasury_;
    }

    function buy(uint256 rentAmount) external {
        if (rentAmount == 0) revert ZeroAmount();
        if (rent.totalSupply() + rentAmount > rent.MAX_SUPPLY()) revert CapExceeded();

        uint256 cost = rentAmount * PRICE_PER_TOKEN;
        copw.safeTransferFrom(msg.sender, treasury, cost);
        rent.mint(msg.sender, rentAmount);
        distributor.onMint(msg.sender, rentAmount);

        emit RentPurchased(msg.sender, rentAmount, cost);
    }
}
