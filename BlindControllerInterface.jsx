import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { 
  Button, IconButton, Input, Box, Text, VStack, HStack, Modal, ModalOverlay, 
  ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure 
} from "@chakra-ui/react";
import { AppContext } from "../AppContext";
import { FaPowerOff } from "react-icons/fa";
import { formatAddress } from "../utils/formatMetamask";
import CopyToClipboardButton from "../utils/CopyToClipboardButton";

const CONTRACT_ADDRESS = "0xC17dFB855d824E363254134D1778Df6724762a88";

const ABI = [
  "function getNodeStatus() view returns (bool)",
  "function proposeNodeStatusChange(bool _enable) external",
  "function approveNodeStatusChange() external",
  "function revokeApproval() external",
  "function controller1() view returns (address)",
  "function controller2() view returns (address)",
  "function getControllerName(address) view returns (string)",
  "function pendingStatusChange() view returns (bool)",
  "function approvals(address) view returns (bool)"
];

const BlindControllerInterface = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const { rpcUrl } = useContext(AppContext);
  const [contract, setContract] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);
  const [controller1, setController1] = useState("Loading...");
  const [controller2, setController2] = useState("Loading...");
  const [controller1Name, setController1Name] = useState("Loading...");
  const [controller2Name, setController2Name] = useState("Loading...");
  const [account, setAccount] = useState(null);
  const [userApproval, setUserApproval] = useState(false);

  useEffect(() => {
    const init = async () => {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setProvider(provider);
      setSigner(signer);
      setContract(contract);

      const status = await contract.getNodeStatus();
      setIsEnabled(status);

      const pending = await contract.pendingStatusChange();
      setPendingChange(pending);

      const c1 = await contract.controller1();
      const c2 = await contract.controller2();
      setController1(c1);
      setController2(c2);

      const c1Name = await contract.getControllerName(c1);
      const c2Name = await contract.getControllerName(c2);
      setController1Name(c1Name);
      setController2Name(c2Name);
    };
    init();
  }, [rpcUrl]);

  useEffect(() => {
    if (contract && account) {
      const checkApproval = async () => {
        const approval = await contract.approvals(account);
        setUserApproval(approval);
      };
      checkApproval();
    }
  }, [contract, account]);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  const proposeChange = async () => {
    if (!contract) return;
    try {
      const tx = await contract.proposeNodeStatusChange(!isEnabled);
      await tx.wait();
      setPendingChange(!isEnabled);
    } catch (error) {
      console.error("Error proposing node status change", error);
    }
  };

  const approveChange = async () => {
    if (!contract) return;
    try {
      const tx = await contract.approveNodeStatusChange();
      await tx.wait();
      setUserApproval(true);
    } catch (error) {
      console.error("Error approving node status change", error);
    }
  };

  const revokeApproval = async () => {
    if (!contract) return;
    try {
      const tx = await contract.revokeApproval();
      await tx.wait();
      setUserApproval(false);
    } catch (error) {
      console.error("Error revoking approval", error);
    }
  };

  return (
    <>
      <VStack spacing={2} onClick={onOpen} cursor="pointer">
        <IconButton icon={<FaPowerOff />} colorScheme="blue" aria-label="Open BlindController" />
        <Box w={3} h={3} borderRadius="full" bg={isEnabled ? "green.400" : "red.400"} />
        <Text>{isEnabled ? "Online" : "Offline"}</Text>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Blindfold Controller</ModalHeader>
          <Text>Enable or disable trading operations</Text>
          <Text>Both controllers must approve</Text>
          <ModalBody>
            <VStack spacing={4}>
              <Text><strong>Controller 1:</strong> {formatAddress(controller1)} <CopyToClipboardButton value={controller1}/> ({controller1Name})</Text>
              <Text><strong>Controller 2:</strong> {formatAddress(controller2)} <CopyToClipboardButton value={controller2}/> ({controller2Name})</Text>
              <Text><strong>Node Status:</strong> {isEnabled ? "Enabled" : "Disabled"}</Text>

              {pendingChange !== null && (
                <Text color="yellow.500">
                  <strong>Pending Status Change:</strong> {pendingChange ? "Enable" : "Disable"}
                </Text>
              )}

              {account && (account === controller1 || account === controller2) && (
                <>
                  <Button onClick={proposeChange} colorScheme="blue">
                    Propose {isEnabled ? "Disable" : "Enable"}
                  </Button>

                  <HStack>
                    <Button 
                      onClick={approveChange} 
                      colorScheme={userApproval ? "gray" : "green"} 
                      isDisabled={userApproval}
                    >
                      {userApproval ? "Approved" : "Approve"}
                    </Button>
                    <Button onClick={revokeApproval} colorScheme="red">
                      Revoke Approval
                    </Button>
                  </HStack>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="gray">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BlindControllerInterface;
