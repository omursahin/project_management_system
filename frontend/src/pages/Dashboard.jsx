import { Box, Grid, Text, Flex, Heading } from "@chakra-ui/react";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import { groups as groupsResource } from "../services/resources.js";

export default function Dashboard() {
  const { data: groups = [] } = groupsResource.useList();

  const totalGroups = groups.length;
  const ownedGroups = groups.filter(
    (g) => g.owner === JSON.parse(localStorage.getItem("user") || "{}")?.id
  ).length;
  const totalMembers = groups.reduce((sum, g) => sum + (g.member_count || 0), 0);

  return (
    <Box>
      <PageHeader
        title="Panel"
        subtitle="Projeleriniz ve gruplarınız hakkında özet bilgiler"
      />

      <Grid
        templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }}
        gap={4}
        mb={8}
      >
        <StatCard label="Toplam Grup" value={totalGroups} color="teal" />
        <StatCard label="Lider Olduğum" value={ownedGroups} color="blue" />
        <StatCard label="Toplam Üye" value={totalMembers} color="purple" />
        <StatCard label="Aktif Proje" value="-" color="orange" />
      </Grid>

      {/* Son aktivite */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="xl"
        p={6}
      >
        <Heading size="md" color="gray.700" mb={4}>
          Son Aktiviteler
        </Heading>
        {groups.length === 0 ? (
          <Flex
            justify="center"
            align="center"
            py={8}
            color="gray.400"
            fontSize="sm"
          >
            <Text>Henüz bir aktivite yok. Bir gruba katılarak başlayabilirsiniz.</Text>
          </Flex>
        ) : (
          <Box>
            {groups.slice(0, 5).map((group) => (
              <Flex
                key={group.id}
                justify="space-between"
                align="center"
                py={3}
                borderBottom="1px solid"
                borderColor="gray.50"
                _last={{ borderBottom: "none" }}
              >
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {group.name}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {group.member_count || 0} üye
                  </Text>
                </Box>
                <Text
                  fontSize="xs"
                  color="teal.600"
                  fontWeight="medium"
                  bg="teal.50"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  Aktif
                </Text>
              </Flex>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
