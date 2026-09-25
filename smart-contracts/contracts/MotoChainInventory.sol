// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract MotoChainInventory {
 event MotoAdded(uint id,string brand);
 mapping(uint=>string) public motos;
 function addMoto(uint id,string memory brand) external {
  motos[id]=brand;
  emit MotoAdded(id,brand);
 }
}
