import { Box, Heading, Text, Flex } from "@chakra-ui/react";

export default function EmptyState({ icon = "📂", title, description, children }) {
  return (
    <Box textAlign="center" py={16}>
      <Text fontSize="5xl" mb={4}>{icon}</Text>
      <Heading size="lg" color="gray.600" mb={2}>
        {title}
      </Heading>
      {description && (
        <Text color="gray.400" mb={6} maxW="md" mx="auto">
          {description}
        </Text>
      )}
      {children && (
        <Flex gap={3} justify="center">
          {children}
        </Flex>
      )}
    </Box>
  );
}
