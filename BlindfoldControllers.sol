
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BlindController {
    address public controller1;
    address public controller2;
    bool public isEnabled;

    event NodeStatusChanged(bool enabled, address changedBy);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwners() {
        require(msg.sender == controller1 || msg.sender == controller2, "Not authorized");
        _;
    }

    constructor(address _controller1, address _controller2) {
        require(_controller1 != address(0) && _controller2 != address(0), "Invalid owner address");
        require(_controller1 != _controller2, "Owners must be different");
        controller1 = _controller1;
        controller2 = _controller2;
        isEnabled = false;
    }

    function setNodeStatus(bool _enable) external onlyOwners {
        require(isEnabled != _enable, "Already in desired state");
        isEnabled = _enable;
        emit NodeStatusChanged(_enable, msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwners {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != controller1 && newOwner != controller2, "New owner must be different");
        
        if (msg.sender == controller1) {
            emit OwnershipTransferred(controller1, newOwner);
            controller1 = newOwner;
        } else {
            emit OwnershipTransferred(controller2, newOwner);
            controller2 = newOwner;
        }
    }

    function getNodeStatus() external view returns (bool) {
        return isEnabled;
    }
}
