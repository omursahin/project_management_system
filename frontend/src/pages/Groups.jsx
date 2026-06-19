import { useState, useCallback } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Alert,
  Badge,
  Flex,
  Grid,
  Separator,
} from "@chakra-ui/react";
import PageHeader from "../components/ui/PageHeader.jsx";
import FormField from "../components/ui/FormField.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Modal from "../components/ui/Modal.jsx";
import { groups as groupsResource, termLessons as termLessonsResource, groupMembers as groupMembersResource } from "../services/resources.js";

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
function GroupCard({ group }) {
  const { copiedCode, copy } = useCopyToClipboard();
  const [expanded, setExpanded] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = group.owner === currentUser.id;
  const isCopied = copiedCode === group.invite_code;
  const isMember = (group.members || []).some((m) => m.user === currentUser.id);

  // Üye listesini ihtiyaç olunca çek
  const { data: detail, isFetching: loadingMembers, refetch: fetchDetail } =
    groupsResource.useDetail(group.id, { enabled: false });
  const members = detail?.members || [];

  const deleteMembership = groupMembersResource.useDelete({
    onSuccess: () => {
      fetchDetail();
    },
  });
  const deleteMutation = groupsResource.useDelete();

  const toggleMembers = () => {
    if (members.length === 0 && !expanded) {
      fetchDetail();
    }
    setExpanded(!expanded);
  };

  const handleLeave = () => {
    if (!window.confirm("Gruptan ayrılmak istediğine emin misin?")) return;
    const myMembership =
      (detail?.members || group.members || []).find((m) => m.user === currentUser.id);
    if (!myMembership) {
      fetchDetail();
      return;
    }
    deleteMembership.mutate(myMembership.id, {
      onError: () => alert("Gruptan ayrılırken bir hata oluştu."),
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`"${group.name}" grubunu silmek istediğine emin misin?`)) return;
    deleteMutation.mutate(group.id, {
      onError: () => alert("Grup silinirken bir hata oluştu."),
    });
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

      <Flex gap={2} flexWrap="wrap">
        <Button
          size="sm"
          variant="ghost"
          colorPalette="teal"
          onClick={toggleMembers}
          loading={loadingMembers}
        >
          {expanded ? "Gizle" : "Üyeler"}
        </Button>

        {isMember && !isOwner && (
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={handleLeave}
            loading={deleteMembership.isPending}
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
            loading={deleteMutation.isPending}
            ml="auto"
          >
            Sil
          </Button>
        )}
      </Flex>
    </Box>
  );
}

/* ═══════════════════ YENİ GRUP DIALOG ═══════════════════ */
function CreateGroupDialog({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    max_members: 5,
    term_lesson: "",
  });
  const [error, setError] = useState("");

  const createMutation = groupsResource.useCreate({
    onSuccess: () => {
      setForm({ name: "", description: "", max_members: 5, term_lesson: "" });
      setError("");
      onClose();
    },
    onError: (err) => {
      const data = err.response?.data;
      if (data) {
        const msg = typeof data === "string" ? data : Object.values(data).flat().join(" ");
        setError(msg || "Bir hata oluştu.");
      } else {
        setError("Sunucuya bağlanılamadı.");
      }
    },
  });

  const { data: termLessons = [], isLoading: termLessonsLoading } =
    termLessonsResource.useList();

  const termLessonOptions = termLessons.map((tl) => ({
    value: tl.id,
    label: `${tl.term} - ${tl.lesson}`,
  }));

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Grup adı zorunludur."); return; }
    if (!form.term_lesson) { setError("Dönem dersi seçimi zorunludur."); return; }
    setError("");
    createMutation.mutate({
      name: form.name.trim(),
      description: form.description.trim(),
      max_members: Number(form.max_members) || 5,
      term_lesson: Number(form.term_lesson),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Yeni Grup Oluştur">
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
            disabled={createMutation.isPending}
          />
          <FormField
            label="Açıklama"
            name="description"
            placeholder="Grup hakkında kısa bilgi..."
            value={form.description}
            onChange={handleChange}
            disabled={createMutation.isPending}
            multiline
            rows={3}
          />
          <FormField
            label="Dönem Dersi *"
            name="term_lesson"
            options={termLessonOptions}
            placeholder={termLessonsLoading ? "Yükleniyor..." : "Dönem dersi seçin"}
            value={form.term_lesson}
            onChange={(e) => setForm((prev) => ({ ...prev, term_lesson: e.target.value }))}
            disabled={createMutation.isPending || termLessonsLoading}
          />
          <FormField
            label="Maksimum Üye Sayısı"
            name="max_members"
            type="number"
            min={2}
            max={20}
            value={form.max_members}
            onChange={handleChange}
            disabled={createMutation.isPending}
          />
          <HStack justify="end" pt={2}>
            <Button variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
              İptal
            </Button>
            <Button
              type="submit"
              bg="teal.500"
              color="white"
              _hover={{ bg: "teal.600" }}
              loading={createMutation.isPending}
            >
              Oluştur
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  );
}

