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
// for socket.io
import io from "socket.io-client";
const ENDPOINT = "https://react-chat-vars.herokuapp.com";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState();
  const [isTyping, setIsTyping] = useState();

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
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (err) {
      toast.error(err);
      setLoading(false);
      return;
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
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
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (err) {
        toast.error(err);
        return;
      }
    }
  };

  const saveNotification = async () => {
    if (!notification.length) return;
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(
        "/api/notification",
        {
          notification: notification[0].chatId.latestMessage,
        },
        config
      );
    } catch (err) {
      toast.error(err);
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user.user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchAllMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  console.log(notification);
  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chatId._id
      ) {
        if (!notification.includes()) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });
  useEffect(() => {
    saveNotification();
  }, [notification]);
  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            py="3.0"
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
              mr="5"
              onClick={() => setSelectedChat("")}
            >
              <IoIosArrowBack />
            </Box>
            {!selectedChat.isGroupChat ? (
              <Text
                width="100%"
                d="flex"
                py="3"
                alignItems="center"
                justifyContent={{ base: "space-between" }}
                fontSize={{ base: "1.5rem", md: "1.75rem" }}
              >
                <Box display="flex" flexDir="column" alignItems="flex-start">
                  {getSender(user.user, selectedChat.users).name}

                  <Box minH="10px">
                    {isTyping && <Text fontSize="8px">Typing...</Text>}
                  </Box>
                </Box>

                <ProfileModel user={getSender(user.user, selectedChat.users)} />
              </Text>
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
          </Box>
          <Box
            d="flex"
            flexDir="column"
            p="3"
            w="100%"
            h={{ base: "73vh", md: "100%" }}
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
          <FormControl
            onKeyDown={sendMessage}
            isRequired
            mt={{ base: "1", md: "3" }}
            border="1px solid #fff"
            borderRadius="8px"
          >
            <Input
              variant="outline"
              bg="#1d1931"
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
