import { useState } from "react";
import {
  Table, Box, Badge, Button, Text, VStack,
  DialogRoot, DialogContent, DialogHeader, DialogBody,
  DialogTitle, DialogCloseTrigger,
} from "@chakra-ui/react";
import PageHeader from "../ui/PageHeader.jsx";

const universities = [
  { id: 1, name: "Erciyes Üniversitesi", city: "Kayseri", type: "Devlet", detail: "1978 yılında kurulmuştur. Havacılık ve Uzay Bilimleri ile öne çıkar." },
  { id: 2, name: "Orta Doğu Teknik Üniversitesi", city: "Ankara", type: "Devlet", detail: "1956 yılında kurulmuştur. İngilizce eğitim veren bir teknik üniversitedir." },
  { id: 3, name: "Bilkent Üniversitesi", city: "Ankara", type: "Vakıf", detail: "Türkiye'nin ilk vakıf üniversitesidir. Dünya sıralamalarında üst sıralardadır." },
  { id: 4, name: "İstanbul Teknik Üniversitesi", city: "İstanbul", type: "Devlet", detail: "1773 yılına dayanan köklü bir geçmişi vardır." },
];

const UniversityTable = () => {
  const [selectedUni, setSelectedUni] = useState(null);

  return (
    <Box>
      <PageHeader
        title="Üniversiteler"
        subtitle="Kayıtlı üniversiteleri yönetin ve detaylarını inceleyin."
      />

      <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
        <DialogRoot
          open={!!selectedUni}
          onOpenChange={(e) => !e.open && setSelectedUni(null)}
        >
          <Table.Root variant="striped" stickyHeader interactive>
            <Table.Header>
              <Table.Row bg="gray.50">
                <Table.ColumnHeader color="gray.500" fontSize="xs" fontWeight="bold" letterSpacing="wider">ID</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" fontWeight="bold" letterSpacing="wider">ÜNİVERSİTE ADI</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" fontWeight="bold" letterSpacing="wider">ŞEHİR</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" fontWeight="bold" letterSpacing="wider">TÜR</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" fontWeight="bold" letterSpacing="wider" textAlign="end">İŞLEMLER</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {universities.map((uni) => (
                <Table.Row key={uni.id} _hover={{ bg: "teal.50" }}>
                  <Table.Cell color="gray.400" fontSize="sm">#{uni.id}</Table.Cell>
                  <Table.Cell fontWeight="medium" color="gray.700">{uni.name}</Table.Cell>
                  <Table.Cell color="gray.600">{uni.city}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={uni.type === "Devlet" ? "teal" : "purple"}
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                    >
                      {uni.type}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <Button
                      size="xs"
                      variant="outline"
                      colorPalette="teal"
                      onClick={() => setSelectedUni(uni)}
                    >
                      Detay
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {selectedUni && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedUni.name}</DialogTitle>
              </DialogHeader>
              <DialogBody pb={6}>
                <VStack align="start" gap={3}>
                  <Text><strong>Şehir:</strong> {selectedUni.city}</Text>
                  <Text><strong>Tür:</strong> {selectedUni.type}</Text>
                  <Text><strong>Hakkında:</strong> {selectedUni.detail}</Text>
                </VStack>
              </DialogBody>
              <DialogCloseTrigger />
            </DialogContent>
          )}
        </DialogRoot>
      </Box>
    </Box>
  );
};

export default UniversityTable;
