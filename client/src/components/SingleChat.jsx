import React, { useState, useEffect } from "react";
import { ChatState } from "../context/ChatProvider";
import {
  Box,
  Text,
  Heading,
  Divider,
  FormControl,
  Input,
} from "@chakra-ui/react";
import { IoIosArrowBack } from "react-icons/io";
import { getSender } from "../config/ChatLogics";
import ProfileModel from "./ProfileModel";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import Loader from "./Loader";
import { toast } from "react-toastify";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAllMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      console.log(data);
      setMessages(data);
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
      return;
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            chatId: selectedChat._id,
            content: newMessage,
          },
          config
        );
        setMessages([...messages, data]);
      } catch (err) {
        toast.error(err);
        return;
      }
    }
  };
  const typingHandler = (e) => {
    setNewMessage(e.target.value);
  };
  useEffect(() => {
    fetchAllMessages(); // eslint-disable-next-line
  }, [selectedChat]);
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
                  fetchAllMessages={fetchAllMessages}
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
            {loading ? (
              <Loader />
            ) : (
              <div className="message">
                {<ScrollableChat messages={messages} />}
              </div>
            )}
          </Box>
          <FormControl onKeyDown={sendMessage} isRequired mt="3">
            <Input
              variant="filled"
              bg="#fff"
              h="4rem"
              color="#fff"
              placeholder="Enter a message..."
              onChange={typingHandler}
              value={newMessage}
            />
          </FormControl>
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
