// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BasicWallet
 * @notice A simple wallet that can receive and send ETH, owned by a single owner
 */
contract BasicWallet {
    address public owner;

    // Events
    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);

    // Only owner modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    // Constructor sets the deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    // Function to receive ETH
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    // Fallback function
    fallback() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    // Check contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Withdraw ETH (only owner)
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner).transfer(amount);
        emit Withdrawal(owner, amount);
    }

    // Change wallet owner
    function changeOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
