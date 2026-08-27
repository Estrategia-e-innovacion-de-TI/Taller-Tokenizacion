// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {COPW} from "../src/COPW.sol";
import {RENT} from "../src/RENT.sol";
import {PropertySale} from "../src/PropertySale.sol";
import {YieldDistributor} from "../src/YieldDistributor.sol";

/// @notice Verifica los contratos desplegados en Sepolia vía fork (sin broadcast).
/// Uso: make verify-live
contract LiveForkTest is Test {
    // deployments/latest.json (2026-08-20)
    COPW constant copw = COPW(0x55815499F210C97187d242C63b6377D8F55b0553);
    RENT constant rent = RENT(0x51CB22C6A1A51D57c0f112C6100e7b7Ffe7F24ba);
    YieldDistributor constant distributor = YieldDistributor(0x121fD2529dC422183d389BCbaD99C4FF60A4B46f);
    PropertySale constant sale = PropertySale(0x3900f8c6BaB4F1301A5feCaAdb5EB73D026aA526);
    address constant treasury = 0x9A8D3f1D52a8018D4f01f04DB8845C8a58Cc6d4a;

    address internal alice = makeAddr("fork-alice");

    function setUp() public {
        // Requiere --fork-url; si no hay fork, fallan los asserts de wiring.
        vm.createSelectFork(vm.envString("SEPOLIA_RPC_URL"));
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
        console2.log("wiring OK, RENT supply =", rent.totalSupply());
    }

    function test_live_faucet_buy_deposit_claim() public {
        uint256 price = sale.PRICE_PER_TOKEN();
        uint256 rentAmount = 2;
        uint256 cost = rentAmount * price;
        uint256 yieldDeposit = 1_000_000 * 1e2; // 1M COP

        uint256 treasuryBefore = copw.balanceOf(treasury);
        uint256 supplyBefore = rent.totalSupply();

        // 1) Faucet (simulado en fork; no toca Sepolia real)
        vm.prank(alice);
        copw.faucet();
        assertEq(copw.balanceOf(alice), copw.FAUCET_AMOUNT());

        // 2) Comprar RENT → COPW a treasury
        vm.startPrank(alice);
        copw.approve(address(sale), cost);
        sale.buy(rentAmount);
        vm.stopPrank();

        assertEq(rent.balanceOf(alice), rentAmount);
        assertEq(rent.totalSupply(), supplyBefore + rentAmount);
        assertEq(copw.balanceOf(treasury), treasuryBefore + cost);
        assertEq(copw.balanceOf(alice), copw.FAUCET_AMOUNT() - cost);

        // 3) Depositar yield (alice usa COPW restante)
        uint256 pendingBefore = distributor.pendingYield(alice);
        vm.startPrank(alice);
        copw.approve(address(distributor), yieldDeposit);
        distributor.depositYield(yieldDeposit);
        vm.stopPrank();

        uint256 pending = distributor.pendingYield(alice);
        assertGt(pending, pendingBefore, "alice should accrue yield");
        // Con supply > rentAmount (otros holders), recibe su proporción; con solo ella en fork
        // tras mint, recibe yield * aliceBal / totalSupply.
        uint256 expectedShare = (yieldDeposit * rentAmount) / rent.totalSupply();
        assertEq(pending - pendingBefore, expectedShare);

        // 4) Claim
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
