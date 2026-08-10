// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title RENT — participación tokenizada del inmueble demo
/// @notice 1 RENT = 100.000 COP. MAX_SUPPLY 50.000 = 5.000 M COP.
contract RENT is ERC20 {
    uint256 public constant MAX_SUPPLY = 50_000;
    uint256 public constant PROPERTY_VALUE_COP = 5_000_000_000;
    uint256 public constant PRICE_PER_TOKEN_COP = 100_000;

    address public minter;
    address public deployer;
    string public propertyName;
    string public propertyLocation;

    error OnlyMinter();
    error OnlyDeployer();
    error ZeroAddress();
    error CapExceeded();
    error MinterAlreadySet();

    event MinterUpdated(address indexed previousMinter, address indexed newMinter);

    constructor(string memory propertyName_, string memory propertyLocation_) ERC20("RENT", "RENT") {
        propertyName = propertyName_;
        propertyLocation = propertyLocation_;
        deployer = msg.sender;
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    /// @notice Una sola vez: el deployer asigna PropertySale como minter.
    function setMinter(address newMinter) external {
        if (msg.sender != deployer) revert OnlyDeployer();
        if (minter != address(0)) revert MinterAlreadySet();
        if (newMinter == address(0)) revert ZeroAddress();
        minter = newMinter;
        emit MinterUpdated(address(0), newMinter);
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != minter) revert OnlyMinter();
        if (totalSupply() + amount > MAX_SUPPLY) revert CapExceeded();
        _mint(to, amount);
    }
}
