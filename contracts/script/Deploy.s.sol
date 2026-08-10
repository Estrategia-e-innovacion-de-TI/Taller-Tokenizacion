// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {COPW} from "../src/COPW.sol";
import {RENT} from "../src/RENT.sol";
import {PropertySale} from "../src/PropertySale.sol";
import {YieldDistributor} from "../src/YieldDistributor.sol";

/// @notice Despliega el set del taller y escribe addresses en deployments/
contract Deploy is Script {
    function run() external {
        address treasury = vm.envOr("TREASURY", msg.sender);

        vm.startBroadcast();

        COPW copw = new COPW();
        RENT rent = new RENT("RENT - Inmueble Demo", "Colombia");
        YieldDistributor distributor = new YieldDistributor(rent, copw);
        PropertySale sale = new PropertySale(rent, copw, distributor, treasury);

        rent.setMinter(address(sale));
        distributor.setSale(address(sale));

        vm.stopBroadcast();

        address copwAddr = address(copw);
        address rentAddr = address(rent);
        address distAddr = address(distributor);
        address saleAddr = address(sale);

        console2.log("COPW", copwAddr);
        console2.log("RENT", rentAddr);
        console2.log("YieldDistributor", distAddr);
        console2.log("PropertySale", saleAddr);
        console2.log("Treasury", treasury);

        _writeDeployments(copwAddr, rentAddr, distAddr, saleAddr, treasury);
    }

    function _writeDeployments(
        address copw,
        address rent,
        address distributor,
        address sale,
        address treasury
    ) internal {
        string memory network = _networkName(block.chainid);
        string memory json = string.concat(
            "{\n",
            '  "network": "',
            network,
            '",\n',
            '  "chainId": ',
            vm.toString(block.chainid),
            ",\n",
            '  "COPW": "',
            vm.toString(copw),
            '",\n',
            '  "RENT": "',
            vm.toString(rent),
            '",\n',
            '  "YieldDistributor": "',
            vm.toString(distributor),
            '",\n',
            '  "PropertySale": "',
            vm.toString(sale),
            '",\n',
            '  "Treasury": "',
            vm.toString(treasury),
            '"\n',
            "}\n"
        );
        vm.writeFile("deployments/latest.json", json);
        vm.writeFile(
            string.concat("deployments/", network, ".json"),
            json
        );

        string memory md = string.concat(
            "| Contrato | Address |\n",
            "|----------|----------|\n",
            "| COPW | `",
            vm.toString(copw),
            "` |\n",
            "| RENT | `",
            vm.toString(rent),
            "` |\n",
            "| YieldDistributor | `",
            vm.toString(distributor),
            "` |\n",
            "| PropertySale | `",
            vm.toString(sale),
            "` |\n",
            "| Treasury | `",
            vm.toString(treasury),
            "` |\n"
        );
        vm.writeFile("deployments/ADDRESSES.md", md);

        console2.log("Wrote deployments/*.json and deployments/ADDRESSES.md");
    }

    function _networkName(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 84532) return "base-sepolia";
        if (chainId == 11155111) return "ethereum-sepolia";
        if (chainId == 8453) return "base";
        return "unknown";
    }
}