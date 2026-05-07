import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table, Box, Badge, Button, Heading, Text, VStack, Input,
  DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter,
  DialogTitle, DialogCloseTrigger, HStack, Spinner, Alert, AlertIcon
} from "@chakra-ui/react";

// 1. .env DOSYASINDAN BASE URL ALIMI
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.70.128.50:8000';

const UniversityTable = () => {
  const queryClient = useQueryClient();
  
  // Modal/Form State'leri
  const [selectedUni, setSelectedUni] = useState(null);
  const [deleteUni, setDeleteUni] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", city: "", type: "Devlet", detail: "" });

  // -----------------------------------------------------------
  // 2. VERİ ÇEKME (GET) - useQuery
  // -----------------------------------------------------------
  const { data: universities, isLoading, error } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/universities/`);
      // Backend (title, city_code) -> Frontend (name, city) dönüşümü
      return response.data.map(uni => ({
        id: uni.id,
        name: uni.title,
        city: uni.city_code,
        type: uni.type,
        detail: uni.description
      }));
    }
  });

  // -----------------------------------------------------------
  // 3. KAYDET / GÜNCELLE (POST/PUT) - useMutation
  // -----------------------------------------------------------
  const saveMutation = useMutation({
    mutationFn: async (newData) => {
      const payload = {
        title: newData.name,
        description: newData.detail,
        city_code: newData.city,
        type: newData.type
      };
      if (newData.id) {
        return axios.put(`${API_BASE_URL}/api/universities/${newData.id}/`, payload);
      }
      return axios.post(`${API_BASE_URL}/api/universities/`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['universities']); // Listeyi otomatik yenile
      setIsFormOpen(false);
    }
  });

  // -----------------------------------------------------------
  // 4. SİLME (DELETE) - useMutation
  // -----------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${API_BASE_URL}/api/universities/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['universities']); // Listeyi otomatik yenile
      setDeleteUni(null);
    }
  });

  // Formu Kaydetme Tetikleyicisi
  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  // Silme Tetikleyicisi
  const handleDelete = () => {
    if (deleteUni) deleteMutation.mutate(deleteUni.id);
  };

  // Yükleme ve Hata Ekranları
  if (isLoading) return <Box p={10} textAlign="center"><Spinner size="xl" color="blue.500" /></Box>;
  if (error) return <Alert status="error"><AlertIcon />Veriler yüklenirken bir hata oluştu!</Alert>;

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="md" border="1px" borderColor="gray.200">
      <HStack justify="space-between" align="flex-end" mb={6}>
        <VStack align="start" gap="0">
          <Heading size="md" color="gray.800">Üniversite Yönetim Sistemi</Heading>
          <Text color="gray.500" fontSize="sm">React Query ile modernize edildi.</Text>
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
          {universities?.map((uni) => (
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
                <Button colorPalette="blue" loading={saveMutation.isPending} onClick={handleSave}>Kaydet</Button>
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
              <Button colorPalette="red" flex="1" loading={deleteMutation.isPending} onClick={handleDelete}>Evet, Sil</Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default UniversityTable;