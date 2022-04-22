import React from "react";
import { Spinner, Box } from "@chakra-ui/react";

const Loader = () => {
  return (
    <Box
      d="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
    >
      <Spinner
        size="xl"
        h={20}
        w={20}
        thickness="4px"
        color="#fff"
        emptyColor="#1d1931"
        speed="0.4s"
      />
    </Box>
  );
};

export default Loader;
