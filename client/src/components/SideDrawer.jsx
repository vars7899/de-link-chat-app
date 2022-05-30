import React, { useState, useEffect } from "react";
import ProfileModel from "./ProfileModel";
import UserListItem from "./UserListItem";
import Loader from "./Loader";
import {
  Box,
  Tooltip,
  Button,
  Text,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
} from "@chakra-ui/react";
import { IoSearch, IoNotificationsSharp, IoCaretDown } from "react-icons/io5";
import { ChatState } from "../context/ChatProvider.js";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/hooks";
import { toast } from "react-toastify";
import axios from "axios";
import NotificationBadge, { Effect } from "react-notification-badge";

const SideDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const logoutHandler = () => {
    localStorage.removeItem("deLinkUser");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      return toast.info("Please enter a query");
    }
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/users?search=${search}`, config);
      setSearchResult(data.users);
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    setLoading(true);
    setLoadingChat(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chats`, { userId }, config);
      if (!chats.find((item) => item._id === data._id))
        setChats([data, ...chats]);

      setSelectedChat(data);
      setLoading(false);
      setLoadingChat(false);
      onClose();
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };

  const removeNotification = async (id) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(`/api/notification/${id}`, config);
    } catch (err) {
      toast.error(err);
    }
  };
  const getPrevNotification = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/notification", config);
      setNotification(data.map((item) => item.notificationId));
    } catch (err) {
      toast.error(err);
    }
  };
  useEffect(() => {
    getPrevNotification();
  }, []);
  return (
    <>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        p="10px 15px"
        backdropFilter="blur(5px)"
      >
        <Tooltip label="Search to Connect" hasArrow placement="bottom-end">
          <Button variant="ghost" colorScheme={"whiteAlpha"} onClick={onOpen}>
            <IoSearch />
            <Text d={{ base: "none", md: "flex" }} px="10">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text
          fontSize="3xl"
          fontWeight="bold"
          letterSpacing="3px"
          className="brand"
          color="rgba(255, 255, 255, 0.685)"
        >
          De-Link
        </Text>
        <div style={{ display: "flex" }}>
          <Menu>
            <MenuButton p={2} fontSize="2xl" textAlign="center">
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <IoNotificationsSharp color="rgba(255, 255, 255, 0.685)" />
            </MenuButton>
            <MenuList p="2" cursor="pointer">
              {!notification.length && "No Notification"}
              {notification.map((notify) => (
                <MenuItem
                  key={notify._id}
                  cursor="pointer"
                  onClick={() => {
                    removeNotification(notify.chatId._id);
                    console.log(notify);
                    setSelectedChat(notify.chatId);
                    setNotification(notification.filter((n) => n !== notify));
                  }}
                >
                  {notify.chatId.isGroupChat
                    ? `New Message in ${notify.chatId.chatName}`
                    : `New Message from ${notify.sender.name}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              colorScheme="whiteAlpha"
              rightIcon={<IoCaretDown />}
              variant="ghost"
              px="20px"
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.user.name}
                src={user.user.image}
              />
            </MenuButton>
            <MenuList>
              <ProfileModel user={user.user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModel>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer
        size="sm"
        placement="left"
        isOpen={isOpen}
        onClose={onClose}
        backdropFilter="blur(10px)"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch} fontSize="1.5rem">
                <IoSearch />
              </Button>
            </Box>
            {loading ? (
              <Loader />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Loader />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
