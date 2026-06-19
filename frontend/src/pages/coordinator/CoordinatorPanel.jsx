import { Box, Heading, Text } from "@chakra-ui/react";
import PageHeader from "../../components/ui/PageHeader.jsx";

export default function CoordinatorPanel() {
  return (
    <Box>
      <PageHeader
        title="Eğitmen Paneli"
        subtitle="Derslerinizi, gruplarınızı ve not girişlerini sol menüden yönetin."
      />
      <Box textAlign="center" py={10}>
        <Heading size="md" color="gray.600" mb={2}>Hoş Geldiniz</Heading>
        <Text color="gray.400">Sol menüden istediğiniz sayfaya gidin.</Text>
      </Box>
    </Box>
  );
}
