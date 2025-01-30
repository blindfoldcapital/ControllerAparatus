import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xYourContractAddress"; // Replace with deployed contract address
const ABI = [
  "function getNodeStatus() view returns (bool)",
  "function setNodeStatus(bool _enable) external",
  "function controller1() view returns (address)",
  "function controller2() view returns (address)",
];

const BlindControllerInterface = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [controller1, setController1] = useState("Loading...");
  const [controller2, setController2] = useState("Loading...");
  const [account, setAccount] = useState(null);

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
      <p className="mb-2"><strong>Controller 2:</strong> {controller2}</p>
      <p className="mb-4"><strong>Node Status:</strong> {isEnabled ? "Enabled" : "Disabled"}</p>
      <button 
        onClick={toggleNodeStatus} 
        className={`px-4 py-2 ${isEnabled ? "bg-red-500" : "bg-green-500"} text-white rounded-lg`}
      >
        {isEnabled ? "Disable Node" : "Enable Node"}
      </button>
    </div>
  );
};

export default BlindControllerInterface;
