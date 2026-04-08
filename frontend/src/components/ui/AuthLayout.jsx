import { Box, Flex, Heading, Text } from "@chakra-ui/react";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <Flex minH="100vh">
      {/* Sol panel - Brand */}
      <Box
        display={{ base: "none", lg: "flex" }}
        w="45%"
        bgGradient="to-br"
        gradientFrom="teal.500"
        gradientTo="teal.700"
        color="white"
        alignItems="center"
        justifyContent="center"
        p={12}
        position="relative"
        overflow="hidden"
      >
        {/* Dekoratif daireler */}
        <Box
          position="absolute"
          top="-80px"
          right="-80px"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="whiteAlpha.100"
        />
        <Box
          position="absolute"
          bottom="-50px"
          left="-50px"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="whiteAlpha.100"
        />
        <Box position="relative" zIndex={1} maxW="400px">
          <Text fontSize="4xl" fontWeight="bold" mb={4} lineHeight="shorter">
            Proje Yönetim Sistemi
          </Text>
          <Text fontSize="lg" opacity={0.9} lineHeight="tall">
            Projelerini organize et, ekibinle işbirliği yap, hedeflerine ulaş.
          </Text>
        </Box>
      </Box>

      {/* Sağ panel - Form */}
      <Flex
        flex="1"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
        p={{ base: 4, md: 8 }}
      >
        <Box
          bg="white"
          p={{ base: 6, md: 10 }}
          borderRadius="2xl"
          boxShadow="xl"
          w={{ base: "100%", sm: "440px" }}
          border="1px solid"
          borderColor="gray.100"
        >
          {/* Mobilde logo */}
          <Box display={{ base: "block", lg: "none" }} textAlign="center" mb={4}>
            <Text fontSize="sm" fontWeight="bold" color="teal.600" letterSpacing="wider">
              PROJE YÖNETİM SİSTEMİ
            </Text>
          </Box>

          <Heading size="xl" textAlign="center" mb={1} color="gray.800">
            {title}
          </Heading>
          {subtitle && (
            <Text textAlign="center" color="gray.500" fontSize="sm" mb={6}>
              {subtitle}
            </Text>
          )}
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
