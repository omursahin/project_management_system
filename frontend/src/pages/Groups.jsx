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
  Textarea,
  Badge,
  Flex,
  Grid,
  Separator,
} from "@chakra-ui/react";
import api from "../services/api.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import FormField from "../components/ui/FormField.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

/* ────────────────── Yardımcı: panoya kopyala ────────────────── */
function useCopyToClipboard() {
  const [copiedCode, setCopiedCode] = useState(null);

  const copy = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }, []);

  return { copiedCode, copy };
}

/* ═══════════════════ GRUP KARTI ═══════════════════ */
function GroupCard({ group, onRefresh }) {
  const { copiedCode, copy } = useCopyToClipboard();
  const [expanded, setExpanded] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = group.owner === currentUser.id;
  const isCopied = copiedCode === group.invite_code;

  const fetchMembers = async () => {
    if (members.length > 0) {
      setExpanded(!expanded);
      return;
    }
    setLoadingMembers(true);
    try {
      const res = await api.get(`/api/group/${group.id}/`);
      setMembers(res.data.members || []);
      setExpanded(true);
    } catch {
      setMembers([]);
      setExpanded(true);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Gruptan ayrılmak istediğine emin misin?")) return;
    setLeaving(true);
    try {
      await api.post(`/api/group/${group.id}/leave/`);
      onRefresh();
    } catch {
      alert("Gruptan ayrılırken bir hata oluştu.");
    } finally {
      setLeaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${group.name}" grubunu silmek istediğine emin misin?`)) return;
    try {
      await api.delete(`/api/group/${group.id}/`);
      onRefresh();
    } catch {
      alert("Grup silinirken bir hata oluştu.");
    }
  };

  return (
    <Box
      border="1px solid"
      borderColor="gray.100"
      borderRadius="xl"
      p={5}
      bg="white"
      shadow="sm"
      _hover={{ shadow: "md", borderColor: "teal.200" }}
      transition="all 0.2s"
    >
      {/* Başlık */}
      <Flex justify="space-between" align="start" mb={2}>
        <Box flex="1">
          <HStack gap={2} mb={1}>
            <Heading size="md" color="gray.800">
              {group.name}
            </Heading>
            {isOwner && (
              <Badge colorPalette="teal" variant="subtle" fontSize="xs">
                Lider
              </Badge>
            )}
          </HStack>
          {group.description && (
            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              {group.description}
            </Text>
          )}
        </Box>
        <Badge
          colorPalette={group.member_count >= group.max_members ? "red" : "green"}
          variant="subtle"
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          {group.member_count}/{group.max_members}
        </Badge>
      </Flex>

      <Separator my={3} borderColor="gray.100" />

      {/* Davet kodu */}
      <Flex
        align="center"
        justify="space-between"
        bg="gray.50"
        borderRadius="lg"
        px={4}
        py={2}
        mb={3}
      >
        <Box>
          <Text fontSize="xs" color="gray.400" fontWeight="medium">
            Davet Kodu
          </Text>
          <Text fontSize="lg" fontWeight="bold" fontFamily="mono" color="teal.600" letterSpacing="wider">
            {group.invite_code}
          </Text>
        </Box>
        <Button
          size="sm"
          variant={isCopied ? "solid" : "outline"}
          colorPalette={isCopied ? "green" : "teal"}
          onClick={() => copy(group.invite_code)}
        >
          {isCopied ? "Kopyalandı" : "Kopyala"}
        </Button>
      </Flex>

      {/* Üye listesi */}
      {expanded && (
        <Box mb={3} bg="gray.50" borderRadius="lg" p={3}>
          <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2} letterSpacing="wider">
            ÜYELER
          </Text>
          {members.length === 0 ? (
            <Text fontSize="sm" color="gray.400">
              Üye bilgisi yüklenemedi.
            </Text>
          ) : (
            <VStack align="stretch" gap={1}>
              {members.map((m) => (
                <Flex key={m.id} justify="space-between" align="center" py={1}>
                  <Text fontSize="sm" color="gray.700">
                    {m.full_name || m.user_email}
                  </Text>
                  <Badge
                    colorPalette={m.role === "leader" ? "purple" : "gray"}
                    variant="subtle"
                    fontSize="xs"
                  >
                    {m.role === "leader" ? "Lider" : "Üye"}
                  </Badge>
                </Flex>
              ))}
            </VStack>
          )}
        </Box>
      )}

      {/* Aksiyon butonları */}
      <Flex gap={2} flexWrap="wrap">
        <Button
          size="sm"
          variant="ghost"
          colorPalette="teal"
          onClick={fetchMembers}
          loading={loadingMembers}
        >
          {expanded ? "Gizle" : "Üyeler"}
        </Button>

        {group.is_member && !isOwner && (
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={handleLeave}
            loading={leaving}
          >
            Ayrıl
          </Button>
        )}

        {isOwner && (
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={handleDelete}
            ml="auto"
          >
            Sil
          </Button>
        )}
      </Flex>
    </Box>
  );
}

/* ═══════════════════ YENİ GRUP FORMU ═══════════════════ */
function CreateGroupPanel({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    max_members: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Grup adı zorunludur.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/api/group/", {
        name: form.name.trim(),
        description: form.description.trim(),
        max_members: Number(form.max_members) || 5,
      });
      onCreated();
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
      border="1px solid"
      borderColor="teal.200"
      borderRadius="xl"
      p={6}
      bg="white"
      shadow="sm"
    >
      <Heading size="md" color="teal.700" mb={4}>
        Yeni Grup Oluştur
      </Heading>

      {error && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title fontSize="sm">{error}</Alert.Title>
        </Alert.Root>
      )}

      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <FormField
            label="Grup Adı *"
            name="name"
            placeholder="Örn: Proje Takımı Alpha"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
          />
          <FormField
            label="Açıklama"
            name="description"
            placeholder="Grup hakkında kısa bilgi..."
            value={form.description}
            onChange={handleChange}
            disabled={loading}
            multiline
            rows={3}
          />
          <FormField
            label="Maksimum Üye Sayısı"
            name="max_members"
            type="number"
            min={2}
            max={20}
            value={form.max_members}
            onChange={handleChange}
            disabled={loading}
            w="120px"
          />
          <Flex gap={3} pt={2}>
            <Button type="submit" bg="teal.500" color="white" _hover={{ bg: "teal.600" }} loading={loading}>
              Oluştur
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

