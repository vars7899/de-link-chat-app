import React from "react";
import { Tag, TagLabel } from "@chakra-ui/react";
import { IoMdClose } from "react-icons/io";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Tag size="lg" colorScheme="blackAlpha" borderRadius="lg" mr="2" mt="2">
      <TagLabel d="flex" alignItems="center">
        {user.name}
        <IoMdClose onClick={handleFunction} cursor="pointer" />
      </TagLabel>
    </Tag>
  );
};

export default UserBadgeItem;
