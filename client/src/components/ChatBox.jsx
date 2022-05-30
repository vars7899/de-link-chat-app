import React from "react";
import { ChatState } from "../context/ChatProvider";
import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat";
const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();
  return (
    <Box
      d={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      maxH={{ base: "100vh", md: "90vh" }}
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      border="1px rgba(255, 255, 255, 0.085) solid"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
