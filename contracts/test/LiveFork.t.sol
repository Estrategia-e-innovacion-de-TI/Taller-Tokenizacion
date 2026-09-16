// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {COPW} from "../src/COPW.sol";
import {RENT} from "../src/RENT.sol";
import {PropertySale} from "../src/PropertySale.sol";
import {YieldDistributor} from "../src/YieldDistributor.sol";

/// @notice Verifica los contratos de deployments/latest.json vía fork (sin broadcast).
/// Uso: make verify-live
contract LiveForkTest is Test {
    using stdJson for string;

    COPW internal copw;
    RENT internal rent;
    YieldDistributor internal distributor;
    PropertySale internal sale;
    address internal treasury;

    address internal alice = makeAddr("fork-alice");

    function setUp() public {
        vm.createSelectFork(vm.envString("SEPOLIA_RPC_URL"));

        string memory json = vm.readFile("deployments/latest.json");
        copw = COPW(json.readAddress(".COPW"));
        rent = RENT(json.readAddress(".RENT"));
        distributor = YieldDistributor(json.readAddress(".YieldDistributor"));
        sale = PropertySale(json.readAddress(".PropertySale"));
        treasury = json.readAddress(".Treasury");
    }

    function test_live_wiring() public view {
        assertEq(address(sale.copw()), address(copw), "sale.copw");
        assertEq(address(sale.rent()), address(rent), "sale.rent");
        assertEq(address(sale.distributor()), address(distributor), "sale.distributor");
        assertEq(sale.treasury(), treasury, "sale.treasury");
        assertEq(rent.minter(), address(sale), "rent.minter");
        assertEq(distributor.sale(), address(sale), "distributor.sale");
        assertEq(address(distributor.rent()), address(rent), "distributor.rent");
        assertEq(address(distributor.copw()), address(copw), "distributor.copw");
        console2.log("COPW", address(copw));
        console2.log("RENT", address(rent));
        console2.log("Sale", address(sale));
        console2.log("Distributor", address(distributor));
        console2.log("wiring OK, RENT supply =", rent.totalSupply());
    }

    function test_live_faucet_buy_deposit_claim() public {
        uint256 price = sale.PRICE_PER_TOKEN();
        uint256 rentAmount = 2;
        uint256 cost = rentAmount * price;
        uint256 yieldDeposit = 1_000_000 * 1e2; // 1M COP

        uint256 treasuryBefore = copw.balanceOf(treasury);
        uint256 supplyBefore = rent.totalSupply();

        vm.prank(alice);
        copw.faucet();
        assertEq(copw.balanceOf(alice), copw.FAUCET_AMOUNT());

        vm.startPrank(alice);
        copw.approve(address(sale), cost);
        sale.buy(rentAmount);
        vm.stopPrank();

        assertEq(rent.balanceOf(alice), rentAmount);
        assertEq(rent.totalSupply(), supplyBefore + rentAmount);
        assertEq(copw.balanceOf(treasury), treasuryBefore + cost);
        assertEq(copw.balanceOf(alice), copw.FAUCET_AMOUNT() - cost);

        uint256 pendingBefore = distributor.pendingYield(alice);
        vm.startPrank(alice);
        copw.approve(address(distributor), yieldDeposit);
        distributor.depositYield(yieldDeposit);
        vm.stopPrank();

        uint256 pending = distributor.pendingYield(alice);
        assertGt(pending, pendingBefore, "alice should accrue yield");
        uint256 expectedShare = (yieldDeposit * rentAmount) / rent.totalSupply();
        assertEq(pending - pendingBefore, expectedShare);

        uint256 copwBefore = copw.balanceOf(alice);
        vm.prank(alice);
        uint256 claimed = distributor.claim();
        assertEq(claimed, pending);
        assertEq(copw.balanceOf(alice), copwBefore + claimed);
        assertEq(distributor.pendingYield(alice), 0);

        console2.log("flow OK: bought RENT amount", rentAmount);
        console2.log("flow OK: claimed COPW", claimed);
    }
}
