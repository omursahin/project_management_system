import { useState } from "react";
import {
  Table, Box, Badge, Button, Text, VStack, Input,
  DialogRoot, DialogContent, DialogHeader, DialogBody,
  DialogTitle, DialogCloseTrigger, HStack, Spinner, Alert,
} from "@chakra-ui/react";
import PageHeader from "../ui/PageHeader.jsx";
import FormField from "../ui/FormField.jsx";
import { universities } from "../../services/resources.js";

const EMPTY_FORM = { id: null, name: "", city: "", type: "Devlet", detail: "" };

const UniversityTable = () => {
  const [selectedUni, setSelectedUni] = useState(null);
  const [deleteUni, setDeleteUni] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // React Query hook'lari - generic resource yapisindan
  const { data: list = [], isLoading, error } = universities.useList();
  const createMutation = universities.useCreate({ onSuccess: () => setIsFormOpen(false) });
  const updateMutation = universities.useUpdate({ onSuccess: () => setIsFormOpen(false) });
  const deleteMutation = universities.useDelete({ onSuccess: () => setDeleteUni(null) });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (formData.id) {
      updateMutation.mutate(formData);
    } else {
      const { id, ...rest } = formData;
      createMutation.mutate(rest);
    }
  };

  const handleDelete = () => {
    if (deleteUni) deleteMutation.mutate(deleteUni.id);
  };

  if (isLoading) {
    return (
      <Box>
        <PageHeader title="Üniversiteler" subtitle="Yükleniyor..." />
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="teal.500" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Üniversiteler" />
        <Alert.Root status="error" borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>Veriler yüklenirken bir hata oluştu.</Alert.Title>
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Üniversiteler"
        subtitle="Kayıtlı üniversiteleri yönetin ve detaylarını inceleyin."
      >
        <Button
          bg="teal.500"
          color="white"
          _hover={{ bg: "teal.600" }}
          onClick={() => {
            setFormData(EMPTY_FORM);
            setIsFormOpen(true);
          }}
        >
          + Yeni Üniversite
        </Button>
      </PageHeader>

      <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
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
            {list.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} textAlign="center" color="gray.400" py={8}>
                  Henüz kayıtlı üniversite yok.
                </Table.Cell>
              </Table.Row>
            ) : (
              list.map((uni) => (
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
                    <HStack gap={2} justify="end">
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="orange"
                        onClick={() => { setFormData(uni); setIsFormOpen(true); }}
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
                        colorPalette="teal"
                        onClick={() => setSelectedUni(uni)}
                      >
                        Detay
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Detay Diyalogu */}
      <DialogRoot open={!!selectedUni} onOpenChange={(e) => !e.open && setSelectedUni(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedUni?.name}</DialogTitle></DialogHeader>
          <DialogBody pb={6}>
            <VStack align="start" gap={3}>
              <Text><strong>Şehir:</strong> {selectedUni?.city}</Text>
              <Text><strong>Tür:</strong> {selectedUni?.type}</Text>
              <Text><strong>Hakkında:</strong> {selectedUni?.detail}</Text>
            </VStack>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {/* Ekleme/Duzenleme Formu */}
      <DialogRoot open={isFormOpen} onOpenChange={(e) => setIsFormOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formData.id ? "Üniversiteyi Düzenle" : "Yeni Üniversite Ekle"}</DialogTitle>
          </DialogHeader>
          <DialogBody pb={6}>
            <VStack gap={4} align="stretch">
              <FormField
                label="Üniversite Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <FormField
                label="Şehir"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <FormField
                label="Hakkında"
                multiline
                rows={3}
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              />
              <HStack justify="end" pt={2}>
                <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
                  Vazgeç
                </Button>
                <Button
                  bg="teal.500"
                  color="white"
                  _hover={{ bg: "teal.600" }}
                  loading={isSaving}
                  onClick={handleSave}
                >
                  Kaydet
                </Button>
              </HStack>
            </VStack>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {/* Silme Onayi */}
      <DialogRoot open={!!deleteUni} onOpenChange={(e) => !e.open && setDeleteUni(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Silmeyi Onayla</DialogTitle></DialogHeader>
          <DialogBody pb={6}>
            <Text>
              <strong>{deleteUni?.name}</strong> üniversitesini silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </Text>
            <HStack justify="end" pt={4}>
              <Button variant="ghost" onClick={() => setDeleteUni(null)}>
                Vazgeç
              </Button>
              <Button
                colorPalette="red"
                loading={deleteMutation.isPending}
                onClick={handleDelete}
              >
                Sil
              </Button>
            </HStack>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default UniversityTable;
