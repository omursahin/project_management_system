import { useState, useRef } from "react";
import {
  Box, Table, Button, Text, VStack, HStack, Spinner, Alert, Badge, Input,
} from "@chakra-ui/react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { users, departments } from "../../services/resources.js";
import api from "../../services/api.js";

const ROLE_OPTIONS = [
  { value: "student", label: "Öğrenci" },
  { value: "instructor", label: "Eğitmen (is_staff)" },
  { value: "admin", label: "Yönetici (superuser)" },
];

function roleOf(u) {
  if (u.is_superuser) return "admin";
  if (u.is_staff) return "instructor";
  return "student";
}

function roleToFlags(role) {
  if (role === "admin") return { is_staff: true, is_superuser: true };
  if (role === "instructor") return { is_staff: true, is_superuser: false };
  return { is_staff: false, is_superuser: false };
}

const EMPTY_FORM = {
  id: null,
  first_name: "",
  last_name: "",
  identification_number: "",
  email: "",
  phone_number: "",
  address: "",
  department: "",
  role: "student",
  password: "",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteUser, setDeleteUser] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importDefaultStaff, setImportDefaultStaff] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const queryParams = {
    ...(search ? { search } : {}),
    ...(roleFilter === "instructor" ? { is_staff: true, is_superuser: false } :
        roleFilter === "admin" ? { is_superuser: true } :
        roleFilter === "student" ? { is_staff: false, is_superuser: false } : {}),
  };

  const { data: userList = [], isLoading, error, refetch } = users.useList(queryParams);
  const { data: departmentList = [] } = departments.useList();
  const departmentName = (id) => departmentList.find((d) => d.id === id)?.name || "-";

  const createMutation = users.useCreate({ onSuccess: () => setFormOpen(false) });
  const updateMutation = users.usePatch({ onSuccess: () => setFormOpen(false) });
  const deleteMutation = users.useDelete({ onSuccess: () => setDeleteUser(null) });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => { setFormData(EMPTY_FORM); setFormOpen(true); };
  const openEdit = (u) => {
    setFormData({
      id: u.id,
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      identification_number: u.identification_number || "",
      email: u.email || "",
      phone_number: u.phone_number || "",
      address: u.address || "",
      department: u.department || "",
      role: roleOf(u),
      password: "",
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    const { id, role, password, department, ...rest } = formData;
    const payload = {
      ...rest,
      ...(department ? { department: Number(department) } : { department: null }),
      ...roleToFlags(role),
      ...(password ? { password } : {}),
    };
    if (id) {
      updateMutation.mutate({ id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    const fd = new FormData();
    fd.append("file", importFile);
    fd.append("is_staff", importDefaultStaff ? "true" : "false");
    setImporting(true);
    setImportResult(null);
    try {
      const { data } = await api.post("/api/account/users/import/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult(data);
      refetch();
    } catch (err) {
      setImportResult({ error: err.response?.data?.detail || "Yükleme başarısız." });
    } finally {
      setImporting(false);
    }
  };

  const closeImport = () => {
    setImportOpen(false);
    setImportFile(null);
    setImportResult(null);
    setImportDefaultStaff(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formErrors =
    createMutation.error?.response?.data ||
    updateMutation.error?.response?.data ||
    null;

  return (
    <Box>
      <PageHeader
        title="Kullanıcılar"
        subtitle="Öğrenci, eğitmen ve yönetici hesaplarını yönetin."
      >
        <Button variant="outline" colorPalette="purple" onClick={() => setImportOpen(true)}>
          Excel ile Yükle
        </Button>
        <Button bg="teal.500" color="white" _hover={{ bg: "teal.600" }} onClick={openCreate}>
          + Yeni Kullanıcı
        </Button>
      </PageHeader>

      {/* Filtre cubugu */}
      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={3} mb={4}>
        <HStack gap={3}>
          <Input
            placeholder="Ad, soyad, e-posta veya numara ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxW="380px"
          />
          <Box>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                backgroundColor: "white",
                fontSize: "14px",
              }}
            >
              <option value="">Tüm Roller</option>
              <option value="student">Öğrenci</option>
              <option value="instructor">Eğitmen</option>
              <option value="admin">Yönetici</option>
            </select>
          </Box>
        </HStack>
      </Box>

      {error && (
        <Alert.Root status="error" borderRadius="lg" mb={4}>
          <Alert.Indicator />
          <Alert.Title>Kullanıcı listesi yüklenemedi.</Alert.Title>
        </Alert.Root>
      )}

      {isLoading ? (
        <Box textAlign="center" py={10}><Spinner size="xl" color="teal.500" /></Box>
      ) : (
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" overflow="hidden">
          <Table.Root variant="striped" stickyHeader interactive>
            <Table.Header>
              <Table.Row bg="gray.50">
                <Table.ColumnHeader color="gray.500" fontSize="xs" letterSpacing="wider">NUMARA</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" letterSpacing="wider">AD SOYAD</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" letterSpacing="wider">E-POSTA</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" letterSpacing="wider">ROL</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" letterSpacing="wider">BÖLÜM</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" letterSpacing="wider" textAlign="end">İŞLEMLER</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {userList.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" color="gray.400" py={8}>
                    Kayıt bulunamadı.
                  </Table.Cell>
                </Table.Row>
              ) : (
                userList.map((u) => {
                  const role = roleOf(u);
                  const roleMeta = role === "admin"
                    ? { label: "Yönetici", color: "red" }
                    : role === "instructor"
                    ? { label: "Eğitmen", color: "blue" }
                    : { label: "Öğrenci", color: "gray" };
                  return (
                    <Table.Row key={u.id} _hover={{ bg: "teal.50" }}>
                      <Table.Cell fontFamily="mono" fontSize="sm" color="gray.600">
                        {u.identification_number}
                      </Table.Cell>
                      <Table.Cell fontWeight="medium" color="gray.700">
                        {u.full_name || `${u.first_name} ${u.last_name}`.trim() || "-"}
                      </Table.Cell>
                      <Table.Cell color="gray.600" fontSize="sm">{u.email}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={roleMeta.color} variant="subtle" borderRadius="full">
                          {roleMeta.label}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell color="gray.600" fontSize="sm">{departmentName(u.department)}</Table.Cell>
                      <Table.Cell textAlign="end">
                        <HStack gap={2} justify="end">
                          <Button size="xs" variant="ghost" colorPalette="orange" onClick={() => openEdit(u)}>
                            Düzenle
                          </Button>
                          <Button size="xs" variant="ghost" colorPalette="red" onClick={() => setDeleteUser(u)}>
                            Sil
                          </Button>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* CREATE/EDIT MODAL */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={formData.id ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı"}
      >
        <VStack gap={4} align="stretch">
          <HStack gap={3}>
            <FormField label="Ad" value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
            <FormField label="Soyad" value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
          </HStack>
          <FormField
            label="Numara (11 hane)"
            value={formData.identification_number}
            onChange={(e) => setFormData({ ...formData, identification_number: e.target.value })}
            placeholder="Örn: 12345678901"
          />
          <FormField
            label="E-posta (boş bırakılırsa numara@student.local üretilir)"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ornek@uni.edu.tr"
          />
          <HStack gap={3}>
            <FormField
              label="Rol"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={ROLE_OPTIONS}
              placeholder={false}
            />
            <FormField
              label="Bölüm"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={departmentList.map((d) => ({ value: d.id, label: d.name }))}
              placeholder="Bölüm seçiniz (opsiyonel)..."
            />
          </HStack>
          <FormField
            label={formData.id ? "Yeni Şifre (boş bırak = değişmez)" : "Şifre (boş bırakılırsa numara şifre olur)"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          {formErrors && (
            <Alert.Root status="error" borderRadius="md">
              <Alert.Indicator />
              <Alert.Title fontSize="sm">
                {typeof formErrors === "string"
                  ? formErrors
                  : Object.entries(formErrors).map(([k, v]) =>
                      `${k}: ${Array.isArray(v) ? v.join(" ") : v}`
                    ).join(" • ")
                }
              </Alert.Title>
            </Alert.Root>
          )}

          <HStack justify="end" pt={2}>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Vazgeç</Button>
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
      </Modal>

      {/* DELETE CONFIRM */}
      <Modal
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Kullanıcıyı Sil"
        size="sm"
      >
        <Text>
          <strong>{deleteUser?.full_name || deleteUser?.email}</strong> kullanıcısını silmek istediğinize emin misiniz?
          Bu işlem geri alınamaz.
        </Text>
        <HStack justify="end" pt={4}>
          <Button variant="ghost" onClick={() => setDeleteUser(null)}>Vazgeç</Button>
          <Button
            colorPalette="red"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(deleteUser.id)}
          >
            Sil
          </Button>
        </HStack>
      </Modal>

      {/* IMPORT MODAL */}
      <Modal open={importOpen} onClose={closeImport} title="Excel ile Toplu Yükle">
        <VStack gap={4} align="stretch">
          <Box bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="md" p={3}>
            <Text fontSize="sm" color="blue.800" fontWeight="medium" mb={1}>
              Beklenen format
            </Text>
            <Text fontSize="xs" color="blue.700">
              İlk satır başlık olmalı: <strong>numara</strong>, <strong>ad</strong>, <strong>soyad</strong>{" "}
              (alternatif başlıklar: id_number/identification_number/ogrenci_no • first_name/isim • last_name/soyisim).
              <br />
              Email <code>numara@student.local</code> olarak, şifre numaraya eşit olarak üretilir.
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>Excel Dosyası (.xlsx)</Text>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              style={{ width: "100%" }}
            />
          </Box>

          <HStack>
            <input
              id="defaultStaff"
              type="checkbox"
              checked={importDefaultStaff}
              onChange={(e) => setImportDefaultStaff(e.target.checked)}
            />
            <Text as="label" htmlFor="defaultStaff" fontSize="sm" color="gray.600" cursor="pointer">
              Eğitmen olarak yükle (is_staff=true)
            </Text>
          </HStack>

          {importResult && !importResult.error && (
            <Alert.Root status="success" borderRadius="md">
              <Alert.Indicator />
              <Box>
                <Alert.Title fontSize="sm">Yükleme tamamlandı</Alert.Title>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  Oluşturulan: <strong>{importResult.created}</strong> •{" "}
                  Atlanan: <strong>{importResult.skipped}</strong> •{" "}
                  Hata: <strong>{importResult.errors}</strong>
                </Text>
                {importResult.details?.errors?.length > 0 && (
                  <Box mt={2} maxH="120px" overflowY="auto" fontSize="xs" color="red.600">
                    {importResult.details.errors.slice(0, 10).map((e, i) => (
                      <Text key={i}>Satır {e.row}: {e.error}</Text>
                    ))}
                  </Box>
                )}
              </Box>
            </Alert.Root>
          )}
          {importResult?.error && (
            <Alert.Root status="error" borderRadius="md">
              <Alert.Indicator />
              <Alert.Title fontSize="sm">{importResult.error}</Alert.Title>
            </Alert.Root>
          )}

          <HStack justify="end" pt={2}>
            <Button variant="ghost" onClick={closeImport}>Kapat</Button>
            <Button
              bg="purple.500"
              color="white"
              _hover={{ bg: "purple.600" }}
              loading={importing}
              disabled={!importFile}
              onClick={handleImport}
            >
              Yükle
            </Button>
          </HStack>
        </VStack>
      </Modal>
    </Box>
  );
}
