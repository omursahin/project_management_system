import { Box, Flex, Heading, Text } from "@chakra-ui/react";

export default function PageHeader({ title, subtitle, children }) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      mb={6}
      gap={3}
    >
      <Box>
        <Heading size="xl" color="gray.800">
          {title}
        </Heading>
        {subtitle && (
          <Text color="gray.500" fontSize="sm" mt={1}>
            {subtitle}
          </Text>
        )}
      </Box>
      {children && (
        <Flex gap={2} flexShrink={0}>
          {children}
        </Flex>
      )}
    </Flex>
  );
}
