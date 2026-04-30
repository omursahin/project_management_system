import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { groupApi, groupMemberApi, termLessonApi } from "../services/groupApi.js";

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

function MemberRow({ member, isOwner }) {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: () => groupMemberApi.accept(member.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => groupMemberApi.reject(member.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const removeMutation = useMutation({
    mutationFn: () => groupMemberApi.remove(member.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const statusColor = {
    accepted: "green",
    pending: "yellow",
    rejected: "red",
  };

  const statusLabel = {
    accepted: "Kabul",
    pending: "Beklemede",
    rejected: "Reddedildi",
  };

  return (
    <Flex justify="space-between" align="center" py={1}>
      <HStack gap={2}>
        <Text fontSize="sm" color="gray.700">
          {member.user_name || member.user_email}
        </Text>
        <Badge
          colorPalette={statusColor[member.status] || "gray"}
          variant="subtle"
          fontSize="xs"
        >
          {statusLabel[member.status] || member.status}
        </Badge>
      </HStack>

      {isOwner && member.status === "pending" && (
        <HStack gap={1}>
          <Button
            size="xs"
            colorPalette="green"
            variant="subtle"
            onClick={() => acceptMutation.mutate()}
            loading={acceptMutation.isPending}
          >
            Kabul Et
          </Button>
          <Button
            size="xs"
            colorPalette="red"
            variant="subtle"
            onClick={() => rejectMutation.mutate()}
            loading={rejectMutation.isPending}
          >
            Reddet
          </Button>
        </HStack>
      )}

      {isOwner && member.status === "accepted" && (
        <Button
          size="xs"
          colorPalette="red"
          variant="ghost"
          onClick={() => {
            if (window.confirm("Bu üyeyi gruptan çıkarmak istediğine emin misin?"))
              removeMutation.mutate();
          }}
          loading={removeMutation.isPending}
        >
          Çıkar
        </Button>
      )}
    </Flex>
  );
}

function GroupCard({ group }) {
  const { copiedCode, copy } = useCopyToClipboard();
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = group.owner === currentUser.id;
  const isCopied = copiedCode === group.invitation_code;

  const memberships = group.memberships || [];
  const acceptedCount = memberships.filter((m) => m.status === "accepted").length;

  const deleteMutation = useMutation({
    mutationFn: () => groupApi.remove(group.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const handleDelete = () => {
    if (!window.confirm(`"${group.title}" grubunu silmek istediğine emin misin?`)) return;
    deleteMutation.mutate();
  };

  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
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
              {group.title}
            </Heading>
            {isOwner && (
              <Badge colorPalette="teal" variant="subtle" fontSize="xs">
                Lider
              </Badge>
            )}
            {group.status && (
              <Badge colorPalette="blue" variant="outline" fontSize="xs">
                {group.status}
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
          colorPalette={acceptedCount >= group.max_size ? "red" : "green"}
          variant="subtle"
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          {acceptedCount}/{group.max_size} üye
        </Badge>
      </Flex>

      <Separator my={3} />

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
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            Davet Kodu
          </Text>
          <Text
            fontSize="lg"
            fontWeight="bold"
            fontFamily="mono"
            color="teal.600"
            letterSpacing="wider"
          >
            {group.invitation_code}
          </Text>
        </Box>
        <Button
          size="sm"
          variant={isCopied ? "solid" : "outline"}
          colorPalette={isCopied ? "green" : "teal"}
          onClick={() => copy(group.invitation_code)}
        >
          {isCopied ? "Kopyalandı ✓" : "Kopyala"}
        </Button>
      </Flex>

      {expanded && (
        <Box mb={3} bg="gray.50" borderRadius="lg" p={3}>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
            ÜYELER ({memberships.length})
          </Text>
          {memberships.length === 0 ? (
            <Text fontSize="sm" color="gray.400">
              Henüz üye yok.
            </Text>
          ) : (
            <VStack align="stretch" gap={1}>
              {memberships.map((m) => (
                <MemberRow key={m.id} member={m} isOwner={isOwner} />
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
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Üyeleri Gizle" : "Üyeleri Gör"}
        </Button>

        {isOwner && (
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={handleDelete}
            loading={deleteMutation.isPending}
            ml="auto"
          >
            Grubu Sil
          </Button>
        )}
      </Flex>
    </Box>
  );
}

function CreateGroupPanel({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    max_size: 5,
    term_lesson: "",
    status: "active",
  });
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { data: termLessons = [], isLoading: tlLoading } = useQuery({
    queryKey: ["term-lessons"],
    queryFn: termLessonApi.list,
  });

  const termLessonList = Array.isArray(termLessons)
    ? termLessons
    : termLessons.results || [];

  const createMutation = useMutation({
    mutationFn: (payload) => groupApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onCreated();
    },
    onError: (err) => {
      const data = err.response?.data;
      if (data) {
        const msg =
          typeof data === "string"
            ? data
            : typeof data === "object"
              ? Object.entries(data)
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                  .join(" | ")
              : "Bir hata oluştu.";
        setError(msg);
      } else {
        setError("Sunucuya bağlanılamadı.");
      }
    },
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Grup adı zorunludur.");
      return;
    }
    if (!form.term_lesson) {
      setError("Dönem dersi seçimi zorunludur.");
      return;
    }
    setError("");
    createMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      max_size: Number(form.max_size) || 5,
      term_lesson: Number(form.term_lesson),
      status: form.status,
    });
  };

  return (
    <Box
      border="2px solid"
      borderColor="teal.200"
      borderRadius="xl"
      p={6}
      bg="teal.50"
    >
      <Heading size="md" color="teal.700" mb={4}>
        Yeni Grup Oluştur
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
              Dönem Dersi *
            </Text>
            <select
              name="term_lesson"
              value={form.term_lesson}
              onChange={handleChange}
              disabled={createMutation.isPending || tlLoading}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                backgroundColor: "white",
                fontSize: "14px",
              }}
            >
              <option value="">
                {tlLoading ? "Yükleniyor..." : "Dönem dersi seçiniz"}
              </option>
              {termLessonList.map((tl) => (
                <option key={tl.id} value={tl.id}>
                  {tl.term_display || `Dönem ${tl.term} - Ders ${tl.lesson}`} (Maks.
                  Grup: {tl.max_group_size})
                </option>
              ))}
            </select>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
              Grup Adı *
            </Text>
            <Input
              name="title"
              placeholder="Örn: Proje Takımı Alpha"
              value={form.title}
              onChange={handleChange}
              bg="white"
              disabled={createMutation.isPending}
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
              Açıklama
            </Text>
            <Textarea
              name="description"
              placeholder="Grup hakkında kısa bilgi..."
              value={form.description}
              onChange={handleChange}
              bg="white"
              rows={3}
              disabled={createMutation.isPending}
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
              Maksimum Üye Sayısı
            </Text>
            <Input
              name="max_size"
              type="number"
              min={2}
              max={20}
              value={form.max_size}
              onChange={handleChange}
              bg="white"
              w="120px"
              disabled={createMutation.isPending}
            />
          </Box>

          <Flex gap={3} pt={2}>
            <Button
              type="submit"
              colorPalette="teal"
              loading={createMutation.isPending}
            >
              Oluştur
            </Button>
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={createMutation.isPending}
            >
              İptal
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}

function JoinGroupPanel({ onJoined, onCancel }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: (invitationCode) => groupApi.join(invitationCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onJoined();
    },
    onError: (err) => {
      const data = err.response?.data;
      if (err.response?.status === 404) {
        setError("Bu davet koduna ait bir grup bulunamadı.");
      } else if (data) {
        const msg =
          data.detail ||
          data.invitation_code?.[0] ||
          data.non_field_errors?.[0] ||
          (typeof data === "string"
            ? data
            : Object.values(data).flat().join(" "));
        setError(msg || "Gruba katılırken bir hata oluştu.");
      } else {
        setError("Sunucuya bağlanılamadı.");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Davet kodu zorunludur.");
      return;
    }
    setError("");
    joinMutation.mutate(trimmed);
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
        Gruba Katıl
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
              Davet Kodu *
            </Text>
            <Input
              placeholder="Örn: A1B2C3D4"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              bg="white"
              fontFamily="mono"
              fontSize="lg"
              letterSpacing="wider"
              maxLength={12}
              disabled={joinMutation.isPending}
            />
            <Text fontSize="xs" color="gray.400" mt={1}>
              Grup liderinden aldığın davet kodunu gir.
            </Text>
          </Box>

          <Flex gap={3} pt={2}>
            <Button
              type="submit"
              colorPalette="blue"
              loading={joinMutation.isPending}
            >
              Katıl
            </Button>
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={joinMutation.isPending}
            >
              İptal
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}

function EmptyState({ onCreateClick, onJoinClick }) {
  return (
    <Box textAlign="center" py={16}>
      <Text fontSize="5xl" mb={4}>
        📂
      </Text>
      <Heading size="lg" color="gray.600" mb={2}>
        Henüz bir grubun yok
      </Heading>
      <Text color="gray.400" mb={6}>
        Yeni bir grup oluştur veya davet koduyla mevcut bir gruba katıl.
      </Text>
      <Flex gap={3} justify="center">
        <Button colorPalette="teal" onClick={onCreateClick}>
          Grup Oluştur
        </Button>
        <Button variant="outline" colorPalette="blue" onClick={onJoinClick}>
          Davet Koduyla Katıl
        </Button>
      </Flex>
    </Box>
  );
}

export default function Groups() {
  const [activePanel, setActivePanel] = useState(null);

  const {
    data: groupsRaw,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupApi.list(),
  });

  const groups = Array.isArray(groupsRaw)
    ? groupsRaw
    : groupsRaw?.results || [];

  const handleCreated = () => setActivePanel(null);
  const handleJoined = () => setActivePanel(null);

  return (
    <Box>
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        flexWrap="wrap"
        gap={3}
      >
        <Box>
          <Heading size="xl" color="gray.800">
            Gruplarım
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Proje gruplarını yönet, yeni grup oluştur veya mevcut bir gruba
            katıl.
          </Text>
        </Box>

        {groups.length > 0 && !activePanel && (
          <Flex gap={2}>
            <Button
              colorPalette="teal"
              onClick={() => setActivePanel("create")}
            >
              + Yeni Grup
            </Button>
            <Button
              variant="outline"
              colorPalette="blue"
              onClick={() => setActivePanel("join")}
            >
              Davet Koduyla Katıl
            </Button>
          </Flex>
        )}
      </Flex>

      {isError && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>
            {error?.response?.status === 401
              ? "Oturumunuz sona erdi, lütfen tekrar giriş yapın."
              : "Gruplar yüklenirken bir hata oluştu."}
          </Alert.Title>
        </Alert.Root>
      )}

      {activePanel === "create" && (
        <Box mb={6}>
          <CreateGroupPanel
            onCreated={handleCreated}
            onCancel={() => setActivePanel(null)}
          />
        </Box>
      )}

      {activePanel === "join" && (
        <Box mb={6}>
          <JoinGroupPanel
            onJoined={handleJoined}
            onCancel={() => setActivePanel(null)}
          />
        </Box>
      )}

      {isLoading && (
        <Flex justify="center" py={12}>
          <Text color="gray.400">Yükleniyor...</Text>
        </Flex>
      )}

      {!isLoading && !isError && groups.length === 0 && !activePanel && (
        <EmptyState
          onCreateClick={() => setActivePanel("create")}
          onJoinClick={() => setActivePanel("join")}
        />
      )}

      {!isLoading && groups.length > 0 && (
        <Grid
          templateColumns={{
            base: "1fr",
            md: "1fr 1fr",
            xl: "1fr 1fr 1fr",
          }}
          gap={5}
        >
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </Grid>
      )}
    </Box>
  );
}
