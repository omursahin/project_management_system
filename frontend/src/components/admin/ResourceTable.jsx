import { useState } from "react";
import {
  Table, Box, Button, Text, VStack, HStack, Spinner, Alert,
} from "@chakra-ui/react";
import PageHeader from "../ui/PageHeader.jsx";
import FormField from "../ui/FormField.jsx";
import Modal from "../ui/Modal.jsx";

/**
 * Generic admin CRUD tablo + ekleme/duzenleme/silme dialoglu sayfa.
 *
 * Props:
 *  - resource:    createResource() ile uretilmis kaynak
 *  - title:       PageHeader basligi
 *  - subtitle:    PageHeader alt yazisi
 *  - addLabel:    "+ Yeni X" butonu metni
 *  - columns:     [{ key, header, render?(row) }]
 *  - fields:      [{ key, label, type?, multiline?, rows?, options?, placeholder? }]
 *  - emptyForm:   Form ilk acilirken state'i (zorunlu)
 *  - rowKey:      Tablo row key fonksiyonu (default: r => r.id)
 *  - getLabel:    Silme/baslik icin row'un gosterim adi (default: r => r.title || r.name || `#${r.id}`)
 *  - queryParams: useList'e gecirilecek query parametreleri
 *  - normalize:   Server'dan gelen row'u forma yuklerken kullanilacak donusum
 *  - extraActions:[{ label, colorPalette?, onClick(row) }]  -- Duzenle/Sil oncesi ek butonlar
 */
export default function ResourceTable({
  resource,
  title,
  subtitle,
  addLabel = "+ Yeni Kayit",
  columns,
  fields,
  emptyForm,
  rowKey = (r) => r.id,
  getLabel = (r) => r.title || r.name || `#${r.id}`,
  queryParams,
  normalize = (r) => r,
  extraActions = [],
}) {
  const [deleteRow, setDeleteRow] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const { data: list = [], isLoading, error } = resource.useList(queryParams);
  const createMutation = resource.useCreate({ onSuccess: () => setIsFormOpen(false) });
  const updateMutation = resource.useUpdate({ onSuccess: () => setIsFormOpen(false) });
  const deleteMutation = resource.useDelete({ onSuccess: () => setDeleteRow(null) });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (formData.id) {
      updateMutation.mutate(formData);
    } else {
      const { id, ...rest } = formData;
      createMutation.mutate(rest);
    }
  };

  const openCreate = () => {
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (row) => {
    setFormData({ ...emptyForm, ...normalize(row) });
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <Box>
        <PageHeader title={title} subtitle="Yükleniyor..." />
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="teal.500" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title={title} />
        <Alert.Root status="error" borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>Veriler yüklenirken bir hata oluştu.</Alert.Title>
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title={title} subtitle={subtitle}>
        <Button bg="teal.500" color="white" _hover={{ bg: "teal.600" }} onClick={openCreate}>
          {addLabel}
        </Button>
      </PageHeader>

      <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
        <Table.Root variant="striped" stickyHeader interactive>
          <Table.Header>
            <Table.Row bg="gray.50">
              {columns.map((col) => (
                <Table.ColumnHeader
                  key={col.key}
                  color="gray.500"
                  fontSize="xs"
                  fontWeight="bold"
                  letterSpacing="wider"
                  textAlign={col.align}
                >
                  {col.header}
                </Table.ColumnHeader>
              ))}
              <Table.ColumnHeader color="gray.500" fontSize="xs" fontWeight="bold" letterSpacing="wider" textAlign="end">
                İŞLEMLER
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {list.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1} textAlign="center" color="gray.400" py={8}>
                  Henüz kayıt yok.
                </Table.Cell>
              </Table.Row>
            ) : (
              list.map((row) => (
                <Table.Row key={rowKey(row)} _hover={{ bg: "teal.50" }}>
                  {columns.map((col) => (
                    <Table.Cell key={col.key} textAlign={col.align}>
                      {col.render ? col.render(row) : row[col.key]}
                    </Table.Cell>
                  ))}
                  <Table.Cell textAlign="end">
                    <HStack gap={2} justify="end">
                      {extraActions.map((act) => (
                        <Button
                          key={act.label}
                          size="xs"
                          variant={act.variant || "outline"}
                          colorPalette={act.colorPalette || "teal"}
                          onClick={() => act.onClick(row)}
                        >
                          {act.label}
                        </Button>
                      ))}
                      <Button size="xs" variant="ghost" colorPalette="orange" onClick={() => openEdit(row)}>
                        Düzenle
                      </Button>
                      <Button size="xs" variant="ghost" colorPalette="red" onClick={() => setDeleteRow(row)}>
                        Sil
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Ekleme / Duzenleme Formu */}
      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formData.id ? "Düzenle" : "Yeni Kayıt"}
      >
        <VStack gap={4} align="stretch">
          {fields.map((f) => {
            const value = formData[f.key] ?? "";
            const onChange = (e) => setFormData({ ...formData, [f.key]: e.target.value });
            if (f.render) {
              return <div key={f.key}>{f.render({ value, onChange, formData, setFormData })}</div>;
            }
            return (
              <FormField
                key={f.key}
                label={f.label}
                type={f.type}
                multiline={f.multiline}
                rows={f.rows}
                options={f.options}
                placeholder={f.placeholder}
                value={value}
                onChange={onChange}
              />
            );
          })}
          <HStack justify="end" pt={2}>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Vazgeç</Button>
            <Button bg="teal.500" color="white" _hover={{ bg: "teal.600" }} loading={isSaving} onClick={handleSave}>
              Kaydet
            </Button>
          </HStack>
        </VStack>
      </Modal>

      {/* Silme Onayi */}
      <Modal
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        title="Silmeyi Onayla"
        size="sm"
      >
        <Text>
          <strong>{deleteRow && getLabel(deleteRow)}</strong> kaydını silmek istediğinize emin misiniz?
          Bu işlem geri alınamaz.
        </Text>
        <HStack justify="end" pt={4}>
          <Button variant="ghost" onClick={() => setDeleteRow(null)}>Vazgeç</Button>
          <Button colorPalette="red" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteRow.id)}>
            Sil
          </Button>
        </HStack>
      </Modal>
    </Box>
  );
}
