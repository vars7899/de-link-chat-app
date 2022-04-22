import React from "react";
import { ChatState } from "../context/ChatProvider";
import { Box, Text, Heading, Divider } from "@chakra-ui/react";
import { IoIosArrowBack } from "react-icons/io";
import { getSender } from "../config/ChatLogics";
import ProfileModel from "./ProfileModel";
import UpdateGroupChatModal from "./UpdateGroupChatModal";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat } = ChatState();
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "1.5rem", md: "1.75rem" }}
            py="3"
            px="4"
            w="100%"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            bg="#fff"
            borderRadius="lg"
          >
            <Box
              d={{ base: "flex", md: "none" }}
              onClick={() => setSelectedChat("")}
            >
              <IoIosArrowBack />
            </Box>
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user.user, selectedChat.users).name}
                <ProfileModel user={getSender(user.user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            p="3"
            w="100%"
            h="100%"
            overflowY="hidden"
          >
            {/* Message here */}
          </Box>
        </>
      ) : (
        <Box
          d="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
          flexDir="column"
          color="rgba(255, 255, 255, 0.685)"
        >
          <Heading size="4xl" mb="4">
            De-Link
          </Heading>
          <Divider />
          <Text fontSize="3xl" px="3">
            Select on a user to start chat
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
