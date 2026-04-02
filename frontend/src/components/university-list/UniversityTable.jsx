import React, { useState } from 'react';
import {
  Table, Box, Badge, Button, Heading, Text, VStack,
  DialogRoot, DialogContent, DialogHeader, DialogBody,
  DialogTitle, DialogCloseTrigger, DialogTrigger
} from "@chakra-ui/react";

const UniversityTable = () => {
  // Seçili üniversiteyi hafızada tutmak için state
  const [selectedUni, setSelectedUni] = useState(null);

  const universities = [
    { id: 1, name: "Erciyes Üniversitesi", city: "Kayseri", type: "Devlet", detail: "1978 yılında kurulmuştur. Havacılık ve Uzay Bilimleri ile öne çıkar." },
    { id: 2, name: "Orta Doğu Teknik Üniversitesi", city: "Ankara", type: "Devlet", detail: "1956 yılında kurulmuştur. İngilizce eğitim veren bir teknik üniversitedir." },
    { id: 3, name: "Bilkent Üniversitesi", city: "Ankara", type: "Vakıf", detail: "Türkiye'nin ilk vakıf üniversitesidir. Dünya sıralamalarında üst sıralardadır." },
    { id: 4, name: "İstanbul Teknik Üniversitesi", city: "İstanbul", type: "Devlet", detail: "1773 yılına dayanan köklü bir geçmişi vardır." },
  ];

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="md" border="1px" borderColor="gray.200">
      <VStack align="start" mb={6}>
        <Heading size="md" color="gray.800">Üniversite Yönetim Sistemi</Heading>
        <Text color="gray.500" fontSize="sm">Kayıtlı üniversiteleri yönetin ve detaylarını inceleyin.</Text>
      </VStack>

      {/* MODAL (DIALOG) YAPISI */}
      <DialogRoot
        open={!!selectedUni}
        onOpenChange={(e) => !e.open && setSelectedUni(null)}
      >
        <Table.Root variant="striped" stickyHeader interactive>
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>Üniversite Adı</Table.ColumnHeader>
              <Table.ColumnHeader>Şehir</Table.ColumnHeader>
              <Table.ColumnHeader>Tür</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">İşlemler</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {universities.map((uni) => (
              <Table.Row key={uni.id} _hover={{ bg: "blue.50" }}>
                <Table.Cell color="gray.500">#{uni.id}</Table.Cell>
                <Table.Cell fontWeight="semibold">{uni.name}</Table.Cell>
                <Table.Cell>{uni.city}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={uni.type === "Devlet" ? "blue" : "purple"} variant="subtle">
                    {uni.type}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {/* Butona tıklandığında seçili üniversiteyi state'e ata */}
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette="blue"
                    onClick={() => setSelectedUni(uni)}
                  >
                    Detay
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {/* DETAY PENCERESİ (MODAL CONTENT) */}
        {selectedUni && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUni.name}</DialogTitle>
            </DialogHeader>
            <DialogBody pb={6}>
              <VStack align="start" spacing={3}>
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
  );
};

export default UniversityTable;