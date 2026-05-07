import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
  Alert,
  Badge,
  Flex,
  Table,
  Select,
} from "@chakra-ui/react";
import api from "../services/api.js";

/* ══════════════════════ DÖNEM FORM MODAL ══════════════════════ */
function TermFormPanel({ term, onSaved, onCancel }) {
  const [form, setForm] = useState({
    term: term?.term || "",
    year: term?.year || new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.term.trim()) {
      setError("Dönem adı zorunludur.");
      return;
    }
    if (!form.year) {
      setError("Yıl zorunludur.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (term) {
        await api.put(`/api/term/${term.id}/`, {
          term: form.term.trim(),
          year: Number(form.year),
        });
      } else {
        await api.post("/api/term/", {
          term: form.term.trim(),
          year: Number(form.year),
        });
      }
      onSaved();
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msg = typeof data === "string" ? data : Object.values(data).flat().join(" ");
        setError(msg || "Bir hata oluştu.");
      } else {
        setError("Sunucuya bağlanılamadı.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      border="2px solid"
      borderColor="blue.200"
      borderRadius="xl"
      p={6}
      bg="blue.50"
    >
      <Heading size="md" color="blue.700" mb={4}>
        {term ? "Dönem Düzenle" : "Yeni Dönem Ekle"}
      </Heading>

      {error && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}

      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
              Dönem *
            </Text>
            <Select
              name="term"
              value={form.term}
              onChange={handleChange}
              bg="white"
              disabled={loading}
            >
              <option value="">Seçiniz</option>
              <option value="Güz">Güz</option>
              <option value="Bahar">Bahar</option>
              <option value="Yaz">Yaz</option>
            </Select>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
              Yıl *
            </Text>
            <Input
              name="year"
              type="number"
              min={2000}
              max={2100}
              value={form.year}
              onChange={handleChange}
              bg="white"
              disabled={loading}
            />
          </Box>

          <Flex gap={3} pt={2}>
            <Button type="submit" colorPalette="blue" loading={loading}>
              {term ? "Güncelle" : "Ekle"}
            </Button>
            <Button variant="ghost" onClick={onCancel} disabled={loading}>
              İptal
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}

/* ══════════════════════ BOŞ DURUM ══════════════════════ */
function EmptyState({ onAddClick }) {
  return (
    <Box textAlign="center" py={16}>
      <Text fontSize="5xl" mb={4}>📅</Text>
      <Heading size="lg" color="gray.600" mb={2}>
        Henüz dönem tanımlanmamış
      </Heading>
      <Text color="gray.400" mb={6}>
        Yeni bir akademik dönem ekleyerek başlayın.
      </Text>
      <Button colorPalette="blue" onClick={onAddClick}>
        + Dönem Ekle
      </Button>
    </Box>
  );
}

/* ══════════════════════ ANA SAYFA ══════════════════════ */
export default function Terms() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTerm, setEditingTerm] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/term/");
      setTerms(res.data.results || res.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError("Dönemler yüklenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const handleSaved = () => {
    setShowForm(false);
    setEditingTerm(null);
    fetchTerms();
  };

  const handleEdit = (term) => {
    setEditingTerm(term);
    setShowForm(true);
  };

  const handleDelete = async (term) => {
    if (!window.confirm(`"${term.year} ${term.term}" dönemini silmek istediğinize emin misiniz?`)) return;
    try {
      await api.delete(`/api/term/${term.id}/`);
      fetchTerms();
    } catch {
      alert("Dönem silinirken bir hata oluştu.");
    }
  };

  const handleSetActive = async (term) => {
    try {
      await api.post(`/api/term/${term.id}/set_active/`);
      fetchTerms();
    } catch {
      alert("Aktif dönem ayarlanırken bir hata oluştu.");
    }
  };

  const handleAddNew = () => {
    setEditingTerm(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTerm(null);
  };

  const activeTerm = terms.find(t => t.is_active);

  return (
    <Box>
      {/* Sayfa başlığı */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        flexWrap="wrap"
        gap={3}
      >
        <Box>
          <Heading size="xl" color="gray.800">
            Dönem Yönetimi
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Akademik dönemleri yönetin, yeni dönem ekleyin veya mevcut dönemleri düzenleyin.
          </Text>
          {activeTerm && (
            <Flex align="center" gap={2} mt={2}>
              <Badge colorPalette="green" variant="solid" fontSize="sm" px={3} py={1}>
                Aktif Dönem: {activeTerm.year} {activeTerm.term}
              </Badge>
            </Flex>
          )}
        </Box>

        {terms.length > 0 && !showForm && (
          <Button colorPalette="blue" onClick={handleAddNew}>
            + Yeni Dönem
          </Button>
        )}
      </Flex>

      {/* Hata mesajı */}
      {error && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}

      {/* Form paneli */}
      {showForm && (
        <Box mb={6}>
          <TermFormPanel
            term={editingTerm}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        </Box>
      )}

      {/* Yükleniyor */}
      {loading && (
        <Flex justify="center" py={12}>
          <Text color="gray.400">Yükleniyor...</Text>
        </Flex>
      )}

      {/* Boş durum */}
      {!loading && terms.length === 0 && !showForm && (
        <EmptyState onAddClick={handleAddNew} />
      )}

      {/* Dönem tablosu */}
      {!loading && terms.length > 0 && (
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="xl"
          overflow="hidden"
          bg="white"
        >
          <Table.Root variant="line" size="lg">
            <Table.Header>
              <Table.Row bg="gray.50">
                <Table.ColumnHeader fontWeight="bold" color="gray.700">
                  Yıl
                </Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold" color="gray.700">
                  Dönem
                </Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold" color="gray.700">
                  Durum
                </Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold" color="gray.700" textAlign="right">
                  İşlemler
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {terms.map((term) => (
                <Table.Row key={term.id} _hover={{ bg: "gray.50" }}>
                  <Table.Cell fontWeight="medium" color="gray.800">
                    {term.year}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette="blue" variant="subtle">
                      {term.term}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {term.is_active ? (
                      <Badge colorPalette="green" variant="solid">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge colorPalette="gray" variant="subtle">
                        Pasif
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <HStack gap={2} justify="flex-end">
                      {!term.is_active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          colorPalette="green"
                          onClick={() => handleSetActive(term)}
                        >
                          Aktif Yap
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        colorPalette="blue"
                        onClick={() => handleEdit(term)}
                      >
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => handleDelete(term)}
                      >
                        Sil
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  );
}
