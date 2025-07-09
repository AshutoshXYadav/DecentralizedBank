// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DecentralizedBank {
    // Mapping to store user balances
    mapping(address => uint256) public balances;

    // Event logs
    event Deposited(address indexed user, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount, uint256 newBalance);
    event Transferred(address indexed from, address indexed to, uint256 amount);

    // Transaction history: deposit, withdraw, transfer
    enum TxType { Deposit, Withdraw, TransferOut, TransferIn }

    struct Transaction {
        TxType txType;
        address counterparty;  // who you sent to / received from
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Transaction[]) public history;

    // Deposit ETH into the bank
    function deposit() external payable {
        require(msg.value > 0, "Must deposit more than 0");

        balances[msg.sender] += msg.value;

        history[msg.sender].push(Transaction(TxType.Deposit, address(0), msg.value, block.timestamp));

        emit Deposited(msg.sender, msg.value, balances[msg.sender]);
    }

    // Withdraw ETH from the bank
    function withdraw(uint256 amount) external {
        require(amount > 0, "Must withdraw more than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;

        history[msg.sender].push(Transaction(TxType.Withdraw, address(0), amount, block.timestamp));

        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount, balances[msg.sender]);
    }

    // Transfer ETH from your bank balance to another wallet
    function transfer(address to, uint256 amount) external {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;

        // recipient can be outside, so we just transfer ETH directly
        payable(to).transfer(amount);

        // Record sender's transfer out
        history[msg.sender].push(Transaction(TxType.TransferOut, to, amount, block.timestamp));

        // Record recipient's transfer in (only if recipient is also a user)
        history[to].push(Transaction(TxType.TransferIn, msg.sender, amount, block.timestamp));

        emit Transferred(msg.sender, to, amount);
    }

    // Get your balance
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    // Get transaction history
    function getHistory(address user) external view returns (Transaction[] memory) {
        return history[user];
    }
}
