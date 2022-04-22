import React, { useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { useDisclosure } from "@chakra-ui/hooks";
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
  Box,
  FormControl,
  Input,
  Text,
  AccordionItem,
  Accordion,
  AccordionButton,
  AccordionPanel,
} from "@chakra-ui/react";
import { toast } from "react-toastify";
import { ChatState } from "../context/ChatProvider";
import UserBadgeItem from "./UserBadgeItem";
import axios from "axios";
import Loader from "./Loader";
import UserListItem from "./UserListItem";

const UpdateGroupChatModal = ({
  fetchAgain,
  setFetchAgain,
  fetchAllMessages,
}) => {
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, user, setSelectedChat } = ChatState();

  const handleRemoveUser = async (userToBeRemoved) => {
    if (user.user._id !== selectedChat.groupAdmin._id) {
      toast.info("Only Admins can add/remove member");
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chats/groupremove`,
        {
          userId: userToBeRemoved._id,
          chatId: selectedChat._id,
        },
        config
      );

      userToBeRemoved._id === user._d
        ? setSelectedChat()
        : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchAllMessages();
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };
  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }
    setRenameLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chats/grouprename",
        { chatName: groupChatName, chatId: selectedChat._id },
        config
      );
      toast.info(`Group name successfully changed to ${data.chatName}`);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (err) {
      toast.error(err);
      setRenameLoading(false);
      return;
    }
    setGroupChatName("");
  };
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
  const handleAddMember = async (userToAdd) => {
    if (userToAdd.email === "guest@deLink.com") {
      toast.info("\nGuest user can not be a part of group");
      return;
    }
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      toast.info("User already present in the group");
      return;
    }
    if (user.user._id !== selectedChat.groupAdmin._id) {
      toast.info("Only Admins can add/remove member");
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chats/groupadd`,
        {
          userId: userToAdd._id,
          chatId: selectedChat._id,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };
  const handleRemove = async (userToBeRemoved) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(
        `/api/chats/groupremove`,
        {
          userId: userToBeRemoved.user._id,
          chatId: selectedChat._id,
        },
        config
      );
      setSelectedChat();
      setFetchAgain(!fetchAgain);
      fetchAllMessages();
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };
  return (
    <>
      <Button onClick={onOpen} d={{ base: "flex" }}>
        <IoSettingsOutline fontSize="1.4rem" />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="1.75rem"
            d="flex"
            justifyContent="center"
            textTransform="capitalize"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody>
            <Box>
              <Text>Group Members</Text>
              {selectedChat.users.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemoveUser(user)}
                />
              ))}
            </Box>
            <FormControl d="flex" mt="5" width="100%">
              <Input
                placeholder="Chat Name"
                value={groupChatName}
                mb="1"
                onChange={(e) => setGroupChatName(e.target.value)}
              />

              <Button
                variant="solid"
                bg="#1d1931"
                color="#fff"
                colorScheme="blackAlpha"
                ml="1"
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl d="flex" width="100%">
              <Input
                placeholder="Add members to group"
                mb="3"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Box
                minH="100px"
                width="100%"
                d="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Loader />
              </Box>
            ) : (
              <Box minH="100px" maxH="100px" overflowY="scroll">
                {searchResult?.map((user) => (
                  <UserListItem
                    width="100%"
                    key={user._id}
                    user={user}
                    handleFunction={() => handleAddMember(user)}
                  />
                ))}
              </Box>
            )}
            <Box></Box>
          </ModalBody>

          <ModalFooter>
            <Accordion allowToggle width="100%">
              <AccordionItem>
                <AccordionButton d="flex" justifyContent="center" width="100%">
                  Danger Zone
                </AccordionButton>
                <AccordionPanel>
                  <Text>
                    By Leaving the Group, you will not be able to access old
                    chat and all the chat media will be deleted as well
                  </Text>
                  <Button
                    mt="2"
                    colorScheme="red"
                    width="100%"
                    onClick={() => handleRemove(user)}
                  >
                    Leave Group
                  </Button>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
