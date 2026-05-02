import React, { useState } from 'react';
import {
  Table, Box, Badge, Button, Heading, Text, VStack, Input,
  DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter,
  DialogTitle, DialogCloseTrigger, HStack
} from "@chakra-ui/react";

const UniversityTable = () => {
  // Seçili üniversiteyi hafızada tutmak için state
  const [selectedUni, setSelectedUni] = useState(null);
  const [deleteUni, setDeleteUni] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", city: "", type: "Devlet", detail: "" });

const [universities, setSetUniversities] = useState([
  { id: 1, name: "Erciyes Üniversitesi", city: "Kayseri", type: "Devlet", detail: "1978 yılında kurulmuştur." },
  { id: 2, name: "Orta Doğu Teknik Üniversitesi", city: "Ankara", type: "Devlet", detail: "1956 yılında kurulmuştur." },
  { id: 3, name: "Bilkent Üniversitesi", city: "Ankara", type: "Vakıf", detail: "Türkiye'nin ilk vakıf üniversitesidir." },
  { id: 4, name: "İstanbul Teknik Üniversitesi", city: "İstanbul", type: "Devlet", detail: "1773 yılına dayanan köklü bir geçmişi vardır." },
]);

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="md" border="1px" borderColor="gray.200">
      <HStack justify="space-between" align="flex-end" mb={6}>
  <VStack align="start" gap="0">
    <Heading size="md" color="gray.800">Üniversite Yönetim Sistemi</Heading>
    <Text color="gray.500" fontSize="sm">Kayıtlı üniversiteleri yönetin ve detaylarını inceleyin.</Text>
  </VStack>
  <Button 
  colorPalette="blue" 
  onClick={() => {
    setFormData({ name: "", city: "", type: "Devlet", detail: "" });
    setIsFormOpen(true);
  }}
>
  Yeni Üniversite Ekle
</Button>
</HStack>

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
  <HStack gap="2" justify="end"> {/* Butonları yan yana ve sağa yaslı dizmek için */}
    <Button 
      size="xs" 
      variant="ghost" 
      colorPalette="orange" 
      onClick={() => {
    setFormData(uni); // Formun içini o üniversitenin bilgileriyle doldurur
    setIsFormOpen(true); // Formu açar
  }}
    >
      Düzenle
    </Button>

    <Button 
      size="xs" 
      variant="ghost" 
      colorPalette="red" 
      onClick={() => setDeleteUni(uni)}
    >
      Sil
    </Button>

    <Button
      size="xs"
      variant="outline"
      colorPalette="blue"
      onClick={() => setSelectedUni(uni)}
    >
      Detay
    </Button>
  </HStack>
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
      {/* ÜNİVERSİTE EKLEME FORMU */}
<DialogRoot 
  open={isFormOpen} 
  onOpenChange={(e) => setIsFormOpen(e.open)}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Yeni Üniversite Ekle</DialogTitle>
    </DialogHeader>
    <DialogBody pb={6}>
  <VStack gap="4" align="stretch">
    <Box>
      <Text mb="2" fontSize="sm" fontWeight="medium">Üniversite Adı</Text>
      <Input 
        placeholder="Örn: Erciyes Üniversitesi" 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
    </Box>

    <Box>
      <Text mb="2" fontSize="sm" fontWeight="medium">Şehir</Text>
      <Input 
        placeholder="Örn: Kayseri" 
        value={formData.city}
        onChange={(e) => setFormData({...formData, city: e.target.value})}
      />
    </Box>

    <Box>
      <Text mb="2" fontSize="sm" fontWeight="medium">Hakkında</Text>
      <Input 
        placeholder="Kısa bir açıklama girin" 
        value={formData.detail}
        onChange={(e) => setFormData({...formData, detail: e.target.value})}
      />
    </Box>
  </VStack>

  <HStack mt={4} justify="end">
    <Button variant="outline" onClick={() => setIsFormOpen(false)}>Vazgeç</Button>
    <Button 
  colorPalette="blue" 
  onClick={() => {
    // FORMDAKİ VERİLERİ LİSTEYE EKLE
    const yeniUni = { 
      ...formData, 
      id: universities.length + 1 
    };
    setSetUniversities([...universities, yeniUni]); 
    
    // PENCEREYİ KAPAT
    setIsFormOpen(false);
  }}
>
  Kaydet
</Button>
  </HStack>
</DialogBody>
  </DialogContent>
</DialogRoot>
{/* SİLME ONAY DİYALOĞU */}
      <DialogRoot open={!!deleteUni} onOpenChange={() => setDeleteUni(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Üniversiteyi Sil</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              <strong>{deleteUni?.name}</strong> üniversitesini silmek istediğinize emin misiniz?
            </Text>
          </DialogBody>
          <DialogFooter>
            <HStack gap="3" width="full">
              <Button variant="outline" flex="1" onClick={() => setDeleteUni(null)}>
                Vazgeç
              </Button>
              <Button 
                colorPalette="red" 
                flex="1" 
                onClick={() => {
                  const yeniListe = universities.filter(u => u.id !== deleteUni.id);
                  setSetUniversities(yeniListe);
                  setDeleteUni(null);
                }}
              >
                Evet, Sil
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default UniversityTable;