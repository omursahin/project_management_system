import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { getStoredUser } from "../services/auth.js";

export default function Home() {
  const user = getStoredUser();
  const greeting = getGreeting();

  return (
    <Box>
      {/* Hero */}
      <Box
        bgGradient="to-r"
        gradientFrom="teal.500"
        gradientTo="teal.400"
        borderRadius="2xl"
        p={{ base: 6, md: 10 }}
        color="white"
        mb={6}
      >
        <Text fontSize="sm" fontWeight="medium" opacity={0.85} mb={1}>
          {greeting}
        </Text>
        <Heading size="2xl" mb={2}>
          {user?.first_name || "Kullanıcı"} {user?.last_name || ""}
        </Heading>
        <Text fontSize="md" opacity={0.9} maxW="lg" mb={5}>
          Proje yönetim sistemine hoş geldin. Derslerini görmek, grup oluşturmak ve
          projelerini yönetmek için derslerine göz at.
        </Text>
        <Button
          as={Link}
          to="/lessons"
          bg="white"
          color="teal.600"
          _hover={{ bg: "gray.100" }}
          size="lg"
          fontWeight="semibold"
        >
          {"\u{1F393}"}  Derslerime Git
        </Button>
      </Box>

      {/* Bilgi kartı */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="xl"
        p={6}
      >
        <Heading size="md" color="gray.700" mb={3}>Nasıl çalışır?</Heading>
        <Text fontSize="sm" color="gray.600" lineHeight="taller">
          1. <strong>Derslerim</strong> bölümünden kayıtlı olduğun dersleri görürsün.<br />
          2. Bir derse girdiğinde o derse ait <strong>grupları</strong> ve <strong>kendi grubunu</strong> görürsün.<br />
          3. Liderisen grubuna üye davet edebilir, <strong>proje oluşturup eğitmenin onayına</strong> sunabilirsin.
        </Text>
      </Box>
    </Box>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}
