import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x365645275B9De7EFd2dB02d6E7d3318aDE244617";

const ABI = [
  "function getNodeStatus() view returns (bool)",
  "function setNodeStatus(bool _enable) external",
  "function controller1() view returns (address)",
  "function controller2() view returns (address)",
  "function getControllerName(address) view returns (string)",
  "function updateControllerName(string) external",
  "function transferOwnership(address, string) external",
];

const BlindControllerInterface = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [controller1, setController1] = useState("Loading...");
  const [controller2, setController2] = useState("Loading...");
  const [controller1Name, setController1Name] = useState("Loading...");
  const [controller2Name, setController2Name] = useState("Loading...");
  const [account, setAccount] = useState(null);
  const [newControllerAddress, setNewControllerAddress] = useState("");
  const [newControllerName, setNewControllerName] = useState("");
  const [updatedName, setUpdatedName] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        setProvider(provider);
        setSigner(signer);
        setContract(contract);

        const status = await contract.getNodeStatus();
        setIsEnabled(status);

        const c1 = await contract.controller1();
        const c2 = await contract.controller2();
        setController1(c1);
        setController2(c2);

        const c1Name = await contract.getControllerName(c1);
        const c2Name = await contract.getControllerName(c2);
        setController1Name(c1Name);
        setController2Name(c2Name);
      } else {
        alert("Please install MetaMask to interact with this contract.");
      }
    };
    init();
  }, []);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  const toggleNodeStatus = async () => {
    if (!contract) return;
    try {
      const tx = await contract.setNodeStatus(!isEnabled);
      await tx.wait();
      setIsEnabled(!isEnabled);
    } catch (error) {
      console.error("Error toggling node status", error);
    }
  };

  const updateName = async () => {
    if (!contract || !updatedName) return;
    try {
      const tx = await contract.updateControllerName(updatedName);
      await tx.wait();
      if (account === controller1) {
        setController1Name(updatedName);
      } else if (account === controller2) {
        setController2Name(updatedName);
      }
      setUpdatedName("");
    } catch (error) {
      console.error("Error updating controller name", error);
    }
  };

  const transferOwnership = async () => {
    if (!contract || !newControllerAddress || !newControllerName) return;
    try {
      const tx = await contract.transferOwnership(newControllerAddress, newControllerName);
      await tx.wait();
      if (account === controller1) {
        setController1(newControllerAddress);
        setController1Name(newControllerName);
      } else if (account === controller2) {
        setController2(newControllerAddress);
        setController2Name(newControllerName);
      }
      setNewControllerAddress("");
      setNewControllerName("");
    } catch (error) {
      console.error("Error transferring ownership", error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto border rounded-xl shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-4">BlindController Interface</h1>

      <button 
        onClick={connectWallet} 
        className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4"
      >
        {account ? `Connected: ${account.substring(0, 6)}...` : "Connect Wallet"}
      </button>

      <p className="mb-2"><strong>Controller 1:</strong> {controller1}</p>
      <p className="mb-2"><strong>Name:</strong> {controller1Name}</p>

      <p className="mb-2"><strong>Controller 2:</strong> {controller2}</p>
      <p className="mb-2"><strong>Name:</strong> {controller2Name}</p>

      <p className="mb-4"><strong>Node Status:</strong> {isEnabled ? "Enabled" : "Disabled"}</p>

      <button 
        onClick={toggleNodeStatus} 
        className={`px-4 py-2 ${isEnabled ? "bg-red-500" : "bg-green-500"} text-white rounded-lg mb-4`}
      >
        {isEnabled ? "Disable Node" : "Enable Node"}
      </button>

      {account && (account === controller1 || account === controller2) && (
        <>
          <div className="mt-4">
            <h2 className="text-lg font-bold mb-2">Update Controller Name</h2>
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className="px-3 py-1 border rounded-md"
              placeholder="New Name"
            />
            <button 
              onClick={updateName} 
              className="ml-2 px-4 py-1 bg-yellow-500 text-white rounded-lg"
            >
              Update Name
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-bold mb-2">Transfer Ownership</h2>
            <input
              type="text"
              value={newControllerAddress}
              onChange={(e) => setNewControllerAddress(e.target.value)}
              className="px-3 py-1 border rounded-md"
              placeholder="New Controller Address"
            />
            <input
              type="text"
              value={newControllerName}
              onChange={(e) => setNewControllerName(e.target.value)}
              className="px-3 py-1 border rounded-md ml-2"
              placeholder="New Controller Name"
            />
            <button 
              onClick={transferOwnership} 
              className="ml-2 px-4 py-1 bg-purple-500 text-white rounded-lg"
            >
              Transfer
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BlindControllerInterface;
