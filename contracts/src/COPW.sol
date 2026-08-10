// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title COPW — pesos colombianos de demo (mock)
/// @notice Faucet público para fondear smart accounts en el taller. No es dinero real.
contract COPW is ERC20 {
    uint8 private constant DECIMALS = 2;

    /// @dev 5.000.000 COP por claim (con 2 decimals)
    uint256 public constant FAUCET_AMOUNT = 5_000_000 * 10 ** DECIMALS;

    /// @dev Cooldown anti-spam por address (1 hora)
    uint256 public constant FAUCET_COOLDOWN = 1 hours;

    mapping(address => uint256) public lastFaucetAt;

    event FaucetClaimed(address indexed account, uint256 amount);

    error FaucetCooldownActive(uint256 availableAt);

    constructor() ERC20("COP Wrapped", "COPW") {}

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /// @notice Fondea `msg.sender` con FAUCET_AMOUNT. Público, sin roles.
    function faucet() external {
        uint256 last = lastFaucetAt[msg.sender];
        if (last != 0) {
            uint256 availableAt = last + FAUCET_COOLDOWN;
            if (block.timestamp < availableAt) {
                revert FaucetCooldownActive(availableAt);
            }
        }
        lastFaucetAt[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
}
