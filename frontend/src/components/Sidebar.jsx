import { Box, VStack, Link, Text, Flex, Separator } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

<<<<<<< HEAD
const menuItems = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Panel", href: "/dashboard" },
  { label: "Üniversiteler", href: "/universities" }, // Mevcut olan
  { label: "Dönem Dersleri", href: "/term-lesson-list" }, // Yeni eklenen
  { label: "Gruplarım", href: "/groups" },
  { label: "Profilim", href: "/profile" },
  { label: "Ayarlar", href: "/settings" },
=======
const menuSections = [
  {
    label: "GENEL",
    items: [
      { label: "Ana Sayfa", href: "/", icon: "\u2302" },
      { label: "Panel", href: "/dashboard", icon: "\u25A6" },
    ],
  },
  {
    label: "PROJE",
    items: [
      { label: "Gruplarım", href: "/groups", icon: "\u2630" },
      { label: "Üniversiteler", href: "/universities", icon: "\u2302" },
    ],
  },
  {
    label: "HESAP",
    items: [
      { label: "Profilim", href: "/profile", icon: "\u2603" },
      { label: "Ayarlar", href: "/settings", icon: "\u2699" },
    ],
  },
>>>>>>> cb2db4e6e6665be9123216fdfeb15727421f754d
];

const Sidebar = () => {
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
<<<<<<< HEAD
      <VStack align="stretch" spacing={1}>
        <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>
          MENÜ
        </Text>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              p={2}
              borderRadius="md"
              fontWeight={isActive ? "semibold" : "normal"}
              bg={isActive ? "teal.50" : "transparent"}
              color={isActive ? "teal.700" : "gray.700"}
              _hover={{ bg: "teal.50", color: "teal.600", textDecoration: "none" }}
              textDecoration="none"
              // Eğer react-router-dom Link'i gibi davranmasını istiyorsan gerekirse as={NavLink} eklenebilir
=======
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
>>>>>>> cb2db4e6e6665be9123216fdfeb15727421f754d
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
                    bg={isActive ? "teal.50" : "transparent"}
                    color={isActive ? "teal.700" : "gray.600"}
                    borderLeft="3px solid"
                    borderLeftColor={isActive ? "teal.500" : "transparent"}
                    _hover={{
                      bg: isActive ? "teal.50" : "gray.50",
                      color: isActive ? "teal.700" : "gray.800",
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
};

export default Sidebar;
