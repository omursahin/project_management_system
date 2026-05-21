import { Box, Flex, Grid, Heading, Text, Button, Link } from "@chakra-ui/react";
import { getStoredUser } from "../services/auth.js";

function QuickActionCard({ icon, title, description, href, color = "teal" }) {
  return (
    <Link href={href} _hover={{ textDecoration: "none" }}>
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="xl"
        p={6}
        cursor="pointer"
        _hover={{ shadow: "md", borderColor: `${color}.200`, transform: "translateY(-2px)" }}
        transition="all 0.2s"
      >
        <Text fontSize="2xl" mb={3}>{icon}</Text>
        <Heading size="md" color="gray.800" mb={1}>{title}</Heading>
        <Text fontSize="sm" color="gray.500">{description}</Text>
      </Box>
    </Link>
  );
}

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
        mb={8}
      >
        <Text fontSize="sm" fontWeight="medium" opacity={0.85} mb={1}>
          {greeting}
        </Text>
        <Heading size="2xl" mb={2}>
          {user?.first_name || "Kullanıcı"} {user?.last_name || ""}
        </Heading>
        <Text fontSize="md" opacity={0.9} maxW="lg">
          Proje yönetim paneline hoş geldin. Gruplarına göz at, yeni projeler
          oluştur ve ekibinle işbirliği yap.
        </Text>
      </Box>

      {/* Hızlı erişim */}
      <Heading size="lg" color="gray.700" mb={4}>
        Hızlı Erişim
      </Heading>
      <Grid
        templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }}
        gap={4}
      >
        <QuickActionCard
          icon={"\u{1F4CB}"}
          title="Gruplarım"
          description="Proje gruplarınızı görüntüleyip yönetin"
          href="/groups"
        />
        <QuickActionCard
          icon={"\u{1F4CA}"}
          title="Panel"
          description="İstatistikler ve özet bilgiler"
          href="/dashboard"
          color="blue"
        />
        <QuickActionCard
          icon={"\u{1F3EB}"}
          title="Üniversiteler"
          description="Üniversite bilgilerini inceleyin"
          href="/universities"
          color="purple"
        />
      </Grid>
    </Box>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}