/* ═══════════════════ GRUBA KATIL DIALOG ═══════════════════ */
function JoinGroupDialog({ open, onClose }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const joinAction = groupsResource.useAction("join", {
    onSuccess: () => { setCode(""); setError(""); onClose(); },
    onError: (err) => {
      const data = err.response?.data;
      if (err.response?.status === 404) {
        setError("Bu davet koduna ait bir grup bulunamadı.");
      } else if (err.response?.status === 400) {
        const msg =
          data?.detail ||
          data?.error ||
          (typeof data === "string" ? data : Object.values(data).flat().join(" "));
        setError(msg || "Gruba katılırken bir hata oluştu.");
      } else {
        setError("Sunucuya bağlanılamadı.");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError("Davet kodu zorunludur."); return; }
    setError("");
    joinAction.mutate({ invitation_code: trimmed });
  };

  return (
    <Modal open={open} onClose={onClose} title="Davet Koduyla Katıl">
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
              disabled={joinAction.isPending}
              fontFamily="mono"
              fontSize="lg"
              letterSpacing="wider"
              maxLength={8}
            />
            <Text fontSize="xs" color="gray.400" mt={1}>
              Grup liderinden aldığın 8 haneli kodu gir.
            </Text>
          </Box>
          <HStack justify="end" pt={2}>
            <Button variant="ghost" onClick={onClose} disabled={joinAction.isPending}>
              İptal
            </Button>
            <Button
              type="submit"
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              loading={joinAction.isPending}
            >
              Katıl
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  );
}

/* ═══════════════════ ANA SAYFA ═══════════════════ */
export default function Groups() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const { data: list = [], isLoading, error } = groupsResource.useList();

  return (
    <Box>
      <PageHeader
        title="Gruplarım"
        subtitle="Proje gruplarınızı yönetin, yeni grup oluşturun veya mevcut bir gruba katılın."
      >
        {list.length > 0 && (
          <>
            <Button bg="teal.500" color="white" _hover={{ bg: "teal.600" }} onClick={() => setShowCreate(true)}>
              + Yeni Grup
            </Button>
            <Button variant="outline" colorPalette="blue" onClick={() => setShowJoin(true)}>
              Davet Koduyla Katıl
            </Button>
          </>
        )}
      </PageHeader>

      {error && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title fontSize="sm">Gruplar yüklenirken bir hata oluştu.</Alert.Title>
        </Alert.Root>
      )}

      {isLoading && (
        <Flex justify="center" py={12}>
          <Text color="gray.400" fontSize="sm">Yükleniyor...</Text>
        </Flex>
      )}

      {!isLoading && list.length === 0 && (
        <EmptyState
          icon={"\u{1F4C2}"}
          title="Henüz bir grubun yok"
          description="Yeni bir grup oluştur veya davet koduyla mevcut bir gruba katıl."
        >
          <Button bg="teal.500" color="white" _hover={{ bg: "teal.600" }} onClick={() => setShowCreate(true)}>
            Grup Oluştur
          </Button>
          <Button variant="outline" colorPalette="blue" onClick={() => setShowJoin(true)}>
            Davet Koduyla Katıl
          </Button>
        </EmptyState>
      )}

      {!isLoading && list.length > 0 && (
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }}
          gap={5}
        >
          {list.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </Grid>
      )}

      <CreateGroupDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinGroupDialog open={showJoin} onClose={() => setShowJoin(false)} />
    </Box>
  );
}
