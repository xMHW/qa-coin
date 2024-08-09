// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QaCoin is ERC20 {
    uint256 public constant MINT_AMOUNT = 10000 * 10**18;  // Adjust decimal places accordingly

    // Mapping to keep track of who has already minted their tokens
    mapping(address => bool) public hasMinted;

    constructor() ERC20("QaCoin", "QAC") {
        // Initial mint to the contract deployer or reserve
        _mint(msg.sender, 1000000 * 10**18); // Example initial supply
    }

    // Function to mint tokens to student wallets
    function mintTokens() public {
        require(!hasMinted[msg.sender], "You have already minted your tokens.");
        _mint(msg.sender, MINT_AMOUNT);
        hasMinted[msg.sender] = true;
    }
}