/* ═══════════════════ GRUBA KATIL FORMU ═══════════════════ */
function JoinGroupPanel({ onJoined, onCancel }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Davet kodu zorunludur.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/api/group/join/", { invite_code: trimmed });
      onJoined();
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 404) {
        setError("Bu davet koduna ait bir grup bulunamadı.");
      } else if (err.response?.status === 400) {
        const msg = data?.detail || data?.error || (typeof data === "string" ? data : Object.values(data).flat().join(" "));
        setError(msg || "Gruba katılırken bir hata oluştu.");
      } else {
        setError("Sunucuya bağlanılamadı.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      border="1px solid"
      borderColor="blue.200"
      borderRadius="xl"
      p={6}
      bg="white"
      shadow="sm"
    >
      <Heading size="md" color="blue.700" mb={4}>
        Gruba Katıl
      </Heading>

      {error && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title fontSize="sm">{error}</Alert.Title>
        </Alert.Root>
      )}

      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <Box>
            <FormField
              label="Davet Kodu *"
              name="code"
              placeholder="Örn: A1B2C3D4"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              fontFamily="mono"
              fontSize="lg"
              letterSpacing="wider"
              maxLength={8}
            />
            <Text fontSize="xs" color="gray.400" mt={1}>
              Grup liderinden aldığın 8 haneli kodu gir.
            </Text>
          </Box>
          <Flex gap={3} pt={2}>
            <Button type="submit" bg="blue.500" color="white" _hover={{ bg: "blue.600" }} loading={loading}>
              Katıl
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

/* ═══════════════════ ANA SAYFA ═══════════════════ */
export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePanel, setActivePanel] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/group/");
      setGroups(res.data.results || res.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError("Gruplar yüklenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreated = () => {
    setActivePanel(null);
    fetchGroups();
  };

  const handleJoined = () => {
    setActivePanel(null);
    fetchGroups();
  };

  return (
    <Box>
      <PageHeader
        title="Gruplarım"
        subtitle="Proje gruplarınızı yönetin, yeni grup oluşturun veya mevcut bir gruba katılın."
      >
        {groups.length > 0 && !activePanel && (
          <>
            <Button bg="teal.500" color="white" _hover={{ bg: "teal.600" }} onClick={() => setActivePanel("create")}>
              + Yeni Grup
            </Button>
            <Button variant="outline" colorPalette="blue" onClick={() => setActivePanel("join")}>
              Davet Koduyla Katıl
            </Button>
          </>
        )}
      </PageHeader>

      {error && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title fontSize="sm">{error}</Alert.Title>
        </Alert.Root>
      )}

      {activePanel === "create" && (
        <Box mb={6}>
          <CreateGroupPanel onCreated={handleCreated} onCancel={() => setActivePanel(null)} />
        </Box>
      )}

      {activePanel === "join" && (
        <Box mb={6}>
          <JoinGroupPanel onJoined={handleJoined} onCancel={() => setActivePanel(null)} />
        </Box>
      )}

      {loading && (
        <Flex justify="center" py={12}>
          <Text color="gray.400" fontSize="sm">Yükleniyor...</Text>
        </Flex>
      )}

      {!loading && groups.length === 0 && !activePanel && (
        <EmptyState
          icon={"\u{1F4C2}"}
          title="Henüz bir grubun yok"
          description="Yeni bir grup oluştur veya davet koduyla mevcut bir gruba katıl."
        >
          <Button bg="teal.500" color="white" _hover={{ bg: "teal.600" }} onClick={() => setActivePanel("create")}>
            Grup Oluştur
          </Button>
          <Button variant="outline" colorPalette="blue" onClick={() => setActivePanel("join")}>
            Davet Koduyla Katıl
          </Button>
        </EmptyState>
      )}

      {!loading && groups.length > 0 && (
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }}
          gap={5}
        >
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} onRefresh={fetchGroups} />
          ))}
        </Grid>
      )}
    </Box>
  );
}
