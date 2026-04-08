import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Alert,
  Separator,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const STATUS_MAP = {
  pending: { label: "Beklemede", color: "yellow" },
  in_progress: { label: "Devam Ediyor", color: "blue" },
  completed: { label: "Tamamlandı", color: "green" },
};

function ProjectCard({ project }) {
  const navigate = useNavigate();
  const status = STATUS_MAP[project.status] || { label: project.status, color: "gray" };

  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="xl"
      p={5}
      bg="white"
      shadow="sm"
      cursor="pointer"
      onClick={() => navigate(`/projects/${project.id}`)}
      _hover={{ shadow: "lg", borderColor: "teal.300", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Box flex="1" mr={3}>
          <Heading size="md" color="gray.800" mb={1}>
            {project.title}
          </Heading>
          <Text fontSize="sm" color="gray.500" noOfLines={2}>
            {project.description}
          </Text>
        </Box>
        <Badge colorPalette={status.color} variant="subtle" px={3} py={1} borderRadius="full" fontSize="xs" flexShrink={0}>
          {status.label}
        </Badge>
      </Flex>

      <Separator my={3} />

      <Flex justify="space-between" align="center">
        <HStack gap={3}>
          <Box>
            <Text fontSize="xs" color="gray.400">Grup</Text>
            <Text fontSize="sm" fontWeight="medium" color="gray.700">{project.group_name}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.400">Üye</Text>
            <Text fontSize="sm" fontWeight="medium" color="gray.700">{project.members?.length || 0}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.400">Rapor</Text>
            <Text fontSize="sm" fontWeight="medium" color="gray.700">{project.reports?.length || 0}</Text>
          </Box>
        </HStack>
        {project.is_approved ? (
          <Badge colorPalette="green" variant="outline" fontSize="xs">Onaylı</Badge>
        ) : (
          <Badge colorPalette="orange" variant="outline" fontSize="xs">Onay Bekliyor</Badge>
        )}
      </Flex>
    </Box>
  );
}

function CreateProjectPanel({ onCreated, onCancel }) {
  const [form, setForm] = useState({ title: "", description: "", group: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Proje başlığı zorunludur."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/api/group-project/", {
        title: form.title.trim(),
        description: form.description.trim(),
        group: Number(form.group) || 1,
        group_name: "Yeni Grup",
      });
      onCreated();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? (typeof data === "string" ? data : Object.values(data).flat().join(" ")) : "Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box border="2px solid" borderColor="teal.200" borderRadius="xl" p={6} bg="teal.50">
      <Heading size="md" color="teal.700" mb={4}>Yeni Proje Oluştur</Heading>
      {error && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}
      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>Proje Başlığı *</Text>
            <Input name="title" placeholder="Örn: Akıllı Kampüs Sistemi" value={form.title} onChange={handleChange} bg="white" />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>Açıklama</Text>
            <Textarea name="description" placeholder="Proje hakkında kısa bilgi..." value={form.description} onChange={handleChange} bg="white" rows={3} />
          </Box>
          <HStack gap={3}>
            <Button type="submit" colorPalette="teal" loading={loading} flex={1}>Oluştur</Button>
            <Button variant="ghost" onClick={onCancel} flex={1}>İptal</Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/group-project/");
      setProjects(res.data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.group_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.800">Projelerim</Heading>
        <Button colorPalette="teal" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Kapat" : "+ Yeni Proje"}
        </Button>
      </Flex>

      {showCreate && (
        <Box mb={6}>
          <CreateProjectPanel
            onCreated={() => { setShowCreate(false); fetchProjects(); }}
            onCancel={() => setShowCreate(false)}
          />
        </Box>
      )}

      <Input
        placeholder="Proje veya grup adıyla ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={6}
        maxW="400px"
      />

      {loading ? (
        <Flex justify="center" py={12}><Spinner size="lg" color="teal.500" /></Flex>
      ) : filtered.length === 0 ? (
        <Text color="gray.400" textAlign="center" py={12}>Henüz bir proje bulunamadı.</Text>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }} gap={5}>
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </Grid>
      )}
    </Box>
  );
}
