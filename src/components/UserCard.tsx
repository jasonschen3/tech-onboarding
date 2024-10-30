import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Link,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { apiUrl, Service } from "@hex-labs/core";
import axios from "axios";

type Props = {
  user: any;
};

const UserCard: React.FC<Props> = (props: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hexathons, setHexathons] = useState<any[]>([]);

  // TODO DOESN'T WORK YET
  // Function to fetch hexathons based on user applications
  const fetchUserHexathons = async () => {
    try {
      console.log(props.user.name.first, props.user.id);

      // 1) Fetch all hexatons
      const hexathonsRes = await axios.get(
        apiUrl(Service.HEXATHONS, "/hexathons")
      );
      console.log("All hexathons", hexathonsRes.data);
      const allHexathons = hexathonsRes.data;
      // 2) Loop thru all hackathons
      const userHexathons = await Promise.all(
        allHexathons.map(async (hexathon: any) => {
          const hexathonId = hexathon.id;

          // Query applications by hexathonId
          const appRes = await axios.get(
            apiUrl(Service.REGISTRATION, "/applications"),
            { params: { hexathon: hexathonId, userId: props.user.id } }
          );

          console.log(`Applications for hexathon ${hexathonId}:`, appRes.data);

          // If user has an application for this hexathon, return it
          if (appRes.data.length > 0) {
            return hexathon;
          }
        })
      );
      // TODO
    } catch (error) {
      console.error("Error fetching user's hexathons", error);
    }
  };

  return (
    <>
      <Box
        borderWidth="1px"
        rounded="lg"
        boxShadow="lg"
        height="175px"
        fontWeight="bold"
        alignItems="center"
        onClick={onOpen}
        cursor="pointer"
      >
        <Flex padding="2" flexDirection="column">
          <HStack align="flex-end" justify="space-between">
            <Text fontSize="xl">{`${props.user.name.first} ${props.user.name.last}`}</Text>
          </HStack>
          <Text
            fontSize="sm"
            fontWeight="semibold"
            justifyContent="justify"
            mt="2"
          >
            {props.user.email}
          </Text>
        </Flex>
      </Box>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`${props.user.name.first} ${props.user.name.middle ? props.user.name.middle + " " : ""} ${props.user.name.last}`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              <strong>Email:</strong>{" "}
              <Link href={`mailto:${props.user.email}`} color="blue.500">
                {props.user.email}
              </Link>
            </Text>
            <Text>
              <strong>Phone:</strong> {props.user.phoneNumber}
            </Text>
            <Text>
              <strong>User ID:</strong> {props.user.userId}
            </Text>

            {/* Display hexathons the user applied to */}
            {hexathons.length > 0 && (
              <>
                <Text mt={4} fontWeight="bold">
                  Hexathons Applied:
                </Text>
                <ul>
                  {hexathons.map((hexathon) => (
                    <li key={hexathon.id}>{hexathon.name}</li>
                  ))}
                </ul>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={fetchUserHexathons}>
              Show Applied Hexathons
            </Button>
            <Button onClick={onClose} ml={3}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserCard;
