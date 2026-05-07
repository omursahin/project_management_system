import { Box, Text } from "@chakra-ui/react";

export default function StatCard({ label, value, color = "teal" }) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="xl"
      p={5}
      shadow="sm"
      _hover={{ shadow: "md", borderColor: `${color}.200` }}
      transition="all 0.2s"
    >
      <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={1}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color={`${color}.600`}>
        {value}
      </Text>
    </Box>
  );
}
