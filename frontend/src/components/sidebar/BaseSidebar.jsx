import { Box, VStack, Link, Text, Separator } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

/**
 * Generic sidebar component shared across all layout types.
 *
 * @param {Object} props
 * @param {Array}  props.menuSections - Array of { label, items: [{ label, href, icon }] }
 * @param {string} [props.activeColor="teal"] - Color token for active item styling
 */
export default function BaseSidebar({ menuSections, activeColor = "teal" }) {
  const location = useLocation();

  return (
    <Box
      as="aside"
      w="240px"
      minH="calc(100vh - 56px)"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.100"
      py={5}
      px={3}
      display={{ base: "none", md: "block" }}
      flexShrink={0}
    >
      <VStack align="stretch" gap={5}>
        {menuSections.map((section, idx) => (
          <Box key={section.label}>
            {idx > 0 && <Separator mb={4} borderColor="gray.100" />}
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="gray.400"
              letterSpacing="wider"
              px={3}
              mb={2}
            >
              {section.label}
            </Text>
            <VStack align="stretch" gap={0.5}>
              {section.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    px={3}
                    py={2}
                    borderRadius="lg"
                    fontSize="sm"
                    fontWeight={isActive ? "semibold" : "normal"}
                    bg={isActive ? `${activeColor}.50` : "transparent"}
                    color={isActive ? `${activeColor}.700` : "gray.600"}
                    borderLeft="3px solid"
                    borderLeftColor={isActive ? `${activeColor}.500` : "transparent"}
                    _hover={{
                      bg: isActive ? `${activeColor}.50` : "gray.50",
                      color: isActive ? `${activeColor}.700` : "gray.800",
                      textDecoration: "none",
                    }}
                    transition="all 0.15s"
                  >
                    <Text fontSize="md" opacity={isActive ? 1 : 0.6}>
                      {item.icon}
                    </Text>
                    {item.label}
                  </Link>
                );
              })}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}