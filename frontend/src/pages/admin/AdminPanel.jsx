import { Box, SimpleGrid, Text, Flex, Heading } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";

const QUICK_LINKS = [
  { title: "Üniversiteler", desc: "Üniversite ekle, düzenle.", href: "/admin/universities", icon: "\u{1F3DB}" },
  { title: "Fakülteler", desc: "Fakülteleri yönetin.", href: "/admin/faculties", icon: "\u{1F3EB}" },
  { title: "Bölümler", desc: "Bölümleri yönetin.", href: "/admin/departments", icon: "\u{1F4DA}" },
  { title: "Dönemler", desc: "Akademik dönem tanımları.", href: "/admin/terms", icon: "\u{1F4C5}" },
  { title: "Dersler", desc: "Ders kataloğunu yönetin.", href: "/admin/lessons", icon: "\u{1F393}" },
  { title: "Dönem-Ders Atama", desc: "Dersleri dönemlere atayın.", href: "/admin/term-lessons", icon: "\u{1F517}" },
  { title: "Öğrenci Atama", desc: "Derslere öğrenci ekleyin / çıkarın.", href: "/admin/student-assignments", icon: "\u{1F468}‍\u{1F393}" },
  { title: "Kullanıcılar", desc: "Öğrenci ekle, düzenle, Excel ile toplu yükle.", href: "/admin/users", icon: "\u{1F465}" },
];

function QuickCard({ title, desc, href, icon }) {
  return (
    <Link to={href} style={{ textDecoration: "none" }}>
      <Box
        bg="white"
        borderRadius="xl"
        shadow="sm"
        border="1px solid"
        borderColor="gray.100"
        p={5}
        transition="all 0.15s"
        _hover={{ shadow: "md", borderColor: "teal.300", transform: "translateY(-2px)" }}
      >
        <Flex align="center" gap={3} mb={2}>
          <Box
            w="40px"
            h="40px"
            borderRadius="lg"
            bg="teal.50"
            color="teal.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xl"
          >
            {icon}
          </Box>
          <Heading size="sm" color="gray.700">{title}</Heading>
        </Flex>
        <Text fontSize="sm" color="gray.500">{desc}</Text>
      </Box>
    </Link>
  );
}

export default function AdminPanel() {
  return (
    <Box>
      <PageHeader
        title="Yönetim Paneli"
        subtitle="Akademik yapı, ders ve dönem yönetim işlemlerine buradan başlayın."
      />
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {QUICK_LINKS.map((item) => (
          <QuickCard key={item.href} {...item} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
