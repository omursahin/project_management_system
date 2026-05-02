import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table, Box, Badge, Button, Heading, Text, VStack, Input,
  DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter,
  DialogTitle, DialogCloseTrigger, HStack
} from "@chakra-ui/react";

const UniversityTable = () => {
  // State Tanımlamaları
  const [universities, setUniversities] = useState([]); // Başlangıç boş, API'den dolacak
  const [selectedUni, setSelectedUni] = useState(null);
  const [deleteUni, setDeleteUni] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", city: "", type: "Devlet", detail: "" });

  // 1. VERİLERİ API'DEN ÇEKME (GET)
  const fetchUniversities = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/universities/');
      // Backend'deki alan adlarını (title, city_code) frontend'e (name, city) çeviriyoruz
      const formattedData = response.data.map(uni => ({
        id: uni.id,
        name: uni.title,
        city: uni.city_code,
        type: uni.type,
        detail: uni.description
      }));
      setUniversities(formattedData);
    } catch (error) {
      console.error("Veriler çekilemedi:", error);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  // 2. KAYDET VEYA GÜNCELLE (POST/PUT)
  const handleSave = async () => {
    const payload = {
      title: formData.name,
      description: formData.detail,
      city_code: formData.city,
      type: formData.type
    };

    try {
      if (formData.id) {
        await axios.put(`http://127.0.0.1:8000/api/universities/${formData.id}/`, payload);
      } else {
        await axios.post('http://127.0.0.1:8000/api/universities/', payload);
      }
      fetchUniversities(); // Listeyi yenile
      setIsFormOpen(false);
    } catch (error) {
      console.error("İşlem başarısız:", error);
    }
  };

  // 3. SİLME (DELETE)
  const handleDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/universities/${deleteUni.id}/`);
      fetchUniversities();
      setDeleteUni(null);
    } catch (error) {
      console.error("Silme başarısız:", error);
    }
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="md" border="1px" borderColor="gray.200">
      <HStack justify="space-between" align="flex-end" mb={6}>
        <VStack align="start" gap="0">
          <Heading size="md" color="gray.800">Üniversite Yönetim Sistemi</Heading>
          <Text color="gray.500" fontSize="sm">Kayıtlı üniversiteleri yönetin.</Text>
        </VStack>
        <Button 
          colorPalette="blue" 
          onClick={() => {
            setFormData({ id: null, name: "", city: "", type: "Devlet", detail: "" });
            setIsFormOpen(true);
          }}
        >
          Yeni Üniversite Ekle
        </Button>
      </HStack>

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
                <HStack gap="2" justify="end">
                  <Button size="xs" variant="ghost" colorPalette="orange" onClick={() => { setFormData(uni); setIsFormOpen(true); }}>
                    Düzenle
                  </Button>
                  <Button size="xs" variant="ghost" colorPalette="red" onClick={() => setDeleteUni(uni)}>
                    Sil
                  </Button>
                  <Button size="xs" variant="outline" colorPalette="blue" onClick={() => setSelectedUni(uni)}>
                    Detay
                  </Button>
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* DETAY DİYALOĞU */}
      <DialogRoot open={!!selectedUni} onOpenChange={(e) => !e.open && setSelectedUni(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedUni?.name}</DialogTitle></DialogHeader>
          <DialogBody pb={6}>
            <VStack align="start">
              <Text><strong>Şehir:</strong> {selectedUni?.city}</Text>
              <Text><strong>Tür:</strong> {selectedUni?.type}</Text>
              <Text><strong>Hakkında:</strong> {selectedUni?.detail}</Text>
            </VStack>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {/* EKLEME/DÜZENLEME FORMU */}
      <DialogRoot open={isFormOpen} onOpenChange={(e) => setIsFormOpen(e.open)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{formData.id ? "Üniversiteyi Düzenle" : "Yeni Üniversite Ekle"}</DialogTitle></DialogHeader>
          <DialogBody pb={6}>
            <VStack gap="4" align="stretch">
              <Box>
                <Text mb="2" fontSize="sm" fontWeight="medium">Üniversite Adı</Text>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </Box>
              <Box>
                <Text mb="2" fontSize="sm" fontWeight="medium">Şehir</Text>
                <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </Box>
              <Box>
                <Text mb="2" fontSize="sm" fontWeight="medium">Hakkında</Text>
                <Input value={formData.detail} onChange={(e) => setFormData({...formData, detail: e.target.value})} />
              </Box>
              <HStack justify="end">
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Vazgeç</Button>
                <Button colorPalette="blue" onClick={handleSave}>Kaydet</Button>
              </HStack>
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>

      {/* SİLME ONAYI */}
      <DialogRoot open={!!deleteUni} onOpenChange={() => setDeleteUni(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Üniversiteyi Sil</DialogTitle></DialogHeader>
          <DialogBody><Text><strong>{deleteUni?.name}</strong> silinecek. Emin misiniz?</Text></DialogBody>
          <DialogFooter>
            <HStack gap="3" width="full">
              <Button variant="outline" flex="1" onClick={() => setDeleteUni(null)}>Vazgeç</Button>
              <Button colorPalette="red" flex="1" onClick={handleDelete}>Evet, Sil</Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default UniversityTable;