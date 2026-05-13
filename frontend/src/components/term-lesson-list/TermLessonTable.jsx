import { useState } from "react";
import api from '../../services/api';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table, Box, Heading, Text, VStack, HStack, Spinner, Button,
  Dialog, Field, Input, Stack, Badge
} from "@chakra-ui/react";

const TermLessonTable = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false); 
  const [requestOpen, setRequestOpen] = useState(false); 
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [formData, setFormData] = useState({
    lesson: "", term: "", instructor: "", max_group_size: 5
  });

  // 1. Verileri Çekme
  const { data: termLessons, isLoading } = useQuery({
    queryKey: ['term-lessons'],
    queryFn: async () => (await api.get("/api/term-lesson/")).data
  });

  const { data: requests, isLoading: reqLoading } = useQuery({
    queryKey: ['collab-requests', selectedLesson],
    queryFn: async () => (await api.get(`/api/collaboration-requests/?term_lesson=${selectedLesson}`)).data,
    enabled: !!selectedLesson
  });

  // 2. Mutation İşlemleri
  const createMutation = useMutation({
    mutationFn: (newData) => api.post("/api/term-lesson/", newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['term-lessons'] });
      setOpen(false);
      setFormData({ lesson: "", term: "", instructor: "", max_group_size: 5 });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/term-lesson/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['term-lessons'] });
    }
  });

  const handleRequestAction = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/api/collaboration-requests/${id}/`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collab-requests'] });
    }
  });

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm">
      {/* BAŞLIK VE EKLEME BUTONU - HER ZAMAN GÖRÜNÜR */}
      <HStack justify="space-between" mb={6}>
        <VStack align="start" gap="0">
          <Heading size="md">Dönem Dersi Yönetimi</Heading>
          <Text color="gray.500" fontSize="sm">Dersleri ve öğrenci isteklerini yönetin.</Text>
        </VStack>

        <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
          <Dialog.Trigger asChild>
            <Button colorPalette="blue" size="sm">Yeni Dönem Dersi Ekle</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header><Dialog.Title>Yeni Dönem Dersi Oluştur</Dialog.Title></Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Field.Root>
                  <Text mb="1" fontSize="sm" fontWeight="medium">Ders ID</Text>
                  <Input value={formData.lesson} onChange={(e) => setFormData({...formData, lesson: e.target.value})}/>
                </Field.Root>
                <Field.Root>
                  <Text mb="1" fontSize="sm" fontWeight="medium">Dönem ID</Text>
                  <Input value={formData.term} onChange={(e) => setFormData({...formData, term: e.target.value})}/>
                </Field.Root>
                <Field.Root>
                  <Text mb="1" fontSize="sm" fontWeight="medium">Öğretim Üyesi ID</Text>
                  <Input value={formData.instructor} onChange={(e) => setFormData({...formData, instructor: e.target.value})}/>
                </Field.Root>
                <Field.Root>
                  <Text mb="1" fontSize="sm" fontWeight="medium">Maksimum Grup Boyutu</Text>
                  <Input type="number" value={formData.max_group_size} onChange={(e) => setFormData({...formData, max_group_size: e.target.value})}/>
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap="3">
                <Dialog.ActionTrigger asChild><Button variant="outline">İptal</Button></Dialog.ActionTrigger>
                <Button colorPalette="blue" onClick={() => createMutation.mutate(formData)} loading={createMutation.isPending}>Kaydet</Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </HStack>

      {/* TABLO ALANI - YÜKLENİYORSA SPINNER, VERİ YOKSA UYARI GÖSTERİR */}
      {isLoading ? (
        <Box p={10} textAlign="center"><Spinner size="xl" /></Box>
      ) : (
        <Table.Root variant="striped">
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader>Ders</Table.ColumnHeader>
              <Table.ColumnHeader>Dönem</Table.ColumnHeader>
              <Table.ColumnHeader>Hoca</Table.ColumnHeader>
              <Table.ColumnHeader>Max Grup</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">İşlemler</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {termLessons && termLessons.length > 0 ? (
              termLessons.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell fontWeight="medium">{item.lesson_name}</Table.Cell>
                  <Table.Cell>{item.term_name}</Table.Cell>
                  <Table.Cell>{item.instructor_name}</Table.Cell>
                  <Table.Cell>{item.max_group_size}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack justify="end" gap="2">
                      <Button 
                        variant="outline" size="xs" colorPalette="teal" 
                        onClick={() => { setSelectedLesson(item.id); setRequestOpen(true); }}
                      >
                        İstekler
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        colorPalette="red"
                        loading={deleteMutation.isPending && deleteMutation.variables === item.id}
                        onClick={() => { if(window.confirm("Bu dersi silmek istediğinize emin misiniz?")) deleteMutation.mutate(item.id) }}
                      >
                        Sil
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={5} textAlign="center" py={10}>
                  <Text color="gray.500">Henüz kayıtlı bir dönem dersi bulunamadı. Yeni bir tane ekleyerek başlayın.</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      )}

      {/* İSTEKLER MODALI */}
      <Dialog.Root open={requestOpen} onOpenChange={(e) => setRequestOpen(e.open)}>
        <Dialog.Content>
          <Dialog.Header><Dialog.Title>Gelen İşbirliği İstekleri</Dialog.Title></Dialog.Header>
          <Dialog.Body>
            {reqLoading ? <Spinner /> : (
              <Stack gap="4">
                {requests?.length > 0 ? requests.map(req => (
                  <HStack key={req.id} justify="space-between" p={2} borderBottom="1px solid #eee">
                    <VStack align="start" gap="0">
                      <Text fontWeight="bold">{req.student_name}</Text>
                      <Badge colorPalette={req.status === 'pending' ? 'orange' : 'green'}>{req.status}</Badge>
                    </VStack>
                    <HStack>
                      <Button size="xs" colorPalette="green" onClick={() => handleRequestAction.mutate({id: req.id, status: 'accepted'})}>Kabul</Button>
                      <Button size="xs" colorPalette="red" onClick={() => handleRequestAction.mutate({id: req.id, status: 'rejected'})}>Red</Button>
                    </HStack>
                  </HStack>
                )) : <Text>Henüz bir istek yok.</Text>}
              </Stack>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};

export default TermLessonTable;