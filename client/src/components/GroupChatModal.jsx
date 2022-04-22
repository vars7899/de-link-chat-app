import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Divider,
  FormControl,
  Input,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDisclosure } from "@chakra-ui/hooks";
import { ChatState } from "../context/ChatProvider";
import { IoIosArrowForward } from "react-icons/io";
import UserListItem from "./UserListItem";
import Loader from "./Loader";
import UserBadgeItem from "./UserBadgeItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUser, setSelectedUser] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { user, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      // ? if query string is empty
      toast.info("please search to add users");
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
  const handleSelectUser = (user) => {
    console.log(user);
    if (selectedUser.includes(user)) {
      toast.info("User already added to the Group");
      return;
    }
    setSelectedUser([...selectedUser, user]);
  };
  const handleRemoveUser = (user) => {
    setSelectedUser(selectedUser.filter((sel) => sel._id !== user._id));
  };
  const handleSubmit = async () => {
    if (user.user.email === "guest@deLink.com") {
      toast.info("Guest cannot create groups");
      return;
    }
    if (
      selectedUser.map((u) => {
        if (u.email === "guest@deLink.com") {
          toast.info("Guest user can not be added in group");
        }
        return {};
      })
    )
      if (!groupChatName || !selectedUser) {
        toast.info("Please fill in all the required fields");
        return;
      }
    if (selectedUser.length <= 2) {
      toast.info("Group must have at least 3 members");
      return;
    }
    // create chat
    setSubmitLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const usersString = JSON.stringify(selectedUser.map((u) => u._id));
      const { data } = await axios.post(
        "/api/chats/group",
        { name: groupChatName, users: usersString },
        config
      );
      setChats([data, ...chats]);
      onClose();
      setSubmitLoading(false);
      toast.success(`${groupChatName} successfully created`);
      setSelectedUser([]);
    } catch (err) {
      toast.error(err);
      setSubmitLoading(false);
      return;
    }
  };
  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="1.25rem"
            d="flex"
            justifyContent="center"
            textTransform="capitalize"
          >
            Create Group
          </ModalHeader>
          <Divider />
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl pb="5" pt="5">
              <Input
                placeholder="Enter Group Name"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add members to group"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" d="flex" flexWrap="wrap" mb="3">
              {selectedUser.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemoveUser(user)}
                />
              ))}
            </Box>
            <Divider />
            <Box
              minHeight="150px"
              maxHeight="150px"
              w="100%"
              mt="3"
              overflowY="scroll"
            >
              {loading ? (
                <Loader />
              ) : (
                searchResult
                  ?.slice(0, 4)
                  .map((user) => (
                    <UserListItem
                      width="100%"
                      key={user._id}
                      user={user}
                      handleFunction={() => handleSelectUser(user)}
                    />
                  ))
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              bg="#1d1931"
              color="#fff"
              colorScheme="blackAlpha"
              mr={3}
              onClick={handleSubmit}
              rightIcon={<IoIosArrowForward />}
              isLoading={submitLoading}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
