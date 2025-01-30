import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { Button, IconButton, Input, Box, Text, VStack, HStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@chakra-ui/react";
import { AppContext } from "../AppContext";
import { FaPowerOff } from "react-icons/fa";
import { formatAddress } from "../utils/formatMetamask";
import CopyToClipboardButton from "../utils/CopyToClipboardButton";

const CONTRACT_ADDRESS = "0x365645275B9De7EFd2dB02d6E7d3318aDE244617";

const ABI = [
  "function getNodeStatus() view returns (bool)",
  "function setNodeStatus(bool _enable) external",
  "function controller1() view returns (address)",
  "function controller2() view returns (address)",
  "function getControllerName(address) view returns (string)"

];

const BlindControllerInterface = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const { rpcUrl } = useContext(AppContext);
  const [contract, setContract] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [controller1, setController1] = useState("Loading...");
  const [controller2, setController2] = useState("Loading...");
  const [controller1Name, setController1Name] = useState("Loading...");
  const [controller2Name, setController2Name] = useState("Loading...");
  useEffect(() => {
    const init = async () => {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      setProvider(provider);
      setContract(contract);
      
      const status = await contract.getNodeStatus();
      setIsEnabled(status);

      const c1 = await contract.controller1();
      const c2 = await contract.controller2();
      const c1Name = await contract.getControllerName(c1);
      const c2Name = await contract.getControllerName(c2);
      setController1(c1);
      setController2(c2);
      setController1Name(c1Name);
      setController2Name(c2Name);
    };
    init();
  }, [rpcUrl]);

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
          <Text>Both controllers must approve </Text>
          <ModalBody>
          <VStack spacing={4}>
              <Text><strong>Controller 1:</strong> {formatAddress(controller1)} <CopyToClipboardButton value={controller1}/> ({controller1Name})</Text>
              <Text><strong>Controller 2:</strong> {formatAddress(controller2)} <CopyToClipboardButton value={controller2}/> ({controller2Name})</Text>
              <Text><strong>Node Status:</strong> {isEnabled ? "Enabled" : "Disabled"}</Text>
              <Button onClick={toggleNodeStatus} colorScheme={isEnabled ? "red" : "green"}>
                {isEnabled ? "Disable Node" : "Enable Node"}
              </Button>
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
