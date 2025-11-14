
# 💰 BasicWallet Smart Contract

A simple Ethereum-compatible wallet contract deployed and verified on **Base Mainnet**.  
It allows the contract owner to securely store, withdraw, and track ETH transactions on-chain.

---

## 🔗 Deployed Contract

- **Address:** [`0x54C4d4e6F51345a50d29352dFA5EC1b742041c85`](https://basescan.org/address/0x54C4d4e6F51345a50d29352dFA5EC1b742041c85)
- **Network:** Base Mainnet
- **Status:** ✅ Verified on BaseScan
- **License:** MIT

---

## 📜 Features

- **Deposit ETH** with a custom description
- **Withdraw ETH** (only contract owner)

---

## 🛠️ Functions Overview

| Function | Description |
|----------|-------------|
| `deposit(string)` | Deposit ETH into the wallet with an optional description |
| `withdraw(address payable, uint256, string)` | Withdraw ETH to a specified address (only owner) |

---

## 🧪 Example Interaction

```solidity
// Deposit ETH into the wallet
basicWallet.deposit{value: 1 ether}("Initial funding");

// Withdraw ETH (only owner can call)
basicWallet.withdraw(payable(0xRecipientAddress), 0.5 ether, "Payment to vendor");

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

```