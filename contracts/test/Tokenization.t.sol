// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {COPW} from "../src/COPW.sol";
import {RENT} from "../src/RENT.sol";
import {PropertySale} from "../src/PropertySale.sol";
import {YieldDistributor} from "../src/YieldDistributor.sol";

contract TokenizationTest is Test {
    COPW internal copw;
    RENT internal rent;
    PropertySale internal sale;
    YieldDistributor internal distributor;

    address internal treasury = makeAddr("treasury");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal facilitator = makeAddr("facilitator");

    uint256 internal constant PRICE = 100_000 * 1e2;

    function setUp() public {
        copw = new COPW();
        rent = new RENT("RENT - Inmueble Demo", "Colombia");
        distributor = new YieldDistributor(rent, copw);
        sale = new PropertySale(rent, copw, distributor, treasury);
        rent.setMinter(address(sale));
        distributor.setSale(address(sale));
    }

    function _faucetAndBuy(address user, uint256 rentAmount) internal {
        vm.prank(user);
        copw.faucet();
        vm.prank(user);
        copw.approve(address(sale), type(uint256).max);
        vm.prank(user);
        sale.buy(rentAmount);
    }

    function test_faucetGivesFiveMillion() public {
        vm.prank(alice);
        copw.faucet();
        assertEq(copw.balanceOf(alice), 5_000_000 * 1e2);
    }

    function test_faucetCooldown() public {
        vm.prank(alice);
        copw.faucet();
        vm.prank(alice);
        vm.expectRevert();
        copw.faucet();

        vm.warp(block.timestamp + 1 hours);
        vm.prank(alice);
        copw.faucet();
        assertEq(copw.balanceOf(alice), 10_000_000 * 1e2);
    }

    function test_buyMinOneRent() public {
        _faucetAndBuy(alice, 1);
        assertEq(rent.balanceOf(alice), 1);
        assertEq(copw.balanceOf(treasury), PRICE);
        assertEq(copw.balanceOf(alice), 5_000_000 * 1e2 - PRICE);
    }

    function test_buyRespectsCap() public {
        // Alice needs many faucets — mint via deal for speed
        deal(address(copw), alice, 50_000 * PRICE);
        vm.startPrank(alice);
        copw.approve(address(sale), type(uint256).max);
        sale.buy(50_000);
        vm.expectRevert();
        sale.buy(1);
        vm.stopPrank();
        assertEq(rent.totalSupply(), 50_000);
    }

    function test_yieldProportional70_30() public {
        _faucetAndBuy(alice, 7);
        _faucetAndBuy(bob, 3);

        uint256 deposit = 10_000_000 * 1e2; // 10 M COP
        deal(address(copw), facilitator, deposit);
        vm.startPrank(facilitator);
        copw.approve(address(distributor), deposit);
        distributor.depositYield(deposit);
        vm.stopPrank();

        assertEq(distributor.pendingYield(alice), 7_000_000 * 1e2);
        assertEq(distributor.pendingYield(bob), 3_000_000 * 1e2);

        uint256 aliceBefore = copw.balanceOf(alice);
        vm.prank(alice);
        distributor.claim();
        assertEq(copw.balanceOf(alice) - aliceBefore, 7_000_000 * 1e2);

        vm.prank(alice);
        vm.expectRevert();
        distributor.claim();
    }

    function test_buyAfterDepositGetsNoRetroactiveYield() public {
        _faucetAndBuy(alice, 10);

        uint256 deposit = 5_000_000 * 1e2;
        deal(address(copw), facilitator, deposit);
        vm.startPrank(facilitator);
        copw.approve(address(distributor), deposit);
        distributor.depositYield(deposit);
        vm.stopPrank();

        _faucetAndBuy(bob, 10);
        assertEq(distributor.pendingYield(bob), 0);
        assertEq(distributor.pendingYield(alice), deposit);
    }

    function test_anyoneCanDepositYield() public {
        _faucetAndBuy(alice, 1);
        // Alice deposits remaining COPW as yield
        uint256 amount = 100_000 * 1e2;
        vm.startPrank(alice);
        copw.approve(address(distributor), amount);
        distributor.depositYield(amount);
        vm.stopPrank();
        assertEq(distributor.epochId(), 1);
    }
}
