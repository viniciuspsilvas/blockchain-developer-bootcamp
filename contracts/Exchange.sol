// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount; // Account that receives exchange fees
    uint256 public feePercent; // Fee percentage charged on trades

    // Token balances for users (tokenAddress => (userAddress => balance))
    mapping(address => mapping(address => uint256)) public tokens;

    // Orders mapping (orderId => Order struct)
    mapping(uint256 => _Order) public orders;

    // Track canceled and filled orders
    mapping(uint256 => bool) public ordersCancelled;
    mapping(uint256 => bool) public ordersFilled;

    uint256 public orderCount; // Counter for order IDs

    // Events for logging deposits, withdrawals, and trades
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address creator,
        uint256 timestamp
    );

    struct _Order {
        // Attributes of an order
        uint256 id; // Unique identifier for order
        address user; // User who made order
        address tokenGet; // Address of the token they receive
        uint256 amountGet; // Amount they receive
        address tokenGive; // Address of token they give
        uint256 amountGive; // Amount they give
        uint256 timestamp; // When order was created
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint256 _amount) public {
        // Transfer tokens to exchange
        require(_amount > 0, "Deposit amount must be greater than zero");
        require(
            Token(_token).transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        // Update user balance
        tokens[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        // Ensure user has enough tokens to withdraw
        require(
            _amount > 0 && tokens[_token][msg.sender] >= _amount,
            "Insufficient balance"
        );

        // Transfer tokens from exchange to user
        require(
            Token(_token).transfer(msg.sender, _amount),
            "Token transfer failed"
        );

        // Update user balance
        tokens[_token][msg.sender] -= _amount;

        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        // Prevent orders if tokens aren't on exchange
        require(
            balanceOf(_tokenGive, msg.sender) >= _amountGive,
            "Insufficient token balance"
        );

        //  Initialize an order
        orderCount++;
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    function cancelOrder(uint256 _id) public {
        // fetch order
        _Order storage _order = orders[_id];

        // Ensure the caller of the function is the owner of the order
        require(
            _order.user == msg.sender,
            "Unauthorized: Only order creator can cancel"
        );

        // Order must exist
        require(_order.id == _id, "Invalid order ID");

        // cancel order
        ordersCancelled[_id] = true;
        emit Cancel(
            _order.id,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            block.timestamp
        );
    }

    function fillOrder(uint256 _id) public {
        // 1. Must be a valid orderId
        require(_id > 0 && _id <= orderCount, "Order does not exist");

        // 2. Order can't be filled
        require(
            !ordersFilled[_id] && !ordersCancelled[_id],
            "Order already filled or cancelled"
        );

        // Fetch order
        _Order storage _order = orders[_id];

        // Execute the trade
        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );

        // Mark order as filled
        ordersFilled[_id] = true;
    }

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        // the fee is paid by the user who fills the order. user2 is how pays the fee
        // Fee is deducted from _amountGet
        uint256 _feeAmount = (_amountGet * feePercent) / 100;

        // Execute the trade
        // msg.sender is the user2, that one who is filling / completing the order
        // while _user is who created the order
        tokens[_tokenGet][msg.sender] -= (_amountGet + _feeAmount);
        tokens[_tokenGet][_user] += _amountGet;
        // Charge fees
        tokens[_tokenGet][feeAccount] += _feeAmount;

        tokens[_tokenGive][_user] -= _amountGive;
        tokens[_tokenGive][msg.sender] += _amountGive;
        emit Trade(
            _orderId, // orderCount was like that, but chatGPT change to  _orderId
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user,
            block.timestamp
        );
    }
}
