import { Box, Heading, Text } from "@chakra-ui/react";
import PageHeader from "../../components/ui/PageHeader.jsx";

export default function AdminPanel() {
  return (
    <Box>
      <PageHeader
        title="Yönetim Paneli"
        subtitle="Sistem yönetimi işlemlerini sol menüden gerçekleştirebilirsiniz."
      />
      <Box textAlign="center" py={10}>
        <Heading size="md" color="gray.600" mb={2}>Hoş Geldiniz</Heading>
        <Text color="gray.400">Sol menüden istediğiniz sayfaya gidin.</Text>
      </Box>
    </Box>
  );
}
