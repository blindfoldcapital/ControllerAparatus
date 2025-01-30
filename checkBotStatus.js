const { ethers } = require("ethers");

// Replace with your RPC provider
const RPC_URL = "https://your_rpc_url_here";
const CONTRACT_ADDRESS = "0xC17dFB855d824E363254134D1778Df6724762a88";

const ABI = [
  "function getNodeStatus() view returns (bool)",
  "function pendingStatusChange() view returns (bool)",
  "function controller1() view returns (address)",
  "function controller2() view returns (address)",
  "function approvals(address) view returns (bool)"
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

/**
 * Fetches bot status based on contract state.
 * @returns {Promise<{isEnabled: boolean, pendingChange: boolean, controllerApprovals: object}>}
 */
const checkBotStatus = async () => {
  try {
    const isEnabled = await contract.getNodeStatus();
    const pendingChange = await contract.pendingStatusChange();
    const controller1 = await contract.controller1();
    const controller2 = await contract.controller2();

    // Fetch controller approvals
    const approvals = {
      [controller1]: await contract.approvals(controller1),
      [controller2]: await contract.approvals(controller2),
    };

    console.log("Bot Status:", isEnabled ? "Enabled" : "Disabled");
    console.log("Pending Change:", pendingChange ? "Enable" : "Disable");
    console.log("Controller Approvals:", approvals);

    return { isEnabled, pendingChange, controllerApprovals: approvals };
  } catch (error) {
    console.error("Error fetching bot status:", error);
    return { isEnabled: false, pendingChange: null, controllerApprovals: {} };
  }
};

// Run the function at intervals (e.g., every 5 seconds)
setInterval(async () => {
  const status = await checkBotStatus();
  console.log("Checked bot status:", status);
}, 5000);

module.exports = { checkBotStatus };
