// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BlindfoldController {
    address public controller1;
    address public controller2;
    bool public isEnabled;

    mapping(address => string) public controllerNames;
    mapping(address => bool) public approvals;
    bool public pendingStatusChange; // Tracks proposed status change

    event NodeStatusChangeRequested(bool newStatus, address requestedBy);
    event NodeStatusChanged(bool enabled);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ControllerNameUpdated(address indexed controller, string newName);

    modifier onlyOwners() {
        require(msg.sender == controller1 || msg.sender == controller2, "Not authorized");
        _;
    }

    constructor(address _controller1, string memory _name1, address _controller2, string memory _name2) {
        require(_controller1 != address(0) && _controller2 != address(0), "Invalid owner address");
        require(_controller1 != _controller2, "Owners must be different");

        controller1 = _controller1;
        controller2 = _controller2;
        controllerNames[_controller1] = _name1;
        controllerNames[_controller2] = _name2;

        isEnabled = false;
        pendingStatusChange = false;
    }

    function proposeNodeStatusChange(bool _enable) external onlyOwners {
        require(isEnabled != _enable, "Already in desired state");

        pendingStatusChange = _enable;
        approvals[msg.sender] = true;

        emit NodeStatusChangeRequested(_enable, msg.sender);
    }

    function approveNodeStatusChange() external onlyOwners {
        require(approvals[controller1] || approvals[controller2], "No pending approval found");
        approvals[msg.sender] = true;

        if (approvals[controller1] && approvals[controller2]) {
            isEnabled = pendingStatusChange;
            approvals[controller1] = false;
            approvals[controller2] = false;
            emit NodeStatusChanged(isEnabled);
        }
    }

    function revokeApproval() external onlyOwners {
        approvals[msg.sender] = false;
    }

    function transferOwnership(address newOwner, string memory newName) external onlyOwners {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != controller1 && newOwner != controller2, "New owner must be different");

        if (msg.sender == controller1) {
            emit OwnershipTransferred(controller1, newOwner);
            controller1 = newOwner;
        } else {
            emit OwnershipTransferred(controller2, newOwner);
            controller2 = newOwner;
        }

        controllerNames[newOwner] = newName;
    }

    function updateControllerName(string memory newName) external onlyOwners {
        controllerNames[msg.sender] = newName;
        emit ControllerNameUpdated(msg.sender, newName);
    }

    function getNodeStatus() external view returns (bool) {
        return isEnabled;
    }

    function getControllerName(address controller) external view returns (string memory) {
        return controllerNames[controller];
    }
}
