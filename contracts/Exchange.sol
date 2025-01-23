// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    mapping(address => mapping(address => uint256)) public tokens;

    // Withdraw tokens
    // Make Orders
    // Cancel Orders
    // Fill Orders
    // Charge Fees
    // Track fee Account

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Deposit Tokens
    function depositToken(address _token, uint256 _amount) public {
        // Transfer tokens to exchange
        Token(_token).transferFrom(msg.sender, address(this), _amount);

        // Update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // Emit an event
    }

    // CHeck Balances
}
